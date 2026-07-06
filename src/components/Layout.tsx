import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { ViewType } from '../App';
import { cn } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import GeminiIcon from './GeminiIcon';
import { SearchSparkIcon } from './SparkIcons';
import AiPanel, { type AppAction, type ChatMessage } from './AiPanel';
import GeminiPromptPill, { type ContextChip, type GeminiSearchItem } from './GeminiPromptPill';
import { useCaseDataset } from '../hooks/useCaseDataset';
import { isOpenCase, isClosedCase, type CaseRecord } from '../services/caseDataset';
import { AiPanelContext, type ScreenContext } from '../contexts/AiPanel';

const pct = (v: number) => (v * 100).toFixed(1) + '%';

// Notifications are temporarily turned off. Flip to true to reinstate the bell +
// panel (all the underlying code is kept intact). The AI panel is independent of this.
const NOTIFICATIONS_ENABLED = false;

/** Serialize the full ticket data for a given section tab into a grounding string. */
function serializeSectionContext(section: string, ticket: CaseRecord | null): string {
  if (!ticket) return `Section: ${section} (no active ticket)`;
  const m = ticket.metrics;
  const base = `Case ${ticket.case_number} — ${ticket.account_name}\nIssue: ${ticket.case_subject}\nRoot cause: ${ticket.root_cause_summary}\n`;
  switch (section) {
    case 'Overview':
      return base + `Accepted Rate: ${pct(m.accepted_rate)}\nBounce Rate: ${pct(m.bounce_rate)}\nOpen Rate: ${pct(m.nonprefetched_open_rate)}\nSpam Complaint Rate: ${pct(m.spam_complaint_rate)}`;
    case 'Deliverability':
      return base + `Accepted Rate: ${pct(m.accepted_rate)}\nBounce Rate: ${pct(m.bounce_rate)}\nOpen Rate: ${pct(m.nonprefetched_open_rate)}\nSpam Complaint Rate: ${pct(m.spam_complaint_rate)}\nTop bounces:\n${ticket.bounces.slice(0, 3).map(b => `  ${b.domain}: ${b.count} bounces — ${(b.reason || '').slice(0, 80)}`).join('\n')}`;
    case 'Authentication':
      return base + `SPF: ${ticket.spf_status} — ${ticket.spf_description}\nDKIM: ${ticket.dkim_status} — ${ticket.dkim_description} (selector: ${ticket.dkim_selector})\nDMARC: ${ticket.dmarc_status} — ${ticket.dmarc_description}\nDMARC policy: ${ticket.dmarc_policy}`;
    case 'Email Performance':
      return base + `Accepted Rate: ${pct(m.accepted_rate)}\nOpen Rate: ${pct(m.nonprefetched_open_rate)}\nBounce Rate: ${pct(m.bounce_rate)}\nSpam Complaint Rate: ${pct(m.spam_complaint_rate)}`;
    case 'Support History':
      return base + `Priority: ${ticket.case_priority} | Status: ${ticket.case_status} | Owner: ${ticket.case_owner}\nTags: ${ticket.tags.join(', ')}`;
    default:
      return base + `Section: ${section}`;
  }
}

// Punchy, data-grounded starter questions for a ticket — shown instantly while
// the model-generated suggestions load, so the fallback never looks templated.
function ticketStarters(t: CaseRecord): string[] {
  const subj = String(t.case_subject || '');
  const tags = (t.tags || []).map((x: string) => String(x).toUpperCase());
  const provider = tags.includes('GMAIL') || /gmail/i.test(subj) ? 'Gmail'
    : tags.includes('YAHOO') || /yahoo/i.test(subj) ? 'Yahoo'
    : /outlook|microsoft|hotmail/i.test(subj) ? 'Outlook' : null;
  const pool = subj.match(/Pool\s+[A-Za-z0-9]+/i)?.[0];
  const domain = t.sending_domains[0];
  const cands: string[] = [];
  if (t.metrics.bounce_rate) cands.push(`Fix the ${pct(t.metrics.bounce_rate)} bounce rate?`);
  if (pool) cands.push(`Is ${pool} the cause?`);
  if (provider) cands.push(`Why is ${provider} blocking us?`);
  else if (domain) cands.push(`Why is ${domain} bouncing?`);
  if (t.metrics.accepted_rate) cands.push(`Recover ${pct(t.metrics.accepted_rate)} delivery?`);
  if (tags.includes('BOUNCE SPIKE')) cands.push('Stop the bounce spike?');
  cands.push(`Root cause for ${t.case_number}?`);
  cands.push(`Next steps to resolve?`);
  return [...new Set(cands)].slice(0, 3);
}

interface ActiveFiltersContext {
  dateRange?: { from: string; to: string };
  sendingIps?: string[];
  sendingDomains?: string[];
  recipientDomains?: string[];
  ipPools?: string[];
  mailboxProviders?: string[];
  campaigns?: string[];
  subaccounts?: string[];
  selectedIp?: string;
  selectedPool?: string;
  selectedIsp?: string;
  selectedDomain?: string;
  selectedSendingDomain?: string;
  selectedCampaign?: string;
  selectedSubaccount?: string;
  selectedBounceClass?: string;
}

function serializeActiveFilters(filters: ActiveFiltersContext | null): string {
  if (!filters) return '';
  const lines: string[] = [];
  
  if (filters.dateRange?.from && filters.dateRange?.to) {
    const fromDate = new Date(filters.dateRange.from);
    const toDate = new Date(filters.dateRange.to);
    const fromStr = fromDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const toStr = toDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const days = Math.round(Math.abs(toDate.getTime() - fromDate.getTime()) / 86400000) + 1;
    lines.push(`Active Date Range Filter: ${fromStr} – ${toStr} (${days}-day window)`);
  }
  
  if (filters.selectedIp) lines.push(`Selected IP: ${filters.selectedIp}`);
  if (filters.selectedDomain || filters.selectedSendingDomain) lines.push(`Selected Sending Domain: ${filters.selectedDomain || filters.selectedSendingDomain}`);
  if (filters.selectedPool) lines.push(`Selected IP Pool: ${filters.selectedPool}`);
  if (filters.selectedIsp) lines.push(`Selected Mailbox Provider (ISP): ${filters.selectedIsp}`);
  if (filters.selectedCampaign) lines.push(`Selected Campaign: ${filters.selectedCampaign}`);
  if (filters.selectedSubaccount) lines.push(`Selected Subaccount: ${filters.selectedSubaccount}`);
  if (filters.selectedBounceClass) lines.push(`Selected Bounce Class: ${filters.selectedBounceClass}`);
  
  if (filters.sendingIps?.length) lines.push(`Filtered Sending IPs: ${filters.sendingIps.join(', ')}`);
  if (filters.sendingDomains?.length) lines.push(`Filtered Sending Domains: ${filters.sendingDomains.join(', ')}`);
  if (filters.recipientDomains?.length) lines.push(`Filtered Recipient Domains: ${filters.recipientDomains.join(', ')}`);
  if (filters.ipPools?.length) lines.push(`Filtered IP Pools: ${filters.ipPools.join(', ')}`);
  if (filters.mailboxProviders?.length) lines.push(`Filtered Mailbox Providers: ${filters.mailboxProviders.join(', ')}`);
  if (filters.campaigns?.length) lines.push(`Filtered Campaigns: ${filters.campaigns.join(', ')}`);
  if (filters.subaccounts?.length) lines.push(`Filtered Subaccounts: ${filters.subaccounts.join(', ')}`);
  return lines.join('\n');
}

function buildTicketContext(t: CaseRecord, activeSection = 'Overview', activeFilters: ActiveFiltersContext | null = null): ScreenContext {
  const sectionContext = serializeSectionContext(activeSection, t);
  const activeFiltersContextStr = serializeActiveFilters(activeFilters);
  const fullTicketContext = [
    serializeSectionContext('Overview', t),
    serializeSectionContext('Authentication', t),
    serializeSectionContext('Deliverability', t),
    serializeSectionContext('Email Performance', t),
    serializeSectionContext('Support History', t),
  ].join('\n\n---\n\n');
  return {
    view: 'investigation',
    kind: 'ticket',
    title: t.account_name,
    subtitle: `${t.case_number} · ${t.case_status} · ${t.case_priority} priority`,
    issue: t.case_subject,
    rca: t.root_cause_summary,
    recordId: t.case_number,
    accountKey: t.account_name,
    data: [
      { label: 'Bounce Rate', value: pct(t.metrics.bounce_rate) },
      { label: 'Accepted Rate', value: pct(t.metrics.accepted_rate) },
      { label: 'Open Rate', value: pct(t.metrics.nonprefetched_open_rate) },
      { label: 'Spam Complaint Rate', value: pct(t.metrics.spam_complaint_rate) },
      { label: 'Sending Domain', value: t.sending_domains[0] },
      ...(activeFilters?.selectedIp ? [{ label: 'Selected IP', value: activeFilters.selectedIp }] : []),
      ...(activeFilters?.selectedDomain || activeFilters?.selectedSendingDomain ? [{ label: 'Selected Sending Domain', value: activeFilters.selectedDomain || activeFilters.selectedSendingDomain }] : []),
      ...(activeFilters?.selectedPool ? [{ label: 'Selected IP Pool', value: activeFilters.selectedPool }] : []),
      ...(activeFilters?.selectedIsp ? [{ label: 'Selected ISP', value: activeFilters.selectedIsp }] : []),
      ...(activeFilters?.selectedCampaign ? [{ label: 'Selected Campaign', value: activeFilters.selectedCampaign }] : []),
      ...(activeFilters?.selectedSubaccount ? [{ label: 'Selected Subaccount', value: activeFilters.selectedSubaccount }] : []),
      ...(activeFilters?.sendingIps?.length ? [{ label: 'Filtered IPs', value: activeFilters.sendingIps.join(', ') }] : []),
      ...(activeFilters?.sendingDomains?.length ? [{ label: 'Filtered Domains', value: activeFilters.sendingDomains.join(', ') }] : []),
    ].filter(d => d.value),
    raw: `Active ticket section: ${activeSection}
Use the active section and the active filters as the immediate visual focus. If a selected IP, sending domain, mailbox provider, IP pool, campaign, or subaccount is present, treat that narrower selected entity as the primary scope before the wider ticket/account.

${activeFiltersContextStr ? `=== ACTIVE FILTERS ON SCREEN ===\n${activeFiltersContextStr}\n` : ''}
=== ACTIVE SECTION CONTEXT ===
${sectionContext}

=== FULL TICKET / ACCOUNT CONTEXT ===
${fullTicketContext}

Tags: ${(t.tags || []).join(', ')}
Sending domains: ${(t.sending_domains || []).join(', ')}
Subaccounts: ${(t.subaccounts || []).join(', ')}`,
    dateRange: activeFilters?.dateRange ? { from: activeFilters.dateRange.from, to: activeFilters.dateRange.to } : undefined,
    suggestions: ticketStarters(t),
  };
}

const TOOL_CONTEXT: Record<string, { title: string; issue: string; suggestions: string[] }> = {
  dig: {
    title: 'Google Dig (DNS Lookup)', issue: 'Inspecting DNS records for a sending domain',
    suggestions: ['How do I read these DNS records?', 'What should a healthy SPF record look like?', 'Why would an A or MX record be missing?'],
  },
  mx: {
    title: 'MX Toolbox', issue: 'Checking mail exchanger records and routing',
    suggestions: ['What do these MX priorities mean?', 'How do I diagnose a missing MX record?', 'How does MX setup affect deliverability?'],
  },
  analyzer: {
    title: 'Message Header Analyzer', issue: 'Parsing a raw email header for deliverability signals',
    suggestions: ['What do the authentication results mean?', 'How do I spot a delivery delay in these hops?', 'Which header fields indicate a spam flag?'],
  },
  ip_warming: {
    title: 'IP Warming Planner', issue: 'Planning a volume ramp schedule for a sending IP',
    suggestions: ['What strategy fits a 100k list?', 'How long should warming take for a new IP?', 'What volumes suit a conservative ramp?'],
  },
};

function buildToolContext(tab: string): ScreenContext {
  const c = TOOL_CONTEXT[tab] || TOOL_CONTEXT.dig;
  return { view: 'tools', kind: 'tool', title: c.title, subtitle: 'Tools', issue: c.issue, suggestions: c.suggestions };
}

// Stable key identifying the case/context a pinned panel belongs to. Two pins
// with different scope keys are NOT the same case (e.g. ticket TCK-5211 vs a
// globally-loaded IP Warming planner), even if pinned in the same session.
function scopeKeyFor(ctx: ScreenContext | null): string {
  if (!ctx) return 'none';
  if (ctx.kind === 'ticket') return `ticket:${ctx.recordId ?? ctx.accountKey ?? ctx.title ?? ''}`;
  if (ctx.kind === 'tool') return `tool:${ctx.title ?? ctx.view ?? ''}`;
  if (ctx.kind === 'guide') return `guide:${ctx.recordId ?? ctx.title ?? ''}`;
  return `${ctx.kind}:${ctx.view ?? ''}`;
}

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  onOpenGuideArticle: (githubPath: string) => void;
  toggleTheme: () => void;
  isDark: boolean;
  globalSearch: string;
  onSearchChange: (val: string) => void;
  activeSection: string;
  onSectionChange: (s: string) => void;
  selectedTicketId: string | null;
  onSelectTicket: (id: string | null) => void;
  toolsTab: string;
  onToolsTabChange: (tab: 'dig' | 'mx' | 'analyzer' | 'ip_warming') => void;
  isTicketPanelOpen: boolean;
  setIsTicketPanelOpen: (v: boolean) => void;
  hudCompact: boolean;
  setHudCompact: (v: boolean) => void;
  inboxType: string;
  setInboxType: (v: string) => void;
  paneOption: string;
  setPaneOption: (v: string) => void;
}

const SECTION_TABS = [
  { label: 'Overview', icon: 'visibility', trailingSep: true },
  { label: 'Authentication', icon: 'shield' },
  { label: 'Deliverability', icon: 'mark_email_unread' },
  { label: 'Email Performance', icon: 'equalizer' },
  { label: 'Support History', icon: 'history' },
  { label: 'Workspace', icon: 'edit', standalone: true },
];

const VIEW_LABELS: Record<string, string> = {
  glance: 'Dashboard',
  charts: 'Analytics',
  tools: 'Tools',
  user_guide: 'User Guide',
  settings: 'Settings',
  investigation: 'Tickets',
};

const TOOL_TABS = [
  { id: 'dig' as const, label: 'Google Dig', icon: 'dns' },
  { id: 'ip_warming' as const, label: 'IP Warming', icon: 'thermostat' },
];

const VIEW_ICONS: Record<string, string> = {
  glance: 'grid_view',
  charts: 'bar_chart',
  tools: 'build',
  user_guide: 'menu_book',
  settings: 'settings',
};

type NotifItem = {
  id: string; category: string; icon: string; iconBg: string;
  title: string; body: string; time: string; cta?: string;
  action?: 'investigation' | 'tools' | 'user_guide'; ticketId?: string; guidePath?: string;
};

const NOTIF_ITEMS: NotifItem[] = [
  {
    id: 'n1', category: 'Deliverability Alerts',
    icon: 'warning', iconBg: 'bg-[#E9371F]',
    title: 'Gmail inbox rate dropped below 85%',
    body: 'Domain sendgrid-prod.braze.com is showing elevated soft bounce rates across Gmail. Immediate review recommended.',
    time: '2 min ago', cta: 'Investigate', action: 'investigation',
  },
  {
    id: 'n2', category: 'Deliverability Alerts',
    icon: 'block', iconBg: 'bg-[#FFA524]',
    title: 'Barracuda blocklist detected',
    body: 'IP 198.2.134.51 has been flagged on Barracuda Reputation Block List. Run a DNS lookup to confirm.',
    time: '18 min ago', cta: 'Run DNS Lookup', action: 'tools',
  },
  {
    id: 'n3', category: 'Ticket Updates',
    icon: 'confirmation_number', iconBg: 'bg-[#1A73E8]',
    title: '26060001 — Response needed',
    body: 'Tesco has replied to your authentication ticket. DMARC policy question requires follow-up.',
    time: '34 min ago', cta: 'Open Ticket', action: 'investigation', ticketId: '26060001',
  },
  {
    id: 'n4', category: 'Ticket Updates',
    icon: 'check_circle', iconBg: 'bg-[#2E7D32]',
    title: '26060002 — Resolved',
    body: 'The DKIM alignment issue was resolved after key rotation. Ticket closed.',
    time: '1 hr ago', action: 'investigation', ticketId: '26060002',
  },
  {
    id: 'n5', category: 'Authentication',
    icon: 'shield', iconBg: 'bg-[#1A73E8]',
    title: 'DMARC policy enforcement ready',
    body: '3 domains are at p=quarantine with >95% pass rate. Upgrade to p=reject to maximize protection.',
    time: '3 hr ago', cta: 'View Auth Scan', action: 'investigation',
  },
  {
    id: 'n6', category: 'Insights & Tips',
    icon: 'lightbulb', iconBg: 'bg-[#0288D1]',
    title: 'IP Warming: Week 3 checkpoint',
    body: 'Your warming plan is on track. Increase daily volume to 25,000 as per your schedule for optimal reputation building.',
    time: '5 hr ago', cta: 'View IP Warming', action: 'tools',
  },
  {
    id: 'n7', category: 'Insights & Tips',
    icon: 'menu_book', iconBg: 'bg-[#1A73E8]',
    title: 'New guide: Sunset Policy Best Practices',
    body: 'Learn how to suppress disengaged subscribers to protect sender reputation and improve engagement metrics.',
    time: '1 day ago', cta: 'Read Article', action: 'user_guide',
  },
];

const SUGGESTED_CHIPS = [
  { label: 'Gmail', icon: 'mark_email_unread' },
  { label: 'DMARC', icon: 'shield' },
  { label: 'Yahoo', icon: 'block' },
  { label: 'Outlook', icon: 'mail' },
  { label: 'Bounce', icon: 'error' },
  { label: 'IP warming', icon: 'thermostat' },
];

type SearchItem = {
  type: 'ticket' | 'guide' | 'nav';
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  icon: string;
};

const GUIDE_PATH_PREFIX_RE = /^(docs\/)?user guide\//i;

const humanizeGuideSegment = (segment: string) => segment
  .replace(/\.md$/i, '')
  .replace(/[_-]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .replace(/\b\w/g, c => c.toUpperCase());

const formatGuideSearchResult = (path = '', fallbackTitle = '') => {
  const cleanPath = path
    .replace(/\\/g, '/')
    .replace(GUIDE_PATH_PREFIX_RE, '')
    .replace(/^\/+|\/+$/g, '');
  const parts = cleanPath.split('/').filter(Boolean);
  const rawFileName = parts[parts.length - 1] || fallbackTitle;
  const baseName = rawFileName.replace(/\.md$/i, '');
  const fallbackBase = fallbackTitle.replace(/\.md$/i, '');
  const titleSource = /^index$/i.test(baseName) && parts.length >= 2
    ? parts[parts.length - 2]
    : (baseName || fallbackBase);
  const title = humanizeGuideSegment(titleSource) || 'User Guide';
  const categoryParts = (/^index$/i.test(baseName) ? parts.slice(0, -2) : parts.slice(0, -1))
    .filter(part => !/^index(\.md)?$/i.test(part))
    .slice(-2)
    .map(humanizeGuideSegment)
    .filter(Boolean);

  return {
    title,
    category: ['User Guide', ...categoryParts].join(' / '),
  };
};

const scoreSearchItem = (item: SearchItem & { searchText: string }, rawQuery: string, tokens: string[]) => {
  const title = item.title.toLowerCase();
  const subtitle = (item.subtitle || '').toLowerCase();
  const meta = (item.meta || '').toLowerCase();
  const id = item.id.toLowerCase();
  let score = 0;

  if (title === rawQuery) score += 1000;
  if (title.startsWith(rawQuery)) score += 700;
  if (title.includes(rawQuery)) score += 450;
  if (subtitle.includes(rawQuery)) score += 240;
  if (meta.includes(rawQuery)) score += 160;
  if (id.includes(rawQuery)) score += 90;

  const matchedTokens = tokens.filter(tok => item.searchText.includes(tok));
  if (matchedTokens.length === tokens.length) score += 180;
  score += matchedTokens.length * 25;

  tokens.forEach(tok => {
    if (title === tok) score += 260;
    if (title.startsWith(tok)) score += 180;
    if (title.includes(tok)) score += 120;
    if (subtitle.includes(tok)) score += 55;
    if (meta.includes(tok)) score += 35;
    if (id.includes(tok)) score += 15;
  });

  if (item.type === 'guide') score += 8;
  return score;
};

function formatCaseDate(isoString: string | null | undefined): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return String(isoString);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${month} ${day} ${hours}:${minutes}${ampm}`;
}

export default function Layout({
  children,
  currentView,
  onNavigate,
  onOpenGuideArticle,
  toggleTheme,
  isDark,
  globalSearch,
  onSearchChange,
  activeSection,
  onSectionChange,
  selectedTicketId,
  onSelectTicket,
  toolsTab,
  onToolsTabChange,
  isTicketPanelOpen,
  setIsTicketPanelOpen,
  hudCompact,
  setHudCompact,
  inboxType,
  setInboxType,
  paneOption,
  setPaneOption,
}: LayoutProps) {
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  // Auto-open Gemini on the very first dashboard visit (per-browser, persisted)
  // so new users immediately see the assistant; subsequent loads respect the
  // user's preference to keep it closed.
  const [aiPanelIsLoading, setAiPanelIsLoading] = useState(false);
  const [aiPanelChips, setAiPanelChips] = useState<Array<{ label: string; content: string }>>([]);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(() => {
    try {
      const seen = localStorage.getItem('edq_gemini_first_open_done');
      return !seen && (currentView === 'glance' || currentView === 'charts');
    } catch { return false; }
  });
  useEffect(() => {
    if (isAiPanelOpen) {
      try { localStorage.setItem('edq_gemini_first_open_done', '1'); } catch {}
    }
  }, [isAiPanelOpen]);
  const [aiPanelWidth, setAiPanelWidth] = useState(() => {
    try {
      const stored = Number(localStorage.getItem('edq_ai_panel_width'));
      return Number.isFinite(stored) ? Math.max(320, Math.min(640, stored)) : 340;
    } catch {
      return 340;
    }
  });
  const [isAiPanelDragging, setIsAiPanelDragging] = useState(false);
  const [aiChatHistory, setAiChatHistory] = useState<ChatMessage[]>([]);
  const [screenContext, setScreenContext] = useState<ScreenContext | null>(null);
  const [activeFilters, setActiveFilters] = useState<ActiveFiltersContext | null>(null);

  useEffect(() => {
    const handleFiltersChange = (e: Event) => {
      const customEvent = e as CustomEvent<ActiveFiltersContext>;
      setActiveFilters(customEvent.detail || null);
    };
    window.addEventListener('edq:active-filters-changed', handleFiltersChange);
    return () => {
      window.removeEventListener('edq:active-filters-changed', handleFiltersChange);
    };
  }, []);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [flyoutItem, setFlyoutItem] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [guideFiles, setGuideFiles] = useState<any[]>([]);
  const [serverGuideResults, setServerGuideResults] = useState<(SearchItem & { searchText: string })[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const flyoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const notifBtnRef = useRef<HTMLButtonElement>(null);
  const geminiBtnRef = useRef<HTMLButtonElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const inlineSearchRef = useRef<HTMLDivElement>(null);
  const centerSearchRef = useRef<HTMLDivElement>(null);

  const [pillSelectorActive, setPillSelectorActive] = useState(false);
  const [pillPendingChip, setPillPendingChip] = useState<ContextChip | null>(null);
  const [panelSelectorActive, setPanelSelectorActive] = useState(false);
  const [panelPendingChip, setPanelPendingChip] = useState<ContextChip | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const scrollStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pageScrolling, setPageScrolling] = useState(false);

  useEffect(() => {
    const el = mainContentRef.current;
    if (!el) return;
    const onScroll = () => {
      setPageScrolling(true);
      setSelectionTooltip(null);
      if (scrollStopTimerRef.current) clearTimeout(scrollStopTimerRef.current);
      scrollStopTimerRef.current = setTimeout(() => setPageScrolling(false), 160);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (scrollStopTimerRef.current) clearTimeout(scrollStopTimerRef.current);
    };
  }, [currentView, selectedTicketId]);

  const [aiPendingQuery, setAiPendingQuery] = useState('');
  const [aiPendingQueryDisplay, setAiPendingQueryDisplay] = useState('');
  const openAiPanel = useCallback((seedMessages?: ChatMessage[], pendingQuery?: string, pendingQueryDisplay?: string) => {
    if (seedMessages !== undefined) setAiChatHistory(seedMessages.length ? seedMessages : []);
    if (pendingQuery) setAiPendingQuery(pendingQuery);
    if (pendingQueryDisplay !== undefined) setAiPendingQueryDisplay(pendingQueryDisplay);
    setIsAiPanelOpen(true);
    setShowNotifications(false);
  }, []);

  const [aiPendingPillQuery, setAiPendingPillQuery] = useState('');
  const [aiPendingPillQueryDisplay, setAiPendingPillQueryDisplay] = useState('');
  const [highlightedContext, setHighlightedContext] = useState<{ text: string; domContext: string } | null>(null);
  
  const [selectionTooltip, setSelectionTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    text: string;
    domContext: string;
  } | null>(null);

  const openPill = useCallback((query: string, queryDisplay?: string, selectionContext?: { text: string; domContext: string }) => {
    setAiPendingPillQuery(query);
    setAiPendingPillQueryDisplay(queryDisplay ?? '');
    setHighlightedContext(selectionContext ?? null);
  }, []);

  const contextValue = useMemo(() => ({
    openPanel: openAiPanel,
    openPill,
    setScreenContext,
    openGuideArticle: onOpenGuideArticle
  }), [openAiPanel, openPill, setScreenContext, onOpenGuideArticle]);

  // Text Selection highlight listener for Google-like "Ask about" tooltip
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        return;
      }
      const text = selection.toString().trim();
      if (text.length > 0 && text.length < 500) { // Limit to reasonable highlights
        try {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          
          let container = range.commonAncestorContainer;
          if (container.nodeType === Node.TEXT_NODE) {
            container = container.parentNode!;
          }
          
          const contextLines: string[] = [];
          let nearestCardTitle = '';
          let nearestSectionName = '';
          let dataAttributes: Record<string, string> = {};
          
          let current = container as HTMLElement | null;
          while (current && current !== document.body) {
            for (let i = 0; i < current.attributes.length; i++) {
              const attr = current.attributes[i];
              if (attr.name.startsWith('data-')) {
                dataAttributes[attr.name] = attr.value;
              }
            }
            if (!nearestCardTitle) {
              const header = current.querySelector('h1, h2, h3, h4, h5, .card-title, [class*="title"], [class*="header"]');
              if (header && header.textContent) {
                nearestCardTitle = header.textContent.trim();
              }
            }
            if (current.hasAttribute('data-gem-panel')) {
              nearestSectionName = current.getAttribute('data-gem-panel') || '';
            }
            current = current.parentElement;
          }
          
          let table = (container as HTMLElement).closest?.('table');
          if (table) {
            let row = (container as HTMLElement).closest?.('tr');
            let cell = (container as HTMLElement).closest?.('td, th');
            if (row && cell) {
              const cellIndex = (cell as HTMLTableCellElement).cellIndex;
              const headers = Array.from(table.querySelectorAll('th'));
              const colHeader = headers[cellIndex]?.textContent?.trim() || '';
              const rowData = Array.from(row.querySelectorAll('td, th'))
                .map((c, idx) => {
                  const h = headers[idx]?.textContent?.trim() || `Col ${idx + 1}`;
                  return `${h}: ${c.textContent?.trim()}`;
                })
                .join(', ');
              contextLines.push(`Location: Table row inside column "${colHeader}"`);
              contextLines.push(`Row data: ${rowData}`);
            }
          }
          
          if (nearestCardTitle) contextLines.push(`Card/Section Title: ${nearestCardTitle}`);
          if (nearestSectionName) contextLines.push(`Section: ${nearestSectionName}`);
          
          const metaParts = Object.entries(dataAttributes)
            .map(([k, v]) => `${k.replace('data-', '')}: ${v}`)
            .join(', ');
          if (metaParts) contextLines.push(`Metadata: ${metaParts}`);
          
          // Position tooltip below the selection, centered (using viewport-relative coords for fixed positioning)
          setSelectionTooltip({
            visible: true,
            x: rect.left + rect.width / 2,
            y: rect.bottom + 8,
            text,
            domContext: contextLines.join('\n')
          });
        } catch (err) {
          console.error(err);
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      // Delay selection check slightly to let browser selection settle
      setTimeout(handleSelectionChange, 10);
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.selection-tooltip-btn')) return;
      setSelectionTooltip(null);
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Open a suggested User Guide article (handled at App level so the target view
  // remounts with the jump path as a prop, and the return view is tracked).
  const openGuideArticle = onOpenGuideArticle;

  const runAppAction = (action: AppAction) => {
    if (action.view === 'tools') {
      if (action.toolsTab) onToolsTabChange(action.toolsTab);
      onNavigate('tools');
      return;
    }
    if (action.view === 'investigation') {
      if (action.ticketSection) onSectionChange(action.ticketSection);
      setIsTicketPanelOpen(true);
      onNavigate('investigation');
      return;
    }
    onNavigate(action.view);
  };

  // Global panel context capture — click any [data-gem-panel] element to add as context chip
  useEffect(() => {
    const selectorOn = pillSelectorActive || panelSelectorActive;
    if (!selectorOn) return;
    const el = mainContentRef.current;
    if (!el) return;
      const pillSelectorOn = pillSelectorActive;
      const panelSelectorOn = panelSelectorActive;
    const handlePanelClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.gemini-exclude')) return;

      // Traverse up to find the outermost explicit panel under the main content container.
      // Keep this aligned with .gem-selector-active CSS so context-pick mode never
      // changes generic card/chart colours.
      let panel: HTMLElement | null = null;
      let current: HTMLElement | null = target;
      while (current && current !== el) {
        if (current.matches('[data-gem-panel]')) {
          const tag = current.tagName;
          if (tag !== 'BUTTON' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'A' && tag !== 'SELECT') {
            panel = current; // Keep overwriting as we bubble up to get the outermost parent
          }
        }
        current = current.parentElement;
      }
      if (!panel) return;

      // Don't prevent default — let article navigation etc. still work
      let label = panel.getAttribute('data-gem-panel-label') || '';
      if (!label) {
        const heading = panel.querySelector('h1, h2, h3, h4, h5, h6, .font-bold, .font-semibold') as HTMLElement | null;
        label = heading ? heading.innerText.trim() : 'Panel';
      }
      if (label.length > 25) {
        label = label.slice(0, 22) + '...';
      }

      const explicitContent = panel.getAttribute('data-gem-panel-content');
      const articlePath = panel.getAttribute('data-gem-article-path');

      // Scope key: identifies the case/context this panel belongs to, captured at
      // pin time. Used to deterministically tell related vs unrelated pins apart
      // (e.g. a ticket's Overview vs a globally-loaded IP Warming planner).
      const scope = articlePath
        ? `guide:${articlePath}`
        : scopeKeyFor(screenContext);

      const applyChip = (content: string) => {
        if (pillSelectorOn) setPillPendingChip({ label, content, scope });
        if (panelSelectorOn) setPanelPendingChip({ label, content, scope });
      };

      if (articlePath) {
        // UG article: fetch actual markdown content from server
        applyChip(`[Loading article: ${label}]`);
        fetch(`/api/user-guide/content?path=${encodeURIComponent(articlePath)}`)
          .then(r => r.text())
          .then(md => {
            const cleanMd = md.slice(0, 3000);
            if (pillSelectorOn) setPillPendingChip({ label, content: cleanMd, scope });
            if (panelSelectorOn) setPanelPendingChip({ label, content: cleanMd, scope });
          })
          .catch(() => {});
      } else if (explicitContent) {
        applyChip(explicitContent);
      } else {
        // Skip SVG/chart internals — only use text from non-SVG elements
        let textContent = Array.from(panel.querySelectorAll('*'))
          .filter(el => {
            const tagName = el.tagName;
            return tagName !== 'SVG' && tagName !== 'svg' && !el.closest('svg') &&
                   tagName !== 'BUTTON' && tagName !== 'INPUT' && tagName !== 'TEXTAREA' &&
                   tagName !== 'A' && !(el as HTMLElement).closest('button');
          })
          .map(el => (el as HTMLElement).innerText || '')
          .filter(t => t.trim().length > 0)
          .join(' ');

        if (!textContent.trim()) {
          textContent = panel.innerText || '';
        }

        const cleanContent = textContent
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 800);

        applyChip(cleanContent || label);
      }
    };
    el.addEventListener('click', handlePanelClick, true);
    return () => el.removeEventListener('click', handlePanelClick, true);
  }, [pillSelectorActive, panelSelectorActive, screenContext]);

  // Dismissible notifications state
  const [dismissedNotifIds, setDismissedNotifIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('edq_dismissed_notifs') || '[]'); } catch { return []; }
  });
  const dismissNotif = (id: string) => {
    setDismissedNotifIds(prev => {
      const next = [...prev, id];
      try { localStorage.setItem('edq_dismissed_notifs', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // Ticket panel local state
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketFilter, setTicketFilter] = useState<'All' | 'Open' | 'Closed'>('Open');
  const [panelWidth, setPanelWidth] = useState(380);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const aiDragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const [pollingEnabled, setPollingEnabled] = useState(() => {
    try { return localStorage.getItem('edq_polling_enabled') !== 'false'; } catch { return true; }
  });

  const [readTicketIds, setReadTicketIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('edq_read_tickets');
      return saved ? JSON.parse(saved) : ['26060001'];
    } catch { return ['26060001']; }
  });

  const markTicketAsRead = (id: string) => {
    setReadTicketIds(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try { localStorage.setItem('edq_read_tickets', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(target) && !notifBtnRef.current?.contains(target)) {
        setShowNotifications(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(target)) setShowSettingsDropdown(false);
      if (inlineSearchRef.current && !inlineSearchRef.current.contains(target)) {
        setIsSearchExpanded(false);
        setSearchFocused(false);
      }
      if (centerSearchRef.current && !centerSearchRef.current.contains(target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('edq_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const { cases: ticketsList } = useCaseDataset();

  useEffect(() => {
    fetch('/api/user-guide/files')
      .then(r => r.ok ? r.json() : { files: [] })
      .then(data => setGuideFiles(data.files || []))
      .catch(() => {});
  }, []);

  // Keep Gemini grounded on whatever is currently on screen. The User Guide view
  // pushes its own (per-article) context, so we skip it here and let it override.
  useEffect(() => {
    if (currentView === 'user_guide') return;
    if (currentView === 'investigation') {
      const t = ticketsList.find(x => x.case_number === selectedTicketId) ?? ticketsList[0];
      setScreenContext(t ? buildTicketContext(t, activeSection, activeFilters) : null);
    } else if (currentView === 'tools') {
      setScreenContext(buildToolContext(toolsTab));
    } else {
      const label = VIEW_LABELS[currentView] || 'Dashboard';
      setScreenContext({
        view: currentView, kind: 'dashboard', title: label,
        suggestions: [
          'How can I improve my email deliverability?',
          'What are best practices for email authentication?',
          'How do I monitor my sender reputation?',
        ],
      });
    }
  }, [currentView, selectedTicketId, ticketsList, toolsTab, activeSection, activeFilters]);

  const allSearchItems: (SearchItem & { searchText: string })[] = React.useMemo(() => [
    ...ticketsList.map((t) => ({
      type: 'ticket' as const, id: t.case_number, title: t.account_name, subtitle: t.case_subject, meta: t.case_status, icon: 'confirmation_number',
      searchText: `${t.account_name} ${t.case_subject} ${t.case_priority} ${t.case_status} ${(t.tags || []).join(' ')} ${t.sending_domains[0] || ''} ${t.case_number}`.toLowerCase(),
    })),
    ...guideFiles.filter((f: any) => f.isSynced).map((f: any) => {
      const { title, category } = formatGuideSearchResult(f.githubPath, f.filename);
      return {
        type: 'guide' as const,
        id: f.githubPath,
        title,
        subtitle: category,
        icon: 'menu_book',
        searchText: `${title} ${category} ${f.githubPath}`.toLowerCase(),
      };
    }),
    { type: 'nav' as const, id: 'nav-glance', title: 'Dashboard', subtitle: 'Overview & Analytics', icon: 'grid_view', meta: undefined, searchText: 'dashboard overview analytics' },
    { type: 'nav' as const, id: 'nav-tools', title: 'Tools', subtitle: 'DNS, MX, Headers, IP Warming', icon: 'build', meta: undefined, searchText: 'tools dns mx headers ip warming' },
  ], [ticketsList, guideFiles]);

  // Auto-select ticket from globalSearch
  useEffect(() => {
    if (!globalSearch.trim()) return;
    const exactMatch = ticketsList.find(t => t.case_number.toLowerCase() === globalSearch.toLowerCase().trim());
    if (exactMatch) {
      onSelectTicket(exactMatch.case_number);
      onNavigate('investigation');
    }
  }, [globalSearch, ticketsList]);

  const saveRecentSearch = (term: string) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(t => t !== term);
      const next = [term, ...filtered].slice(0, 5);
      try { localStorage.setItem('edq_recent_searches', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (currentView !== 'investigation' && currentView !== 'tools') {
          window.dispatchEvent(new Event('edq:focus-gemini-pill'));
        } else {
          window.dispatchEvent(new Event('edq:focus-gemini-pill'));
        }
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        onSearchChange('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearchChange, currentView]);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target?.classList?.contains('custom-scrollbar')) {
        target.classList.add('is-scrolling');
        const tid = (target as any).__scrollTimeout;
        if (tid) clearTimeout(tid);
        (target as any).__scrollTimeout = setTimeout(() => target.classList.remove('is-scrolling'), 1000);
      }
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);

  const query = globalSearch.toLowerCase().trim();

  useEffect(() => {
    if (!query || query.length < 2) { setServerGuideResults([]); return; }
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(r => r.ok ? r.json() : { guides: [] })
        .then(data => setServerGuideResults((data.guides || []).map((g: any) => {
          const { title, category } = formatGuideSearchResult(g.path, g.title);
          return {
            type: 'guide' as const,
            id: `srv-${g.path}`,
            title,
            subtitle: category,
            icon: 'menu_book',
            searchText: `${title} ${category} ${g.path || ''}`.toLowerCase(),
          };
        })))
        .catch(() => {});
    }, 180);
    return () => clearTimeout(timer);
  }, [query]);

  const searchResults: (SearchItem & { searchText: string })[] = React.useMemo(() => {
    if (!query) return [];
    const tokens = query.split(/\s+/).filter(Boolean);
    const localMatches = allSearchItems.filter(item => tokens.some(tok => item.searchText.includes(tok)));
    // Merge server guide results (deduplicated by title)
    const localTitles = new Set(localMatches.filter(r => r.type === 'guide').map(r => r.title.toLowerCase()));
    const serverOnly = serverGuideResults.filter(g => !localTitles.has(g.title.toLowerCase()));
    return [...localMatches, ...serverOnly]
      .map((item, index) => ({ item, index, score: scoreSearchItem(item, query, tokens) }))
      .filter(entry => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .map(entry => entry.item)
      .slice(0, 18);
  }, [query, allSearchItems, serverGuideResults]);

  const handleSearchResultSelect = (item: GeminiSearchItem, source: 'result' | 'suggestion' = 'result') => {
    if (item.type === 'ticket') {
      if (source === 'suggestion') {
        setTicketSearch(item.title);
        setTicketFilter('All');
        onNavigate('investigation');
        setIsTicketPanelOpen(true);
        saveRecentSearch(item.title);
        onSearchChange('');
        return;
      }
      onSelectTicket(item.id);
      onNavigate('investigation');
      setIsTicketPanelOpen(false);
      saveRecentSearch(item.title);
    } else if (item.type === 'guide') {
      const guidePath = item.id.startsWith('srv-') ? item.id.slice(4) : item.id;
      openGuideArticle(guidePath);
      saveRecentSearch(item.title);
    } else {
      onNavigate(item.id.replace('nav-', '') as any);
      saveRecentSearch(item.title);
    }
    onSearchChange('');
  };

  const showFlyout = (item: string) => {
    if (flyoutTimerRef.current) clearTimeout(flyoutTimerRef.current);
    setFlyoutItem(item);
  };
  const hideFlyout = () => {
    flyoutTimerRef.current = setTimeout(() => setFlyoutItem(null), 120);
  };
  const keepFlyout = () => {
    if (flyoutTimerRef.current) clearTimeout(flyoutTimerRef.current);
  };

  const navItems = [
    { id: 'glance' as ViewType, icon: 'grid_view', label: 'Dashboard', flyout: null },
    { id: 'investigation' as ViewType, icon: 'confirmation_number', label: 'Tickets', flyout: null },
    { id: 'tools' as ViewType, icon: 'build', label: 'Tools', flyout: null },
    { id: 'user_guide' as ViewType, icon: 'menu_book', label: 'User Guide', flyout: null },
  ];

  const filteredTickets = ticketsList.filter(t => {
    if (ticketFilter === 'Open') {
      if (!isOpenCase(t)) return false;
    } else if (ticketFilter === 'Closed') {
      if (!isClosedCase(t)) return false;
    }
    if (ticketSearch.trim()) {
      const q = ticketSearch.toLowerCase().trim();
      return (
        t.case_number.toLowerCase().includes(q) ||
        t.account_name.toLowerCase().includes(q) ||
        t.case_subject.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sortedTickets = React.useMemo(() => {
    const sorted = [...filteredTickets];
    if (inboxType === 'unread') {
      sorted.sort((a, b) => {
        const aUnread = !readTicketIds.includes(a.case_number);
        const bUnread = !readTicketIds.includes(b.case_number);
        if (aUnread && !bUnread) return -1;
        if (!aUnread && bUnread) return 1;
        return 0;
      });
    } else if (inboxType === 'important') {
      sorted.sort((a, b) => {
        const aImportant = a.case_priority === 'High';
        const bImportant = b.case_priority === 'High';
        if (aImportant && !bImportant) return -1;
        if (!aImportant && bImportant) return 1;
        return 0;
      });
    }
    return sorted;
  }, [filteredTickets, inboxType, readTicketIds]);

  const handleAiPanelDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    aiDragRef.current = { startX: e.clientX, startWidth: aiPanelWidth };
    setIsAiPanelDragging(true);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (ev: MouseEvent) => {
      if (!aiDragRef.current) return;
      const nextWidth = Math.max(320, Math.min(640, aiDragRef.current.startWidth + aiDragRef.current.startX - ev.clientX));
      setAiPanelWidth(nextWidth);
    };

    const onMouseUp = (ev: MouseEvent) => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      setIsAiPanelDragging(false);
      const finalWidth = Math.max(320, Math.min(640, (aiDragRef.current?.startWidth ?? aiPanelWidth) + (aiDragRef.current?.startX ?? ev.clientX) - ev.clientX));
      try { localStorage.setItem('edq_ai_panel_width', String(Math.round(finalWidth))); } catch {}
      aiDragRef.current = null;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <AiPanelContext.Provider value={contextValue}>
    <div className="flex h-screen w-full overflow-hidden font-sans bg-[#F6F8FC] dark:bg-[#141218] text-on-surface dark:text-inverse-on-surface">

      {/* NAV RAIL */}
      <motion.aside
        animate={{ width: isNavExpanded ? 200 : 80 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex flex-col bg-transparent shrink-0 z-30 overflow-hidden"
      >
        {/* Brand — Braze logo, upper-left (hamburger removed; nav stays collapsed) */}
        <div className="h-14 shrink-0 flex items-center justify-center px-2">
          <img src="/braze-logo.svg" alt="Braze" className="h-6 w-auto max-w-full object-contain" />
        </div>

        {/* Nav items */}
        <nav className="flex flex-col flex-1">
          {navItems.map(item => {
            const isActive = item.id === 'glance'
              ? (currentView === 'glance' || currentView === 'charts')
              : currentView === item.id;
            return (
              <div key={item.id} className="relative">
                <button
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "flex items-center w-full py-1.5 transition-all",
                    isNavExpanded ? "flex-row gap-3 px-4" : "flex-col gap-0.5 items-center"
                  )}
                >
                  <div className={cn(
                    "rounded-[100px] flex items-center justify-center relative shrink-0",
                    isNavExpanded ? "w-10 h-8" : "w-16 h-8",
                    !isActive && "transition-colors hover:bg-[rgba(60,64,67,0.06)] dark:hover:bg-white/8"
                  )}>
                    {isActive && (
                      <motion.div layoutId="sidenav-pill-bg" className="absolute inset-0 bg-[#1A73E8] rounded-[100px]" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />
                    )}
                    <span className={cn("relative z-10 material-symbols-outlined text-[22px]",
                      isActive ? "text-white" : "text-[#49454F] dark:text-white/60"
                    )} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}>{item.icon}</span>
                  </div>
                  <span className={cn(
                    "select-none whitespace-nowrap overflow-hidden transition-all",
                    isNavExpanded ? "text-[13px] font-medium" : "text-[10px] font-medium text-center",
                    isActive ? "text-[#1A73E8] dark:text-[#8AB4F8] font-semibold" : "text-[#49454F] dark:text-white/60"
                  )}>{item.label}</span>
                </button>
              </div>
            );
          })}
        </nav>

        {/* Bottom nav */}
        <div className="flex flex-col pb-4">
          {[
            { id: 'settings', icon: 'settings', label: 'Settings', onClick: () => onNavigate('settings' as ViewType) },
            { id: 'help', icon: 'help', label: 'Help', onClick: () => {} },
          ].map(item => {
            const isActive = currentView === item.id;
            return (
              <button key={item.id} onClick={item.onClick}
                className={cn("flex items-center w-full py-1.5 transition-all", isNavExpanded ? "flex-row gap-3 px-4" : "flex-col gap-0.5 items-center")}
              >
                <div className={cn(
                  "rounded-[100px] flex items-center justify-center transition-colors shrink-0",
                  isNavExpanded ? "w-10 h-8" : "w-16 h-8",
                  isActive ? "bg-[#1A73E8]" : "hover:bg-[rgba(60,64,67,0.06)] dark:hover:bg-white/8"
                )}>
                  <span className={cn("material-symbols-outlined text-[22px]", isActive ? "text-white" : "text-[#49454F] dark:text-white/60")}
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}>{item.icon}</span>
                </div>
                <span className={cn("select-none whitespace-nowrap overflow-hidden transition-all",
                  isNavExpanded ? "text-[13px] font-medium" : "text-[10px] font-medium text-center",
                  isActive ? "text-[#1A73E8] dark:text-[#8AB4F8] font-semibold" : "text-[#49454F] dark:text-white/60"
                )}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </motion.aside>



      {/* RIGHT: top bar + content */}
      <div className="flex-1 flex min-h-0 flex-col overflow-hidden min-w-0">

        {/* TOP CONTEXT BAR */}
        <header className="relative flex items-center justify-between px-4 h-14 bg-transparent z-20 shrink-0">
          {/* Centered Gmail-style search — only for views that have no tabs in header */}
          {false && currentView !== 'investigation' && currentView !== 'tools' && (
            <div ref={centerSearchRef} className="absolute left-1/2 -translate-x-1/2 w-[600px] max-w-[52%] z-30 top-[7px]">

              {/* Input bar — always pill-shaped, bottom corners flatten when dropdown open */}
              <div
                className="flex items-center h-11 px-2 bg-white dark:bg-[#2C2B30] relative z-10"
                style={{
                  borderRadius: searchFocused ? '24px 24px 0 0' : '9999px',
                  boxShadow: searchFocused
                    ? '0 1px 0 rgba(32,33,36,0.1)'
                    : '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
                  transition: 'border-radius 300ms cubic-bezier(0.2,0.8,0.2,1), box-shadow 200ms ease',
                }}
              >
                <button onClick={() => searchInputRef.current?.focus()} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/8 dark:hover:bg-white/8 transition-colors shrink-0">
                  <SearchSparkIcon className="w-[22px] h-[22px]" />
                </button>
                <input
                  ref={searchInputRef}
                  id="header-search-input"
                  type="text"
                  autoComplete="off"
                  className="flex-1 bg-transparent text-[15px] text-[#1f1f1f] dark:text-white outline-none placeholder:text-[#5f6368] dark:placeholder:text-white/40"
                  placeholder="Search tickets, guides, tools..."
                  value={globalSearch}
                  onChange={e => onSearchChange(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
                  onKeyDown={e => {
                    if (e.key === 'Escape') { onSearchChange(''); setSearchFocused(false); e.currentTarget.blur(); }
                  }}
                />
                {globalSearch ? (
                  <button onMouseDown={e => { e.preventDefault(); onSearchChange(''); }} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/8 dark:hover:bg-white/8 transition-colors shrink-0">
                    <span className="material-symbols-outlined text-[#5f6368] dark:text-white/50 text-[20px]">close</span>
                  </button>
                ) : (
                  <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/8 dark:hover:bg-white/8 transition-colors shrink-0">
                    <span className="material-symbols-outlined text-[#5f6368] dark:text-white/50" style={{ fontSize: '20px' }}>tune</span>
                  </button>
                )}
              </div>

              {/* Dropdown — absolutely anchored to bottom of input bar, grows strictly downward */}
              <div
                className="absolute left-0 right-0 top-[44px] overflow-hidden"
                style={{
                  maxHeight: searchFocused ? '380px' : '0px',
                  transition: 'max-height 380ms cubic-bezier(0.2,0.8,0.2,1)',
                }}
              >
                <div
                  className="bg-white dark:bg-[#2C2B30] rounded-b-[24px] overflow-hidden pb-2"
                  style={{ boxShadow: '0 6px 10px rgba(32,33,36,0.2)' }}
                >
                  <div className="h-px bg-[#e8eaed] dark:bg-white/10 mx-4 mb-1" />
                  <div className="overflow-y-auto max-h-[340px]">
                    {globalSearch.trim() ? (
                      searchResults.length > 0 ? (
                        <ul className="py-1">
                          {(['ticket', 'nav', 'guide'] as const).map(type => {
                            const group = searchResults.filter(r => r.type === type);
                            if (!group.length) return null;
                            const label = type === 'ticket' ? 'Tickets' : type === 'nav' ? 'Tools & Navigation' : 'User Guide Articles';
                            return (
                              <li key={type}>
                                <div className="px-5 pt-2 pb-1 text-[10px] font-black uppercase tracking-widest text-[#5f6368] dark:text-white/40 select-none">{label}</div>
                                {group.map(item => (
                                  <button
                                    key={item.id}
                                    onMouseDown={e => {
                                      e.preventDefault();
                                      if (item.type === 'ticket') {
                                        onSearchChange(item.id);
                                        onNavigate('investigation');
                                        setIsTicketPanelOpen(false);
                                        saveRecentSearch(item.title);
                                      } else if (item.type === 'guide') {
                                        try { sessionStorage.setItem('edq_guide_jump_path', item.id); } catch {}
                                        onNavigate('user_guide');
                                        saveRecentSearch(item.title);
                                      } else {
                                        onNavigate(item.id.replace('nav-', '') as any);
                                      }
                                      setSearchFocused(false);
                                      onSearchChange('');
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#f1f3f4] dark:hover:bg-white/8 transition-colors text-left"
                                  >
                                    <span className="material-symbols-outlined text-[#5f6368] dark:text-white/40 shrink-0" style={{ fontSize: '20px' }}>{item.icon}</span>
                                    <div className="flex flex-col min-w-0 flex-1">
                                      <span className="text-[14px] text-[#202124] dark:text-white truncate">{item.title}</span>
                                      {item.subtitle && <span className="text-[11px] text-[#5f6368] dark:text-white/40 truncate">{item.subtitle}</span>}
                                    </div>
                                    {item.meta && (
                                      <span className="text-[10px] font-semibold text-[#5f6368] dark:text-white/40 shrink-0">{item.meta}</span>
                                    )}
                                  </button>
                                ))}
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="py-6 text-center text-[13px] text-[#5f6368] dark:text-white/40">No results for "{globalSearch}"</div>
                      )
                    ) : (
                      <ul className="py-1">
                        {recentSearches.length > 0 && recentSearches.slice(0, 5).map(term => (
                          <li key={term}>
                            <button
                              onMouseDown={e => {
                                e.preventDefault();
                                onSearchChange(term);
                                searchInputRef.current?.focus();
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#f1f3f4] dark:hover:bg-white/8 transition-colors text-left"
                            >
                              <span className="material-symbols-outlined text-[#5f6368] dark:text-white/40 shrink-0" style={{ fontSize: '20px' }}>history</span>
                              <span className="text-[14px] text-[#202124] dark:text-white flex-1 truncate">{term}</span>
                              <button
                                onMouseDown={e => {
                                  e.stopPropagation(); e.preventDefault();
                                  setRecentSearches(prev => {
                                    const next = prev.filter(i => i !== term);
                                    try { localStorage.setItem('edq_recent_searches', JSON.stringify(next)); } catch {}
                                    return next;
                                  });
                                }}
                                className="p-1 rounded-full hover:bg-black/8 text-[#5f6368]/50 hover:text-[#5f6368] transition-colors"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                              </button>
                            </button>
                          </li>
                        ))}
                        {recentSearches.length > 0 && <li><div className="h-px bg-[#e8eaed] dark:bg-white/10 my-1 mx-2" /></li>}
                        {SUGGESTED_CHIPS.map(chip => (
                          <li key={chip.label}>
                            <button
                              onMouseDown={e => {
                                e.preventDefault();
                                onSearchChange(chip.label);
                                saveRecentSearch(chip.label);
                                searchInputRef.current?.focus();
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#f1f3f4] dark:hover:bg-white/8 transition-colors text-left"
                            >
                              <span className="material-symbols-outlined text-[#5f6368] dark:text-white/40 shrink-0" style={{ fontSize: '20px' }}>{chip.icon}</span>
                              <span className="text-[14px] text-[#202124] dark:text-white">{chip.label}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* LEFT: section tabs, tool tabs, or view title */}
          <div className="flex items-center flex-1 min-w-0 h-full overflow-hidden">
            {currentView === 'investigation' ? (
              <div className="flex items-center gap-3 flex-1 min-w-0 h-full overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsTicketPanelOpen(!isTicketPanelOpen)}
                  className="flex items-center gap-2 select-none shrink-0 px-2 py-1 -mx-2 rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/8 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[#1A73E8] dark:text-[#D2E3FC]" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
                  <span className="text-[16px] font-bold text-[#1D192B] dark:text-[#D2E3FC]">Tickets</span>
                  <span className="text-[12px] font-semibold px-1.5 py-0.5 bg-[#D2E3FC] dark:bg-[#4A4459] text-[#1A73E8] dark:text-[#D2E3FC] rounded-full">{filteredTickets.length}</span>
                </button>
                <>
                  <div className="w-px h-5 bg-black/12 dark:bg-white/12 shrink-0" />
                  <div className="relative flex items-center gap-[3px] overflow-x-auto no-scrollbar py-[6px] px-[6px] rounded-[100px]">
                    {SECTION_TABS.map(tab => {
                      const isActive = activeSection === tab.label;
                      const selectorOn = pillSelectorActive || panelSelectorActive;
                      return (
                        <React.Fragment key={tab.label}>
                          {tab.standalone && <div className="w-px h-5 bg-black/12 dark:bg-white/12 shrink-0 mx-1" />}
                          <button
                            onClick={() => {
                              const ticket = ticketsList.find(t => t.case_number === selectedTicketId) ?? null;
                              const tabScope = scopeKeyFor(screenContext);
                              if (pillSelectorActive) {
                                setPillPendingChip({ label: tab.label, content: serializeSectionContext(tab.label, ticket), scope: tabScope });
                              }
                              if (panelSelectorActive) {
                                setPanelPendingChip({ label: tab.label, content: serializeSectionContext(tab.label, ticket), scope: tabScope });
                              }
                              onSectionChange(tab.label);
                            }}
                            className={cn(
                              "relative flex items-center gap-1.5 px-[12px] h-8 rounded-[100px] text-[13px] font-[500] transition-all select-none whitespace-nowrap shrink-0",
                              isActive && !selectorOn ? "text-white" : "text-[#5f6368] dark:text-white/60 hover:bg-[rgba(60,64,67,0.06)] hover:text-[#202124] dark:hover:text-white",
                              selectorOn && "outline outline-2 outline-dashed outline-[rgba(26,115,232,0.45)] -outline-offset-2 hover:outline-[#1A73E8] hover:bg-[#E8F0FE]/60 dark:hover:bg-[#1A73E8]/15",
                            )}
                          >
                            {isActive && !selectorOn && (
                              <motion.div layoutId="section-pill-bg" className="absolute inset-0 bg-[#1A73E8] rounded-[100px]" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />
                            )}
                            <span className="relative z-10 material-symbols-outlined" style={{ fontSize: '17px', fontVariationSettings: isActive && !selectorOn ? "'FILL' 1" : "" }}>{tab.icon}</span>
                            <span className="relative z-10">{tab.label}</span>
                          </button>
                          {tab.trailingSep && <div className="w-px h-5 bg-black/12 dark:bg-white/12 shrink-0 mx-1" />}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </>
              </div>
            ) : currentView === 'tools' ? (
              <div className="flex items-center gap-3 flex-1 min-w-0 h-full overflow-hidden">
                <div className="flex items-center gap-2 select-none shrink-0">
                  <span className="material-symbols-outlined text-[#1A73E8] dark:text-[#D2E3FC]" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>build</span>
                  <span className="text-[16px] font-bold text-[#1D192B] dark:text-[#D2E3FC]">Tools</span>
                </div>
                <>
                  <div className="w-px h-5 bg-black/12 dark:bg-white/12 shrink-0" />
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    {TOOL_TABS.map(tab => {
                      const isActive = tab.id === 'dig' ? toolsTab !== 'ip_warming' : toolsTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => onToolsTabChange(tab.id)}
                          className={cn(
                            "relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all select-none whitespace-nowrap shrink-0",
                            isActive ? "text-[#1D192B] dark:text-[#D2E3FC]" : "text-[#49454F] dark:text-white/60 hover:bg-black/8 dark:hover:bg-white/8"
                          )}
                        >
                          {isActive && (
                            <motion.div layoutId="tool-pill-bg" className="absolute inset-0 bg-[#D2E3FC] dark:bg-[#4A4459] rounded-full" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />
                          )}
                          <span className="relative z-10 material-symbols-outlined" style={{ fontSize: '17px', fontVariationSettings: isActive ? "'FILL' 1" : "" }}>{tab.icon}</span>
                          <span className="relative z-10 flex items-center gap-[4px]">
                            {tab.id === 'dig' ? (
                              <>
                                <img
                                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Google_2026_logo.svg/500px-Google_2026_logo.svg.png"
                                  alt="Google"
                                  className="h-[13px] object-contain translate-y-[1px]"
                                />
                                <span>Dig</span>
                              </>
                            ) : (
                              tab.label
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              </div>
            ) : (
              <div className="flex items-center gap-2 select-none">
                <span className="material-symbols-outlined text-[#1A73E8] dark:text-[#D2E3FC]" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>{VIEW_ICONS[currentView] ?? 'grid_view'}</span>
                <span className="text-[16px] font-bold text-[#1D192B] dark:text-[#D2E3FC]">{VIEW_LABELS[currentView] ?? 'Dashboard'}</span>
              </div>
            )}
          </div>

          {/* RIGHT: search (expands inline) + notifications */}
          <div className={cn("flex items-center gap-0.5 pr-3 ml-2 transition-all duration-200 shrink-0", isSearchExpanded && "w-[340px]")}>

            {/* Search area — inline expanding for investigation/tools */}
            {false && (currentView === 'investigation' || currentView === 'tools') && (
              <motion.div
                ref={inlineSearchRef}
                className="relative"
                animate={{ width: isSearchExpanded ? 300 : 36 }}
                transition={{ type: 'spring', stiffness: 400, damping: 36 }}
              >
                <AnimatePresence mode="wait">
                  {isSearchExpanded ? (
                    <motion.div key="expanded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="relative">
                      <div className={cn("flex items-center h-11 px-2 transition-all duration-150", searchFocused ? "bg-white dark:bg-[#2C2B30] rounded-t-[24px] shadow-[0_1px_1px_0_rgba(65,69,73,0.3)]" : "bg-[#f1f3f4] dark:bg-white/8 rounded-full")}>
                        <SearchSparkIcon className="w-[22px] h-[22px] ml-1 shrink-0" />
                        <input
                          ref={searchInputRef}
                          id="header-search-input"
                          autoFocus
                          type="text"
                          className="flex-1 bg-transparent text-[15px] text-[#1f1f1f] dark:text-white outline-none placeholder:text-[#5f6368] dark:placeholder:text-white/40 px-2"
                          placeholder="Search tickets, guides, tools..."
                          value={globalSearch}
                          onChange={e => onSearchChange(e.target.value)}
                          onFocus={() => setSearchFocused(true)}
                          onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
                          onKeyDown={e => { if (e.key === 'Escape') { setIsSearchExpanded(false); setSearchFocused(false); onSearchChange(''); } }}
                        />
                        <button onMouseDown={e => { e.preventDefault(); setIsSearchExpanded(false); setSearchFocused(false); onSearchChange(''); }} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/8 dark:hover:bg-white/8 transition-colors shrink-0">
                          <span className="material-symbols-outlined text-[#5f6368] dark:text-white/50 text-[20px]">{globalSearch ? 'close' : 'close'}</span>
                        </button>
                      </div>
                      <AnimatePresence>
                        {searchFocused && (
                          <motion.div key="sdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}
                            className="absolute left-0 right-0 top-[44px] bg-white dark:bg-[#2C2B30] rounded-b-[24px] overflow-hidden z-50"
                            style={{ boxShadow: '0 4px 6px rgba(32,33,36,0.28)' }}
                          >
                            <div className="h-px bg-[#e8eaed] dark:bg-white/10 mx-4" />
                            {globalSearch.trim() ? (
                              searchResults.length > 0 ? (
                                <ul className="py-2 max-h-80 overflow-y-auto">
                                  {(['ticket', 'nav', 'guide'] as const).map(type => {
                                    const grp = searchResults.filter(r => r.type === type);
                                    if (!grp.length) return null;
                                    const lbl = type === 'ticket' ? 'Tickets' : type === 'nav' ? 'Tools & Navigation' : 'User Guide Articles';
                                    return (
                                      <li key={type}>
                                        <div className="px-5 pt-2 pb-1 text-[10px] font-black uppercase tracking-widest text-[#5f6368] dark:text-white/40 select-none">{lbl}</div>
                                        {grp.map(item => (
                                          <button key={item.id} onMouseDown={e => {
                                            e.preventDefault();
                                            if (item.type === 'ticket') {
                                              onSearchChange(item.id); onNavigate('investigation'); setIsTicketPanelOpen(false); saveRecentSearch(item.title);
                                            } else if (item.type === 'guide') {
                                              try { sessionStorage.setItem('edq_guide_jump_path', item.id); } catch {}
                                              onNavigate('user_guide'); saveRecentSearch(item.title);
                                            } else {
                                              onNavigate(item.id.replace('nav-', '') as any);
                                            }
                                            setIsSearchExpanded(false); setSearchFocused(false); onSearchChange('');
                                          }} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#f1f3f4] dark:hover:bg-white/8 transition-colors text-left">
                                            <span className="material-symbols-outlined text-[#5f6368] dark:text-white/40 shrink-0" style={{ fontSize: '20px' }}>{item.icon}</span>
                                            <div className="flex flex-col min-w-0 flex-1">
                                              <span className="text-[14px] text-[#202124] dark:text-white truncate">{item.title}</span>
                                              {item.subtitle && <span className="text-[11px] text-[#5f6368] dark:text-white/40 truncate">{item.subtitle}</span>}
                                            </div>
                                            {item.meta && <span className="text-[10px] font-semibold text-[#5f6368] shrink-0">{item.meta}</span>}
                                          </button>
                                        ))}
                                      </li>
                                    );
                                  })}
                                </ul>
                              ) : <div className="py-6 text-center text-[13px] text-[#5f6368] dark:text-white/40">No results for "{globalSearch}"</div>
                            ) : (
                              <ul className="py-2">
                                {recentSearches.slice(0, 4).map(term => (
                                  <li key={term}><button onMouseDown={e => { e.preventDefault(); onSearchChange(term); searchInputRef.current?.focus(); }} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#f1f3f4] dark:hover:bg-white/8 transition-colors text-left">
                                    <span className="material-symbols-outlined text-[#5f6368] dark:text-white/40 shrink-0" style={{ fontSize: '20px' }}>history</span>
                                    <span className="text-[14px] text-[#202124] dark:text-white flex-1 truncate">{term}</span>
                                  </button></li>
                                ))}
                                {recentSearches.length > 0 && <li><div className="h-px bg-[#e8eaed] dark:bg-white/10 my-1 mx-2" /></li>}
                                {SUGGESTED_CHIPS.map(chip => (
                                  <li key={chip.label}><button onMouseDown={e => { e.preventDefault(); onSearchChange(chip.label); saveRecentSearch(chip.label); searchInputRef.current?.focus(); }} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#f1f3f4] dark:hover:bg-white/8 transition-colors text-left">
                                    <span className="material-symbols-outlined text-[#5f6368] dark:text-white/40 shrink-0" style={{ fontSize: '20px' }}>{chip.icon}</span>
                                    <span className="text-[14px] text-[#202124] dark:text-white">{chip.label}</span>
                                  </button></li>
                                ))}
                              </ul>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <motion.button key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                      onClick={() => { setIsSearchExpanded(true); setSearchFocused(true); setTimeout(() => searchInputRef.current?.focus(), 60); }}
                      className="p-2 text-[#49454F] dark:text-white/60 hover:text-[#1A73E8] dark:hover:text-[#D2E3FC] rounded-xl transition-colors"
                      title="Search (⌘K)"
                    >
                      <SearchSparkIcon className="w-[22px] h-[22px]" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Notifications button — temporarily disabled (kept for future reintroduction). */}
            {NOTIFICATIONS_ENABLED && (
            <button
              ref={notifBtnRef}
              onClick={() => setShowNotifications(v => { if (!v) setIsAiPanelOpen(false); return !v; })}
              className={cn("p-2 rounded-xl transition-colors shrink-0", showNotifications ? "text-[#1A73E8] dark:text-[#D2E3FC]" : "text-[#49454F] dark:text-white/60 hover:text-[#1A73E8] dark:hover:text-[#D2E3FC]")}
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[21px]">notifications</span>
            </button>
            )}
          </div>

          {/* DELETED: old search modal removed — inline expanding bar replaces it */}
          {(false as boolean) && isSearchOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => { setIsSearchOpen(false); onSearchChange(''); }} />
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      className="absolute right-0 top-full mt-2 w-[380px] bg-[#F1F3F4] dark:bg-[#1E1D22] border border-[#1A73E8]/12 dark:border-outline-variant/15 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
                    >
                      {/* Search input row */}
                      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-outline-variant/10">
                        <span className="material-symbols-outlined text-[19px] text-on-surface-variant/50 dark:text-inverse-on-surface/40 shrink-0">search</span>
                        <input
                          id="header-search-input"
                          autoFocus
                          value={globalSearch}
                          onChange={e => onSearchChange(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Escape') { setIsSearchOpen(false); onSearchChange(''); }
                            if (e.key === 'Enter' && searchResults.length > 0) {
                              const first = searchResults[0];
                              if (first.type === 'ticket') {
                                onSearchChange(first.id);
                                onNavigate('investigation');
                                saveRecentSearch(first.title);
                              } else if (first.type === 'guide') {
                                onNavigate('user_guide');
                                saveRecentSearch(first.title);
                              } else {
                                onNavigate(first.id.replace('nav-', '') as any);
                              }
                              setIsSearchOpen(false);
                              onSearchChange('');
                            }
                          }}
                          className="flex-1 bg-transparent text-sm font-medium text-on-surface dark:text-inverse-on-surface focus:outline-none placeholder:text-on-surface-variant/40 dark:placeholder:text-inverse-on-surface/30"
                          placeholder="Search tickets, domains, accounts…"
                        />
                        {globalSearch ? (
                          <button
                            onMouseDown={e => { e.preventDefault(); onSearchChange(''); }}
                            className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-inverse-surface/30 text-on-surface-variant/50 hover:text-on-surface-variant transition-colors"
                          >
                            <span className="material-symbols-outlined text-[15px]">close</span>
                          </button>
                        ) : (
                          <kbd className="text-[9px] font-mono bg-neutral-100 dark:bg-inverse-surface/40 px-1.5 py-0.5 rounded-md text-on-surface-variant/50 border border-neutral-200 dark:border-outline-variant/20 select-none shrink-0">⌘K</kbd>
                        )}
                      </div>

                      {/* Content */}
                      {globalSearch.trim() ? (
                        searchResults.length > 0 ? (
                          <div className="flex flex-col max-h-72 overflow-y-auto custom-scrollbar p-1.5 gap-0.5">
                            {(['ticket', 'guide', 'nav'] as const).map(type => {
                              const group = searchResults.filter(r => r.type === type);
                              if (!group.length) return null;
                              const label = type === 'ticket' ? 'Tickets' : type === 'guide' ? 'User Guide' : 'Navigation';
                              return (
                                <div key={type}>
                                  <div className="px-3 py-1.5 text-[9px] font-black text-[#1A73E8] dark:text-[#D2E3FC] uppercase tracking-wider select-none border-b border-[#1A73E8]/5 mb-1">
                                    {label} ({group.length})
                                  </div>
                                  {group.map(item => (
                                    <div
                                      key={item.id}
                                      onMouseDown={() => {
                                        if (item.type === 'ticket') {
                                          onSearchChange(item.id);
                                          onNavigate('investigation');
                                          setIsTicketPanelOpen(false);
                                          saveRecentSearch(item.title);
                                        } else if (item.type === 'guide') {
                                          onNavigate('user_guide');
                                          saveRecentSearch(item.title);
                                        } else {
                                          onNavigate(item.id.replace('nav-', '') as any);
                                        }
                                        setIsSearchOpen(false);
                                        onSearchChange('');
                                      }}
                                      className="px-3 py-2.5 min-h-[48px] hover:bg-[rgba(29,27,32,0.08)] dark:hover:bg-[rgba(255,255,255,0.08)] rounded-xl cursor-pointer transition-colors flex items-center gap-3"
                                    >
                                      <span className="material-symbols-outlined text-[#1A73E8]/60 dark:text-[#D2E3FC]/50 shrink-0" style={{ fontSize: '18px' }}>{item.icon}</span>
                                      <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                                        <div className="text-xs font-bold text-on-surface dark:text-inverse-on-surface truncate">{item.title}</div>
                                        {item.subtitle && <p className="text-[10px] text-on-surface-variant dark:text-inverse-on-surface/70 truncate">{item.subtitle}</p>}
                                      </div>
                                      {item.meta && (
                                        <span className="text-[8px] font-black uppercase tracking-wider px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 shrink-0">{item.meta}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="py-8 text-center">
                            <span className="material-symbols-outlined text-[32px] text-on-surface-variant/20 block mb-2">search_off</span>
                            <p className="text-xs text-on-surface-variant/50 font-semibold">No matching results</p>
                          </div>
                        )
                      ) : (
                        <div className="flex flex-col">
                          {/* Suggested chips */}
                          <div className="px-4 py-3 border-b border-outline-variant/10">
                            <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/50 dark:text-inverse-on-surface/40 mb-2 select-none">Suggested</p>
                            <div className="flex flex-wrap gap-1.5">
                              {SUGGESTED_CHIPS.map(chip => (
                                <button
                                  key={chip.label}
                                  onMouseDown={() => {
                                    onSearchChange(chip.label);
                                    onNavigate('investigation');
                                    saveRecentSearch(chip.label);
                                    setIsSearchOpen(false);
                                  }}
                                  className="px-2.5 py-1 rounded-full bg-[#E8F0FE] dark:bg-[#1A73E8]/20 text-[#1A73E8] dark:text-[#D2E3FC] text-[10px] font-bold hover:bg-[#D2E3FC] dark:hover:bg-[#1A73E8]/35 transition-colors select-none"
                                >
                                  {chip.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Recent searches */}
                          <div className="p-1.5">
                            <div className="px-3 py-1.5 text-[9px] font-black text-on-surface-variant/50 dark:text-inverse-on-surface/40 uppercase tracking-wider select-none">
                              Recent
                            </div>
                            {recentSearches.length > 0 ? (
                              <div className="flex flex-col gap-0.5">
                                {recentSearches.map(term => {
                                  const matchedTicket = ticketsList.find(t => t.case_number === term);
                                  return (
                                    <div
                                      key={term}
                                      onMouseDown={() => {
                                        onSearchChange(term);
                                        onNavigate('investigation');
                                        saveRecentSearch(term);
                                        setIsSearchOpen(false);
                                      }}
                                      className="px-3 py-1.5 min-h-[48px] hover:bg-[rgba(29,27,32,0.08)] dark:hover:bg-[rgba(255,255,255,0.08)] rounded-xl cursor-pointer transition-colors flex items-center justify-between"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className="material-symbols-outlined text-on-surface-variant/40 text-[15px] shrink-0">history</span>
                                        {matchedTicket ? (
                                          <span className="text-xs font-bold text-on-surface dark:text-inverse-on-surface truncate">
                                            {matchedTicket.account_name}
                                            <span className="font-mono text-[9px] font-black text-[#1A73E8] dark:text-[#D2E3FC] ml-1.5">#{matchedTicket.case_number}</span>
                                          </span>
                                        ) : (
                                          <span className="text-xs font-bold text-on-surface dark:text-inverse-on-surface truncate">{term}</span>
                                        )}
                                      </div>
                                      <button
                                        onMouseDown={e => {
                                          e.stopPropagation(); e.preventDefault();
                                          setRecentSearches(prev => {
                                            const next = prev.filter(i => i !== term);
                                            try { localStorage.setItem('edq_recent_searches', JSON.stringify(next)); } catch {}
                                            return next;
                                          });
                                        }}
                                        className="p-1 hover:bg-neutral-100 dark:hover:bg-inverse-surface rounded-lg text-on-surface-variant/30 hover:text-on-surface-variant transition-colors"
                                      >
                                        <span className="material-symbols-outlined text-[12px]">close</span>
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="py-5 text-center text-xs text-on-surface-variant/40 dark:text-inverse-on-surface/30 font-bold select-none">
                                No recent searches
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
        </header>

        <div className="flex min-h-0 flex-1 overflow-visible relative">
        {/* DETAIL PANE */}
        <main className={cn("flex-1 relative bg-white dark:bg-[#1C1B1F] min-w-0 min-h-0 mt-1 mb-2 flex overflow-hidden rounded-b-[16px] border border-[#E8EAED] dark:border-white/8", (showNotifications || isAiPanelOpen) ? "rounded-tl-[16px] rounded-tr-[16px]" : "rounded-tl-[16px]")}>

          {/* TICKET PANEL — inside the white investigation panel, flex sibling to content */}
          {currentView === 'investigation' && (
            <>
              <motion.div
                animate={{ width: isTicketPanelOpen ? panelWidth : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                className="relative h-full shrink-0 overflow-hidden z-10"
	              >
	                <div className="h-full overflow-hidden" style={{ width: isTicketPanelOpen ? panelWidth : 0 }}>
	                  <div
	                    className="box-border flex h-full flex-col gap-0 overflow-hidden border-r border-[#E8EAED] bg-[#F8F9FA] dark:border-outline-variant/15 dark:bg-[#121115]"
	                    style={{ width: panelWidth }}
	                  >
                      {/* Ticket search */}
                      <div className="shrink-0 px-3 pb-2 pt-3">
                        <div className="relative">
                          <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#49454F]/45 dark:text-white/35" style={{ fontSize: '18px' }}>search</span>
                          <input
                            type="text"
                            className="w-full rounded-full border border-transparent bg-[#F1F3F4]/70 py-2.5 pl-9 pr-4 text-[13px] text-[#1D192B] transition-colors placeholder:text-[#49454F]/40 focus:border-[#1A73E8]/15 focus:outline-none dark:bg-white/8 dark:text-white dark:placeholder:text-white/30"
                            placeholder="Search tickets"
                            value={ticketSearch}
                            onChange={e => setTicketSearch(e.target.value)}
                          />
                          {ticketSearch && (
                            <button onClick={() => setTicketSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#49454F]/40 transition-colors hover:text-[#49454F]">
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Underline tab filter */}
                      <div className="mx-3 mb-1 flex shrink-0 items-end border-b border-black/10 dark:border-white/10">
                        {(['All', 'Open', 'Closed'] as const).map(filter => {
                          const isActive = ticketFilter === filter;
                          return (
                            <button
                              key={filter}
                              type="button"
                              onClick={() => setTicketFilter(filter)}
                              className={cn(
                                "relative flex-1 select-none pb-2.5 pt-1.5 text-center text-[13.5px] transition-colors duration-150",
                                isActive
                                  ? "font-semibold text-[#1A73E8] dark:text-[#8AB4F8]"
                                  : "font-medium text-[#5f6368]/70 hover:text-[#202124] dark:text-white/40 dark:hover:text-white/80"
                              )}
                              style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}
                            >
                              {filter}
                              {isActive && (
                                <motion.div
                                  layoutId="ticket-filter-underline"
                                  className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full bg-[#1A73E8] dark:bg-[#8AB4F8]"
                                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Ticket list */}
                      <div className="flex-1 overflow-y-auto px-3 pb-3 pt-2 custom-scrollbar flex flex-col gap-[2px]">
                        {sortedTickets.map((t, idx) => {
                          const isSelected = t.case_number === selectedTicketId;
                          const isFirst = idx === 0;
                          const isLast = idx === sortedTickets.length - 1;

                          let roundedClass = "rounded-[4px]";
                          if (isFirst && isLast) {
                            roundedClass = "rounded-[16px]";
                          } else if (isFirst) {
                            roundedClass = "rounded-t-[16px] rounded-b-[4px]";
                          } else if (isLast) {
                            roundedClass = "rounded-b-[16px] rounded-t-[4px]";
                          }

                          return (
                            <motion.div
                              key={t.case_number}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, delay: idx * 0.03, ease: 'easeOut' }}
                              onClick={() => {
                                onSelectTicket(t.case_number);
                              }}
                              className={cn(
                                "flex w-full cursor-pointer select-none p-[18px_20px] gap-4 transition-colors duration-150 justify-between items-center min-h-[84px]",
                                roundedClass,
                                isSelected
                                  ? "bg-[#1A73E8] text-white"
                                  : "bg-[#EEF4FF] dark:bg-[#1E2A40] hover:bg-[#D2E3FC] dark:hover:bg-[#1E3358] active:bg-[#C6DAFC] dark:active:bg-[#1A3070]"
                              )}
                              style={{ fontFamily: "'Google Sans', 'Google Sans Text', Roboto, sans-serif" }}
                            >
                              <div className="flex flex-col min-w-0 flex-1">
                                <h4 className={cn(
                                  "text-[15.5px] font-medium truncate leading-tight",
                                  isSelected ? "text-white" : "text-on-surface dark:text-[#E6E1E5]"
                                )}>
                                  {t.account_name}
                                </h4>
                                <p className={cn(
                                  "text-[14px] font-medium mt-1.5 truncate leading-snug",
                                  isSelected ? "text-white/90" : "text-on-surface-variant dark:text-[#CAC4D0]"
                                )}>
                                  {t.case_subject}
                                </p>
                                <p className={cn(
                                  "text-[13.5px] font-semibold mt-1 truncate",
                                  isSelected ? "text-white/75" : "text-on-surface-variant/70 dark:text-white/40"
                                )}>
                                  {t.case_number} · {t.case_priority}
                                </p>
                              </div>
                              <div className="shrink-0 flex flex-col items-end gap-1.5 self-start mt-0.5">
                                <span className={cn(
                                  "text-[12.5px] font-medium",
                                  isSelected ? "text-white" : "text-on-surface-variant dark:text-white/40"
                                )}>
                                  {formatCaseDate(t.case_created_at)}
                                </span>
                                <span className={cn(
                                  "px-3 py-1 rounded-[100px] text-[11px] font-semibold text-white",
                                  t.case_status === 'Closed'
                                    ? "bg-[#1967D2]"
                                    : t.case_status === 'In Progress'
                                      ? "bg-[#FFCE18]"
                                      : "bg-[#188038]"
                                )}>
                                  {t.case_status}
                                </span>
                              </div>
                            </motion.div>
                          );
                        })}
                        {sortedTickets.length === 0 && (
                          <div className="py-12 text-center text-sm text-[#49454F]/40 select-none">No matching tickets.</div>
                        )}
                      </div>
	                  </div>
	                </div>
	              </motion.div>
              {/* Ticket drawer handle — sits on the panel edge, not a large pill. */}
              <motion.button
                type="button"
                aria-label={isTicketPanelOpen ? 'Collapse ticket list' : 'Open ticket list'}
                animate={{ left: isTicketPanelOpen ? panelWidth : 8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                className="group absolute top-1/2 z-[120] flex h-12 w-5 -translate-x-1/2 -translate-y-1/2 cursor-pointer select-none items-center justify-center bg-transparent"
                onClick={() => setIsTicketPanelOpen(!isTicketPanelOpen)}
              >
                <div className="h-12 w-1.5 rounded-full bg-[#CAC4D0]/95 shadow-sm transition-[transform,background-color] duration-200 ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-y-125 group-hover:bg-[#1A73E8] dark:bg-white/30 dark:group-hover:bg-white/50" />
              </motion.button>
            </>
          )}

          {/* Page content */}
          <div
            ref={mainContentRef}
            className={cn(
              "app-responsive-scope relative flex-1 min-w-0 min-h-0",
              "overflow-y-auto overflow-x-hidden",
              (pillSelectorActive || panelSelectorActive) && "gem-selector-active"
            )}
          >
            {children}
          </div>
        </main>

        {/* AI PANEL DRAWER — MD3 side sheet. Panel slides in/out; container width closes behind it. */}
        <div
          className={cn("shrink-0 h-full relative", !isAiPanelDragging && "transition-[width] duration-[400ms]")}
          style={{
            width: isAiPanelOpen ? aiPanelWidth : 0,
            transitionTimingFunction: isAiPanelOpen
              ? 'cubic-bezier(0.05, 0.7, 0.1, 1.0)'   /* MD3 Emphasized Decelerate — enter */
              : 'cubic-bezier(0.3, 0.0, 0.8, 0.15)',   /* MD3 Emphasized Accelerate — exit  */
          }}
        >
          {(isAiPanelOpen || aiPanelIsLoading) && (
            <motion.button
              type="button"
              onMouseDown={handleAiPanelDragStart}
	              title="Drag to resize Gemini"
	              aria-label="Drag to resize Gemini"
	              initial={false}
	              animate={{ left: 9 }}
	              className="group absolute top-1/2 z-[120] flex h-12 w-5 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize select-none items-center justify-center bg-transparent"
	            >
	              <div className="h-12 w-1.5 rounded-full bg-[#CAC4D0]/95 shadow-sm transition-[transform,background-color] duration-200 ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-y-125 group-hover:bg-[#1A73E8] dark:bg-white/30 dark:group-hover:bg-white/50" />
	            </motion.button>
          )}
          <AnimatePresence>
          {(isAiPanelOpen || aiPanelIsLoading) && (
            <motion.div
              key="ai-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1.0] }}
              style={{ position: 'absolute', inset: 0 }}
              className="gemini-exclude pt-1 pb-2 pl-2 pr-2 box-border flex flex-col"
            >
              <AiPanel
                isDark={isDark}
                screenContext={screenContext}
                chatHistory={aiChatHistory}
                onUpdateHistory={setAiChatHistory}
                onClose={() => setIsAiPanelOpen(false)}
                onOpenArticle={openGuideArticle}
                selectorActive={panelSelectorActive}
                onSelectorToggle={setPanelSelectorActive}
                pendingChip={panelPendingChip}
                onChipConsumed={() => setPanelPendingChip(null)}
                onLoadingChange={setAiPanelIsLoading}
                onChipsChange={setAiPanelChips}
                pendingQuery={aiPendingQuery}
                pendingQueryDisplay={aiPendingQueryDisplay}
                onPendingQueryConsumed={() => { setAiPendingQuery(''); setAiPendingQueryDisplay(''); }}
                searchQuery={globalSearch}
                onSearchQueryChange={onSearchChange}
                searchResults={searchResults}
                onSelectSearchResult={handleSearchResultSelect}
                onRunAction={runAppAction}
              />
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        {/* NOTIFICATIONS DRAWER — inline flex sibling, pushes main left but not header */}
        <AnimatePresence>
          {NOTIFICATIONS_ENABLED && showNotifications && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 340 }}
              exit={{ width: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="shrink-0 overflow-hidden h-full"
            >
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-[340px] h-full pt-1 pb-2 pr-2 pl-2 box-border flex flex-col"
              >
              <div
                ref={notifRef}
                className="flex-1 bg-white dark:bg-[#1C1B1F] rounded-2xl flex flex-col overflow-hidden"
                style={{ border: '1px solid rgba(0,0,0,0.05)' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#f1f3f4] dark:border-white/8 shrink-0">
                  <h2 className="text-[15px] font-bold text-on-surface dark:text-[#D2E3FC]">Notifications</h2>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setDismissedNotifIds(prev => {
                        const allIds = NOTIF_ITEMS.map(n => n.id);
                        const next = [...new Set([...prev, ...allIds])];
                        try { localStorage.setItem('edq_dismissed_notifs', JSON.stringify(next)); } catch {}
                        return next;
                      })}
                      className="text-[11px] font-medium text-[#1A73E8] hover:underline px-2 py-1 rounded transition-colors"
                    >Mark all read</button>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="w-7 h-7 flex items-center justify-center rounded-full text-[#444746] dark:text-white/50 hover:bg-black/6 dark:hover:bg-white/8 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                </div>

                {/* Notification feed */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {(() => {
                    const visible = NOTIF_ITEMS.filter(n => !dismissedNotifIds.includes(n.id));
                    if (visible.length === 0) return (
                      <div className="flex flex-col items-center justify-center h-full py-12 gap-3">
                        <span className="material-symbols-outlined text-[36px] text-on-surface-variant/20">notifications_off</span>
                        <p className="text-[13px] text-on-surface-variant/50 font-medium">You're all caught up</p>
                      </div>
                    );
                    const categories = [...new Set(visible.map(n => n.category))];
                    return categories.map((cat, ci) => {
                      const catItems = visible.filter(n => n.category === cat);
                      return (
                        <motion.div key={cat} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: ci * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                          <div className="px-4 pt-3 pb-1.5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50 select-none">{cat}</p>
                          </div>
                          {catItems.map(notif => (
                            <div key={notif.id} className="mx-2 mb-1 rounded-xl border border-outline-variant/20 bg-surface-container-low/60 dark:bg-white/3 overflow-hidden">
                              <div
                                className="px-3 py-2.5 cursor-pointer hover:bg-black/3 dark:hover:bg-white/4 transition-colors"
                                onClick={() => {
                                  if (notif.action === 'investigation') { onNavigate('investigation'); if (notif.ticketId) onSelectTicket(notif.ticketId); }
                                  else if (notif.action === 'tools') onNavigate('tools');
                                  else if (notif.action === 'user_guide') { try { if (notif.guidePath) sessionStorage.setItem('edq_guide_jump_path', notif.guidePath); } catch {} onNavigate('user_guide'); }
                                  setShowNotifications(false);
                                }}
                              >
                                <div className="flex items-start gap-2.5">
                                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5", notif.iconBg)}>
                                    <span className="material-symbols-outlined text-[15px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>{notif.icon}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[12.5px] font-semibold text-on-surface dark:text-white leading-snug">{notif.title}</p>
                                    <p className="text-[11px] text-on-surface-variant dark:text-white/50 mt-0.5 leading-snug">{notif.body}</p>
                                    <p className="text-[10px] text-on-surface-variant/50 mt-1">{notif.time}</p>
                                  </div>
                                </div>
                                {notif.cta && (
                                  <div className="mt-2 flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-[#1A73E8] dark:text-[#D2E3FC]">{notif.cta} →</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center border-t border-outline-variant/10 px-3 py-1.5 gap-2">
                                <button
                                  onClick={() => dismissNotif(notif.id)}
                                  className="text-[10px] font-medium text-on-surface-variant/60 hover:text-on-surface-variant transition-colors"
                                >Dismiss</button>
                                {notif.action && (
                                  <button
                                    onClick={() => {
                                      if (notif.action === 'investigation') { onNavigate('investigation'); if (notif.ticketId) onSelectTicket(notif.ticketId); }
                                      else if (notif.action === 'tools') onNavigate('tools');
                                      else if (notif.action === 'user_guide') { try { if (notif.guidePath) sessionStorage.setItem('edq_guide_jump_path', notif.guidePath); } catch {} onNavigate('user_guide'); }
                                      setShowNotifications(false);
                                    }}
                                    className="ml-auto text-[10px] font-bold text-[#1A73E8] dark:text-[#D2E3FC] hover:underline transition-colors"
                                  >View</button>
                                )}
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      );
                    });
                  })()}
                </div>
              </div>
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
      {/* Floating Gemini prompt pill — hidden while AiPanel drawer is open */}
      <GeminiPromptPill
        isAiPanelOpen={isAiPanelOpen}
        onOpenAiPanel={openAiPanel}
        isDark={isDark}
        currentView={currentView}
        selectorActive={pillSelectorActive}
        onSelectorToggle={setPillSelectorActive}
        pendingChip={pillPendingChip}
        onChipConsumed={() => setPillPendingChip(null)}
        screenContext={screenContext}
        onOpenArticle={openGuideArticle}
        panelChatHistory={aiChatHistory}
        panelIsLoading={aiPanelIsLoading}
        panelActiveChips={aiPanelChips}
        searchQuery={globalSearch}
        onSearchQueryChange={onSearchChange}
        searchResults={searchResults}
        onSelectSearchResult={handleSearchResultSelect}
        onRunAction={runAppAction}
        pageScrolling={pageScrolling}
        pendingPillQuery={aiPendingPillQuery}
        pendingPillQueryDisplay={aiPendingPillQueryDisplay}
        onPendingPillQueryConsumed={() => {
          setAiPendingPillQuery('');
          setAiPendingPillQueryDisplay('');
          setHighlightedContext(null);
        }}
        highlightedContext={highlightedContext}
      />

      {selectionTooltip?.visible && createPortal(
        <div
          className="selection-tooltip-btn fixed z-[9999] flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#20202C] text-[#202124] dark:text-white rounded-xl border border-neutral-300/40 dark:border-outline-variant/30 shadow-[0_2px_6px_rgba(60,64,67,0.15),0_1px_2px_rgba(60,64,67,0.3)] select-none cursor-pointer hover:bg-neutral-50 dark:hover:bg-white/5 active:scale-[0.97] transition-all"
          style={{
            left: `${selectionTooltip.x}px`,
            top: `${selectionTooltip.y}px`,
            transform: 'translate(-50%, 0)',
          }}
          onClick={() => {
            openPill(
              `Explain this selection: "${selectionTooltip.text}"`,
              `Ask about: "${selectionTooltip.text}"`,
              { text: selectionTooltip.text, domContext: selectionTooltip.domContext }
            );
            setSelectionTooltip(null);
            window.getSelection()?.removeAllRanges();
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#1A73E8] dark:text-[#8AB4F8]">
            <path d="M12 8l4 4-4 4" />
            <path d="M8 4v8h8" />
          </svg>
          <span className="text-[13px] font-[600] tracking-tight">Ask about</span>
        </div>,
        document.body
      )}
    </AiPanelContext.Provider>
  );
}
