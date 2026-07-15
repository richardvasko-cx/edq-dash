// Canonical case dataset — sole source of truth for account, case, communication,
// authentication, diagnostic, bounce, action, filter and provider metric data.
//
// Parses public/data/uk_supermarket_email_deliverability_cases_final.csv into strict
// CaseRecord rows. One row per account + support case. This module is pure (no fetch,
// no React) so it can run in the browser hook AND server-side. The hook
// (useCaseDataset) supplies the CSV text.
//
// Email Deliverability team is ADVISORY/INVESTIGATIVE only — recommendations carry an
// owner prefix (Deliverability Team / Customer Email Ops / Customer DNS / Customer Data
// Operations / Customer Contact) and must never imply the team executed customer changes.

export const CASE_DATASET_URL = '/data/uk_supermarket_email_deliverability_cases_final.csv';

export type CaseStatus = 'Open' | 'In Progress' | 'Closed';
export const ASSIGNABLE_CASE_OWNERS = [
  'Alexandre Zibrick',
  'Austin Currin',
  'Brandon Blair',
  'Bryant Gregory',
  'Chris Mcgraw',
  'Daniel Stone',
  'Darren Lindsay',
  'Eric Stelle',
  'Ess Adjekum',
  'Esther Davis',
  'Hailey Wade',
  'José Ramón García Layos',
  'Justin Rodriguez',
  'Kimberly Paxton',
  'Lydia Vazquez',
  'Mike Auldredge',
  'Nikita Sambrekar',
  'Pooja Raje',
  'Richard Ibrahim',
  'Richard Vasko',
  'Song Soon Yang',
  'Sophie Jean Saint-Julien',
  'Stephanie Wooldridge',
  'Steve Butcher',
  'Tamara Wulf',
] as const;

export type CaseOwner = (typeof ASSIGNABLE_CASE_OWNERS)[number];
export type CommType = 'chat' | 'email';
export type AuthStatus = 'PASS' | 'WARN' | 'FAIL' | string;

export interface CaseThreadMessage {
  message_id: string;
  timestamp: string;
  comm_type: CommType;
  channel_scope: 'internal' | 'external' | string;
  sender_type: 'owner' | 'contact' | 'external' | string;
  sender_name: string;
  recipient_type: 'owner' | 'contact' | 'external' | string;
  recipient_name: string;
  direction: 'internal' | 'inbound' | 'outbound' | string;
  visibility: string;
  subject: string;
  message: string;
}

export interface DiagnosticItem {
  icon: string;
  title: string;
  description: string;
  status: string;
  is_error: boolean;
}

export interface BounceDetail {
  domain: string;
  count: number;
  reason: string;
  category: string;
  classification: string;
}

// Canonical sending-infrastructure metric counts + rates for the case's single aggregate window.
export interface CaseMetrics {
  admin_bounce_rate: number;
  count_admin_bounce: number;
  count_generation_failed: number;
  count_generation_rejection: number;
  count_injected: number;
  count_policy_rejection: number;
  count_rejected: number;
  rejected_rate: number;
  count_targeted: number;
  count_accepted: number;
  accepted_rate: number;
  avg_msg_size: number;
  avg_delivery_time_first: number;
  avg_delivery_time_subsequent: number;
  block_bounce_rate: number;
  count_block_bounce: number;
  bounce_rate: number;
  count_bounce: number;
  count_delayed: number;
  count_delayed_first: number;
  delayed_rate: number;
  count_delivered_first: number;
  count_delivered_subsequent: number;
  total_msg_volume: number;
  hard_bounce_rate: number;
  count_hard_bounce: number;
  count_inband_bounce: number;
  count_outofband_bounce: number;
  count_sent: number;
  soft_bounce_rate: number;
  count_soft_bounce: number;
  undetermined_bounce_rate: number;
  count_undetermined_bounce: number;
  count_inbox_panel: number;
  count_inbox_seed: number;
  count_spam_panel: number;
  count_spam_seed: number;
  count_inbox: number;
  inbox_folder_rate: number;
  count_moved_to_inbox: number;
  moved_to_inbox_rate: number;
  count_moved_to_spam: number;
  moved_to_spam_rate: number;
  count_spam: number;
  spam_folder_rate: number;
  click_through_rate: number;
  count_clicked: number;
  nonprefetched_open_rate: number;
  count_nonprefetched_rendered: number;
  count_nonprefetched_initial_rendered: number;
  spam_complaint_rate: number;
  count_spam_complaint: number;
  count_unique_clicked: number;
  count_nonprefetched_unique_confirmed_opened: number;
  unsubscribe_rate: number;
  count_unsubscribe: number;
}

const METRIC_KEYS: (keyof CaseMetrics)[] = [
  'admin_bounce_rate', 'count_admin_bounce', 'count_generation_failed', 'count_generation_rejection',
  'count_injected', 'count_policy_rejection', 'count_rejected', 'rejected_rate', 'count_targeted',
  'count_accepted', 'accepted_rate', 'avg_msg_size', 'avg_delivery_time_first', 'avg_delivery_time_subsequent',
  'block_bounce_rate', 'count_block_bounce', 'bounce_rate', 'count_bounce', 'count_delayed', 'count_delayed_first',
  'delayed_rate', 'count_delivered_first', 'count_delivered_subsequent', 'total_msg_volume', 'hard_bounce_rate',
  'count_hard_bounce', 'count_inband_bounce', 'count_outofband_bounce', 'count_sent', 'soft_bounce_rate',
  'count_soft_bounce', 'undetermined_bounce_rate', 'count_undetermined_bounce', 'count_inbox_panel',
  'count_inbox_seed', 'count_spam_panel', 'count_spam_seed', 'count_inbox', 'inbox_folder_rate',
  'count_moved_to_inbox', 'moved_to_inbox_rate', 'count_moved_to_spam', 'moved_to_spam_rate', 'count_spam',
  'spam_folder_rate', 'click_through_rate', 'count_clicked', 'nonprefetched_open_rate', 'count_nonprefetched_rendered',
  'count_nonprefetched_initial_rendered', 'spam_complaint_rate', 'count_spam_complaint', 'count_unique_clicked',
  'count_nonprefetched_unique_confirmed_opened', 'unsubscribe_rate', 'count_unsubscribe',
];

export interface CaseRecord {
  // ── Account ────────────────────────────────────────────────────────────
  account_id: string;
  account_name: string;
  cluster: string;
  account_status: string;
  email_service_provider: string;
  region: string;
  platform_edition: string;
  contract_end_date: string;
  macro_classification: string;
  industry_rollup: string;
  current_carr_usd: number;
  // ── Case ───────────────────────────────────────────────────────────────
  case_number: string; // canonical 8-char numeric STRING
  contact_name: string; // first name only
  contact_email: string;
  case_owner: CaseOwner;
  case_owner_team: string;
  case_subject: string;
  case_description: string;
  issue_type: string;
  case_status: CaseStatus;
  case_priority: string;
  support_category: string;
  escalation_path: string;
  case_created_at: string;
  case_updated_at: string;
  case_resolved_at: string;
  case_closed_at: string;
  sla_target_at: string;
  sla_breached: boolean;
  root_cause_summary: string;
  resolution_summary: string;
  tags: string[];
  comm_type: CommType[];
  case_thread_message_count: number;
  latest_message_at: string;
  case_thread: CaseThreadMessage[];
  recommended_actions: string[];
  diagnostics: DiagnosticItem[];
  bounces: BounceDetail[];
  // ── Authentication ───────────────────────────────────────────────────────
  dkim_selector: string;
  spf_status: AuthStatus;
  spf_description: string;
  spf_record: string;
  dkim_status: AuthStatus;
  dkim_description: string;
  dmarc_status: AuthStatus;
  dmarc_description: string;
  dmarc_policy: string;
  rdns_status: AuthStatus;
  rdns_hostname: string;
  // ── Metric window + filter dimensions ─────────────────────────────────────
  metric_start_date: string;
  metric_end_date: string;
  metric_timezone: string;
  sending_domains: string[];
  domains: string[];
  sending_ips: string[];
  ip_pools: string[];
  campaigns: string[];
  mailbox_providers: string[];
  mailbox_provider_regions: string[];
  subaccounts: string[];
  // ── Metrics ──────────────────────────────────────────────────────────────
  metrics: CaseMetrics;
}

// ── Status helpers (only the three final statuses are supported) ─────────────
export const isOpenCase = (c: { case_status: CaseStatus }) =>
  c.case_status === 'Open' || c.case_status === 'In Progress';
export const isClosedCase = (c: { case_status: CaseStatus }) => c.case_status === 'Closed';

// ── RFC 4180 CSV parser (handles quoted fields containing commas, newlines and
//    embedded JSON with doubled "" quotes) ───────────────────────────────────
export function parseCsvRows(text: string): string[][] {
  // Fast path for simple flat CSVs with no double-quoted fields (like the 1.9MB history file).
  // Avoids character-by-character string builder loops which trigger garbage collection.
  if (!text.includes('"')) {
    const s = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
    const lines = s.split(/\r?\n/);
    const rows: string[][] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line === '') continue;
      rows.push(line.split(','));
    }
    return rows;
  }

  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;
  // Strip BOM.
  const s = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inQuotes) {
      if (ch === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field); field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && s[i + 1] === '\n') i++;
      row.push(field); field = '';
      // Skip blank trailing rows.
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += ch;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const num = (v: string): number => {
  if (v == null || v === '') return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const bool = (v: string): boolean => /^(true|1|yes)$/i.test((v ?? '').trim());
const jsonArr = <T>(v: string, fallback: T[] = []): T[] => {
  if (!v) return fallback;
  try { const p = JSON.parse(v); return Array.isArray(p) ? p : fallback; } catch { return fallback; }
};

export interface DatasetParseResult {
  records: CaseRecord[];
  errors: string[];
}

/** Parse the CSV text into validated CaseRecord rows. Validation issues are returned
 *  in `errors` (non-fatal) so the UI can surface a data-quality warning if needed. */
export function parseCaseDataset(csvText: string): DatasetParseResult {
  const rows = parseCsvRows(csvText);
  const errors: string[] = [];
  if (rows.length < 2) return { records: [], errors: ['Dataset is empty.'] };
  const header = rows[0];
  const idx = (col: string) => header.indexOf(col);
  const records: CaseRecord[] = [];
  const seenAccounts = new Set<string>();
  const seenCases = new Set<string>();

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    if (cells.length === 1 && cells[0] === '') continue;
    const get = (col: string) => { const i = idx(col); return i >= 0 ? (cells[i] ?? '') : ''; };

    const metrics = {} as CaseMetrics;
    for (const k of METRIC_KEYS) metrics[k] = num(get(k));

    const caseNumber = get('case_number').trim();
    const status = get('case_status').trim() as CaseStatus;
    const owner = get('case_owner').trim() as CaseOwner;

    const rec: CaseRecord = {
      account_id: get('account_id'),
      account_name: get('account_name'),
      cluster: get('cluster'),
      account_status: get('account_status'),
      email_service_provider: get('email_service_provider'),
      region: get('region'),
      platform_edition: get('platform_edition'),
      contract_end_date: get('contract_end_date'),
      macro_classification: get('macro_classification'),
      industry_rollup: get('industry_rollup'),
      current_carr_usd: num(get('current_carr_usd')),
      case_number: caseNumber,
      contact_name: get('contact_name'),
      contact_email: get('contact_email'),
      case_owner: owner,
      case_owner_team: get('case_owner_team'),
      case_subject: get('case_subject'),
      case_description: get('case_description'),
      issue_type: get('issue_type'),
      case_status: status,
      case_priority: get('case_priority'),
      support_category: get('support_category'),
      escalation_path: get('escalation_path'),
      case_created_at: get('case_created_at'),
      case_updated_at: get('case_updated_at'),
      case_resolved_at: get('case_resolved_at'),
      case_closed_at: get('case_closed_at'),
      sla_target_at: get('sla_target_at'),
      sla_breached: bool(get('sla_breached')),
      root_cause_summary: get('root_cause_summary'),
      resolution_summary: get('resolution_summary'),
      tags: jsonArr<string>(get('tags_json')),
      comm_type: jsonArr<CommType>(get('comm_type')),
      case_thread_message_count: num(get('case_thread_message_count')),
      latest_message_at: get('latest_message_at'),
      case_thread: sortThread(jsonArr<CaseThreadMessage>(get('case_thread_json'))),
      recommended_actions: jsonArr<string>(get('recommended_actions_json')),
      diagnostics: jsonArr<DiagnosticItem>(get('diagnostic_breakdown_json')),
      bounces: jsonArr<BounceDetail>(get('bounce_details_json')),
      dkim_selector: get('dkim_selector'),
      spf_status: get('spf_status'),
      spf_description: get('spf_description'),
      spf_record: get('spf_record'),
      dkim_status: get('dkim_status'),
      dkim_description: get('dkim_description'),
      dmarc_status: get('dmarc_status'),
      dmarc_description: get('dmarc_description'),
      dmarc_policy: get('dmarc_policy'),
      rdns_status: get('rdns_status'),
      rdns_hostname: get('rdns_hostname'),
      metric_start_date: get('metric_start_date'),
      metric_end_date: get('metric_end_date'),
      metric_timezone: get('metric_timezone'),
      sending_domains: jsonArr<string>(get('sending_domains')),
      domains: jsonArr<string>(get('domains')),
      sending_ips: jsonArr<string>(get('sending_ips')),
      ip_pools: jsonArr<string>(get('ip_pools')),
      campaigns: jsonArr<string>(get('campaigns')),
      mailbox_providers: jsonArr<string>(get('mailbox_providers')),
      mailbox_provider_regions: jsonArr<string>(get('mailbox_provider_regions')),
      subaccounts: jsonArr<string>(get('subaccounts')),
      metrics,
    };

    // ── Validation (non-fatal, reported) ──────────────────────────────────
    if (!/^\d{8}$/.test(rec.case_number)) errors.push(`Row ${r}: case_number "${rec.case_number}" is not 8 digits.`);
    if (seenCases.has(rec.case_number)) errors.push(`Row ${r}: duplicate case_number ${rec.case_number}.`);
    if (seenAccounts.has(rec.account_id)) errors.push(`Row ${r}: duplicate account_id ${rec.account_id}.`);
    if (!['Open', 'In Progress', 'Closed'].includes(rec.case_status)) errors.push(`Row ${r}: invalid case_status "${rec.case_status}".`);
    if (!ASSIGNABLE_CASE_OWNERS.includes(rec.case_owner)) errors.push(`Row ${r}: invalid case_owner "${rec.case_owner}".`);
    if (/\s/.test(rec.contact_name.trim())) errors.push(`Row ${r}: contact_name "${rec.contact_name}" should be a first name only.`);
    if (!rec.subaccounts.some(s => /^braze/i.test(s))) errors.push(`Row ${r}: no braze-prefixed subaccount.`);
    if (rec.mailbox_providers.length < 5) errors.push(`Row ${r}: fewer than 5 mailbox providers.`);
    if (rec.mailbox_providers.includes('All')) errors.push(`Row ${r}: mailbox_providers contains "All".`);
    const chat = rec.case_thread.filter(m => m.comm_type === 'chat').length;
    const email = rec.case_thread.filter(m => m.comm_type === 'email').length;
    if (chat !== 6 || email !== 2) errors.push(`Row ${r}: expected 6 chat + 2 email, got ${chat} + ${email}.`);

    seenCases.add(rec.case_number);
    seenAccounts.add(rec.account_id);
    records.push(rec);
  }
  return { records, errors };
}

function sortThread(thread: CaseThreadMessage[]): CaseThreadMessage[] {
  return [...thread].sort((a, b) => (a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0));
}

// ── Weighted aggregate metrics across a set of cases ─────────────────────────
// The CSV is one aggregate window per case — do NOT fabricate daily points. These
// weighted formulas combine multiple cases (e.g. a filtered cohort) correctly.
const sum = (records: CaseRecord[], k: keyof CaseMetrics) => records.reduce((t, c) => t + (c.metrics[k] || 0), 0);
const ratio = (n: number, d: number) => (d > 0 ? n / d : 0);

export interface WeightedMetrics {
  acceptedRate: number;
  bounceRate: number;
  delayedRate: number;
  rejectionRate: number;
  complaintRate: number;
  confirmedOpenRate: number;
  clickThroughRate: number;
  inboxRate: number;
}

export function weightedMetrics(records: CaseRecord[]): WeightedMetrics {
  const inbox = sum(records, 'count_inbox');
  const spam = sum(records, 'count_spam');
  return {
    acceptedRate: ratio(sum(records, 'count_accepted'), sum(records, 'count_sent')),
    bounceRate: ratio(sum(records, 'count_bounce'), sum(records, 'count_sent')),
    delayedRate: ratio(sum(records, 'count_delayed_first'), sum(records, 'count_accepted')),
    rejectionRate: ratio(sum(records, 'count_rejected'), sum(records, 'count_targeted')),
    complaintRate: ratio(sum(records, 'count_spam_complaint'), sum(records, 'count_accepted')),
    confirmedOpenRate: ratio(sum(records, 'count_nonprefetched_unique_confirmed_opened'), sum(records, 'count_accepted')),
    clickThroughRate: ratio(sum(records, 'count_unique_clicked'), sum(records, 'count_accepted')),
    inboxRate: ratio(inbox, inbox + spam),
  };
}

export const findCase = (records: CaseRecord[], caseNumber: string | null) =>
  caseNumber ? records.find(c => c.case_number === caseNumber) ?? null : null;

// Flatten + dedupe a list field across records (e.g. for building filter options).
// `mailbox_providers` never contains the dataset value "All".
export function uniqueAcross(records: CaseRecord[], key: 'mailbox_providers' | 'sending_domains' | 'domains' | 'sending_ips' | 'ip_pools' | 'campaigns' | 'subaccounts'): string[] {
  const set = new Set<string>();
  for (const r of records) for (const v of r[key]) if (v && v !== 'All') set.add(v);
  return [...set].sort();
}
