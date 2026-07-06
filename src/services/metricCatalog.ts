// Metric catalog for the Braze sending-infrastructure "Metrics" picker + the combo charts it drives.
//
// Each metric maps an exact provider metric label to historical fields and a render kind:
//   - count  : SUM(field)                     → plotted as bars (left axis)
//   - size   : weighted avg of field          → bars/line (left axis)
//   - latency: weighted avg by delivered count → line (left axis, ms)
//   - rate   : SUM(num) / SUM(den)            → line (right axis, %). NEVER averaged.
//
// Metrics with no field in the historical dataset are marked unavailable (rendered but
// not selectable) so the picker still mirrors the provider layout.

import type { HistoricalMetricRecord } from './historicalMetricsDataset';
import { normalizeMta, type Mta } from './providerRouting';

export type MetricKind = 'count' | 'rate' | 'latency' | 'size';
export type MetricGroup = 'Injection Metrics' | 'Delivery Metrics' | 'Deliverability Metrics' | 'Engagement Metrics';

export interface MetricDef {
  key: string;
  label: string;
  group: MetricGroup;
  kind: MetricKind;
  field?: keyof HistoricalMetricRecord;       // count / size
  num?: keyof HistoricalMetricRecord;         // rate numerator
  den?: keyof HistoricalMetricRecord;         // rate denominator
  weight?: keyof HistoricalMetricRecord;      // latency/size weight
  available: boolean;                          // false → present in UI but disabled (no history field)
}

export const METRIC_GROUP_SUBTITLES: Record<MetricGroup, string> = {
  'Injection Metrics': "Processing of messages through the account's sending infrastructure",
  'Delivery Metrics': 'Transmission of messages to the mailbox',
  'Deliverability Metrics': 'Placement of messages in the inbox',
  'Engagement Metrics': 'Interaction with messages in the inbox',
};

const c = (key: string, label: string, group: MetricGroup, field: keyof HistoricalMetricRecord): MetricDef => ({ key, label, group, kind: 'count', field, available: true });
const r = (key: string, label: string, group: MetricGroup, num: keyof HistoricalMetricRecord, den: keyof HistoricalMetricRecord): MetricDef => ({ key, label, group, kind: 'rate', num, den, available: true });
const na = (key: string, label: string, group: MetricGroup): MetricDef => ({ key, label, group, kind: 'count', available: false });

// Order matches the provider side-sheet (2-column, alphabetical within group).
export const METRIC_CATALOG: MetricDef[] = [
  // ── Injection ──
  r('admin_bounce_rate', 'Admin Bounce Rate', 'Injection Metrics', 'count_admin_bounce', 'count_injected'),
  c('count_admin_bounce', 'Admin Bounces', 'Injection Metrics', 'count_admin_bounce'),
  na('count_generation_failed', 'Generation Failures', 'Injection Metrics'),
  na('count_generation_rejection', 'Generation Rejections', 'Injection Metrics'),
  c('count_injected', 'Injected', 'Injection Metrics', 'count_injected'),
  na('count_policy_rejection', 'Policy Rejections', 'Injection Metrics'),
  c('count_rejected', 'Rejected', 'Injection Metrics', 'count_rejected'),
  r('rejected_rate', 'Rejection Rate', 'Injection Metrics', 'count_rejected', 'count_targeted'),
  c('count_targeted', 'Targeted', 'Injection Metrics', 'count_targeted'),
  // ── Delivery ──
  c('count_accepted', 'Accepted', 'Delivery Metrics', 'count_accepted'),
  r('accepted_rate', 'Accepted Rate', 'Delivery Metrics', 'count_accepted', 'count_sent'),
  { key: 'avg_msg_size', label: 'Avg Delivery Message Size', group: 'Delivery Metrics', kind: 'size', field: 'avg_msg_size', weight: 'count_sent', available: true },
  { key: 'avg_delivery_time_first', label: 'Avg Latency 1st Attempt', group: 'Delivery Metrics', kind: 'latency', field: 'avg_delivery_time_first', weight: 'count_delivered_first', available: true },
  { key: 'avg_delivery_time_subsequent', label: 'Avg Latency 2+ Attempts', group: 'Delivery Metrics', kind: 'latency', field: 'avg_delivery_time_subsequent', weight: 'count_delivered_subsequent', available: true },
  r('block_bounce_rate', 'Block Bounce Rate', 'Delivery Metrics', 'count_block_bounce', 'count_sent'),
  c('count_block_bounce', 'Block Bounces', 'Delivery Metrics', 'count_block_bounce'),
  r('bounce_rate', 'Bounce Rate', 'Delivery Metrics', 'count_bounce', 'count_sent'),
  c('count_bounce', 'Bounces', 'Delivery Metrics', 'count_bounce'),
  c('count_delayed', 'Delayed', 'Delivery Metrics', 'count_delayed'),
  c('count_delayed_first', 'Delayed 1st Attempt', 'Delivery Metrics', 'count_delayed_first'),
  r('delayed_rate', 'Delayed Rate', 'Delivery Metrics', 'count_delayed_first', 'count_accepted'),
  c('count_delivered_first', 'Delivered 1st Attempt', 'Delivery Metrics', 'count_delivered_first'),
  c('count_delivered_subsequent', 'Delivered 2+ Attempts', 'Delivery Metrics', 'count_delivered_subsequent'),
  c('total_msg_volume', 'Delivery Message Volume', 'Delivery Metrics', 'total_msg_volume'),
  r('hard_bounce_rate', 'Hard Bounce Rate', 'Delivery Metrics', 'count_hard_bounce', 'count_sent'),
  c('count_hard_bounce', 'Hard Bounces', 'Delivery Metrics', 'count_hard_bounce'),
  c('count_inband_bounce', 'In-band Bounces', 'Delivery Metrics', 'count_inband_bounce'),
  c('count_outofband_bounce', 'Out-of-band Bounces', 'Delivery Metrics', 'count_outofband_bounce'),
  c('count_sent', 'Sent', 'Delivery Metrics', 'count_sent'),
  r('soft_bounce_rate', 'Soft Bounce Rate', 'Delivery Metrics', 'count_soft_bounce', 'count_sent'),
  c('count_soft_bounce', 'Soft Bounces', 'Delivery Metrics', 'count_soft_bounce'),
  r('undetermined_bounce_rate', 'Undetermined Bounce Rate', 'Delivery Metrics', 'count_undetermined_bounce', 'count_sent'),
  c('count_undetermined_bounce', 'Undetermined Bounces', 'Delivery Metrics', 'count_undetermined_bounce'),
  // ── Deliverability (placement) ──
  c('count_inbox', 'Inbox Folder Count', 'Deliverability Metrics', 'count_inbox'),
  r('inbox_folder_rate', 'Inbox Folder Rate', 'Deliverability Metrics', 'count_inbox', 'count_inbox'), // special: inbox/(inbox+spam) handled in compute
  c('count_moved_to_inbox', 'Moved to Inbox Count', 'Deliverability Metrics', 'count_moved_to_inbox'),
  r('moved_to_inbox_rate', 'Moved to Inbox Rate', 'Deliverability Metrics', 'count_moved_to_inbox', 'count_inbox'),
  c('count_moved_to_spam', 'Moved to Spam Count', 'Deliverability Metrics', 'count_moved_to_spam'),
  r('moved_to_spam_rate', 'Moved to Spam Rate', 'Deliverability Metrics', 'count_moved_to_spam', 'count_spam'),
  c('count_spam', 'Spam Folder Count', 'Deliverability Metrics', 'count_spam'),
  r('spam_folder_rate', 'Spam Folder Rate', 'Deliverability Metrics', 'count_spam', 'count_spam'), // special handled in compute
  // ── Engagement ──
  r('click_through_rate', 'Click-through Rate', 'Engagement Metrics', 'count_unique_clicked', 'count_accepted'),
  c('count_clicked', 'Clicks', 'Engagement Metrics', 'count_clicked'),
  r('nonprefetched_open_rate', 'Open Rate', 'Engagement Metrics', 'count_nonprefetched_unique_confirmed_opened', 'count_accepted'),
  c('count_nonprefetched_rendered', 'Opens (Bottom Pixel)', 'Engagement Metrics', 'count_nonprefetched_rendered'),
  c('count_nonprefetched_initial_rendered', 'Opens (Top Pixel)', 'Engagement Metrics', 'count_nonprefetched_initial_rendered'),
  r('spam_complaint_rate', 'Spam Complaint Rate', 'Engagement Metrics', 'count_spam_complaint', 'count_accepted'),
  c('count_spam_complaint', 'Spam Complaints', 'Engagement Metrics', 'count_spam_complaint'),
  c('count_unique_clicked', 'Unique Clicks', 'Engagement Metrics', 'count_unique_clicked'),
  c('count_nonprefetched_unique_confirmed_opened', 'Unique Confirmed Opens', 'Engagement Metrics', 'count_nonprefetched_unique_confirmed_opened'),
  r('unsubscribe_rate', 'Unsubscribe Rate', 'Engagement Metrics', 'count_unsubscribe', 'count_accepted'),
  c('count_unsubscribe', 'Unsubscribes', 'Engagement Metrics', 'count_unsubscribe'),
];

export const METRIC_GROUPS: MetricGroup[] = ['Injection Metrics', 'Delivery Metrics', 'Deliverability Metrics', 'Engagement Metrics'];
export const METRIC_BY_KEY: Record<string, MetricDef> = Object.fromEntries(METRIC_CATALOG.map(m => [m.key, m]));

const SES_LABEL_OVERRIDES: Record<string, string> = {
  count_accepted: 'Delivered',
  accepted_rate: 'Delivery Rate',
  count_soft_bounce: 'Transient Bounces',
  soft_bounce_rate: 'Transient Bounce Rate',
  count_hard_bounce: 'Permanent Bounces',
  hard_bounce_rate: 'Permanent Bounce Rate',
  count_spam_complaint: 'Complaints',
  spam_complaint_rate: 'Complaint Rate',
  count_nonprefetched_unique_confirmed_opened: 'Opens',
  nonprefetched_open_rate: 'Open Rate',
  count_unique_clicked: 'Clicks',
  click_through_rate: 'Click Rate',
  count_inbox: 'Inbox Count',
  inbox_folder_rate: 'Inbox Rate',
  count_spam: 'Spam Count',
  spam_folder_rate: 'Spam Rate',
};

const SES_AVAILABLE_METRICS = new Set([
  'count_sent',
  'count_accepted',
  'accepted_rate',
  'count_spam_complaint',
  'spam_complaint_rate',
  'count_soft_bounce',
  'soft_bounce_rate',
  'count_hard_bounce',
  'hard_bounce_rate',
  'count_nonprefetched_unique_confirmed_opened',
  'nonprefetched_open_rate',
  'count_unique_clicked',
  'click_through_rate',
  'count_inbox',
  'inbox_folder_rate',
  'count_spam',
  'spam_folder_rate',
  'count_unsubscribe',
  'unsubscribe_rate',
]);

export function getMetricCatalogForProvider(provider?: string | null): MetricDef[] {
  const mta = normalizeMta(provider);
  if (mta !== 'ses') return METRIC_CATALOG;
  return METRIC_CATALOG
    .filter(metric => SES_AVAILABLE_METRICS.has(metric.key))
    .map(metric => ({
      ...metric,
      label: SES_LABEL_OVERRIDES[metric.key] ?? metric.label,
      available: metric.available,
    }));
}

export function getMetricByKeyForProvider(provider?: string | null): Record<string, MetricDef> {
  return Object.fromEntries(getMetricCatalogForProvider(provider).map(metric => [metric.key, metric]));
}

export function getEnabledMetricKeysForProvider(provider?: string | null): string[] {
  return getMetricCatalogForProvider(provider).filter(metric => metric.available).map(metric => metric.key);
}

export function getProviderDefaultMetrics(provider?: string | null): string[] {
  const mta: Mta = normalizeMta(provider);
  if (mta === 'ses') return ['count_sent', 'count_accepted', 'accepted_rate', 'count_soft_bounce', 'soft_bounce_rate'];
  return DEFAULT_METRICS;
}

const sum = (rows: HistoricalMetricRecord[], k: keyof HistoricalMetricRecord) => rows.reduce((t, r) => t + (r[k] as number || 0), 0);

/** Compute a metric's value over a set of rows (weighted; never averages row rates). */
export function computeMetric(def: MetricDef, rows: HistoricalMetricRecord[]): number {
  if (!rows.length) return 0;
  switch (def.kind) {
    case 'count':
      return def.field ? sum(rows, def.field) : 0;
    case 'rate': {
      // Folder rates use inbox/(inbox+spam) and spam/(inbox+spam).
      if (def.key === 'inbox_folder_rate' || def.key === 'spam_folder_rate') {
        const inbox = sum(rows, 'count_inbox'), spam = sum(rows, 'count_spam');
        const denom = inbox + spam;
        return denom > 0 ? (def.key === 'inbox_folder_rate' ? inbox : spam) / denom : 0;
      }
      const n = def.num ? sum(rows, def.num) : 0;
      const d = def.den ? sum(rows, def.den) : 0;
      return d > 0 ? n / d : 0;
    }
    case 'size':
    case 'latency': {
      if (!def.field || !def.weight) return 0;
      let n = 0, d = 0;
      for (const row of rows) { const w = row[def.weight] as number || 0; n += (row[def.field] as number || 0) * w; d += w; }
      return d > 0 ? n / d : 0;
    }
  }
}

export const isRate = (def: MetricDef) => def.kind === 'rate';
export const formatMetric = (def: MetricDef, v: number): string =>
  def.kind === 'rate' ? `${(v * 100).toFixed(2)}%`
    : def.kind === 'latency' ? `${v.toFixed(0)} ms`
    : def.kind === 'size' ? `${(v / 1024).toFixed(1)} KB`
    : v.toLocaleString();

// Default selected metrics (mirror the example: Targeted, Accepted, Bounces + a rate line).
export const DEFAULT_METRICS = ['count_sent', 'count_accepted', 'bounce_rate'];
