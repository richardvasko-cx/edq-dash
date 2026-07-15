// Workspace — final stop of the investigation (brief §14 + consultant refinements).
//
// Vertical sequence of AI-pre-generated suggestion cards connected by a dotted
// timeline rail. Mandatory linear flow: Accept or Reject (→edit) the current panel
// before the next unlocks. Completed panels can be re-opened and edited, which marks
// downstream panels stale. The final panel is an INTERNAL resolution note assembled
// from the approved panels; after it is approved the consultant can Resolve the
// ticket or Update its status. Up to three relevant User Guide articles are surfaced
// (also referenced inside the draft) and deep-link into the User Guide view.

import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { marked } from 'marked';
import { cn } from '../../App';
import GeminiIcon from '../GeminiIcon';
import MarkdownContent from '../MarkdownContent';
import { AiPanelContext } from '../../contexts/AiPanel';
import { type CaseRecord, isClosedCase } from '../../services/caseDataset';
import { useCaseDataset } from '../../hooks/useCaseDataset';
import { rankRelevant } from '../../services/historyRelevance';
import { authCheckFromTicket, authCheckSummary, checkTicketAuthWithGoogleDig, type TicketAuthCheck } from '../../services/googleDigAuth';
import { providerDisplayName } from '../../services/providerRouting';
import {
  WORKSPACE_PANELS,
  initWorkspaceState,
  acceptPanel,
  editPanel,
  approvedPanels,
  currentPanelId,
  type WorkspaceState,
  type WorkspacePanelId,
  type WorkspacePanelStatus,
} from '../../services/workspaceDependencies';
import { buildWorkspaceSuggestions } from '../../services/workspaceContent';
import { DELIVERABILITY_BENCHMARKS } from '../../services/deliverabilityBenchmarks';

marked.setOptions({ gfm: true, breaks: true });

const WORKSPACE_NAV_GAP = 112;
const WORKSPACE_NAV_HEIGHT = 44;
const WORKSPACE_NAV_TOP = (WORKSPACE_NAV_GAP - WORKSPACE_NAV_HEIGHT) / 2;

// AI output often contains placeholder tokens like "<selector>._domainkey.<domain>".
// marked treats "<selector>"/"<domain>" as raw HTML tags — so they either render as
// stray markup or get silently swallowed (the placeholder text vanishes), which looks
// like a formatting bug. Escape tag-like angle brackets, but ONLY outside code spans
// (inside backticks marked already escapes them, so we'd otherwise double-escape).
function escapeBareTags(md: string): string {
  return md
    .split(/(```[\s\S]*?```|`[^`]*`)/g)
    .map((seg, i) => (i % 2 === 1 ? seg : seg.replace(/<(\/?[a-zA-Z][^>]*)>/g, '&lt;$1&gt;')))
    .join('');
}
const mdToHtml = (md: string) => ({ __html: marked.parse(escapeBareTags(md || '')) as string });

// Canonical metrics are decimals (0–1); render as a percent string.
const pct = (v: number) => (v * 100).toFixed(1) + '%';
const possessive = (name: string) => (name.endsWith('s') || name.endsWith('S') ? `${name}'` : `${name}'s`);

type FinalRefineMode = 'shorter' | 'technical' | 'data';

// The Workspace flow lives in component-local state, but every top-level view in
// the app is unmounted when the user navigates away (e.g. clicking a suggested
// article jumps to the User Guide). To make the flow survive that round-trip —
// "leave it where the user left off" — the resolution progress is mirrored to
// sessionStorage, keyed by ticket id, and rehydrated when the panel remounts.
interface PersistedWorkspace {
  state: WorkspaceState;
  autoGen: WorkspacePanelId[];
  resolution: string | null;
  consultantEvidence?: ConsultantEvidence[];
  informationGateComplete?: boolean;
  informationGateVersion?: string;
}

type InformationPriority = 'required' | 'recommended' | 'optional';
interface ConsultantEvidence {
  id: string;
  question: string;
  answer: string;
  priority: InformationPriority;
  impacts: WorkspacePanelId[];
  addedAt: string;
  skipped?: boolean;
}

interface InformationRequest {
  id: string;
  title: string;
  question: string;
  why: string;
  priority: InformationPriority;
  impacts: WorkspacePanelId[];
  choices: string[];
  checked: string[];
}

interface ReviewTarget {
  section: 'Overview' | 'Authentication' | 'Deliverability' | 'Email Performance' | 'Support History';
  panelLabel: string;
  buttonLabel: string;
}
const INFORMATION_GATE_VERSION = 'ticket-evidence-v2';
const WS_STORE_KEY = (id?: string | null) => `edq.workspace.${id ?? 'none'}`;
function loadWorkspace(id?: string | null): PersistedWorkspace | null {
  if (!id || typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(WS_STORE_KEY(id));
    return raw ? (JSON.parse(raw) as PersistedWorkspace) : null;
  } catch { return null; }
}
function saveWorkspace(id: string | null | undefined, data: PersistedWorkspace) {
  if (!id || typeof sessionStorage === 'undefined') return;
  try { sessionStorage.setItem(WS_STORE_KEY(id), JSON.stringify(data)); } catch { /* quota / serialization — non-fatal */ }
}
function validGeneratedPanels(saved: PersistedWorkspace | null): WorkspacePanelId[] {
  return (saved?.autoGen ?? []).filter(id => {
    if (id === 'gettingStarted') return true;
    const content = saved?.state?.[id]?.content?.trim() ?? '';
    const suggestion = saved?.state?.[id]?.suggestion?.trim() ?? '';
    return Boolean(content) && Boolean(suggestion) && content !== 'No response.' && suggestion !== 'No response.' && !content.startsWith('⚠️') && !suggestion.startsWith('⚠️');
  });
}
function hydrateWorkspaceState(saved: PersistedWorkspace | null, suggestions: Record<WorkspacePanelId, string>): WorkspaceState {
  const initial = initWorkspaceState(suggestions);
  if (!saved?.state) return initial;
  const repaired = { ...saved.state } as WorkspaceState;
  let resetFrom = -1;
  WORKSPACE_PANELS.forEach(({ id }, index) => {
    const stored = saved.state[id] ?? initial[id];
    const storedContent = stored.content?.trim() ?? '';
    const storedSuggestion = stored.suggestion?.trim() ?? '';
    const invalidGenerated = id !== 'gettingStarted' && (
      !storedContent || !storedSuggestion || storedContent === 'No response.' || storedSuggestion === 'No response.' ||
      storedContent.startsWith('⚠️') || storedSuggestion.startsWith('⚠️')
    );
    if (resetFrom < 0 && invalidGenerated && stored.status !== 'locked') resetFrom = index;
    const content = invalidGenerated ? initial[id].content : storedContent;
    const suggestion = invalidGenerated ? initial[id].suggestion : storedSuggestion;
    repaired[id] = { ...stored, content, suggestion };
  });
  if (resetFrom >= 0) {
    WORKSPACE_PANELS.forEach(({ id }, index) => {
      if (index < resetFrom) return;
      repaired[id] = {
        ...repaired[id],
        status: index === resetFrom ? 'current' : 'locked',
        excludeReason: undefined,
      };
    });
  }
  return repaired;
}
function savedInformationGateIsCurrent(saved: PersistedWorkspace | null) {
  return saved?.informationGateVersion === INFORMATION_GATE_VERSION;
}

function mailboxProviderLabel(domain: string | undefined): string {
  const d = (domain || '').toLowerCase();
  if (/outlook|hotmail|live\.com|msn|microsoft/.test(d)) return 'Microsoft/Outlook';
  if (/gmail|google/.test(d)) return 'Gmail';
  if (/yahoo|aol|verizon/.test(d)) return 'Yahoo/AOL';
  if (/icloud|me\.com|mac\.com|apple/.test(d)) return 'Apple/iCloud';
  return domain || 'the mailbox provider';
}

const normalizeEvidenceText = (parts: Array<string | string[] | undefined | null>) =>
  parts.flatMap(part => Array.isArray(part) ? part : [part]).filter(Boolean).join(' ').toLowerCase();

function ticketEvidenceText(ticket: CaseRecord) {
  return normalizeEvidenceText([
    ticket.case_subject,
    ticket.case_description,
    ticket.issue_type,
    ticket.root_cause_summary,
    ticket.resolution_summary,
    ticket.tags,
    ticket.recommended_actions,
    ticket.diagnostics?.map(item => `${item.title} ${item.description} ${item.status}`),
    ticket.bounces?.map(item => `${item.domain} ${item.category} ${item.classification} ${item.reason}`),
  ]);
}

function threadEvidenceText(ticket: CaseRecord) {
  return normalizeEvidenceText(ticket.case_thread?.map(item => `${item.subject} ${item.message} ${item.sender_name} ${item.recipient_name}`));
}

function hasThreadAnswer(thread: string, pattern: RegExp) {
  return pattern.test(thread);
}

function highValueRequestsOnly(requests: InformationRequest[]) {
  const seen = new Set<string>();
  return requests.filter(request => {
    if (seen.has(request.id)) return false;
    seen.add(request.id);
    return true;
  }).slice(0, 3);
}

// The Workspace gate is a pre-flight evidence review. It should not be a generic
// checklist: it asks only for a missing customer decision that is likely to change
// the generated RCA, actions, or final handoff.
function informationRequestsFor(ticket: CaseRecord | null): InformationRequest[] {
  if (!ticket) return [];
  const topBounce = ticket.bounces?.[0];
  const topSignal = topBounce ? `${topBounce.classification} at ${topBounce.domain}` : 'the dominant delivery signal';
  const mailboxProvider = mailboxProviderLabel(topBounce?.domain || ticket.mailbox_providers?.[0]);
  const m = ticket.metrics;
  const evidence = ticketEvidenceText(ticket);
  const thread = threadEvidenceText(ticket);
  const allEvidence = `${evidence} ${thread}`;
  const requests: InformationRequest[] = [];

  const volumeIsCentral = /\b(volume|ramp|warm|warming|cadence|frequency|burst|spike|throughput|send rate|hourly|daily)\b/.test(evidence);
  const volumeAlreadyExplained = hasThreadAnswer(allEvidence, /\b(planned|scheduled|agreed|expected|intended|confirmed|exceeded|doubled|expanded|increased|burst|spike|ramp|warm(?:ing)?)\b/);
  if (volumeIsCentral && !volumeAlreadyExplained) {
    requests.push({
      id: `volume-plan-${ticket.case_number}`,
      title: `Confirm send-plan context for ${ticket.account_name}`,
      question: `Was ${possessive(ticket.account_name)} volume, cadence, or audience ramp expected for this send window?`,
      why: `This changes whether Gemini treats the ${pct(m.delayed_rate)} delayed rate and ${topSignal} as expected ramp pressure or an unexpected traffic change that needs investigation.`,
      priority: 'required',
      impacts: ['rootCause', 'recommendedActions', 'finalResponse'],
      choices: ['Expected', 'Unexpected', 'Partially expected', 'Not known'],
      checked: ['Ticket description', 'Customer thread', 'Deliverability metrics', 'Support history'],
    });
  }

  const providerBlock = /\b(microsoft|outlook|hotmail|gmail|google|yahoo|aol|icloud|apple)\b/.test(evidence) &&
    /\b(block|blocked|sender reputation|ip reputation|shared ip reputation|complaint reputation|policy rejection|policy rejections|s3140|s3150|550 5\.7\.1|554 message refused)\b/.test(evidence);
  const providerIssueIsCustomerMitigatable = !/\b(mailbox full|over quota|invalid recipient|user unknown|recipient mailbox|not indicating an ip block|not an ip block|not causal)\b/.test(evidence);
  const providerMitigationAlreadyKnown = hasThreadAnswer(thread, /\b(sender support|postmaster|mitigation|delist|delisting|unblock|provider support|request has been received|submitted|opened|raised|replied|response from|ticket)\b/);
  if (providerBlock && providerIssueIsCustomerMitigatable && !providerMitigationAlreadyKnown) {
    requests.push({
      id: `mailbox-provider-mitigation-${ticket.case_number}`,
      title: `Confirm ${mailboxProvider} mitigation status`,
      question: `Has ${ticket.account_name} already submitted or started a mailbox-provider mitigation request for ${mailboxProvider}?`,
      why: `This changes whether Gemini recommends a new mailbox-provider mitigation request or references an existing one while handling the ${topSignal} pattern.`,
      priority: 'recommended',
      impacts: ['recommendedActions', 'finalResponse'],
      choices: ['Yes', 'No', 'Unknown'],
      checked: ['Ticket description', 'Customer thread', 'Support history', 'Internal guidance'],
    });
  }

  const audienceIsCentral = /\b(audience|segment|cohort|dormant|inactive|unengaged|suppression|consent|preference|migration|old addresses|stale|imported)\b/.test(evidence);
  const audienceAlreadyExplained = hasThreadAnswer(allEvidence, /\b(confirmed|blank values|mapped|legacy|suppression|opted|inactive|dormant|recent purchasers|explicit opt|old addresses|migration|cohort)\b/);
  if (audienceIsCentral && !audienceAlreadyExplained) {
    requests.push({
      id: `audience-source-${ticket.case_number}`,
      title: `Confirm affected audience source for ${ticket.account_name}`,
      question: `Which audience, segment, import, or consent change created the affected recipient group?`,
      why: `This decides whether Gemini frames ${topSignal} as a list-quality, consent, or targeting issue rather than a platform delivery fault.`,
      priority: 'required',
      impacts: ['rootCause', 'emailPerformanceFindings', 'recommendedActions', 'finalResponse'],
      choices: ['Known segment', 'Recent import or migration', 'Consent or suppression change', 'Not known'],
      checked: ['Ticket description', 'Customer thread', 'Email performance', 'Support history'],
    });
  }

  const authIssue = /\b(dmarc|spf|dkim|dns|rua|return-path|alignment|reporting)\b/.test(evidence) && /warn|fail|missing|not published|stopped|not receiving|policy p=none|none\b/.test(evidence);
  const authAlreadyActioned = hasThreadAnswer(thread, /\b(published|updated|added|authori[sz]ation|confirmed.*record|confirmed.*dns|report receipt|corrected)\b/);
  if (authIssue && !authAlreadyActioned) {
    requests.push({
      id: `auth-change-${ticket.case_number}`,
      title: `Confirm authentication change ownership for ${ticket.account_name}`,
      question: `Can the customer confirm who will publish or update the required DNS/authentication record?`,
      why: `This changes whether Gemini lists the authentication item as a customer DNS action or an internal Braze platform follow-up.`,
      priority: ticket.dmarc_status === 'FAIL' || ticket.spf_status === 'FAIL' || ticket.dkim_status === 'FAIL' ? 'required' : 'recommended',
      impacts: ['authenticationFindings', 'recommendedActions', 'finalResponse'],
      choices: ['Customer DNS owner', 'Braze/internal ticket', 'Already updated', 'Not known'],
      checked: ['Authentication scan', 'Ticket thread', 'Support history'],
    });
  }

  const complaintIssue = /\b(complaint|spam complaint|feedback|fbl|user feedback)\b/.test(evidence) || m.spam_complaint_rate >= DELIVERABILITY_BENCHMARKS.spamComplaintRate.targetMaximum;
  const complaintCauseKnown = hasThreadAnswer(allEvidence, /\b(consent|preference|frequency|content|dormant|inactive|complaint increase is concentrated|cohort|suppression|reintroduced)\b/);
  if (complaintIssue && !complaintCauseKnown) {
    requests.push({
      id: `complaint-driver-${ticket.case_number}`,
      title: `Confirm complaint driver for ${ticket.account_name}`,
      question: `Is the complaint increase tied to a known content, consent, frequency, or audience change?`,
      why: `This affects whether Gemini recommends content/list remediation, suppression correction, or a mailbox-provider recovery path.`,
      priority: 'recommended',
      impacts: ['rootCause', 'emailPerformanceFindings', 'recommendedActions', 'finalResponse'],
      choices: ['Content change', 'Consent or suppression change', 'Frequency or audience change', 'Not known'],
      checked: ['Ticket description', 'Customer thread', 'Email performance', 'Support history'],
    });
  }

  return highValueRequestsOnly(requests);
}

function reviewTargetFor(request: InformationRequest, ticket: CaseRecord | null): ReviewTarget | null {
  if (!ticket) return null;
  const requestText = [
    request.id,
    request.title,
    request.question,
    request.why,
  ].join(' ').toLowerCase();
  const ticketText = [
    ticket.case_subject,
    ticket.root_cause_summary,
    ...(ticket.tags ?? []),
    ...(ticket.bounces ?? []).map(item => `${item.classification} ${item.reason} ${item.domain}`),
  ].join(' ').toLowerCase();
  const combined = `${requestText} ${ticketText}`;

  if (request.id.startsWith('audience-source-')) {
    return { section: 'Support History', panelLabel: 'Case Thread (Support History)', buttonLabel: 'Review' };
  }

  if (request.id.startsWith('complaint-driver-')) {
    return { section: 'Email Performance', panelLabel: 'Complaint Rate', buttonLabel: 'Review' };
  }

  if (request.id.startsWith('auth-change-')) {
    return { section: 'Support History', panelLabel: 'Case Thread (Support History)', buttonLabel: 'Review' };
  }

  if (/volume|ramp|cadence|frequency|send-plan/.test(requestText)) {
    return { section: 'Deliverability', panelLabel: 'Volume by day', buttonLabel: 'Review' };
  }

  if (/mailbox-provider|mitigation|delist|unblock|sender support/.test(requestText)) {
    return { section: 'Support History', panelLabel: 'Case Thread (Support History)', buttonLabel: 'Review' };
  }

  if (/spf|dkim|dmarc|auth|dns|return-path|ptr|rdns/.test(combined)) {
    return { section: 'Authentication', panelLabel: 'Authentication Scan', buttonLabel: 'Review' };
  }

  if (/reported|customer said|customer issue|client|ticket description|case subject/.test(requestText)) {
    return { section: 'Overview', panelLabel: 'Ticket Info', buttonLabel: 'Review' };
  }

  if (/open|click|complaint|spam|unsubscribe|engagement|ctor/.test(requestText)) {
    if (/complaint|spam/.test(requestText)) return { section: 'Email Performance', panelLabel: 'Complaint Rate', buttonLabel: 'Review' };
    if (/click|ctor/.test(requestText)) return { section: 'Email Performance', panelLabel: 'Unique Click Rate', buttonLabel: 'Review' };
    if (/unsubscribe/.test(requestText)) return { section: 'Email Performance', panelLabel: 'Unsubscribe Rate', buttonLabel: 'Review' };
    return { section: 'Email Performance', panelLabel: 'Unique Open Rate', buttonLabel: 'Review' };
  }

  if (/deferr|throttl|rate limit|4\.7\.28|temporar/.test(combined)) {
    return { section: 'Deliverability', panelLabel: 'Deferrals by ISP and Reason', buttonLabel: 'Review' };
  }

  if (/block|hotmail|outlook|microsoft|gmail|yahoo|reputation/.test(combined)) {
    return { section: 'Deliverability', panelLabel: 'Deferred Events by ISP', buttonLabel: 'Review' };
  }

  if (/bounce|hardbounce|invalid recipient|mailbox unavailable/.test(combined)) {
    return { section: 'Deliverability', panelLabel: 'Bounce Class by ISP and Reason', buttonLabel: 'Review' };
  }

  return { section: 'Support History', panelLabel: 'Support History', buttonLabel: 'Review' };
}

// Phase labels shown while the Final Customer Response is generated. The model is
// asked to reason across every upstream section in this exact order; the status
// mirrors that so each section name appears once, spread over the generation time.
const FINAL_PHASES = [
  'Putting it together ✏️',
  'Reading Root Cause',
  'Verifying Authentication',
  'Adding Deliverability',
  'Checking Email KPIs',
  'Comparing Support History',
  'Final recommendations',
];
const PHASE_STEP_MS = 2200;

// Steps through `phases` once (no looping); the last phase holds until generation
// completes, so the rotation spreads across the whole generation window.
function PhasedStatus({ startTime, phases, stepMs = PHASE_STEP_MS, className }: { startTime: number; phases: string[]; stepMs?: number; className?: string }) {
  const idxAt = () => Math.min(Math.floor((Date.now() - startTime) / stepMs), phases.length - 1);
  const [i, setI] = useState(idxAt);
  useEffect(() => {
    const elapsed = Date.now() - startTime;
    const cur = Math.min(Math.floor(elapsed / stepMs), phases.length - 1);
    setI(cur);
    const timers = phases.slice(cur + 1).map((_, rel) => {
      const target = cur + 1 + rel;
      return setTimeout(() => setI(target), stepMs * target - elapsed);
    });
    return () => timers.forEach(clearTimeout);
  }, [startTime]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className={cn('h-4 overflow-hidden', className)}>
      <span key={i} className="gemini-think-word block text-[12px] font-medium">{phases[i]}</span>
    </div>
  );
}

// MD3-style status chips: leading icon + label, 8px-rounded tonal container. `icon`
// is the leading symbol; `iconCls` overrides the icon colour (current = red pin).
const STATUS_META: Record<WorkspacePanelStatus, { label: string; cls: string; text: string; icon: string; iconCls?: string }> = {
  locked:   { label: 'LOCKED',          icon: 'lock',         text: 'text-outline',                                    cls: 'text-outline bg-surface-variant/60 border-outline-variant/30' },
  current:  { label: 'CURRENT',         icon: 'location_on',  text: 'text-[#1A73E8] dark:text-[#8AB4F8]',             cls: 'text-[#1A73E8] bg-[#E8F0FE] border-[#D2E3FC] dark:bg-[#1A73E8]/15 dark:border-[#1A73E8]/30 dark:text-[#8AB4F8]', iconCls: 'text-[#EA4335]' },
  accepted: { label: 'ACCEPTED',        icon: 'check_circle', text: 'text-[#137333] dark:text-[#81C995]',             cls: 'text-[#137333] bg-[#E6F4EA] border-[#C8E6C9] dark:bg-[#137333]/15 dark:border-[#137333]/30 dark:text-[#81C995]' },
  edited:   { label: 'EDITED',          icon: 'check_circle', text: 'text-[#137333] dark:text-[#81C995]',             cls: 'text-[#137333] bg-[#E6F4EA] border-[#C8E6C9] dark:bg-[#137333]/15 dark:border-[#137333]/30 dark:text-[#81C995]' },
  excluded: { label: 'REJECTED',        icon: 'cancel',       text: 'text-[#C5221F] dark:text-[#F28B82]',             cls: 'text-[#C5221F] bg-[#FCE8E6] border-[#F5C6C5] dark:bg-[#C5221F]/15 dark:border-[#C5221F]/30 dark:text-[#F28B82]' },
  stale:    { label: 'NEEDS RE-REVIEW', icon: 'warning',      text: 'text-[#9A6700] dark:text-[#FBD38D]',             cls: 'text-[#9A6700] bg-[#FEF7E0] border-[#FDE293] dark:bg-[#F59E0B]/15 dark:border-[#F59E0B]/30 dark:text-[#FBD38D]' },
};

const STATUS_OPTIONS = ['Open', 'In Progress', 'Closed'];

// Static article suggestions (≤3) matched to the ticket; clickable list resolves
// real guide paths separately. `section` is a short category label shown above the title.
interface MatchedArticle { title: string; keys: string; section: string }
function matchArticles(ticket: CaseRecord | null): MatchedArticle[] {
  if (!ticket) return [];
  const hay = `${ticket.case_subject} ${ticket.root_cause_summary} ${(ticket.tags || []).join(' ')}`.toLowerCase();
  const lib = [
    { title: 'Understanding SPF, DKIM and DMARC alignment', keys: 'spf dkim dmarc authentication', section: 'Authentication', match: /spf|dkim|dmarc|permerror|quarantine|alignment/ },
    { title: 'Recovering from Gmail throttling and deferrals', keys: 'gmail throttling deferral', section: 'Deliverability', match: /gmail|deferral|throttl/ },
    { title: 'Resolving Microsoft (Outlook) blocks', keys: 'microsoft outlook block', section: 'Deliverability', match: /microsoft|outlook|hotmail|s3140/ },
    { title: 'Diagnosing hard bounces and list hygiene', keys: 'bounce list hygiene', section: 'List hygiene', match: /bounce|invalid recipient|mailbox unavailable/ },
    { title: 'Managing spam complaints and sender reputation', keys: 'spam complaint reputation', section: 'Reputation', match: /spam|complaint|reputation/ },
  ];
  return lib.filter(a => a.match.test(hay)).slice(0, 3).map(({ title, keys, section }) => ({ title, keys, section }));
}

// Resolve the closest real guide path for an article by keyword overlap with the
// synced User Guide files. Shared by the Final Ticket Response's suggested articles.
function resolveArticlePath(keys: string, files: any[]): string | null {
  const synced = files.filter((f: any) => f.isSynced);
  const toks = keys.split(/\s+/);
  let best: { path: string; score: number } | null = null;
  for (const f of synced) {
    const hay = `${f.filename} ${f.githubPath}`.toLowerCase();
    const score = toks.reduce((n, t) => (hay.includes(t) ? n + 1 : n), 0);
    if (score > 0 && (!best || score > best.score)) best = { path: f.githubPath, score };
  }
  return best?.path ?? null;
}

// Signal-specific remediation knowledge. A small local model defaults to vague
// advice ("investigate IP reputation", "work with your ESP"); support's job is to
// actually resolve the issue, so we detect THIS case's bounce codes / classifications
// / auth state and inject the concrete, named steps that fix each one. The prompts
// then instruct the model to ground its recommendations in these steps rather than
// emit generic filler.
// Braze platform reality the model can't infer — used to frame the CUSTOMER-FACING
// final reply so it only asks the customer to do things they can actually do, and
// attributes platform/MTA-level work to the Braze team. (Internal panels don't use
// this — they list the full technical steps regardless of who performs them.)
const BRAZE_PLATFORM_CONTEXT =
`=== EDS / OWNERSHIP CONTEXT — how to assign each action (this note goes to the INTERNAL team, never the customer) ===
- The EDS (Email Deliverability Services) team only INVESTIGATES and RECOMMENDS in this note. EDS does NOT contact the end customer, does NOT submit mailbox-provider (Microsoft/Google/Yahoo/Apple) tickets, delisting or escalation follow-ups on the customer's behalf, and does NOT actively monitor the account. The internal colleague (CSM/support) relays findings to the customer and raises tickets to other teams when the case needs them. So NEVER write "we will submit…", "we will monitor…", or "we will coordinate with the customer".
- The CUSTOMER only has the Braze dashboard + Looker (no direct SparkPost/SendGrid/Amazon SES/MTA/IP provider-console access). Assign to the CUSTOMER (phrased for the colleague to relay): fix/publish their DNS authentication records (SPF/DKIM/DMARC) at their DNS provider; advance their DMARC policy; manage list hygiene, segments/suppression, content and sending cadence in Braze; warm the sending domain; submit mailbox-provider mitigation/unblock requests only to mailbox providers such as Microsoft/Outlook, Gmail/Google, Yahoo/AOL or Apple/iCloud when those providers are the blocking/deferring party; and MONITOR results via their scheduled Looker reports and data in Braze.
- Microsoft SNDS/JMRP are already configured at the Braze platform level — do NOT tell anyone to enroll, and do NOT claim EDS monitors them.
- Some fixes need a Braze-side platform change the customer cannot make (e.g. an aligned custom Return-Path / bounce domain in the sending infrastructure). Put these under "To raise internally" — the CSM should raise a ticket to the appropriate Braze team. Do NOT tell the customer to do them directly in SparkPost, SendGrid, or Amazon SES.
- Group every recommendation under "For the customer to action (relay to them)" or "To raise internally (cross-team / platform ticket)". Never assign the customer a tool they can't access, and never invent capabilities.`;

const CUSTOMER_INFRA_ACCESS_RULE =
  'Customers do not have direct access to SparkPost, SendGrid, Amazon SES, MTA consoles, or Braze-managed IP/provider tooling. Never tell the customer to log into or change those systems. Customer-facing steps must be limited to their DNS provider, Braze, Looker, and recipient mailbox-provider channels such as Microsoft/Outlook, Gmail/Google, Yahoo/AOL, or Apple/iCloud.';

// Redacted precedent from the most similar resolved case on ANOTHER account — the
// same "match reference" the Overview's Suggested Next Steps shows. No PII: only the
// signal-match score and how that case was resolved.
function buildPrecedent(t: CaseRecord, pool: CaseRecord[]): string | null {
  const candidates = pool.filter(x => x.account_id !== t.account_id && isClosedCase(x));
  const top = rankRelevant(t, candidates)[0];
  return top && top.ticket.resolution_summary
    ? `A similar resolved case (${top.score}% signal match) was fixed by: ${top.ticket.resolution_summary}`
    : null;
}

function remediationPlaybook(t: CaseRecord): string {
  const hay = [
    ...(t.bounces || []).map(b => `${b.classification} ${b.domain} ${b.reason}`),
    `SPF ${t.spf_status} ${t.spf_description} DKIM ${t.dkim_status} ${t.dkim_description} DMARC ${t.dmarc_status} ${t.dmarc_description}`,
    t.case_subject, t.root_cause_summary,
  ].join(' ').toLowerCase();
  const has = (re: RegExp) => re.test(hay);
  const blocks: string[] = [];

  if (has(/outlook|hotmail|live\.com|microsoft|s3140/) && has(/5\.7\.1|s3140|reputation|block|weren't sent/)) {
    blocks.push(
`MICROSOFT (Outlook/Hotmail) block — 550 5.7.1 / [S3140]:
- Microsoft SNDS and JMRP are already configured by Braze at onboarding; the Braze team monitors complaint, trap-hit and reputation data — the customer does NOT need to enroll.
- The customer submits the mitigation/delisting request via the Microsoft Office 365 / Outlook.com Sender Support form, quoting the exact "550 5.7.1 ... [S3140]" error and the sending IP; Braze provides the evidence and wording to relay.
- As this followed a sending-domain change, the customer should warm the new domain into Microsoft: start with their most-engaged Outlook/Hotmail recipients at low volume and ramp over 2–4 weeks.`);
  }
  if (has(/gmail|google/) && has(/421|defer|throttl|unusual rate|4\.7\.28/)) {
    blocks.push(
`GMAIL throttling/deferral — 421 4.7.28:
- Register the domain in Google Postmaster Tools and monitor Domain/IP reputation, spam rate and the authentication panel.
- Smooth volume: lower the send rate and spread the campaign so Gmail accepts at a sustainable pace; avoid sharp spikes.
- Keep the Postmaster spam rate under 0.10% and suppress chronically unengaged Gmail recipients.`);
  }
  if (has(/gmail|google/) && has(/poor reputation/)) {
    blocks.push(
`GMAIL IP reputation — 550 5.7.1:
- In Google Postmaster Tools confirm the IP/domain reputation band and complaint rate driving the block.
- Pause low-engagement sends and re-warm to highly-engaged Gmail users to rebuild reputation before resuming full volume.`);
  }
  if (has(/invalid recipient|mailbox unavailable|5\.5\.0|5\.1\.1|user unknown|does not exist/)) {
    blocks.push(
`INVALID-RECIPIENT hard bounces — 550 5.5.0 / 5.1.1:
- Confirm these addresses are on the Braze suppression list so they are not retried.
- Validate the affected segment (remove role, malformed and known-invalid addresses) before the next send.
- Add a sunset policy that retires repeatedly-bouncing / long-unengaged profiles.`);
  }
  if (has(/too many dns lookups|>10|permerror|10 dns/)) {
    blocks.push(
`SPF PermError / >10 DNS lookups:
- Flatten the SPF record to stay within the 10-lookup limit (consolidate or remove unused includes), then re-test SPF and DMARC alignment with a validator.`);
  }
  if (has(/return-path|return path/) && has(/not (fully )?aligned|warn|unaligned/)) {
    blocks.push(
`SPF alignment (Return-Path):
- Configure an aligned custom bounce / Return-Path domain in the account's Braze sending infrastructure (SparkPost, SendGrid, or Amazon SES as configured) that matches the header "From" domain so SPF aligns for DMARC.`);
  }
  if (has(/dkim/) && has(/invalid|fail|syntax|5\.7\.26|does not pass dkim/)) {
    blocks.push(
`DKIM failure:
- Regenerate the DKIM keypair and publish the correct public-key TXT record at the "selector._domainkey.yourdomain" host (using the sending domain's actual selector); confirm the signing selector matches, then seed-test until DKIM=pass before resuming.`);
  }
  if (has(/p=none|dmarc warn|5\.7\.9|policy reasons/) || (has(/dmarc/) && has(/warn|none/))) {
    blocks.push(
`DMARC policy:
- Keep DMARC aggregate reporting (rua=) on; once SPF and DKIM are both aligned, advance the policy in stages: p=none → p=quarantine → p=reject.`);
  }
  if (has(/spam|complaint|user feedback|554|feedback/)) {
    blocks.push(
`SPAM complaints / feedback:
- Enroll in feedback loops (Microsoft JMRP, Yahoo Complaint Feedback Loop) and honor complaints as immediate unsubscribes.
- Reduce frequency to unengaged cohorts and tighten content relevance and consent.`);
  }

  return blocks.join('\n\n');
}

// Shared data accents — a metric tile and an auth status pill. Used by the panel
// visual headers AND by the Clean up advisory (so a rejected claim can show the
// actual data that contradicts it, e.g. SPF/DKIM/DMARC all PASS).
function MetricChip({ label, value, trend }: { label: string; value: string; trend?: string }) {
  return (
    <div className="flex flex-col gap-0.5 px-3 py-2 rounded-xl bg-surface-variant/30 dark:bg-inverse-surface/20 border border-outline-variant/15 min-w-[104px]">
      <span className="text-[9.5px] font-black uppercase tracking-wide text-on-surface-variant/70">{label}</span>
      <span className="text-[15px] font-black text-on-surface dark:text-inverse-on-surface leading-none">
        {value}{trend ? <span className="ml-1.5 text-[11px] font-bold text-on-surface-variant/60">{trend}</span> : null}
      </span>
    </div>
  );
}
function AuthPill({ label, status }: { label: string; status: string }) {
  const m = status === 'PASS'
    ? { cls: 'bg-[#E6F4EA] text-[#137333] border-[#C8E6C9] dark:bg-[#137333]/15 dark:border-[#137333]/30 dark:text-[#81C995]', icon: 'check_circle' }
    : status === 'FAIL'
    ? { cls: 'bg-[#FCE8E6] text-[#C5221F] border-[#F5C6C5] dark:bg-[#C5221F]/15 dark:border-[#C5221F]/30 dark:text-[#F28B82]', icon: 'cancel' }
    : { cls: 'bg-[#FEF7E0] text-[#9A6700] border-[#FDE293] dark:bg-[#F59E0B]/15 dark:border-[#F59E0B]/30 dark:text-[#FBD38D]', icon: 'warning' };
  return (
    <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[12px] font-bold', m.cls)}>
      <span className="material-symbols-outlined text-[15px]">{m.icon}</span>{label} {status}
    </div>
  );
}

// Deterministic guardrail for Clean up / Save — independent of the on-device model,
// which is too small to reliably catch contradictions. Scans the consultant's draft
// for claims that conflict with hard ticket facts (categorical auth statuses and key
// metric values) and returns a consultant-facing advisory if any are found. Applies
// uniformly to every panel. Conservative by design: only flags high-confidence
// conflicts so it never nags on legitimate edits.
// Which data accents are relevant to the contradiction(s) found — drives the
// evidence chips so we only show data tied to what was actually flagged (e.g. an
// auth contradiction shows auth pills + the bounce signal, NOT open/spam rates).
type EvidenceKind = 'auth' | 'delivery' | 'engagement' | 'bounce';
// `claims` = what the consultant asserted (shown to them as "You said …"); the actual
// data is shown only as visual chips (`kinds`), never duplicated as text. `correction`
// carries the real values to the model so it can regenerate accurately.
interface Contradiction { claims: string[]; correction: string; kinds: EvidenceKind[]; }

// The model appends a single "§§ADVISORY§§: …" line when it DROPPED an unsupported or
// contradicted claim from the regenerated section. Split it off the committed body so the
// delimiter never shows in the reply, and surface the message in the consultant note.
const ADVISORY_RE = /§§\s*ADVISORY\s*§§\s*:?\s*(.*)$/im;
function splitAdvisory(text: string): { body: string; advisory: string | null } {
  const m = text.match(ADVISORY_RE);
  if (!m) return { body: text, advisory: null };
  const advisory = m[1].trim();
  const body = text.replace(ADVISORY_RE, '').trim();
  return { body, advisory: advisory || 'Part of your edit was not supported by the case data and was left out.' };
}

// Which evidence chips meaningfully describe THIS case — used when a free-text model
// advisory fires (an unsupported claim with no specific contradiction category), so the
// note can still show "what the data actually shows".
function dataKinds(t: CaseRecord): EvidenceKind[] {
  const kinds: EvidenceKind[] = ['auth', 'delivery', 'engagement'];
  if ((t.bounces?.length ?? 0) > 0) kinds.push('bounce');
  return kinds;
}

function detectContradictions(draft: string, t: CaseRecord, baseline = ''): Contradiction | null {
  // Only check what the CONSULTANT actually wrote — i.e. sentences in the draft that
  // were NOT already in the original AI suggestion (`baseline`). Otherwise the AI's own
  // text (e.g. "SPF WARN … not fully aligned") gets mis-read as the consultant claiming
  // SPF is fine. If they added nothing new, there's nothing to flag.
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
  const baseSents = new Set(baseline.split(/(?<=[.!?\n])/).map(norm).filter(Boolean));
  const newSents = draft.split(/(?<=[.!?\n])/).filter(s => { const k = norm(s); return k && !baseSents.has(k); });
  const userText = newSents.join(' ');
  if (!userText.trim()) return null;

  const lower = userText.toLowerCase();
  const claims: string[] = [];      // what they said (display)
  const corrections: string[] = []; // real values (model guidance only)
  const kinds = new Set<EvidenceKind>();
  const top = (t.bounces || [])[0];

  // --- Auth (categorical: PASS / FAIL / WARN) ---
  const mechs: Array<{ name: string; re: RegExp; status: string; desc: string }> = [
    { name: 'SPF', re: /\bspf\b/, status: t.spf_status, desc: t.spf_description },
    { name: 'DKIM', re: /\bdkim\b/, status: t.dkim_status, desc: t.dkim_description },
    { name: 'DMARC', re: /\bdmarc\b/, status: t.dmarc_status, desc: t.dmarc_description },
  ];
  const positive = /(pass(?:es|ed|ing)?|fine|aligned|healthy|intact|valid\b|correct(?:ly)?|ok\b|no (?:auth\w*|authentication)? ?(?:issue|problem)|not (?:an? )?(?:issue|problem)|isn't (?:an? )?(?:issue|problem))/;
  // Negative must catch negated alignment ("not fully aligned") and WARN states so a
  // legitimately-cautionary sentence isn't read as a positive "it's fine" claim.
  const negative = /(fail(?:s|ed|ing)?|broken|misconfigured|unaligned|not (?:fully |partially )?aligned|warn(?:ing|ed|s)?|invalid|missing|error)/;
  for (const sentence of newSents) {
    const s = sentence.toLowerCase();
    for (const m of mechs) {
      if (!m.re.test(s)) continue;
      const saysPass = positive.test(s);
      const saysFail = negative.test(s);
      if (saysPass && !saysFail && m.status !== 'PASS') {
        claims.push(`${m.name} is passing/fine`);
        corrections.push(`${m.name} is actually ${m.status}${m.desc ? ` (${m.desc})` : ''}`);
        kinds.add('auth'); if (top) kinds.add('bounce');
      } else if (saysFail && !saysPass && m.status === 'PASS') {
        claims.push(`${m.name} is failing`);
        corrections.push(`${m.name} is actually PASS${m.desc ? ` (${m.desc})` : ''}`);
        kinds.add('auth'); if (top) kinds.add('bounce');
      }
    }
  }
  // Blanket "authentication is fine" while a mechanism is not passing.
  const anyNotPass = mechs.some(m => m.status !== 'PASS');
  if (anyNotPass && /\b(authentication|auth)\b[^.!?\n]{0,40}(fine|pass\w*|ok\b|no (?:issue|problem)|intact|healthy|aligned|not (?:an? )?(?:issue|problem))/.test(lower)) {
    claims.push('authentication is fine');
    corrections.push(`authentication is not fully passing: SPF ${t.spf_status}, DKIM ${t.dkim_status}, DMARC ${t.dmarc_status}`);
    kinds.add('auth'); if (top) kinds.add('bounce');
  }

  // --- Metrics (tight match so trends like "by 12%" don't false-trigger) ---
  // Canonical metrics are decimals 0–1; compare against the user's typed percent.
  const metrics: Array<{ key: string; label: string; actualPct: number; kind: EvidenceKind }> = [
    { key: 'open rate', label: 'Open rate', actualPct: t.metrics.nonprefetched_open_rate * 100, kind: 'engagement' },
    { key: 'bounce rate', label: 'Bounce rate', actualPct: t.metrics.bounce_rate * 100, kind: 'delivery' },
    { key: 'delivery rate', label: 'Delivery rate', actualPct: t.metrics.accepted_rate * 100, kind: 'delivery' },
    { key: 'spam rate', label: 'Spam rate', actualPct: t.metrics.spam_complaint_rate * 100, kind: 'engagement' },
  ];
  for (const mc of metrics) {
    // "<metric> [is|was|of|at|=|:|to|currently|sits at|stands at|around] NN%" — excludes "by NN%" (a trend).
    const re = new RegExp(mc.key + "\\s*(?:is|was|of|at|=|:|to|currently|sits at|stands at|around)?\\s*(\\d{1,3}(?:\\.\\d+)?)\\s*%", 'i');
    const m = userText.match(re);
    if (!m) continue;
    const stated = parseFloat(m[1]);
    if (Math.abs(stated - mc.actualPct) > 0.6) {
      claims.push(`the ${mc.label.toLowerCase()} is ${stated}%`);
      corrections.push(`${mc.label} is actually ${mc.actualPct.toFixed(1)}%`);
      kinds.add(mc.kind);
    }
  }

  // --- Blanket "all clear" claims while the case clearly still has problems ---
  // Catches contradictory edits like "the issue is resolved", "everything is fine",
  // "no problems", "delivery is healthy" when the ticket's own signals say otherwise.
  const allClear = /\b(?:issue|problem|this|it|case|ticket)\s+(?:is|has been|'s|was)\s+(?:resolved|fixed|solved|sorted)\b|\bfully (?:resolved|fixed)\b|\bno (?:problems?|issues?|concerns?)\b|\beverything(?:'s| is)? (?:fine|healthy|good|ok|normal)\b|\ball (?:good|clear|healthy|fine)\b|\bnothing (?:is )?wrong\b|\b(?:delivery|deliverability|engagement|performance) is (?:fine|healthy|good|normal|strong)\b/i;
  if (allClear.test(userText)) {
    const problems: string[] = [];
    if (anyNotPass) { problems.push(`authentication is not fully passing (SPF ${t.spf_status}, DKIM ${t.dkim_status}, DMARC ${t.dmarc_status})`); kinds.add('auth'); }
    if (top) { problems.push(`active bounce/defer signal "${top.reason}" at ${top.domain}`); kinds.add('bounce'); }
    if (t.metrics.accepted_rate < DELIVERABILITY_BENCHMARKS.deliveryRate.healthy) { problems.push(`delivery is below the 99% operating target (${pct(t.metrics.accepted_rate)})`); kinds.add('delivery'); }
    if (t.metrics.bounce_rate > DELIVERABILITY_BENCHMARKS.bounceRate.investigate) { problems.push(`bounce rate needs investigation (${pct(t.metrics.bounce_rate)})`); kinds.add('delivery'); }
    if (t.metrics.spam_complaint_rate >= DELIVERABILITY_BENCHMARKS.spamComplaintRate.targetMaximum) { problems.push(`spam complaints exceed the 0.10% target (${pct(t.metrics.spam_complaint_rate)})`); kinds.add('engagement'); }
    if (problems.length) {
      claims.push('the case is resolved / healthy');
      corrections.push(`the case still has active problems: ${problems.join('; ')}`);
    }
  }

  if (!claims.length) return null;
  return { claims, correction: corrections.join('; '), kinds: Array.from(kinds) };
}

// Past-ticket card for the Support History Context panel. This intentionally
// mirrors the light, segmented historical-case cards in Support History.
function HistoryCard({ ticket: h }: { ticket: CaseRecord }) {
  const [open, setOpen] = useState(false);
  const statusBadge = (s: string) =>
    s === 'Closed' ? 'bg-[#E6F4EA] text-[#137333] border-[#C8E6C9] dark:bg-[#137333]/15 dark:border-[#137333]/30 dark:text-[#81C995]'
    : s === 'Open' ? 'bg-[#E8F0FE] text-[#1A73E8] border-[#D2E3FC] dark:bg-[#1A73E8]/15 dark:border-[#1A73E8]/30 dark:text-[#8AB4F8]'
    : 'bg-[#FEF7E0] text-[#9A6700] border-[#FDE293] dark:bg-[#F59E0B]/15 dark:border-[#F59E0B]/30 dark:text-[#FBD38D]';
  return (
    <div className="overflow-hidden rounded-md border border-[#D2D7DE] bg-[#FBFCFD] dark:border-outline-variant/40 dark:bg-inverse-surface/15">
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="min-w-0">
          <span className="block text-[12px] font-bold text-primary">{h.case_number}</span>
          <span className="mt-0.5 block truncate text-[13px] font-semibold text-on-surface">{h.case_subject}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn('text-[9.5px] font-black px-2 py-0.5 rounded-full border', statusBadge(h.case_status))}>{h.case_status}</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={cn('h-7 w-7 shrink-0 text-[#1A73E8] transition-transform duration-300 ease-out', open && 'rotate-45')}>
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
      </button>
      <div className={cn('grid transition-[grid-template-rows] duration-300 ease-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 border-t border-dotted border-[#DDE1E7] sm:grid-cols-2 dark:border-outline-variant/30">
            <div className="border-b border-dotted border-[#DDE1E7] bg-[#FBFCFD] p-4 sm:border-b-0 sm:border-r dark:border-outline-variant/30 dark:bg-inverse-surface/15">
              <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60 mb-1">Root cause</p>
              <p className="text-[12px] text-on-surface-variant leading-relaxed">{h.root_cause_summary}</p>
            </div>
            {h.resolution_summary && (
              <div className="bg-[#FBFCFD] p-4 dark:bg-inverse-surface/15">
                <p className="text-[9px] font-black uppercase tracking-widest text-[#137333]/70 dark:text-[#81C995]/70 mb-1">Resolution</p>
                <p className="text-[12px] text-[#137333] dark:text-[#81C995] leading-relaxed">{h.resolution_summary}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 border-t border-dotted border-[#DDE1E7] dark:border-outline-variant/30">
        {[
          ['Accepted', pct(h.metrics.accepted_rate)],
          ['Bounce', pct(h.metrics.bounce_rate)],
          ['Open', pct(h.metrics.nonprefetched_open_rate)],
        ].map(([label, value], index) => (
          <div key={label} className={cn('px-2 py-2.5 text-center', index > 0 && 'border-l border-dotted border-[#DDE1E7] dark:border-outline-variant/30')}>
            <div className="text-[9px] font-bold uppercase tracking-wide text-on-surface-variant/65">{label}</div>
            <div className="mt-0.5 text-[14px] font-black text-on-surface">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: WorkspacePanelStatus }) {
  const m = STATUS_META[status];
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-black tracking-wider whitespace-nowrap', m.text)}>
      <span className={cn('material-symbols-outlined text-[15px] leading-none', m.iconCls)} style={{ fontVariationSettings: "'FILL' 1" }}>{m.icon}</span>
      {m.label}
    </span>
  );
}

export default function WorkspacePanels({ ticket, onJumpSection, onJumpPanel }: { ticket: CaseRecord | null; onJumpSection?: (s: string) => void; onJumpPanel?: (section: ReviewTarget['section'], panelLabel: string) => void }) {
  const ctx = useContext(AiPanelContext);
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const { cases } = useCaseDataset();
  const suggestions = useMemo(() => buildWorkspaceSuggestions(ticket), [ticket]);
  // Rehydrate from sessionStorage so the flow resumes exactly where the user left
  // off after navigating away and back; fall back to a fresh flow when none saved.
  const [state, setState] = useState<WorkspaceState>(() => hydrateWorkspaceState(loadWorkspace(ticket?.case_number), suggestions));

  const [editingId, setEditingId] = useState<WorkspacePanelId | null>(null);
  const [copiedPanelId, setCopiedPanelId] = useState<WorkspacePanelId | null>(null);
  const [draft, setDraft] = useState('');
  // Consultant-only advisory from a Clean up pass — flags points the consultant
  // raised that the ticket data can't support. Shown beside the editor, never
  // folded into the (customer-facing) draft.
  // What the consultant claimed that conflicts with data — shown as "You said …".
  const [cleanupClaims, setCleanupClaims] = useState<string[]>([]);
  const [cleanupConfirmation, setCleanupConfirmation] = useState<string | null>(null);
  // Which evidence chips to show under the advisory — only the data categories the
  // contradiction actually touched (so an auth conflict won't show open/spam rates).
  const [cleanupEvidence, setCleanupEvidence] = useState<EvidenceKind[]>([]);
  // Free-text grounding shown when the model dropped an UNSUPPORTED claim (e.g. billing)
  // that the deterministic detector can't catch — the actual root cause for context.
  const [cleanupGrounding, setCleanupGrounding] = useState<string | null>(null);
  // Panel whose edit-regeneration was requested but is waiting in / running through the
  // serialized generation queue — drives immediate "queued/generating" feedback on the
  // edit buttons even while a background panel is still finishing first.
  const [regenPending, setRegenPending] = useState<WorkspacePanelId | null>(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [resolution, setResolution] = useState<string | null>(() => loadWorkspace(ticket?.case_number)?.resolution ?? null);
  const [consultantEvidence, setConsultantEvidence] = useState<ConsultantEvidence[]>(() => {
    const saved = loadWorkspace(ticket?.case_number);
    return savedInformationGateIsCurrent(saved) ? saved?.consultantEvidence ?? [] : [];
  });
  const [informationGateComplete, setInformationGateComplete] = useState(() => {
    const saved = loadWorkspace(ticket?.case_number);
    return savedInformationGateIsCurrent(saved) ? saved?.informationGateComplete ?? false : false;
  });
  const [expandedInformationId, setExpandedInformationId] = useState<string | null>(null);
  const [informationChoice, setInformationChoice] = useState('');
  const [informationDetail, setInformationDetail] = useState('');
  const [workspaceUpdate, setWorkspaceUpdate] = useState<string | null>(null);
  const [authCheck, setAuthCheck] = useState<TicketAuthCheck | null>(null);
  const getGoogleAuthEvidence = async (caseRecord: CaseRecord) => {
    try {
      return await checkTicketAuthWithGoogleDig({
        domain: caseRecord.sending_domains?.[0] ?? '',
        selector: caseRecord.dkim_selector,
      });
    } catch {
      return authCheckFromTicket(caseRecord);
    }
  };

  // Every panel is genuinely AI-generated (streamed) via the same endpoint the
  // Gemini pill/panel use (/api/user-guide/ask-stream) — not stitched templates.
  // `gen` tracks the one panel currently streaming; only the Final panel persists
  // hyperlinked article cards.
  const [gen, setGen] = useState<{ id: WorkspacePanelId | null; phase: 'loading' | 'streaming'; streamText: string }>({ id: null, phase: 'loading', streamText: '' });
  const [panelThinking, setPanelThinking] = useState<Partial<Record<WorkspacePanelId, string[]>>>({});
  const [openThinkingPanel, setOpenThinkingPanel] = useState<WorkspacePanelId | null>(null);
  // Synced User Guide files — used to resolve suggested-article links in the Final panel.
  const [guideFiles, setGuideFiles] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/user-guide/files').then(r => (r.ok ? r.json() : { files: [] })).then(d => setGuideFiles(d.files || [])).catch(() => {});
  }, []);
  // Reactive set of panels whose AI pass has finished — drives the per-panel
  // "preparing / generating / ready" status shown on locked (background) panels.
  // Seeded from saved autoGen so restored panels read as already done.
  const [pregenDone, setPregenDone] = useState<Set<WorkspacePanelId>>(() => new Set(validGeneratedPanels(loadWorkspace(ticket?.case_number))));
  const genStartRef = useRef(0);
  const autoGenRef = useRef<Set<WorkspacePanelId>>(new Set(validGeneratedPanels(loadWorkspace(ticket?.case_number))));
  // Guards the one-shot background pre-generation queue (kicked off on Get started).
  const pregenStartedRef = useRef(false);
  // Bounded per-panel regeneration retries (so a failed gen recovers but a down model
  // doesn't loop forever).
  const retryCountRef = useRef<Record<string, number>>({});
  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  // On ticket change, rehydrate that ticket's saved flow (or start fresh). Panels
  // already generated stay generated — autoGenRef is restored so we don't re-run
  // generation over content the user already reviewed.
  useEffect(() => {
    const saved = loadWorkspace(ticket?.case_number);
    const infoGateCurrent = savedInformationGateIsCurrent(saved);
    setState(hydrateWorkspaceState(saved, suggestions));
    setResolution(saved?.resolution ?? null);
    setConsultantEvidence(infoGateCurrent ? saved?.consultantEvidence ?? [] : []);
    setInformationGateComplete(infoGateCurrent ? saved?.informationGateComplete ?? false : false);
    setExpandedInformationId(null);
    setInformationChoice('');
    setInformationDetail('');
    setWorkspaceUpdate(null);
    setAuthCheck(null);
    const validAutoGen = validGeneratedPanels(saved);
    autoGenRef.current = new Set(validAutoGen);
    setPregenDone(new Set(validAutoGen));
    retryCountRef.current = {};
    pregenStartedRef.current = false; // re-arm background pre-gen for the new ticket
    setGen({ id: null, phase: 'loading', streamText: '' });
    setPanelThinking({});
    setOpenThinkingPanel(null);
    setEditingId(null);
    setCleanupClaims([]); setCleanupConfirmation(null); setCleanupEvidence([]); setCleanupGrounding(null);
  }, [ticket?.case_number]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mirror flow progress to sessionStorage whenever it changes.
  useEffect(() => {
    saveWorkspace(ticket?.case_number, { state, autoGen: Array.from(autoGenRef.current) as WorkspacePanelId[], resolution, consultantEvidence, informationGateComplete, informationGateVersion: INFORMATION_GATE_VERSION });
  }, [state, resolution, consultantEvidence, informationGateComplete, ticket?.case_number]);

  useEffect(() => {
    if (!ticket) return;
    let cancelled = false;
    getGoogleAuthEvidence(ticket)
      .then(result => { if (!cancelled) setAuthCheck(result); })
    return () => { cancelled = true; };
  }, [ticket?.case_number]); // eslint-disable-line react-hooks/exhaustive-deps

  // Suggested articles for the Final Ticket Response — ticket-matched and resolved to
  // real synced guide paths (replaces the static AI-endpoint list; same logic that used
  // to power the standalone "Recommended articles" block below the flow).
  const finalArticles = useMemo(
    () => matchArticles(ticket).map(a => ({ ...a, path: resolveArticlePath(a.keys, guideFiles) })),
    [ticket?.case_number, guideFiles], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const precedent = useMemo(() => (ticket ? buildPrecedent(ticket, cases) : null), [ticket?.case_number, cases]); // eslint-disable-line react-hooks/exhaustive-deps

  // Screen + ticket reference shared by generation and refine, so on-device RAG
  // pulls the right guide pages and same-account ticket history.
  const genScreen = (t: CaseRecord) =>
    `Support ticket\nTitle: ${t.account_name}\nReference: ${t.case_number}\nIssue: ${t.case_subject}\nRoot cause summary: ${t.root_cause_summary}`;
  const genTicketRef = (t: CaseRecord) => ({ id: t.case_number, account: t.account_name });
  const authEvidenceFor = (t: CaseRecord) => {
    const fallback = authCheckFromTicket(t);
    return authCheck?.domain === fallback.domain ? authCheck : fallback;
  };

  // Prompt per panel — each fed ONLY the data relevant to that section so the
  // model can't converge on a generic "metrics + auth + next step" blob. Routed
  // through the minimal /api/workspace/section-stream endpoint (final excepted).
  const promptFor = (id: WorkspacePanelId, title: string, t: CaseRecord, authOverride?: TicketAuthCheck): string => {
    const provider = providerDisplayName(t.email_service_provider, 'the sending platform');
    const authLine = authCheckSummary(authOverride ?? authEvidenceFor(t));
    const top = t.bounces?.[0];
    const dominant = top ? `${top.classification} at ${top.domain}, reason "${top.reason}"` : 'the main bounce/defer signal';
    const sendingDomain = t.sending_domains[0];
    const m = t.metrics;
    const consultantContext = consultantEvidence.length
      ? `\n=== CONSULTANT-CONFIRMED CONTEXT ===\n${consultantEvidence.map(item => `- ${item.question} ${item.answer}${item.addedAt ? ` (confirmed ${item.addedAt})` : ''}`).join('\n')}\nUse this only where it materially affects the section. Do not imply unconfirmed facts beyond it.\n`
      : '';

    switch (id) {
      case 'customerIssue':
        return (
          `Restate the customer's reported issue for an internal note, using ONLY these ticket details:\n` +
          `- Account: ${t.account_name} (${t.platform_edition})\n- Sending via: ${provider}, domain ${sendingDomain}\n- Reported: "${t.case_subject}"\n- Impact described: ${t.root_cause_summary}\n- Headline movement: open rate ${pct(m.nonprefetched_open_rate)}\n\n` +
          `Write one short framing sentence, then 3–5 tight bullets of just these facts. Do NOT diagnose, analyse, recommend, list other metrics, or add any next step — only present what was reported.` + consultantContext
        );
      case 'rootCause':
        return (
          `Determine the single most likely ROOT CAUSE of THIS case only. Do not reference any other account or past case.\n` +
          `- Issue: "${t.case_subject}" — ${t.root_cause_summary}\n- Delivery ${pct(m.accepted_rate)}, bounce ${pct(m.bounce_rate)}\n- Open ${pct(m.nonprefetched_open_rate)}, spam ${pct(m.spam_complaint_rate)}\n- Authentication: ${authLine}\n` +
          (top ? `- Dominant bounce/defer: ${top.classification} at ${top.domain} — "${top.reason}"\n` : '') +
          `\nOutput: one **bold one-line verdict**, then 2–4 evidence bullets that cite the actual numbers/codes, then a final line exactly "Confidence: High" / "Medium" / "Low". No other sections, no recommendations.` + consultantContext
        );
      case 'authenticationFindings':
        return (
          `Evaluate authentication for THIS case using the Google Dig scan below, not just the CSV status. Data: ${authLine}.\n` +
          `If all mechanisms pass, say authentication is not contributing and name what was checked. If any mechanism fails or is missing, explain ONLY the failing or warning mechanism(s): what is wrong, how it affects deliverability, and the one-line fix. 2–4 sentences or bullets.` + consultantContext
        );
      case 'deliverabilityFindings':
        return (
          `Give an EXPANDED, data-driven deliverability analysis for this case (no auth, no open/spam engagement, no next-step list). Lead with the data, then interpret it:\n` +
          `- Delivery rate ${pct(m.accepted_rate)}, bounce rate ${pct(m.bounce_rate)}, sourced from ${provider}.\n` +
          `- Dominant pattern: ${dominant}.\n\n` +
          `Structure: a **bold one-line headline**, then 3–5 bullets that quote the actual numbers/codes and explain what each signal means for this sender, then a final "**Best practice:**" line with the most relevant remediation for that pattern. Be specific and quantitative — embed the data, don't just restate it.` + consultantContext
        );
      case 'emailPerformanceFindings':
        return (
          `Give an EXPANDED, data-driven engagement analysis for this case (no delivery/bounce, no auth, no next-step list). Lead with the data, then interpret it:\n` +
          `- Open rate ${pct(m.nonprefetched_open_rate)}, spam complaints ${pct(m.spam_complaint_rate)}, sourced from ${provider}.\n\n` +
          `Structure: a **bold one-line headline**, then 3–5 bullets that quote the actual rates and explain what the movement indicates (e.g. throttling, content/list quality, reputation), then a final "**Best practice:**" line with the most relevant engagement remediation. Be specific and quantitative — embed the data, don't just restate it.` + consultantContext
        );
      case 'supportHistoryContext':
        return (
          `Issue context for matching: "${t.case_subject}" — ${t.root_cause_summary} (tags: ${(t.tags || []).join(', ')}).\n` +
          `Using the SIMILAR PAST CASES provided in your context (this account at full fidelity, other accounts anonymised), surface precedent. ` +
          `Start with one italic line exactly: "_All cross-account precedents are anonymised — no other customer's identifiers are shown._" ` +
          `Then 2–4 bullets, one per precedent: "**<short anonymised case label>** — Context: <why this precedent matches the current issue>; Root cause: <…>; Resolution: <what fixed it>." ` +
          `Keep each field concise. The interface will add the real match score and outcome metrics from the grounded ticket record, so do not invent or repeat percentages. ` +
          `Do not invent precedents; if none are provided, say so in one line.` + consultantContext
        );
      case 'recommendedActions': {
        const playbook = remediationPlaybook(t);
        return (
          `Produce the internal action plan from ALL the evidence for this case: issue "${t.case_subject}"; delivery ${pct(m.accepted_rate)}; bounce ${pct(m.bounce_rate)}; open ${pct(m.nonprefetched_open_rate)}; spam ${pct(m.spam_complaint_rate)}; auth ${authLine}${top ? `; dominant ${top.classification} at ${top.domain}` : ''}.\n\n` +
          `PLATFORM ACCESS RULE: ${CUSTOMER_INFRA_ACCESS_RULE} Put Braze infrastructure changes under internal/cross-team follow-up.\n\n` +
          (playbook
            ? `Base the steps on this REMEDIATION PLAYBOOK for the exact signals in this case — use these specific, named actions (tools, forms, records, thresholds, sequencing):\n${playbook}\n\n`
            : '') +
          `Output a numbered list of 3–5 steps, ordered by impact. Each step: a **bold imperative action**, then a half-line of why referencing the specific data/error code. ` +
          `Be CONCRETE — name the actual tool/form/record/threshold to use. Do NOT write generic filler like "investigate IP reputation", "address the underlying reputation", or "work with your ESP on reputation". No intro line, no customer-facing wording, no closing summary.` + consultantContext
        );
      }
      case 'finalResponse': {
        const approved = approvedPanels(state);
        const playbook = remediationPlaybook(t);
        return (
          `Write the final deliverability HANDOFF NOTE for ${t.case_number} (${t.account_name}). AUDIENCE: written by the Braze deliverability team TO the internal colleague/CSM who owns this customer relationship — they relay the relevant parts to the customer. It is NOT addressed to the customer directly.\n\n` +
          `Use EXACTLY this structure and these headings, as flowing prose (not terse bullets for the narrative parts):\n` +
          `1. Start with "Hi team," then one short paragraph introducing the handoff for ${t.case_number} (${t.account_name}) and the core issue.\n` +
          `2. "**What we found:**" — one paragraph grounded in the EXACT metrics and error codes: accepted rate ${pct(m.accepted_rate)}, bounce rate ${pct(m.bounce_rate)}, first-attempt delay ${pct(m.delayed_rate)}, confirmed open ${pct(m.nonprefetched_open_rate)}, complaint rate ${pct(m.spam_complaint_rate)}${top ? `, and the dominant signal "${top.reason}" at ${top.domain}` : ''}. Quote the real numbers exactly; never invent or round away figures and do NOT mention "trends" (none are recorded).\n` +
          `3. "**What it means:**" — one short interpretation paragraph.\n` +
          `4. "**For the customer to action (relay to them):**" — a bullet list. The customer submits their OWN recipient mailbox-provider mitigation/delisting requests only where the mailbox provider is the blocking/deferring party, and monitors recovery via their scheduled Looker reports / data in Braze. Each step names the concrete tool/form/record/threshold.\n` +
          `5. "**To raise internally (cross-team / platform ticket):**" — a bullet list for anything the customer cannot do themselves (e.g. a Braze-side platform change) that the colleague should raise to the right team.\n` +
          `6. End with "Let me know if you have any questions on these steps."\n\n` +
          `OWNERSHIP — EDS is advisory: do NOT write "we will submit/monitor/coordinate", do NOT claim we monitor the account or contact the customer. Do NOT write vague filler like "investigate the reputation of your sending IP". Translate the playbook below into specific steps in the correct ownership group. Aim for ~350–450 words.\n\n` +
          BRAZE_PLATFORM_CONTEXT + `\n\n` +
          (playbook ? `=== REMEDIATION PLAYBOOK (base your next steps on these specific actions) ===\n${playbook}\n\n` : '') +
          `=== APPROVED FINDINGS ===\n` +
          (approved.length
              ? approved.map(p => `## ${p.title}\n${p.content.slice(0, 900)}`).join('\n\n')
                : `Issue: ${t.case_subject}\nRoot cause: ${t.root_cause_summary}`) + consultantContext
        );
      }
      default:
        return `Write the "${title}" section concisely in Markdown.`;
    }
  };

  // Stream a panel's content from the model. Final panel shows the phased status;
  // every other panel shows standard streaming text.
  // The on-device model serves ONE request at a time. Backgrounding plus the
  // jump-ahead fallback (and manual Refresh) can fire generation calls that overlap,
  // which both garbles output and clears the shared `gen` indicator mid-stream. Chain
  // every call through a single promise so they run strictly one after another.
  const genChainRef = useRef<Promise<unknown>>(Promise.resolve());
  const generatePanel = (id: WorkspacePanelId, title: string, auto = false): Promise<string> => {
    const run = genChainRef.current.then(() => generatePanelInner(id, title, auto));
    genChainRef.current = run.catch(() => undefined);
    return run;
  };

  const askGeminiAboutPanel = (id: WorkspacePanelId, title: string) => {
    if (!ticket) return;
    ctx.openPill(promptFor(id, title, ticket), `${title} · ${ticket.account_name} · ${ticket.case_number}`);
  };

  const generatePanelInner = async (id: WorkspacePanelId, title: string, auto = false): Promise<string> => {
    if (!ticket) return '';

    genStartRef.current = Date.now();
    setGen({ id, phase: 'loading', streamText: '' });
    setPanelThinking(current => ({ ...current, [id]: [] }));
    let answer = '';
    let thinking: string[] = [];
    try {
      const promptAuthOverride = id === 'authenticationFindings'
        ? await getGoogleAuthEvidence(ticket)
        : undefined;
      if (promptAuthOverride) setAuthCheck(promptAuthOverride);
      // Every panel — including the final reply — uses the lean section endpoint.
      // Its small system prompt keeps the whole request inside the on-device
      // model's 4096-token window (the rich RAG endpoint's large system prompt
      // overflowed it for the findings-heavy final prompt, so it never generated).
      // Suggested guide articles are surfaced separately in the Recommended
      // articles strip below the flow.
      const isFinal = id === 'finalResponse';
      const res = await fetch('/api/workspace/section-stream', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptFor(id, title, ticket, promptAuthOverride),
          ticketRef: genTicketRef(ticket),
          includeHistory: id === 'supportHistoryContext',
          final: isFinal,
        }),
      });
      if (!res.ok || !res.body) throw new Error('Stream request failed');
      setGen(g => (g.id === id ? { ...g, phase: 'streaming' } : g));
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          try {
            const parsed = JSON.parse(line.slice(5).trim());
            // Accumulate tokens but don't surface them — the panel reveals the
            // finished answer whole rather than streaming it character by character.
            if (parsed.token) { answer += parsed.token; }
            else if (parsed.thought) { /* streaming status is intentionally visual-only */ }
            else if (Array.isArray(parsed.thinking)) {
              thinking = parsed.thinking.filter(Boolean).map((item: unknown) => String(item));
              setPanelThinking(current => ({ ...current, [id]: thinking }));
            }
            else if (parsed.done) { answer = parsed.text || answer; }
            else if (parsed.error) {
              answer = parsed.error === 'Failed to reach Gemini API'
                ? '⚠️ **Gemini API is not configured.** Please check your settings or `.env` file.'
                : `⚠️ ${parsed.error}`;
            }
          } catch { /* ignore partial frames */ }
        }
      }
    } catch (e: any) {
      answer = `⚠️ Could not reach Gemini: ${e.message}`;
    }
    answer = answer.trim();
    if (!answer || answer === 'No response.') {
      answer = '⚠️ Gemini returned an empty Workspace section. Please retry.';
    }
    setGen({ id: null, phase: 'loading', streamText: '' });
    // Generation failed (model unreachable / overflow / stream error). Don't keep a
    // permanent "done" claim or overwrite with an error: keep the seed but UN-CLAIM
    // so the panel can regenerate on next visit, and leave it OUT of pregenDone so it
    // shows the generating skeleton (never the raw seed) and stays un-acceptable.
    if (/^⚠️/.test(answer.trim())) {
      autoGenRef.current.delete(id);
      if (!auto) {
        // Manual Refresh: surface the error so the user knows it failed.
        setState(s => ({ ...s, [id]: { ...s[id], suggestion: answer, content: s[id].status === 'edited' ? s[id].content : answer } }));
      }
      return '';
    }
    const shouldKeepNavOnPanel = state[id]?.status === 'current' || currentId === id;
    if (shouldKeepNavOnPanel) {
      scrollSpyPausedUntilRef.current = Date.now() + 900;
      setNavActiveId(id);
      window.setTimeout(() => {
        if (currentIdRef.current === id) setNavActiveId(id);
      }, 120);
      window.setTimeout(() => {
        if (currentIdRef.current === id) setNavActiveId(id);
      }, 420);
    }
    setPregenDone(s => new Set(s).add(id)); // success — mark done
    setPanelThinking(current => ({ ...current, [id]: thinking }));
    setState(s => ({ ...s, [id]: { ...s[id], suggestion: answer, content: s[id].status === 'edited' ? s[id].content : answer } }));
    return answer;
  };

  // Format-refine pills (Shorter / Expand / + Data) — available on every panel.
  // The refine endpoint operates purely on the prior answer + its question (no
  // fresh RAG), so it works identically for any panel's content.
  const refinePanel = async (id: WorkspacePanelId, title: string, mode: FinalRefineMode) => {
    if (!ticket) return;
    const prior = state[id].content;
    if (!prior) return;
    genStartRef.current = Date.now();
    setGen({ id, phase: 'loading', streamText: '' });
    try {
      const res = await fetch('/api/user-guide/ask', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `refine:${mode}`, mode,
          screen: genScreen(ticket), ticketRef: genTicketRef(ticket),
          history: [
            { role: 'user', content: promptFor(id, title, ticket) },
            { role: 'assistant', content: prior },
          ],
        }),
      });
      const d = await res.json();
      const ans = d.error ? `⚠️ ${d.error}` : (d.text || prior);
      setState(s => ({ ...s, [id]: { ...s[id], suggestion: ans, content: s[id].status === 'edited' ? s[id].content : ans } }));
    } catch { /* keep prior content */ } finally {
      setGen({ id: null, phase: 'loading', streamText: '' });
    }
  };

  // Shared Shorter / Expand / + Data / Copy chip row, rendered under any generated panel.
  const RefineChips = ({ id, title }: { id: WorkspacePanelId; title: string }) => (
    <div className="flex flex-wrap items-center gap-1.5">
      {([
        { mode: 'shorter' as const, label: 'Shorter', icon: 'compress' },
        { mode: 'technical' as const, label: 'Expand', icon: 'expand_content' },
        { mode: 'data' as const, label: '+ Data', icon: 'bar_chart' },
      ]).map(o => (
        <button
          key={o.mode}
          onClick={() => refinePanel(id, title, o.mode)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-semibold bg-[#1A73E8]/10 text-[#1A73E8] hover:bg-[#1A73E8]/20 dark:text-[#8AB4F8] dark:bg-[#8AB4F8]/10 dark:hover:bg-[#8AB4F8]/20 transition-colors"
        >
          <span className="material-symbols-outlined text-[12px]">{o.icon}</span>
          {o.label}
        </button>
      ))}
      <button
        type="button"
        onClick={() => copySuggestedPanel(id)}
        title={copiedPanelId === id ? 'Copied' : `Copy ${title}`}
        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-semibold bg-[#1A73E8]/10 text-[#1A73E8] hover:bg-[#1A73E8]/20 dark:text-[#8AB4F8] dark:bg-[#8AB4F8]/10 dark:hover:bg-[#8AB4F8]/20 transition-colors"
      >
        <span className="material-symbols-outlined text-[12px]">{copiedPanelId === id ? 'check' : 'content_copy'}</span>
        {copiedPanelId === id ? 'Copied' : 'Copy'}
      </button>
    </div>
  );

  const informationRequests = useMemo(() => informationRequestsFor(ticket), [ticket?.case_number]);
  const outstandingInformation = informationRequests.filter(request => !consultantEvidence.some(item => item.id === request.id));
  const resolvedInformation = informationRequests.filter(request => consultantEvidence.some(item => item.id === request.id));
  const panelTitle = (id: WorkspacePanelId) => WORKSPACE_PANELS.find(panel => panel.id === id)?.title ?? id;
  const informationEvidenceFor = (id: string) => consultantEvidence.find(item => item.id === id);

  const openInformation = (request: InformationRequest) => {
    setExpandedInformationId(request.id);
    setInformationChoice('');
    setInformationDetail('');
  };

  const storeInformationEvidence = (request: InformationRequest, answer: string, skipped = false) => {
    if (!answer) return;
    const addedAt = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date());
    setConsultantEvidence(current => [...current.filter(item => item.id !== request.id), {
      id: request.id,
      question: request.question,
      answer,
      priority: request.priority,
      impacts: request.impacts,
      addedAt,
      skipped,
    }]);
    // Preserve manual edits and drafts. We flag only already-reviewed outputs as
    // needing a refresh, leaving the consultant in control of every change.
    setState(current => {
      const next = { ...current };
      request.impacts.forEach(id => {
        if (next[id].status === 'accepted' || next[id].status === 'edited') {
          next[id] = { ...next[id], status: 'stale' };
        }
      });
      return next;
    });
    setExpandedInformationId(null);
    setInformationChoice('');
    setInformationDetail('');
    setWorkspaceUpdate(skipped
      ? `Marked as continued without additional context — Gemini will treat this as unknown, not as a confirmed fact.`
      : `Analysis updated — review the affected ${request.impacts.map(panelTitle).join(', ')} section${request.impacts.length > 1 ? 's' : ''}.`);
  };

  const saveInformation = (request: InformationRequest) => {
    const answer = [informationChoice, informationDetail.trim()].filter(Boolean).join(informationDetail.trim() ? ' — ' : '');
    storeInformationEvidence(request, answer);
  };

  const continueWithoutInformation = (request: InformationRequest) => {
    storeInformationEvidence(request, 'Not provided — consultant chose to continue without this additional customer-specific context. Treat this point as unknown.', true);
  };

  const refreshAffected = (request: InformationRequest) => {
    request.impacts.forEach(id => {
      const panel = WORKSPACE_PANELS.find(item => item.id === id);
      if (panel && !panel.isFinal) generatePanel(id, panel.title);
    });
    setWorkspaceUpdate(`Refreshing the affected analysis using the confirmed context.`);
  };

  const priorityMeta: Record<InformationPriority, { label: string; cls: string }> = {
    required: { label: 'Required before finalizing', cls: 'bg-[#FCE8E6] text-[#C5221F] border-[#F5C6C5]' },
    recommended: { label: 'Recommended for a stronger response', cls: 'bg-[#FEF7E0] text-[#9A6700] border-[#FDE293]' },
    optional: { label: 'Optional context', cls: 'bg-[#E8F0FE] text-[#1A73E8] border-[#D2E3FC]' },
  };

  const currentId = currentPanelId(state);
  const currentIdRef = useRef<WorkspacePanelId | null>(currentId);
  currentIdRef.current = currentId;
  // The flow "starts" once the intro panel is accepted; before that we show only the
  // centered Get Started splash.
  const started = state.gettingStarted.status === 'accepted' || state.gettingStarted.status === 'edited';
  const showInformationGate = started && informationRequests.length > 0 && !informationGateComplete;
  const needsInformation = showInformationGate;

  // Once the consultant hits Get started, pre-generate EVERY panel up front so each
  // step's AI suggestion is ready the moment they reach it — no waiting per step.
  // The on-device model serves one request at a time, so we run a single SEQUENTIAL
  // queue (parallel calls would contend and slow each other). Panels the user hasn't
  // reached stay locked/greyed visually; only their content is filled in the
  // background. autoGenRef de-dupes so nothing regenerates (incl. restored content),
  // and we generate in flow order so the current panel is always done first.
  useEffect(() => {
    if (!ticket || !started || needsInformation || pregenStartedRef.current) return;
    pregenStartedRef.current = true;
    (async () => {
      for (const p of WORKSPACE_PANELS) {
        if (p.isIntro) continue;
        // The final reply is SYNTHESISED from the consultant's APPROVED findings —
        // none exist yet at pre-gen time, so generating it now would produce a thin,
        // context-poor version. Skip it here; the fallback effect generates it (with
        // the full approved context) the moment the consultant reaches it.
        if (p.isFinal) continue;
        // autoGenRef (restored from saved state) already marks panels the user
        // previously generated; everything else gets a real AI pass. Note: panels
        // start with a deterministic SEED in content, so we must NOT skip on content
        // presence — that would leave the generic seed and never call the model.
        if (autoGenRef.current.has(p.id)) continue;
        autoGenRef.current.add(p.id);
        await generatePanel(p.id, p.title, true); // sequential — one model call at a time
      }
    })();
  }, [started, needsInformation, ticket?.case_number]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fallback + retry: ensure the CURRENT panel always ends up generated. Covers
  // jumping ahead of the background queue AND retrying a panel whose generation
  // failed (errors un-claim it and leave it out of pregenDone). Re-runs when the
  // queue frees up (gen.id clears) or a panel finishes (pregenDone changes); bounded
  // by retryCountRef so a genuinely-down model doesn't loop forever.
  useEffect(() => {
    if (!ticket || !currentId || needsInformation) return;
    const def = WORKSPACE_PANELS.find(p => p.id === currentId);
    if (!def || def.isIntro) return;
    if (pregenDone.has(currentId)) return;          // already generated OK
    if (gen.id !== null) return;                     // model busy — wait its turn
    if (autoGenRef.current.has(currentId)) return;   // claimed / in-flight
    if ((retryCountRef.current[currentId] ?? 0) >= 3) return; // give up after 3 tries
    retryCountRef.current[currentId] = (retryCountRef.current[currentId] ?? 0) + 1;
    autoGenRef.current.add(currentId);
    // Persist the claim immediately — if the user navigates away before generation
    // completes, the save effect (which only fires on state changes) won't run, so
    // without this flush finalResponse would be missing from sessionStorage and would
    // regenerate on every return.
    saveWorkspace(ticket.case_number, { state, autoGen: Array.from(autoGenRef.current) as WorkspacePanelId[], resolution, consultantEvidence, informationGateComplete, informationGateVersion: INFORMATION_GATE_VERSION });
    generatePanel(currentId, def.title, true);
  }, [currentId, gen.id, pregenDone, needsInformation]); // eslint-disable-line react-hooks/exhaustive-deps

  // Smoothly scroll the newly-active panel into view as the consultant advances
  // (skips the very first render so opening the tab doesn't yank the page).
  const didFirstScroll = useRef(false);
  useEffect(() => {
    if (!currentId) return;
    if (!didFirstScroll.current) { didFirstScroll.current = true; return; }
    const el = panelRefs.current[currentId];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentId]);

  // Floating step-nav active id — driven live by the scroll handler below (was an
  // IntersectionObserver, which updated late / mid-panel).
  const [navActiveId, setNavActiveId] = useState<WorkspacePanelId | null>(null);

  // While a click-navigation scroll runs, scrollspy is paused (see observer) so only the
  // target pill is active — no cascade through intermediate panels.
  const jumpingRef = useRef(false);
  const jumpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The pills shift while the active one expands; block clicks during that ~300ms window
  // so a quick second click can't land on a neighbour that just moved.
  const [navSettling, setNavSettling] = useState(false);
  const [navPreviewId, setNavPreviewId] = useState<WorkspacePanelId | null>(null);
  const scrollSpyPausedUntilRef = useRef(0);
  const jumpToPanel = (id: WorkspacePanelId) => {
    if (state[id].status === 'locked') return;
    setNavPreviewId(null);
    jumpingRef.current = true;
    setNavSettling(true);
    if (jumpTimerRef.current) clearTimeout(jumpTimerRef.current);
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    setNavActiveId(id);
    panelRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    jumpTimerRef.current = setTimeout(() => { jumpingRef.current = false; }, 700);
    settleTimerRef.current = setTimeout(() => setNavSettling(false), 360);
  };

  // Live nav-pill tracking only — NO snap on scroll (that jumped too much). Snapping
  // happens only when clicking a nav item (jumpToPanel). The active pill is recomputed
  // every frame to the panel currently crossing the lock line, so it never lags.
  useEffect(() => {
    if (!started || !ticket) return;
    const firstEl = panelRefs.current[WORKSPACE_PANELS.find(p => !p.isIntro)!.id];
    const container = firstEl?.closest('.custom-scrollbar') as HTMLElement | null;
    if (!container) return;
    const NAV_OFFSET = WORKSPACE_NAV_GAP; // matches each panel's scrollMarginTop (lands below the floating nav)
    const topOf = (el: HTMLElement) =>
      el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;

    let rafPending = false;
    const updateActive = () => {
      rafPending = false;
      if (jumpingRef.current || Date.now() < scrollSpyPausedUntilRef.current) return;
      const lock = container.scrollTop + NAV_OFFSET + 1;
      let activeId: WorkspacePanelId | null = null;
      for (const p of WORKSPACE_PANELS) {
        if (p.isIntro) continue;
        const el = panelRefs.current[p.id];
        if (el && topOf(el) <= lock) activeId = p.id; // last panel at/above the lock line
      }
      if (activeId) setNavActiveId(activeId);
    };
    const onScroll = () => {
      if (!rafPending) { rafPending = true; requestAnimationFrame(updateActive); }
    };
    container.addEventListener('scroll', onScroll, { passive: true });
    updateActive(); // initial
    return () => container.removeEventListener('scroll', onScroll);
  }, [started, ticket?.case_number]); // eslint-disable-line react-hooks/exhaustive-deps

  const startEdit = (id: WorkspacePanelId) => {
    setEditingId(id);
    setDraft('');
    lastRegenRef.current = '';
    lastReviewedInputRef.current = '';
    preRegenDraftRef.current = '';
    setCleanupClaims([]);
    setCleanupConfirmation(null);
    setCleanupEvidence([]);
    setCleanupGrounding(null);
  };

  const copySuggestedPanel = (id: WorkspacePanelId) => {
    const content = state[id]?.content?.trim();
    if (!content) return;
    navigator.clipboard?.writeText(content).then(() => {
      setCopiedPanelId(id);
      window.setTimeout(() => setCopiedPanelId(current => current === id ? null : current), 1500);
    }).catch(() => {});
  };

  // Truly REGENERATE a panel, feeding the consultant's edited draft back in as new
  // authoritative context — so the result is a fresh AI answer in the same rich
  // format as the original generation (NOT a reworded/templated swap of their text).
  // Uses the same /api/workspace/section-stream endpoint the first pass used, and is
  // chained through the single generation lock so it never overlaps other calls.
  const regenerateWithEditInner = async (id: WorkspacePanelId, title: string, edit: string, correction = ''): Promise<string> => {
    if (!ticket) return '';
    genStartRef.current = Date.now();
    setGen({ id, phase: 'loading', streamText: '' });
    setPanelThinking(current => ({ ...current, [id]: [] }));
    let answer = '';
    let thinking: string[] = [];
    try {
      const isFinal = id === 'finalResponse';
      const prompt =
        promptFor(id, title, ticket) +
        `\n\n=== CONSULTANT REVISION (intent to revise — NOT automatically true) ===\n` +
        `Below is the consultant's edited version of this section. Use it to understand what they want to change, but EVERY statement you output MUST be supported by the CASE DATA above. Follow these rules strictly:\n` +
        `1. Incorporate a claim ONLY if the case data supports it.\n` +
        `2. If a claim is NOT supported by the case data — e.g. billing/payment status, account suspension/disconnection, contract issues, or anything not present in the metrics, authentication, bounces or root cause — DO NOT include it and NEVER use it as the verdict/headline. Keep the section grounded in the real data only.\n` +
        `3. Regenerate the full section in the SAME required format — complete and polished, do not just echo their text.\n` +
        `4. If you dropped or corrected ANY claim because it was unsupported or contradicted by the data, append EXACTLY ONE final line, on its own, starting with "§§ADVISORY§§: " that names the unsupported/incorrect claim in plain language and states what the data actually shows. This line is for the consultant and is NOT part of the section. If every claim was supported, do NOT add the line.\n\n` +
        `CONSULTANT'S REVISION:\n` +
        edit +
        (correction
          ? `\n\n=== DATA-CHECK CORRECTIONS — MANDATORY ===\n` +
            `Parts of the consultant's revision conflict with the ticket data. You MUST use the REAL ticket values below, not their incorrect figures/claims. Correct these in the regenerated section and name them in the §§ADVISORY§§ line:\n${correction}`
          : '');
      const res = await fetch('/api/workspace/section-stream', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ticketRef: genTicketRef(ticket), includeHistory: id === 'supportHistoryContext', final: isFinal }),
      });
      if (!res.ok || !res.body) throw new Error('Stream request failed');
      setGen(g => (g.id === id ? { ...g, phase: 'streaming' } : g));
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          try {
            const parsed = JSON.parse(line.slice(5).trim());
            if (parsed.token) { answer += parsed.token; }
            else if (parsed.thought) { /* streaming status is intentionally visual-only */ }
            else if (Array.isArray(parsed.thinking)) {
              thinking = parsed.thinking.filter(Boolean).map((item: unknown) => String(item));
              setPanelThinking(current => ({ ...current, [id]: thinking }));
            }
            else if (parsed.done) { answer = parsed.text || answer; }
            else if (parsed.error) {
              answer = parsed.error === 'Failed to reach Gemini API'
                ? '⚠️ **Gemini API is not configured.** Please check your settings or `.env` file.'
                : `⚠️ ${parsed.error}`;
            }
          } catch { /* ignore partial frames */ }
        }
      }
    } catch (e: any) {
      answer = `⚠️ Could not reach Gemini: ${e.message}`;
    }
    setGen({ id: null, phase: 'loading', streamText: '' });
    setPanelThinking(current => ({ ...current, [id]: thinking }));
    return answer;
  };
  // Serialized through the same lock as generatePanel (one model call at a time).
  const regenerateWithEdit = (id: WorkspacePanelId, title: string, edit: string, correction = ''): Promise<string> => {
    const run = genChainRef.current.then(() => regenerateWithEditInner(id, title, edit, correction));
    genChainRef.current = run.catch(() => undefined);
    return run;
  };
  // Remembers the exact text we last regenerated to, so confirming a Save on the
  // already-regenerated draft commits it directly instead of regenerating again.
  const lastRegenRef = useRef<string>('');
  const lastReviewedInputRef = useRef<string>('');
  // The consultant's literal text BEFORE a data-correction regeneration replaced it —
  // so "Ignore & Save" can still commit exactly what they wrote, corrections ignored.
  const preRegenDraftRef = useRef<string>('');
  const buildRevisionInput = (id: WorkspacePanelId, addition: string) =>
    `${state[id].content.trim()}\n\nConsultant addition/request:\n${addition.trim()}`;

  // "Clean up" — treat the edited draft as new context and regenerate in place,
  // previewing the fresh answer in the editor. The deterministic guardrail runs
  // first: a hard contradiction is flagged (and the draft kept) instead of fed in.
  const cleanUpDraft = async (id: WorkspacePanelId, title: string) => {
    // Detect contradictions, but DON'T block — feed them in as correction guidance so
    // the regenerated answer is fresh, incorporates the edit, and is corrected against
    // the real ticket data. The note stays visible to show what was corrected.
    // Baseline = the content before this edit, so only the consultant's additions are checked.
    const local = ticket ? detectContradictions(draft, ticket, state[id].content) : null;
    preRegenDraftRef.current = draft; // keep original for Ignore & Save
    const reviewInput = draft.trim();
    setRegenPending(id);
    try {
      const ans = await regenerateWithEdit(id, title, buildRevisionInput(id, reviewInput), local?.correction ?? '');
      let advisory: string | null = null;
      if (ans && !/^⚠️/.test(ans.trim())) {
        const split = splitAdvisory(ans);
        advisory = split.advisory;
        lastRegenRef.current = split.body.trim();
        lastReviewedInputRef.current = reviewInput;
      }
      // Merge deterministic contradictions with the model's unsupported-claim advisory.
      const claims = [...(local?.claims ?? []), ...(advisory ? [advisory] : [])];
      setCleanupClaims(claims);
      setCleanupConfirmation(claims.length ? null : 'Gemini checked this addition against the ticket data. No unsupported or contradictory claims were found. Save & continue will apply it to the suggested outcome.');
      setCleanupEvidence(local?.kinds?.length ? local.kinds : (advisory && ticket ? dataKinds(ticket) : []));
      setCleanupGrounding(advisory && ticket ? ticket.root_cause_summary : null);
    } finally { setRegenPending(null); }
  };

  // "Save & continue" — validate, then REGENERATE from the edit as new context and
  // commit the regenerated answer (not a verbatim insert). A hard contradiction
  // blocks the save and surfaces the note so the consultant can fix or Ignore & Save.
  const submitEdit = async (id: WorkspacePanelId, title: string) => {
    const addition = draft.trim();
    if (!addition) return;
    // Confirming a save after Clean up reviewed this exact addition — commit the
    // already-grounded regenerated section without a second Gemini call.
    if (addition === lastReviewedInputRef.current && lastRegenRef.current) {
      setState(s => editPanel(s, id, lastRegenRef.current || s[id].suggestion));
      setEditingId(null);
      setCleanupClaims([]); setCleanupConfirmation(null); setCleanupEvidence([]); setCleanupGrounding(null);
      return;
    }
    // Otherwise REGENERATE — feeding the edit + ticket data + any contradictions (as
    // correction guidance) so the output is fresh and grounded, not a verbatim insert.
    // Baseline = content before this edit, so only the consultant's additions are checked.
    const local = ticket ? detectContradictions(draft, ticket, state[id].content) : null;
    preRegenDraftRef.current = draft; // keep original for Ignore & Save
    setRegenPending(id);
    let regenerated = '';
    let advisory: string | null = null;
    try {
      const ans = await regenerateWithEdit(id, title, buildRevisionInput(id, addition), local?.correction ?? '');
      if (ans && !/^⚠️/.test(ans.trim())) {
        const split = splitAdvisory(ans);
        regenerated = split.body.trim();
        advisory = split.advisory;
      }
    } finally { setRegenPending(null); }
    if ((local || advisory) && regenerated) {
      // Data was off OR an unsupported claim was dropped — show the corrected, grounded
      // answer + the note, and keep the editor open so the consultant reviews before the
      // final commit (Save again confirms; Ignore & Save keeps their literal text).
      lastRegenRef.current = regenerated;
      lastReviewedInputRef.current = addition;
      setCleanupClaims([...(local?.claims ?? []), ...(advisory ? [advisory] : [])]);
      setCleanupConfirmation(null);
      setCleanupEvidence(local?.kinds?.length ? local.kinds : (advisory && ticket ? dataKinds(ticket) : []));
      setCleanupGrounding(advisory && ticket ? ticket.root_cause_summary : null);
      return;
    }
    setCleanupClaims([]); setCleanupConfirmation(null); setCleanupEvidence([]); setCleanupGrounding(null);
    const finalText = regenerated || draft.trim();
    setState(s => editPanel(s, id, finalText || s[id].suggestion));
    setEditingId(null);
  };

  // "Ignore & Save" — ignore the data corrections and commit the consultant's own
  // literal text (the pre-regeneration draft if a correction replaced it, else the
  // current draft). Escape hatch when they want their exact wording regardless.
  const saveAnyway = (id: WorkspacePanelId) => {
    const literalAddition = (preRegenDraftRef.current || draft).trim();
    const literal = `${state[id].content.trim()}\n\n${literalAddition}`;
    setState(s => editPanel(s, id, literal || s[id].suggestion));
    setEditingId(null);
    setCleanupClaims([]); setCleanupConfirmation(null); setCleanupEvidence([]); setCleanupGrounding(null);
    preRegenDraftRef.current = '';
  };

  // Data evidence chips for the advisory — surface ONLY the data categories the
  // contradiction actually touched (passed in as `kinds`), so e.g. an auth conflict
  // shows auth pills + the bounce signal, never irrelevant open/spam rates.
  const renderCleanupEvidence = (kinds: EvidenceKind[]) => {
    if (!ticket || !kinds.length) return null;
    const t = ticket;
    const has = (k: EvidenceKind) => kinds.includes(k);
    const providerName = providerDisplayName(t.email_service_provider, 'platform');

    const Section = ({ label, children }: { label: string; children: any }) => (
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A5200]/80 dark:text-[#FBD38D]/70">{label}</span>
        {children}
      </div>
    );
    const sections: any[] = [];
    if (has('auth')) {
      sections.push(<Section label="Authentication"><div className="flex flex-wrap gap-2"><AuthPill label="SPF" status={t.spf_status} /><AuthPill label="DKIM" status={t.dkim_status} /><AuthPill label="DMARC" status={t.dmarc_status} /></div></Section>);
    }
    if (has('delivery')) {
      sections.push(<Section label="Delivery"><div className="flex flex-wrap gap-2"><MetricChip label="Delivery rate" value={pct(t.metrics.accepted_rate)} /><MetricChip label="Bounce rate" value={pct(t.metrics.bounce_rate)} /></div></Section>);
    }
    if (has('engagement')) {
      sections.push(<Section label="Engagement"><div className="flex flex-wrap gap-2"><MetricChip label="Open rate" value={pct(t.metrics.nonprefetched_open_rate)} /><MetricChip label="Spam rate" value={pct(t.metrics.spam_complaint_rate)} /></div></Section>);
    }
    if (has('bounce')) {
      const sigs = (t.bounces || []).slice(0, 4);
      sections.push(
        <Section label="Bounce / defer signals">
          <div className="flex flex-col gap-1.5">
            <div className="text-[11.5px] text-on-surface-variant/80 dark:text-inverse-on-surface/70 font-medium">Sending domain <span className="font-bold">{t.sending_domains[0]}</span> · via {providerName}</div>
            {sigs.length ? sigs.map((b, i) => (
              <div key={i} className="text-[12px] leading-relaxed text-[#5F3E00] dark:text-[#FBD38D]/85 pl-3 border-l border-[#9A6700]/25">
                <span className="font-bold uppercase text-[9.5px] tracking-wider text-[#7A5200]/90 block mb-0.5">{b.classification}</span>
                <span className="font-semibold">{b.domain}</span> — {b.reason}
              </div>
            )) : <div className="text-[11.5px] italic text-on-surface-variant/70">No bounce/defer signals captured for this ticket.</div>}
          </div>
        </Section>,
      );
    }
    if (!sections.length) return null;
    return (
      <div className="flex flex-col gap-4 mt-1 pt-3 border-t border-[#9A6700]/20 dark:border-[#F59E0B]/20">
        {sections.map((sec, i) => (
          <div key={i} className={cn(i > 0 && 'pt-4 border-t border-[#9A6700]/12 dark:border-[#F59E0B]/12')}>{sec}</div>
        ))}
      </div>
    );
  };
  const doAccept = (id: WorkspacePanelId) => setState(s => acceptPanel(s, id));

  // Deterministic, at-a-glance visual accents drawn from THIS case's own data —
  // shown above the AI prose so the panel reads visually, not just as text.
  const renderVisualHeader = (id: WorkspacePanelId) => {
    if (!ticket) return null;
    const t = ticket;
    const provider = providerDisplayName(t.email_service_provider, 'Platform');
    const chip = (label: string, value: string, trend?: string) => <MetricChip label={label} value={value} trend={trend} />;
    const authPill = (label: string, status: string) => <AuthPill label={label} status={status} />;

    switch (id) {
      case 'customerIssue':
        return (
          <div className="flex flex-wrap gap-1.5">
            {[t.account_name, t.platform_edition, provider, t.sending_domains[0]].filter(Boolean).map((v, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#1A73E8]/10 text-[#1A73E8] dark:bg-[#8AB4F8]/15 dark:text-[#8AB4F8] border border-[#1A73E8]/15">{v}</span>
            ))}
          </div>
        );
      case 'authenticationFindings': {
        const evidence = authEvidenceFor(t);
        const spf = evidence.spf.status.toUpperCase();
        const dkim = evidence.dkim ? evidence.dkim.status.toUpperCase() : 'NOT CHECKED';
        const dmarc = evidence.dmarc.status.toUpperCase();
        const allPass = [spf, dkim, dmarc].filter(s => s !== 'NOT CHECKED').every(s => s === 'PASS');
        return (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              {authPill('SPF', spf)}{authPill('DKIM', dkim)}{authPill('DMARC', dmarc)}
            </div>
            <div className={cn('flex items-center gap-1.5 text-[12.5px] font-semibold', allPass ? 'text-[#1A73E8] dark:text-[#8AB4F8]' : 'text-[#C5221F] dark:text-[#F28B82]')}>
              {allPass ? (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="13" cy="13" r="7" fill="white"/>
                  <path d="M9.6 23.5L7.7 20.3L4.1 19.5L4.45 15.8L2 13L4.45 10.2L4.1 6.5L7.7 5.7L9.6 2.5L13 3.95L16.4 2.5L18.3 5.7L21.9 6.5L21.55 10.2L24 13L21.55 15.8L21.9 19.5L18.3 20.3L16.4 23.5L13 22.05L9.6 23.5ZM11.95 16.55L17.6 10.9L16.2 9.45L11.95 13.7L9.8 11.6L8.4 13L11.95 16.55Z" fill="#1A73E8"/>
                </svg>
              ) : (
                <span className="material-symbols-outlined text-[17px] shrink-0 mt-[1.5px]">report</span>
              )}
              <span>{allPass ? 'Verified by ' : 'Authentication gaps found by '}</span>
              <span className="inline-flex items-center gap-[4px] align-middle font-bold">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Google_2026_logo.svg/500px-Google_2026_logo.svg.png" 
                  alt="Google" 
                  className="h-[13px] object-contain translate-y-[1px]" 
                />
                <span>Dig</span>
              </span>
            </div>
          </div>
        );
      }
      case 'deliverabilityFindings':
        return <div className="flex flex-wrap gap-2">{chip('Delivery rate', pct(t.metrics.accepted_rate))}{chip('Bounce rate', pct(t.metrics.bounce_rate))}</div>;
      case 'emailPerformanceFindings':
        return <div className="flex flex-wrap gap-2">{chip('Open rate', pct(t.metrics.nonprefetched_open_rate))}{chip('Spam rate', pct(t.metrics.spam_complaint_rate))}</div>;
      case 'supportHistoryContext': {
        const past = cases.filter(h => h.account_id === t.account_id && h.case_number !== t.case_number && isClosedCase(h));
        if (!past.length) return null;
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-on-surface-variant/65">
              <span className="material-symbols-outlined text-[13px]">person</span>
              {t.account_name} — current account history
            </div>
            {past.map(h => (
              <div key={h.case_number}><HistoryCard ticket={h} /></div>
            ))}
          </div>
        );
      }
      default:
        return null;
    }
  };

  // Per-panel body. Intro: static "Get started". Final: phased status → markdown +
  // hyperlinked articles + refine pills. Others: visual header + standard streaming.
  const renderPanelBody = (id: WorkspacePanelId, st: WorkspaceState[WorkspacePanelId]) => {
    // "Busy" = actively streaming OR its AI pass simply hasn't finished yet (queued
    // behind the serialized generator). The latter matters when the consultant
    // advances onto a panel before its turn: show the skeleton, never the raw seed.
    const busy = gen.id === id || (id !== 'gettingStarted' && !pregenDone.has(id));
    const proseCls = cn('ai-prose text-[13px] leading-relaxed text-on-surface-variant dark:text-inverse-on-surface/85', isDark && 'ai-prose-dark');
    const thinkingNotes = panelThinking[id] ?? [];
    const renderThinkingDisclosure = () => {
      if (!thinkingNotes.length) return null;
      return (
        <>
          <button
            type="button"
            onClick={event => {
              event.stopPropagation();
              setOpenThinkingPanel(current => current === id ? null : id);
            }}
            aria-label={openThinkingPanel === id ? 'Hide Gemini thinking notes' : 'Show Gemini thinking notes'}
            aria-expanded={openThinkingPanel === id}
            className="flex h-6 items-center gap-1.5 text-[11px] font-semibold transition-colors text-[#7A7F87] hover:text-[#0B57D0] dark:text-white/50 dark:hover:text-white/80"
          >
            <GeminiIcon className="h-4 w-4" />
            <span>Thinking</span>
            <span className={cn('material-symbols-outlined text-[15px] transition-transform', openThinkingPanel === id && 'rotate-180')}>expand_more</span>
          </button>
          <AnimatePresence initial={false}>
            {openThinkingPanel === id && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -4 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -4 }}
                transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                className="overflow-hidden border-b-2 border-[#1A73E8] pb-3 pt-1 text-[#7A7F87] dark:text-white/55"
              >
                <ul className="space-y-1 text-[11px] leading-relaxed">
                  {thinkingNotes.map((note, noteIndex) => <li key={noteIndex}>{note}</li>)}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      );
    };

    const thinkingDisclosure = renderThinkingDisclosure();

    if (id === 'gettingStarted') {
      const lines = [
        "I'll work through this case step by step — root cause, authentication, deliverability, engagement and precedent from similar cases.",
        "Each step is AI-drafted from this ticket's own data for you to review, edit or refresh.",
        "Accept a step to continue; at the end you'll have a ready-to-send customer response.",
      ];
      return (
        <div className="flex flex-col gap-6 pt-4 pb-8">
          <ul className="flex flex-col gap-2.5 max-w-2xl mx-auto w-full pb-1">
            {lines.map((l, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[14px] text-on-surface-variant dark:text-inverse-on-surface/85 leading-relaxed">
                <span className="material-symbols-outlined text-[19px] text-[#1A73E8] dark:text-[#8AB4F8] shrink-0 mt-0.5">check</span>
                <span>{l}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => doAccept('gettingStarted')}
            className="getstarted-cta absolute left-1/2 top-[calc(100%+14px)] z-20 flex h-12 -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-[#1A73E8] px-9 text-[16px] font-bold text-white shadow-[0_2px_8px_rgba(26,115,232,0.35)] transition-colors hover:bg-[#1967D2]"
          >
            Get started
          </button>
        </div>
      );
    }

    if (id === 'finalResponse') {
      return (
        <div className="flex flex-col gap-3">
          {busy ? (
            <div className="flex flex-col gap-2">
              <div className="flex-1 flex flex-col gap-2 pt-1">
                <span className="flex h-10 items-center pl-[34px] text-[15px] font-semibold leading-normal text-[#4F565E] dark:text-white/75">
                  <span className="thinking-shimmer">Thinking...</span>
                </span>
                <PhasedStatus startTime={genStartRef.current} phases={FINAL_PHASES} className="mt-0.5 text-[#1A73E8] dark:text-[#8AB4F8]" />
              </div>
            </div>
          ) : (
            <>
              {thinkingDisclosure}
              <MarkdownContent className={cn(thinkingNotes.length > 0 && 'mt-3', proseCls)} content={st.content} />
            </>
          )}

          {/* Ticket-matched suggested guide articles, resolved to real synced guide paths */}
          {!busy && finalArticles.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60">
                Suggested article{finalArticles.length > 1 ? 's' : ''}
              </span>
              {finalArticles.slice(0, 5).map((a, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={e => { e.preventDefault(); if (a.path && ctx?.openGuideArticle) ctx.openGuideArticle(a.path); else onJumpSection?.('User Guide'); }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-outline-variant/20 hover:bg-[#E8F0FE]/50 dark:hover:bg-[#1A73E8]/10 transition-colors group"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#1A73E8] dark:text-[#8AB4F8] shrink-0">menu_book</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[8.5px] font-bold uppercase tracking-wide text-on-surface-variant/50">{a.section}</span>
                    <span className="block text-[13px] font-semibold text-[#1A73E8] dark:text-[#8AB4F8] underline decoration-[#1A73E8]/30 underline-offset-2 truncate">{a.title}</span>
                  </span>
                  <span className="material-symbols-outlined text-[15px] text-outline shrink-0 group-hover:translate-x-0.5 transition-transform">arrow_outward</span>
                </a>
              ))}
            </div>
          )}

          {/* Format-refine pills */}
          {!busy && st.content && <RefineChips id="finalResponse" title="Final Customer Response" />}
        </div>
      );
    }

    // Non-final panels: deterministic visual header + AI prose. The answer is
    // revealed whole once generation completes (no token-by-token streaming) —
    // a skeleton holds the space while the model works.
    const header = renderVisualHeader(id);
    const def = WORKSPACE_PANELS.find(p => p.id === id);

    // Support History Context: parse the grounded narrative into the same light,
    // segmented historical-case design used by Support History itself.
    // The italic disclaimer line is rendered separately above the cards.
    const renderHistoryCards = (content: string) => {
      const lines = content.split('\n');
      const disclaimer = lines.find(l => /cross-account precedents are anon/i.test(l))?.replace(/^[_*]+|[_*]+$/g, '').trim();
      const items: Array<{ label: string; context?: string; rootCause: string; resolution: string }> = [];
      for (const line of lines) {
        const current = line.match(/^[-*]\s+\*{1,2}(.+?)\*{1,2}\s*[—–-]+\s*Context:\s*([^;]+?);\s*Root cause:\s*([^;]+?);\s*Resolution:\s*(.+?)\.?\s*$/i);
        if (current) {
          items.push({ label: current[1].trim(), context: current[2].trim(), rootCause: current[3].trim(), resolution: current[4].trim() });
          continue;
        }
        // Preserve already-generated answers saved in the older two-field format.
        const legacy = line.match(/^[-*]\s+\*{1,2}(.+?)\*{1,2}\s*[—–-]+\s*Root cause:\s*([^;]+?);\s*Resolution:\s*(.+?)\.?\s*$/i);
        if (legacy) items.push({ label: legacy[1].trim(), rootCause: legacy[2].trim(), resolution: legacy[3].trim() });
      }
      if (!items.length) return <MarkdownContent className={proseCls} content={content} />;

      // Get real signal-match scores for cross-account closed cases (same order the AI ranks them).
      const crossPool = ticket
        ? cases.filter(x => x.account_id !== ticket.account_id && isClosedCase(x))
        : [];
      const ranked = ticket ? rankRelevant(ticket, crossPool) : [];

      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center pt-1 text-[13px] font-bold text-on-surface-variant/70">
            Related historical cases
            {disclaimer && <span className="ml-auto text-[9px] font-normal normal-case tracking-normal italic text-on-surface-variant/50">{disclaimer}</span>}
          </div>
          {items.map((item, i) => {
            const matched = ranked[i];
            const score = matched?.score;
            const metrics = matched?.ticket.metrics;
            return (
              <div key={i} className="overflow-hidden rounded-md border border-[#D2D7DE] bg-[#FBFCFD] dark:border-outline-variant/40 dark:bg-inverse-surface/10">
                <div className="flex items-start gap-3 border-b border-dotted border-[#DDE1E7] px-4 py-3 dark:border-outline-variant/30">
                  <div className="min-w-0 flex-1">
                    <span className="block text-[13px] font-bold text-on-surface">{item.label}</span>
                    {item.context && <span className="mt-1 block text-[11px] leading-relaxed text-on-surface-variant">{item.context}</span>}
                  </div>
                  {score != null && (
                    <span className="shrink-0 rounded-full bg-[#E8F0FE] px-2.5 py-1 text-[9.5px] font-black text-[#1A73E8] dark:bg-[#1A73E8]/15 dark:text-[#8AB4F8]">
                      {score}% match
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <div className="border-b border-dotted border-[#DDE1E7] bg-[#FBFCFD] p-4 sm:border-b-0 sm:border-r dark:border-outline-variant/30 dark:bg-inverse-surface/15">
                    <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60 mb-1.5">Root cause</p>
                    <p className="text-[12px] text-on-surface-variant dark:text-inverse-on-surface/80 leading-relaxed">{item.rootCause}</p>
                  </div>
                  <div className="bg-[#FBFCFD] p-4 dark:bg-inverse-surface/15">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#137333]/60 dark:text-[#81C995]/60 mb-1.5">Resolution</p>
                    <p className="text-[12px] text-[#137333] dark:text-[#81C995] leading-relaxed">{item.resolution}</p>
                  </div>
                </div>
                {metrics && (
                  <div className="grid grid-cols-3 border-t border-dotted border-[#DDE1E7] dark:border-outline-variant/30">
                    {[
                      ['Accepted', pct(metrics.accepted_rate)],
                      ['Bounce', pct(metrics.bounce_rate)],
                      ['Open', pct(metrics.nonprefetched_open_rate)],
                    ].map(([label, value], metricIndex) => (
                      <div key={label} className={cn('px-2 py-2.5 text-center', metricIndex > 0 && 'border-l border-dotted border-[#DDE1E7] dark:border-outline-variant/30')}>
                        <div className="text-[9px] font-bold uppercase tracking-wide text-on-surface-variant/65">{label}</div>
                        <div className="mt-0.5 text-[14px] font-black text-on-surface">{value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    };

    return (
      <div className="flex flex-col gap-3">
        {header}
        {busy ? (
          <div className="flex flex-col gap-2">
            <div className="flex-1 flex flex-col gap-2 pt-1">
              <span className="flex h-10 items-center pl-[34px] text-[15px] font-semibold leading-normal text-[#4F565E] dark:text-white/75">
                <span className="thinking-shimmer">Thinking...</span>
              </span>
            </div>
          </div>
        ) : (
          <>
            {thinkingDisclosure}
            {id === 'supportHistoryContext' && st.content
              ? <div className={cn(thinkingNotes.length > 0 && 'mt-3')}>{renderHistoryCards(st.content)}</div>
              : <MarkdownContent className={cn(thinkingNotes.length > 0 && 'mt-3', proseCls)} content={st.content} />
            }
            {/* Redacted cross-account precedent — the same "match reference" the
                Overview shows, surfaced under the Recommended Actions next steps. */}
            {id === 'recommendedActions' && st.content && precedent && (
              <div className="mt-1 pt-3 border-t border-outline-variant/15 flex items-start gap-2 text-[12px] text-on-surface-variant dark:text-inverse-on-surface/70">
                <span className="material-symbols-outlined text-[16px] text-[#137333] dark:text-[#81C995] mt-0.5">lightbulb</span>
                <span><span className="font-bold text-[#137333] dark:text-[#81C995]">Precedent (redacted): </span>{precedent}</span>
              </div>
            )}
            {st.content && <RefineChips id={id} title={def?.title ?? ''} />}
          </>
        )}
      </div>
    );
  };

  const flow = WORKSPACE_PANELS;
  const activeNav = navActiveId ?? currentId ?? flow[0].id;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="ws-flow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col gap-4"
        data-gem-panel data-gem-panel-label="Workspace" data-gem-panel-content={`Workspace resolution flow for ${ticket?.case_number ?? ''} — ${ticket?.account_name ?? ''}`}
      >
          {needsInformation ? (
            <section className="mx-auto w-full max-w-[1180px] rounded-[26px] bg-[#F4F7FB] px-8 py-7 dark:bg-[#F4F7FB] text-[#02060A]">
              <div className="flex items-end justify-between gap-6 pr-7">
                <div className="flex items-end gap-4 min-w-0">
                  <div className="shrink-0 select-none self-end pb-[6px] text-[58px] leading-none" aria-hidden="true">⚠️</div>
                  <div className="min-w-0">
                    <h2 className="text-[36px] leading-[1.04] font-[500] tracking-normal text-black">More information required</h2>
                    <p className="mt-2 max-w-[650px] text-[14.5px] leading-tight font-semibold text-[#5F6368]">Gemini reviewed available ticket data before asking for these customer-specific details.</p>
                  </div>
                </div>
                <div className="shrink-0 rounded-full bg-[#F9AB00] px-9 py-2.5 text-[21px] font-black text-white">
                  {informationRequests.length} Review{informationRequests.length === 1 ? '' : 's'}
                </div>
              </div>

              <div className="my-6 h-px bg-[#174EA6]" />

              <div>
                {informationRequests.map((request, index) => {
                  const open = expandedInformationId === request.id;
                  const evidence = informationEvidenceFor(request.id);
                  const done = Boolean(evidence);
                  const reviewTarget = reviewTargetFor(request, ticket);
                  return (
                    <article
                      key={request.id}
                      className={cn(
                        'px-7 py-5 transition-colors',
                        done ? 'bg-[#F1F8F3]' : 'bg-transparent',
                        index > 0 && 'border-t border-dashed border-[#8AB4F8]',
                      )}
                    >
                      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto]">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-[22px] leading-tight font-[500] text-black">{request.title}</h3>
                            {done && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F4EA] px-2.5 py-0.5 text-[11px] font-black text-[#137333]">
                                <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                Done
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-[13.5px] leading-tight font-semibold text-[#5F6368]">{request.question}</p>
                          <p className="mt-4 max-w-[840px] text-[14px] leading-[1.22] font-semibold text-[#5F6368]">{request.why}</p>
                          <p className="mt-4 text-[13px] font-semibold text-[#888C91]"><span className="font-black text-[#7A7F85]">Impacts:</span> {request.impacts.map(panelTitle).join(' · ')}</p>
                          {evidence && (
                            <div className="mt-3 rounded-[14px] border border-[#C8E6C9] bg-white/75 px-4 py-2.5">
                              <div className="text-[11px] font-black uppercase tracking-[0.12em] text-[#137333]">{evidence.skipped ? 'Continued without additional context' : 'Information added'}</div>
                              <p className="mt-1 text-[14px] font-semibold leading-snug text-[#3C4043]">{evidence.answer}</p>
                            </div>
                          )}
                        </div>
                        <div className="justify-self-start md:justify-self-end flex flex-col items-start gap-2">
                          <button
                            onClick={() => open ? setExpandedInformationId(null) : openInformation(request)}
                            className={cn('rounded-[18px] px-5 py-2.5 text-[14.5px] font-black', done ? 'bg-white text-[#1A73E8] ring-1 ring-[#D2E3FC] hover:bg-[#E8F0FE]' : 'bg-[#1A73E8] text-white hover:bg-[#1967D2]')}
                          >
                            {open ? 'Cancel' : done ? 'Edit' : 'Add information'}
                          </button>
                          {reviewTarget && (
                            <button
                              type="button"
                              onClick={() => {
                                if (onJumpPanel) onJumpPanel(reviewTarget.section, reviewTarget.panelLabel);
                                else onJumpSection?.(reviewTarget.section);
                              }}
                              className="rounded-[18px] border border-[#D2E3FC] bg-white px-5 py-2.5 text-[14px] font-black text-[#1A73E8] hover:bg-[#E8F0FE]"
                            >
                              {reviewTarget.buttonLabel}
                            </button>
                          )}
                        </div>
                      </div>
                      {open && (
                        <div className="mt-7 rounded-[18px] border border-[#D0D4DA] bg-white/65 p-4">
                          <div className="flex flex-wrap gap-2">
                            {request.choices.map(choice => (
                              <button key={choice} onClick={() => setInformationChoice(choice)} className={cn('rounded-full border px-4 py-2 text-[13px] font-black transition-colors', informationChoice === choice ? 'border-[#1A73E8] bg-[#D2E3FC] text-[#174EA6]' : 'border-[#D0D4DA] bg-white text-[#5F6368] hover:border-[#1A73E8]/50')}>{choice}</button>
                            ))}
                          </div>
                          <textarea value={informationDetail} onChange={event => setInformationDetail(event.target.value)} rows={2} placeholder="Add customer-specific context…" className="mt-4 w-full resize-y rounded-[14px] border border-[#D0D4DA] bg-white px-4 py-3 text-[14px] text-black outline-none focus:border-[#1A73E8]" />
                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <button onClick={() => saveInformation(request)} disabled={!informationChoice && !informationDetail.trim()} className="rounded-full bg-[#1A73E8] px-5 py-2.5 text-[13px] font-black text-white disabled:opacity-45">Save information</button>
                            <button onClick={() => continueWithoutInformation(request)} className="rounded-full px-4 py-2.5 text-[13px] font-black text-[#5F6368] hover:bg-black/5">Continue without it</button>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
              {outstandingInformation.length === 0 && (
                <div className="mt-6 flex items-center justify-between gap-4 rounded-[20px] border border-[#C8E6C9] bg-white/75 px-5 py-4">
                  <div className="flex items-center gap-3 text-[#137333]">
                    <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <div>
                      <div className="text-[15px] font-black">All review context captured</div>
                      <div className="text-[13px] font-semibold text-[#5F6368]">These answers will be fed into the next Gemini suggestions.</div>
                    </div>
                  </div>
                  <button onClick={() => setInformationGateComplete(true)} className="rounded-full bg-[#1A73E8] px-6 py-3 text-[14px] font-black text-white hover:bg-[#1967D2]">
                    Continue to Gemini suggestions
                  </button>
                </div>
              )}
            </section>
          ) : (
            <>

      {/* Horizontal step nav — same shared sliding pill treatment as Support History. */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="sticky z-40 self-center flex justify-center pointer-events-none"
        style={{ top: WORKSPACE_NAV_TOP, marginBottom: WORKSPACE_NAV_TOP }}
      >
        <div className={cn(
          'flex max-w-[calc(100vw-180px)] items-center gap-[3px] overflow-visible p-[6px] rounded-[100px] bg-white/95 dark:bg-[#28272E]/95 backdrop-blur-[12px] border border-[rgba(218,220,224,0.8)] dark:border-white/[0.08] shadow-[0_4px_20px_rgba(32,33,36,0.08),0_1px_4px_rgba(32,33,36,0.04)] w-fit',
          navSettling ? 'pointer-events-none' : 'pointer-events-auto',
        )}>
          {flow.map(p => {
            const ns = state[p.id].status;
            const done = ns === 'accepted' || ns === 'edited';
            const locked = ns === 'locked';
            const stale = ns === 'stale';
            const navActive = activeNav === p.id;
            const navPreview = navPreviewId === p.id && !navActive;
            const navExpanded = navActive || navPreview;
            const fillIcon = navActive || done;
            const expandedWidth = Math.max(32, Math.min(220, p.title.length * 8.5 + 48));
            return (
              <button
                key={p.id}
                aria-disabled={locked}
                onClick={() => jumpToPanel(p.id)}
                onMouseEnter={() => setNavPreviewId(p.id)}
                onMouseLeave={() => setNavPreviewId(current => current === p.id ? null : current)}
                onFocus={() => setNavPreviewId(p.id)}
                onBlur={() => setNavPreviewId(current => current === p.id ? null : current)}
                style={{ width: navExpanded ? expandedWidth : 32 }}
                className={cn(
                  'relative box-border flex h-8 items-center rounded-[100px] text-[13px] font-[500] transition-[width,background-color,color,box-shadow] duration-200 ease-out select-none whitespace-nowrap shrink-0 overflow-hidden',
                  navExpanded
                    ? 'justify-start gap-1.5 px-[12px] text-[#1a73e8] dark:text-[#8AB4F8]'
                    : locked
                    ? 'justify-center text-[#9AA0A6]/55 cursor-default'
                    : done
                    ? 'justify-center bg-[#137333] text-white shadow-[0_1px_4px_rgba(19,115,51,0.22)]'
                    : stale
                    ? 'justify-center text-[#9A6700] dark:text-[#FBD38D] hover:bg-[#9A6700]/10'
                    : 'justify-center text-[#5f6368] dark:text-white/60 hover:bg-[rgba(60,64,67,0.06)] hover:text-[#202124] dark:hover:text-white',
                )}
              >
                {navActive && (
                  <motion.div
                    layoutId="ws-nav-pill"
                    className="absolute inset-0 bg-[#e8f0fe] dark:bg-[#1a73e8]/20 rounded-[100px]"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                {navPreview && (
                  <span className="absolute inset-0 z-0 rounded-[100px] bg-[#e8f0fe] dark:bg-[#1a73e8]/20" />
                )}
                <span className="relative z-10 material-symbols-outlined shrink-0" style={{ fontSize: '17px', fontVariationSettings: fillIcon ? "'FILL' 1" : '' }}>{p.icon}</span>
                {navExpanded && (
                  <span className="relative z-10 min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                    {p.title}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Panels column — mt-3 keeps cards below the floating nav without touching */}
      {/* each panel fills the viewport so only one shows at a time;
          the next panel peeks ~100px at the bottom via natural page scroll. */}
      <div className="flex flex-col gap-0">
      {flow.map((p, idx) => {
        const st = state[p.id];
        const isCurrent = st.status === 'current';
        const isLocked = st.status === 'locked';
        const isStale = st.status === 'stale';
        const isDone = st.status === 'accepted' || st.status === 'edited';
        const isLast = idx === flow.length - 1;
        const actionable = isCurrent || isStale;
        const editing = editingId === p.id;
        const isFinalPanel = p.id === 'finalResponse';
        const panelThinking = isCurrent && (gen.id === p.id || !pregenDone.has(p.id));
        // The Google border is a generation-complete state, not an acceptance
        // state. It appears the moment Final Ticket Response has usable output and remains
        // visible after the consultant accepts or edits it.
        const finalComplete = isFinalPanel && Boolean(st.content) && !panelThinking;

        return (
          <motion.div
            key={p.id}
            ref={el => { panelRefs.current[p.id] = el as HTMLDivElement | null; }}
            data-pid={p.id}
            className="flex flex-col"
            style={{ scrollMarginTop: `${WORKSPACE_NAV_GAP}px`, transformOrigin: 'top center' }}
            // Snap-into-place motion: scale + fade from the TOP origin. Scaling from the
            // top keeps the panel's top edge fixed, so it never shifts the position the
            // smooth scroll aligns to (a y-translate did, causing the "jump above" bug).
            // No CSS scroll-snap, so long panels scroll freely without jumping back.
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, margin: '0px 0px -20% 0px' }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            {/* Panel card + connector line below (except last) */}
            <div className="flex-1 min-w-0">
              <div
                data-gem-panel
                data-gem-panel-label={p.title}
                data-gem-panel-content={st.content ? `${p.title}: ${st.content.slice(0, 800)}` : `${p.title} — not yet generated`}
                className={cn(
                'rounded-xl p-5 transition-all relative',
                p.isIntro && 'getstarted-panel relative mx-auto w-full max-w-[740px]',
                panelThinking && 'workspace-gemini-shell workspace-gemini-shell-thinking',
                finalComplete && 'workspace-gemini-shell workspace-gemini-shell-complete',
                isCurrent ? (isFinalPanel ? 'border-0 bg-white dark:bg-inverse-surface/40 shadow-[0_1px_3px_rgba(26,115,232,0.12)]' : 'border-2 border-[#1A73E8] bg-white dark:bg-inverse-surface/40 shadow-[0_1px_3px_rgba(26,115,232,0.12)]') :
                isStale ? 'border-2 border-[#F59E0B]/60 bg-[#FEF7E0]/40 dark:bg-[#F59E0B]/5' :
                isLocked ? 'border border-dashed border-outline-variant/80 dark:border-outline-variant/50 bg-surface-variant/20 dark:bg-inverse-surface/10' :
                (isFinalPanel ? 'border-0 bg-white dark:bg-inverse-surface/40' : 'border border-outline-variant/80 dark:border-outline-variant/50 bg-white dark:bg-inverse-surface/40'),
              )}>
                {/* Header (hidden on the intro panel for a clean splash) */}
                {!p.isIntro && (
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={cn('material-symbols-outlined text-[18px]', isLocked ? 'text-outline/50' : 'text-[#1A73E8] dark:text-[#8AB4F8]')}>{p.icon}</span>
                    <h4 className={cn('text-[15px] font-black truncate', isLocked ? 'text-outline/60' : 'text-on-surface dark:text-inverse-on-surface')}>{p.title}</h4>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Edit / Refresh on completed panels */}
                    {isDone && !editing && !p.isIntro && (
                      <>
                        <button onClick={() => startEdit(p.id)} className="flex items-center gap-1 text-[11px] font-bold text-outline hover:text-[#1A73E8] transition-colors">
                          <span className="material-symbols-outlined text-[15px]">edit</span> Edit
                        </button>
                        <button
                          onClick={() => generatePanel(p.id, p.title)}
                          disabled={gen.id === p.id}
                          className="flex items-center gap-1 text-[11px] font-bold text-outline hover:text-[#1A73E8] transition-colors disabled:opacity-50"
                        >
                          <span className={cn('material-symbols-outlined text-[15px]', gen.id === p.id && 'animate-spin')}>{gen.id === p.id ? 'progress_activity' : 'autorenew'}</span> Refresh
                        </button>
                      </>
                    )}
                    {st.status !== 'current' && <StatusChip status={st.status} />}
                  </div>
                </div>
                )}

                {/* Body */}
                {isLocked ? (
                  (() => {
                    // Locked-panel status. Only the panel ACTIVELY generating right now
                    // shows the streaming skeleton; queued panels show a calm one-liner
                    // (no per-panel stream), and finished ones read as ready.
                    const isGenerating = gen.id === p.id;
                    const isReady = pregenDone.has(p.id);
                    if (isGenerating) {
                      return (
                        <span className="flex h-10 items-center pl-[34px] text-[15px] font-semibold leading-normal text-[#4F565E] dark:text-white/75">
                          <span className="thinking-shimmer">Thinking...</span>
                        </span>
                      );
                    }
                    if (!isReady) {
                      // The final reply isn't pre-generated — it's synthesised from
                      // the approved findings when reached.
                      if (p.isFinal) {
                        return (
                          <p className="flex items-center gap-1.5 text-[13px] text-outline/70 italic">
                            <GeminiIcon className="w-3.5 h-3.5 not-italic" />
                            Assembled from your approved findings once you reach this step.
                          </p>
                        );
                      }
                      // Queued (not yet its turn) — calm one-liner, NO skeleton stream.
                      return (
                        <p className="flex items-center gap-1.5 text-[13px] text-outline/70 italic">
                          <span className="material-symbols-outlined text-[15px] text-outline/60 not-italic">schedule</span>
                          Queued — AI suggestion will be prepared shortly.
                        </p>
                      );
                    }
                    return (
                      <p className="flex items-center gap-1.5 text-[13px] text-outline/70 italic">
                        <span className="material-symbols-outlined text-[15px] text-[#137333] dark:text-[#81C995] not-italic">check_circle</span>
                        AI suggestion ready — unlocks after you act on the panel above.
                      </p>
                    );
                  })()
                ) : (
                  renderPanelBody(p.id, st)
                )}

                {editing && !isLocked && !p.isIntro && (
                  (() => {
                  // Busy = this panel's edit is running or queued behind background gen.
                  const editBusy = gen.id === p.id || regenPending === p.id;
                  const editRunning = gen.id === p.id;            // actively streaming now
                  const editQueued = regenPending === p.id && gen.id !== p.id; // waiting its turn
                  const hasEditText = draft.trim().length > 0;
                  return (
                  <div className="mt-3 flex flex-col gap-2 rounded-xl border border-outline-variant/25 bg-surface-variant/20 dark:bg-inverse-surface/15 p-3">
                    <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 dark:text-inverse-on-surface/55">
                      <span className="material-symbols-outlined text-[14px]">edit_note</span>
                      Your addition
                    </label>
                    <textarea
                      value={draft}
                      onChange={e => {
                        setDraft(e.target.value);
                        setCleanupClaims([]);
                        setCleanupConfirmation(null);
                        setCleanupEvidence([]);
                        setCleanupGrounding(null);
                        lastRegenRef.current = '';
                        lastReviewedInputRef.current = '';
                      }}
                      disabled={editBusy}
                      rows={Math.min(10, Math.max(3, draft.split('\n').length + 1))}
                      placeholder="Add your wording, caveat, or correction. Gemini will check it against the ticket data before it is applied."
                      className="w-full min-h-[86px] text-[13px] leading-relaxed text-on-surface dark:text-inverse-on-surface bg-white/70 dark:bg-inverse-surface/20 border border-[#1A73E8]/25 rounded-xl px-3 py-2 outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/10 resize-y font-sans placeholder:text-outline/60 disabled:opacity-60"
                    />
                    <div className="flex items-center gap-2">
                      <button onClick={() => submitEdit(p.id, p.title)} disabled={editBusy || !hasEditText} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A73E8] text-white rounded-full text-[12px] font-bold hover:bg-[#1967D2] transition-colors disabled:opacity-50">
                        <span className={cn('material-symbols-outlined text-[16px]', editBusy && 'animate-spin')}>{editBusy ? 'progress_activity' : 'check'}</span>
                        {editBusy ? 'Regenerating…' : 'Save & continue'}
                      </button>
                      <button
                        onClick={() => cleanUpDraft(p.id, p.title)}
                        disabled={editBusy || !hasEditText}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold text-[#1A73E8] dark:text-[#8AB4F8] border border-[#1A73E8]/30 hover:bg-[#1A73E8]/5 transition-colors disabled:opacity-50"
                      >
                        <span className={cn('material-symbols-outlined text-[15px]', editBusy && 'animate-spin')}>{editBusy ? 'progress_activity' : 'auto_fix_high'}</span>
                        Clean up
                      </button>
                      {cleanupClaims.length > 0 && (
                        <button onClick={() => saveAnyway(p.id)} disabled={editBusy} className="px-3 py-1.5 rounded-full text-[12px] font-bold text-[#9A6700] dark:text-[#FBD38D] border border-[#9A6700]/40 hover:bg-[#9A6700]/5 transition-colors disabled:opacity-50">Ignore &amp; Save</button>
                      )}
                      <button onClick={() => { setEditingId(null); setCleanupClaims([]); setCleanupConfirmation(null); setCleanupEvidence([]); setCleanupGrounding(null); }} disabled={editBusy} className="px-3 py-1.5 rounded-full text-[12px] font-bold text-outline border border-outline-variant/30 hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50">Cancel</button>
                    </div>

                    {(editQueued || editRunning) && (
                      <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[#1A73E8] dark:text-[#8AB4F8]">
                        <GeminiIcon className="w-3 h-3 gemini-twinkle" />
                        {editRunning ? 'Regenerating this section…' : 'Queued — regenerates as soon as the current background step finishes…'}
                      </div>
                    )}

                    {(cleanupClaims.length > 0 || cleanupConfirmation) && (
                      <div className="flex gap-3 p-4 rounded-xl border border-outline-variant/30 dark:border-white/10 bg-[#FEF7E0]/60 dark:bg-[#F59E0B]/5 shadow-sm transition-all duration-200">
                        <div className="flex flex-col gap-2 min-w-0 flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A5200] dark:text-[#FBD38D]">
                            Note for you — not in the reply
                          </span>
                          {cleanupClaims.length > 0 ? (
                            <>
                              <div className="text-[12.5px] leading-relaxed text-[#5F3E00] dark:text-[#FBD38D]/90">
                                <p className="font-semibold mb-1">
                                  {cleanupGrounding ? 'This part of your edit isn’t supported by the case data and was left out:' : 'You said:'}
                                </p>
                                <ul className="list-disc pl-4 space-y-1 my-2">
                                  {cleanupClaims.map((claim, idx) => (
                                    <li key={idx} className="font-semibold text-[#5F3E00] dark:text-[#FBD38D]/85">
                                      {claim}
                                    </li>
                                  ))}
                                </ul>
                                {!cleanupGrounding && <p className="mt-1">...but the supporting data shows:</p>}
                              </div>
                              {cleanupGrounding && (
                                <div className="mt-2 pt-2 border-t border-[#9A6700]/10 text-[12.5px] leading-relaxed text-[#5F3E00] dark:text-[#FBD38D]/90">
                                  <span className="font-bold">Root cause on record:</span> {cleanupGrounding}
                                </div>
                              )}
                              {renderCleanupEvidence(cleanupEvidence)}
                              <p className="text-[11.5px] font-semibold text-[#7A5200]/90 dark:text-[#FBD38D]/80 mt-2.5 border-t border-[#9A6700]/10 pt-2.5">
                                The answer above was regenerated with the correct values. Save &amp; continue to confirm — or use “Ignore &amp; Save” to keep your original wording.
                              </p>
                            </>
                          ) : (
                            <p className="text-[12.5px] leading-relaxed text-[#5F3E00] dark:text-[#FBD38D]/90 font-medium">
                              {cleanupConfirmation}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  );
                  })()
                )}

                {/* Action row — Accept / Reject(→edit) on the current/stale panel */}
                {actionable && !editing && !p.isIntro && (() => {
                  // Block Accept/Reject/Refresh while the panel is streaming OR still
                  // awaiting its (serialized) AI pass — so the consultant can't act on
                  // the placeholder seed before the real suggestion lands.
                  const busy = gen.id === p.id || !pregenDone.has(p.id);
                  return (
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-outline-variant/15">
                    <button onClick={() => doAccept(p.id)} disabled={busy} className="flex h-8 items-center gap-1.5 px-3.5 bg-[#1A73E8] text-white rounded-full text-[12px] font-bold hover:bg-[#1967D2] transition-colors disabled:opacity-50">
                      <span className="material-symbols-outlined text-[16px]">check</span> Accept
                    </button>
                    <button onClick={() => startEdit(p.id)} disabled={busy} className="flex h-8 items-center gap-1.5 px-3.5 rounded-full text-[12px] font-bold text-[#C5221F] dark:text-[#F28B82] border border-[#C5221F]/30 hover:bg-[#C5221F]/5 transition-colors disabled:opacity-50">
                      <span className="material-symbols-outlined text-[16px]">edit_note</span> Reject &amp; edit
                    </button>
                    <button
                      onClick={() => askGeminiAboutPanel(p.id, p.title)}
                      className="relative flex h-8 items-center gap-1.5 px-3.5 rounded-full text-[12px] font-bold transition-all select-none whitespace-nowrap shrink-0 bg-[#E8F0FE] dark:bg-[#1A73E8]/20 text-[#1A73E8] dark:text-[#D2E3FC] hover:bg-[#D2E3FC] dark:hover:bg-[#1A73E8]/30 active:scale-[0.97]"
                    >
                      <GeminiIcon className="w-[15px] h-[15px]" />
                      <span>Ask Gemini</span>
                    </button>
                    <button onClick={() => generatePanel(p.id, p.title)} disabled={busy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold text-outline hover:bg-black/5 dark:hover:bg-white/5 transition-colors ml-auto disabled:opacity-50">
                      <span className={cn('material-symbols-outlined text-[15px]', busy && 'animate-spin')}>{busy ? 'progress_activity' : 'autorenew'}</span>
                      Refresh
                    </button>
                  </div>
                  );
                })()}

                {/* Final-panel resolution actions */}
                {p.isFinal && isDone && !editing && (
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-outline-variant/15 relative">
                    <button
                      onClick={() => setResolution(`Ticket ${ticket?.case_number} marked resolved.`)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#137333] text-white rounded-full text-[12px] font-bold hover:bg-[#0E5C28] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">task_alt</span> Resolve Ticket
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setShowStatusMenu(v => !v)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-bold text-[#1A73E8] dark:text-[#8AB4F8] border border-[#1A73E8]/30 hover:bg-[#1A73E8]/5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span> Update Status
                        <span className="material-symbols-outlined text-[16px]">expand_more</span>
                      </button>
                      {showStatusMenu && (
                        <div className="absolute top-full left-0 mt-1 z-20 bg-white dark:bg-[#2C2B30] rounded-xl border border-outline-variant/20 shadow-lg overflow-hidden min-w-[160px]">
                          {STATUS_OPTIONS.map(opt => (
                            <button
                              key={opt}
                              onClick={() => { setResolution(`Status updated to "${opt}".`); setShowStatusMenu(false); }}
                              className="w-full text-left px-4 py-2 text-[12px] font-semibold text-on-surface dark:text-inverse-on-surface hover:bg-[#E8F0FE]/60 dark:hover:bg-[#1A73E8]/10 transition-colors"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {resolution && (
                      <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[#137333] dark:text-[#81C995] ml-1">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>{resolution}
                      </span>
                    )}
                  </div>
                )}
              </div>
              {/* Dotted connector — creates a clean runway between cards; green if done, gray otherwise */}
              {!isLast && (
                <div className={cn('relative', p.isIntro && 'pt-7')}>
                  <div className={cn(
                    'relative left-1/2 w-px -translate-x-1/2 border-l-2 border-dashed',
                    isDone ? 'border-[#137333]/50 dark:border-[#81C995]/40' : 'border-outline-variant/60 dark:border-outline-variant/40',
                  )} style={{ height: `${WORKSPACE_NAV_GAP}px` }} />
                </div>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Trailing space so the LAST panels can still scroll up to lock at the top
          (otherwise the page can't scroll far enough and the previous panel stays visible). */}
      <div aria-hidden className="shrink-0" style={{ height: '55vh' }} />
      </div>
            </>
          )}
      </motion.div>
    </AnimatePresence>
  );
}
