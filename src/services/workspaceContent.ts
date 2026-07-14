// Seeds each Workspace panel with an AI-style draft derived deterministically from
// the selected case. Every panel has grounded content instantly and offline; the
// Workspace UI layers optional live Gemini regeneration on top.
//
// Drafts are backed by the case's data and the Email Deliverability team's advisory
// role: recommendations keep their ownership prefixes (Deliverability Team / Customer
// Email Ops / Customer DNS / Customer Data Operations / Customer Contact) and never
// imply the Deliverability owner executed customer DNS, routing or data changes.

import type { CaseRecord } from '../data';
import type { WorkspacePanelId } from './workspaceDependencies';
import { providerDisplayName } from './providerRouting';

const dash = (v?: string) => (v && v.trim() ? v : '—');
const pct = (v: number | undefined) => (v == null ? '—' : `${(v * 100).toFixed(1)}%`);
const PLATFORM_ACCESS_NOTE =
  'Customers do not have direct access to SparkPost, SendGrid, Amazon SES, MTA consoles, or Braze-managed IP tooling. Customer-facing actions must stay within their DNS provider, Braze, Looker, and recipient mailbox-provider channels such as Microsoft/Outlook, Gmail/Google, Yahoo/AOL, or Apple/iCloud.';

export function buildWorkspaceSuggestions(t: CaseRecord | null): Record<WorkspacePanelId, string> {
  if (!t) {
    return {
      gettingStarted: '', customerIssue: '', rootCause: '', authenticationFindings: '',
      deliverabilityFindings: '', emailPerformanceFindings: '', supportHistoryContext: '',
      recommendedActions: '', finalResponse: '',
    };
  }

  const provider = providerDisplayName(t.email_service_provider, 'the sending platform');
  const domain = t.sending_domains[0] ?? '—';
  const m = t.metrics;

  const authLine = `SPF ${t.spf_status} (${dash(t.spf_description)}), DKIM ${t.dkim_status} (${dash(t.dkim_description)}), DMARC ${t.dmarc_status} (${dash(t.dmarc_description)}).`;
  const authIssue = [t.spf_status, t.dkim_status, t.dmarc_status].some(s => s === 'FAIL' || s === 'WARN');
  const topBounce = t.bounces?.[0];

  const customerIssue =
    `${t.account_name} (${dash(t.platform_edition)}) raised case ${t.case_number}: "${t.case_subject}".\n` +
    `Sending via ${provider} on ${domain}. Reported impact: ${t.case_description || t.root_cause_summary}`;

  const rootCause =
    `Confirmed root cause: ${t.root_cause_summary}\n\n` +
    `Authentication state — ${authLine}\n` +
    (topBounce ? `Primary failure signal: ${topBounce.classification} at ${topBounce.domain} — "${topBounce.reason}".\n` : '') +
    `This is consistent with the observed accepted rate (${pct(m.accepted_rate)}) and confirmed open rate (${pct(m.nonprefetched_open_rate)}).`;

  const authenticationFindings = authIssue
    ? `Authentication shows findings that the customer's DNS / Infrastructure owner should correct before re-validation. ${authLine}\n` +
      `Best practice (Customer DNS / Infrastructure): keep SPF within the 10 DNS-lookup limit, align the Return-Path to the header From, and confirm the Braze-provided SPF include/selector is published. Deliverability re-checks each sending domain via Tools → Dig once changes land.\n` +
      PLATFORM_ACCESS_NOTE
    : `Authentication is correctly configured and aligned. ${authLine}\n` +
      `No authentication change is required; alignment is not contributing to this issue.`;

  const deliverabilityFindings =
    `Accepted rate ${pct(m.accepted_rate)}, bounce rate ${pct(m.bounce_rate)}, first-attempt delay rate ${pct(m.delayed_rate)} — sourced from ${provider}.\n` +
    (topBounce
      ? `Dominant pattern: ${topBounce.classification} at ${topBounce.domain} (${topBounce.count.toLocaleString()}). Code/reason: "${topBounce.reason}".\n` +
        `Recommendation (Customer Email Ops): ${/throttl|defer|rate/i.test(topBounce.reason + topBounce.classification) ? 'ease the volume ramp and spread sends so the mailbox provider accepts at a sustainable rate' : /reputation/i.test(topBounce.classification) ? 'review sending IP/domain reputation and warm-up posture before resuming full volume' : 'tighten list hygiene and suppress invalid recipients (Customer Data Operations)'}.`
      : 'No dominant bounce pattern identified.');

  const emailPerformanceFindings =
    `Confirmed open rate ${pct(m.nonprefetched_open_rate)}, click-through ${pct(m.click_through_rate)}, spam-complaint rate ${pct(m.spam_complaint_rate)}, unsubscribe rate ${pct(m.unsubscribe_rate)} — sourced from ${provider}.\n` +
    (t.diagnostics.find(d => d.is_error)?.description ?? 'Engagement is within expected range for this cohort.');

  const supportHistoryContext =
    `Reviewed prior cases for ${t.account_name} and contextually similar resolved cases across other accounts (identifiers redacted).\n` +
    `Precedent resolutions are used as supporting evidence only — no other customer's details are disclosed or mixed into this case.`;

  // Recommended actions come straight from the dataset with their ownership prefixes
  // intact — the Deliverability team advises; implementation owners execute.
  const recommendedActions = t.recommended_actions.length
    ? t.recommended_actions.map((a, i) => `${i + 1}. ${a}`).join('\n')
    : '1. Deliverability Team: confirm recovery before closing.';

  // Final Ticket Response — internal deliverability HANDOFF NOTE to the colleague/CSM
  // who owns the customer relationship (they relay to the customer). EDS is advisory:
  // it does NOT contact the customer, submit provider tickets, or monitor the account,
  // so actions are framed as the CUSTOMER's (relayed) or to RAISE INTERNALLY — never
  // "we will submit/monitor/coordinate". The customer submits their own mailbox-provider
  // requests and monitors via scheduled Looker reports / data in Braze. They do not
  // have direct SparkPost, SendGrid, Amazon SES, MTA-console, or Braze-managed IP access.
  const stripOwner = (a: string) => a.replace(/^\s*(Customer\s+[A-Za-z /]+|Deliverability Team|Customer Contact)\s*:\s*/i, '').trim();
  const customerActions = t.recommended_actions.filter(a => /^\s*Customer\b/i.test(a)).map(stripOwner);
  const internalActions = t.recommended_actions.filter(a => !/^\s*Customer\b/i.test(a)).map(stripOwner);
  const bullets = (xs: string[]) => xs.length ? xs.map(s => `- ${s}`).join('\n') : '- (none for this case)';
  const dominant = topBounce ? `the "${topBounce.reason}" signal at ${topBounce.domain}` : 'the dominant deliverability signal';

  const finalResponse =
    `Hi team,\n\n` +
    `Here is the deliverability handoff note for ${t.case_number} (${t.account_name}). ${t.root_cause_summary}\n\n` +
    `**What we found:**\n` +
    `Accepted rate is ${pct(m.accepted_rate)} with a ${pct(m.bounce_rate)} bounce rate and ${pct(m.delayed_rate)} first-attempt delays; confirmed opens are ${pct(m.nonprefetched_open_rate)} and complaints ${pct(m.spam_complaint_rate)} (source: ${provider}). ` +
    (topBounce ? `The dominant signal is ${dominant}. ` : '') +
    `Authentication is ${authIssue ? 'showing findings' : 'healthy'} — ${authLine}\n\n` +
    `**What it means:**\n` +
    `${t.resolution_summary || `The pattern points to ${dominant}; the steps below are grouped by who needs to action them.`}\n\n` +
    `**For the customer to action (relay to them):**\n${bullets(customerActions)}\n` +
    `- Submit any recipient mailbox-provider mitigation/delisting requests themselves, where applicable, and monitor recovery via their scheduled Looker reports and data in Braze.\n` +
    `- Do not ask them to use SparkPost, SendGrid, Amazon SES, raw MTA tooling, or Braze-managed IP provider consoles; they do not have direct access to those systems.\n\n` +
    `**To raise internally (cross-team / platform ticket):**\n${bullets(internalActions)}\n\n` +
    `Let me know if you have any questions on these steps.\n\n` +
    `— ${dash(t.case_owner)}, ${dash(t.case_owner_team)} (deliverability, advisory)`;

  return {
    gettingStarted: '',
    customerIssue,
    rootCause,
    authenticationFindings,
    deliverabilityFindings,
    emailPerformanceFindings,
    supportHistoryContext,
    recommendedActions,
    finalResponse,
  };
}
