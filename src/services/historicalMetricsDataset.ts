// Historical provider-level metrics — the source for ALL time-series charts.
//
// Grain: one row per case_number × metric_date × mailbox_provider.
// 30 dates per case · 6 scoped rows per date · 180 rows per case · 3,600 rows total.
// The final three dates per case have is_current_metric_window = true; exactly one date
// per case is the incident marker (six provider rows). Joined to the case dataset by
// case_number (string) only.
//
// Pure module (no fetch/React) so it runs in the hook and server-side. Never average
// row-level rates — always sum numerators/denominators then divide (see aggregate()).

import { parseCsvRows } from './caseDataset';

export const HISTORY_DATASET_URL = '/data/uk_supermarket_email_deliverability_history_final.csv';

export type CasePhase =
  | 'Baseline' | 'Build-up' | 'Incident' | 'Current incident'
  | 'Partial recovery' | 'Recovery' | 'Recovered' | string;

export interface HistoricalMetricRecord {
  case_number: string;
  account_id: string;
  account_name: string;
  case_status: 'Open' | 'In Progress' | 'Closed' | string;
  issue_type: string;
  metric_date: string; // ISO date
  metric_timezone: string;
  day_index: number;
  days_to_case_end: number;
  phase: CasePhase;
  issue_progress: number;
  is_current_metric_window: boolean;
  is_incident_marker: boolean;
  issue_signal: string;
  is_impacted_provider: boolean;
  mailbox_provider: string;
  recipient_domain: string;
  sending_domain: string;
  sending_ip: string;
  ip_pool: string;
  campaign: string;
  subaccount: string;
  // counts
  count_targeted: number;
  count_rejected: number;
  count_injected: number;
  count_admin_bounce: number;
  count_sent: number;
  count_accepted: number;
  count_bounce: number;
  count_hard_bounce: number;
  count_soft_bounce: number;
  count_undetermined_bounce: number;
  count_block_bounce: number;
  count_delayed: number;
  count_delayed_first: number;
  count_delivered_first: number;
  count_delivered_subsequent: number;
  count_inband_bounce: number;
  count_outofband_bounce: number;
  count_spam_complaint: number;
  count_unique_clicked: number;
  count_clicked: number;
  count_nonprefetched_unique_confirmed_opened: number;
  count_nonprefetched_rendered: number;
  count_nonprefetched_initial_rendered: number;
  count_unsubscribe: number;
  count_inbox: number;
  count_spam: number;
  count_moved_to_inbox: number;
  count_moved_to_spam: number;
  avg_msg_size: number;
  avg_delivery_time_first: number;
  avg_delivery_time_subsequent: number;
  total_msg_volume: number;
  // row-level rates (present in CSV but DO NOT average them — use aggregate())
  admin_bounce_rate: number;
  rejected_rate: number;
  accepted_rate: number;
  block_bounce_rate: number;
  bounce_rate: number;
  hard_bounce_rate: number;
  soft_bounce_rate: number;
  undetermined_bounce_rate: number;
  delayed_rate: number;
  spam_complaint_rate: number;
  nonprefetched_open_rate: number;
  click_through_rate: number;
  unsubscribe_rate: number;
  inbox_folder_rate: number;
  spam_folder_rate: number;
  moved_to_inbox_rate: number;
  moved_to_spam_rate: number;
}

const NUMBER_FIELDS: (keyof HistoricalMetricRecord)[] = [
  'day_index', 'days_to_case_end', 'issue_progress',
  'count_targeted', 'count_rejected', 'count_injected', 'count_admin_bounce', 'count_sent', 'count_accepted',
  'count_bounce', 'count_hard_bounce', 'count_soft_bounce', 'count_undetermined_bounce', 'count_block_bounce',
  'count_delayed', 'count_delayed_first', 'count_delivered_first', 'count_delivered_subsequent',
  'count_inband_bounce', 'count_outofband_bounce', 'count_spam_complaint', 'count_unique_clicked', 'count_clicked',
  'count_nonprefetched_unique_confirmed_opened', 'count_nonprefetched_rendered', 'count_nonprefetched_initial_rendered',
  'count_unsubscribe', 'count_inbox', 'count_spam', 'count_moved_to_inbox', 'count_moved_to_spam',
  'avg_msg_size', 'avg_delivery_time_first', 'avg_delivery_time_subsequent', 'total_msg_volume',
  'admin_bounce_rate', 'rejected_rate', 'accepted_rate', 'block_bounce_rate', 'bounce_rate', 'hard_bounce_rate',
  'soft_bounce_rate', 'undetermined_bounce_rate', 'delayed_rate', 'spam_complaint_rate', 'nonprefetched_open_rate',
  'click_through_rate', 'unsubscribe_rate', 'inbox_folder_rate', 'spam_folder_rate', 'moved_to_inbox_rate', 'moved_to_spam_rate',
];
const BOOL_FIELDS: (keyof HistoricalMetricRecord)[] = ['is_current_metric_window', 'is_incident_marker', 'is_impacted_provider'];

const num = (v: string) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const bool = (v: string) => /^(true|1|yes)$/i.test((v ?? '').trim());

export interface HistoryParseResult { records: HistoricalMetricRecord[]; errors: string[]; }

export function parseHistoricalDataset(csvText: string): HistoryParseResult {
  const rows = parseCsvRows(csvText);
  const errors: string[] = [];
  if (rows.length < 2) return { records: [], errors: ['Historical dataset is empty.'] };
  const header = rows[0];
  const col = (name: string) => header.indexOf(name);
  const colIdx: Record<string, number> = {};
  header.forEach((h, i) => { colIdx[h] = i; });

  const records: HistoricalMetricRecord[] = [];
  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    if (cells.length === 1 && cells[0] === '') continue;
    const get = (name: string) => { const i = colIdx[name]; return i >= 0 ? (cells[i] ?? '') : ''; };
    const rec = {} as HistoricalMetricRecord;
    // strings
    for (const k of ['case_number', 'account_id', 'account_name', 'case_status', 'issue_type', 'metric_date',
      'metric_timezone', 'phase', 'issue_signal', 'mailbox_provider', 'recipient_domain', 'sending_domain',
      'sending_ip', 'ip_pool', 'campaign', 'subaccount'] as const) {
      (rec as any)[k] = get(k);
    }
    for (const k of NUMBER_FIELDS) (rec as any)[k] = num(get(k as string));
    for (const k of BOOL_FIELDS) (rec as any)[k] = bool(get(k as string));
    records.push(rec);
  }

  // ── Validation (non-fatal, reported) ──
  void col;
  const byCase = new Map<string, HistoricalMetricRecord[]>();
  for (const rec of records) {
    if (!byCase.has(rec.case_number)) byCase.set(rec.case_number, []);
    byCase.get(rec.case_number)!.push(rec);
  }
  const approx = (a: number, b: number) => Math.abs(a - b) <= 0.5;
  let eqFails = 0;
  for (const [cn, rs] of byCase) {
    if (rs.length !== 180) errors.push(`Case ${cn}: ${rs.length} rows (expected 180).`);
    const dates = new Set(rs.map(r => r.metric_date));
    if (dates.size !== 30) errors.push(`Case ${cn}: ${dates.size} dates (expected 30).`);
    const incidentDates = new Set(rs.filter(r => r.is_incident_marker).map(r => r.metric_date));
    if (incidentDates.size !== 1) errors.push(`Case ${cn}: ${incidentDates.size} incident dates (expected 1).`);
    const curDates = new Set(rs.filter(r => r.is_current_metric_window).map(r => r.metric_date));
    if (curDates.size !== 3) errors.push(`Case ${cn}: ${curDates.size} current-window dates (expected 3).`);
    // six providers per date
    const perDate = new Map<string, number>();
    for (const r of rs) perDate.set(r.metric_date, (perDate.get(r.metric_date) ?? 0) + 1);
    for (const [d, c] of perDate) if (c !== 6) { errors.push(`Case ${cn} date ${d}: ${c} provider rows (expected 6).`); break; }
    // equations (sample-guarded)
    for (const r of rs) {
      if (!approx(r.count_targeted, r.count_injected + r.count_rejected) ||
        !approx(r.count_sent, r.count_injected - r.count_admin_bounce) ||
        !approx(r.count_sent, r.count_accepted + r.count_bounce) ||
        !approx(r.count_bounce, r.count_hard_bounce + r.count_soft_bounce + r.count_undetermined_bounce) ||
        !approx(r.count_bounce, r.count_inband_bounce + r.count_outofband_bounce) ||
        !approx(r.count_delivered_first + r.count_delivered_subsequent, r.count_accepted + r.count_outofband_bounce)) {
        eqFails++;
      }
    }
  }
  if (eqFails) errors.push(`${eqFails} rows fail count equations.`);
  return { records, errors };
}

/** Cross-check: every historical case_number must exist in the case dataset. */
export function validateAgainstCases(records: HistoricalMetricRecord[], caseNumbers: Set<string>): string[] {
  const missing = new Set<string>();
  for (const r of records) if (!caseNumbers.has(r.case_number)) missing.add(r.case_number);
  return missing.size ? [`Historical case_numbers not in case dataset: ${[...missing].join(', ')}`] : [];
}

// ── Indexes (built once) ──
export interface HistoryIndex {
  byCase: Map<string, HistoricalMetricRecord[]>;
  byCaseDate: Map<string, Map<string, HistoricalMetricRecord[]>>;
}
export function buildIndex(records: HistoricalMetricRecord[]): HistoryIndex {
  const byCase = new Map<string, HistoricalMetricRecord[]>();
  const byCaseDate = new Map<string, Map<string, HistoricalMetricRecord[]>>();
  for (const r of records) {
    if (!byCase.has(r.case_number)) { byCase.set(r.case_number, []); byCaseDate.set(r.case_number, new Map()); }
    byCase.get(r.case_number)!.push(r);
    const dm = byCaseDate.get(r.case_number)!;
    if (!dm.has(r.metric_date)) dm.set(r.metric_date, []);
    dm.get(r.metric_date)!.push(r);
  }
  return { byCase, byCaseDate };
}

// ── Aggregation (weighted — NEVER average row rates) ──
const sum = (rs: HistoricalMetricRecord[], k: keyof HistoricalMetricRecord) => rs.reduce((t, r) => t + (r[k] as number || 0), 0);
const ratio = (n: number, d: number) => (d > 0 ? n / d : 0);
const weightedAvg = (rs: HistoricalMetricRecord[], valKey: keyof HistoricalMetricRecord, wKey: keyof HistoricalMetricRecord) => {
  let n = 0, d = 0;
  for (const r of rs) { const w = r[wKey] as number || 0; n += (r[valKey] as number || 0) * w; d += w; }
  return ratio(n, d);
};

export interface AggregatedMetrics {
  rows: number;
  targeted: number; sent: number; accepted: number; injected: number;
  confirmedOpens: number; uniqueClicks: number;
  bounce: number; delayedFirst: number;
  inbox: number; spam: number;
  acceptedRate: number; bounceRate: number; hardBounceRate: number; softBounceRate: number; blockBounceRate: number;
  delayedRate: number; rejectionRate: number; complaintRate: number; confirmedOpenRate: number;
  clickThroughRate: number; unsubscribeRate: number; inboxFolderRate: number; spamFolderRate: number;
  avgDeliveryTimeFirst: number; avgDeliveryTimeSubsequent: number;
}

export function aggregate(rs: HistoricalMetricRecord[]): AggregatedMetrics {
  const sent = sum(rs, 'count_sent');
  const accepted = sum(rs, 'count_accepted');
  const targeted = sum(rs, 'count_targeted');
  const inbox = sum(rs, 'count_inbox');
  const spam = sum(rs, 'count_spam');
  return {
    rows: rs.length,
    targeted, sent, accepted, injected: sum(rs, 'count_injected'),
    confirmedOpens: sum(rs, 'count_nonprefetched_unique_confirmed_opened'),
    uniqueClicks: sum(rs, 'count_unique_clicked'),
    bounce: sum(rs, 'count_bounce'), delayedFirst: sum(rs, 'count_delayed_first'),
    inbox, spam,
    acceptedRate: ratio(accepted, sent),
    bounceRate: ratio(sum(rs, 'count_bounce'), sent),
    hardBounceRate: ratio(sum(rs, 'count_hard_bounce'), sent),
    softBounceRate: ratio(sum(rs, 'count_soft_bounce'), sent),
    blockBounceRate: ratio(sum(rs, 'count_block_bounce'), sent),
    delayedRate: ratio(sum(rs, 'count_delayed_first'), accepted),
    rejectionRate: ratio(sum(rs, 'count_rejected'), targeted),
    complaintRate: ratio(sum(rs, 'count_spam_complaint'), accepted),
    confirmedOpenRate: ratio(sum(rs, 'count_nonprefetched_unique_confirmed_opened'), accepted),
    clickThroughRate: ratio(sum(rs, 'count_unique_clicked'), accepted),
    unsubscribeRate: ratio(sum(rs, 'count_unsubscribe'), accepted),
    inboxFolderRate: ratio(inbox, inbox + spam),
    spamFolderRate: ratio(spam, inbox + spam),
    avgDeliveryTimeFirst: weightedAvg(rs, 'avg_delivery_time_first', 'count_delivered_first'),
    avgDeliveryTimeSubsequent: weightedAvg(rs, 'avg_delivery_time_subsequent', 'count_delivered_subsequent'),
  };
}

export interface DailyPoint extends AggregatedMetrics { date: string; isIncident: boolean; isCurrentWindow: boolean; phase: CasePhase; }

/** Aggregate selected rows per metric_date (ascending) — the basis for date charts. */
export function dailySeries(rs: HistoricalMetricRecord[]): DailyPoint[] {
  const byDate = new Map<string, HistoricalMetricRecord[]>();
  for (const r of rs) { if (!byDate.has(r.metric_date)) byDate.set(r.metric_date, []); byDate.get(r.metric_date)!.push(r); }
  return [...byDate.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, group]) => ({
      date,
      ...aggregate(group),
      isIncident: group.some(g => g.is_incident_marker),
      isCurrentWindow: group.some(g => g.is_current_metric_window),
      phase: group[0]?.phase ?? '',
    }));
}

/** Baseline (first N dates) vs current (current-window dates) comparison for a case. */
export function baselineVsCurrent(rs: HistoricalMetricRecord[], baselineDays = 7) {
  const firstDates = new Set([...new Set(rs.map(r => r.metric_date))].sort().slice(0, baselineDays));
  const baseline = aggregate(rs.filter(r => firstDates.has(r.metric_date)));
  const current = aggregate(rs.filter(r => r.is_current_metric_window));
  return { baseline, current };
}

export const providersOf = (rs: HistoricalMetricRecord[]) => [...new Set(rs.map(r => r.mailbox_provider))].sort();
export const incidentDate = (rs: HistoricalMetricRecord[]) => rs.find(r => r.is_incident_marker)?.metric_date ?? null;
