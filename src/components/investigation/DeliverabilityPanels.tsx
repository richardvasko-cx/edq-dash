import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  ChartPie,
  Clock3,
  Database,
  Globe2,
  Inbox,
  MailCheck,
  MailWarning,
  Send,
  Server,
  ShieldAlert,
  SlidersHorizontal,
  Search as SearchIcon,
  TableProperties,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../App';
import { md3Ease, md3Enter } from '../../lib/md3Motion';
import MetricsFilterSheet from '../charts/MetricsFilterSheet';
import { EMPTY_FILTERS, type ResourceFilters, type ResourceKey } from '../charts/MetricsFilterTypes';
import PanelCustomizeSheet, { type PanelOutlineItem } from '../charts/PanelCustomizeSheet';
import {
  METRIC_CATALOG,
  METRIC_GROUPS,
  METRIC_GROUP_SUBTITLES,
  getEnabledMetricKeysForProvider,
  getMetricCatalogForProvider,
  type MetricDef,
  type MetricGroup,
} from '../../services/metricCatalog';
import { normalizeMta, providerDisplayName } from '../../services/providerRouting';
import type { BounceDetail, CaseRecord } from '../../data';
import type { HistoricalMetricRecord } from '../../services/historicalMetricsDataset';
import { DELIVERABILITY_BENCHMARKS } from '../../services/deliverabilityBenchmarks';

const BRAZE_ORANGE_LIGHT = '#FFD4BC';
const BRAZE_ORANGE = '#FFA524';
const BRAZE_ORANGE_DARK = '#E9371F';
const BRAZE_PINK_LIGHT = '#F8D3E8';
const BRAZE_PINK = '#FFA4FB';
const BRAZE_PINK_DARK = '#91186E';
const BRAZE_PURPLE_LIGHT = '#C9C4FF';
const BRAZE_PURPLE = '#801ED7';
const BRAZE_PURPLE_DARK = '#300266';

const BLUE = BRAZE_PURPLE_LIGHT;
const PURPLE = BRAZE_PURPLE;
const ORANGE = BRAZE_ORANGE;
const GREEN = BRAZE_PINK;
const SLATE = BRAZE_PINK_LIGHT;
const GRID = '#4A2A82';
const CARD = 'bg-white dark:bg-inverse-surface/40 rounded-xl border border-outline-variant/15 shadow-none';

const intFmt = new Intl.NumberFormat('en-GB');

type TrendRow = {
  day: string;
  date: string;
  targeted: number;
  sent: number;
  accepted: number;
  delivered: number;
  delivery: number;
  delay: number;
  deferred: number;
  bounce: number;
  hardbounce: number;
  softbounce: number;
  blocked: number;
  dropped: number;
  complaints: number;
};

type DiagnosticRow = {
  isp: string;
  bounceClass: string;
  reason: string;
  count: number;
  kind: 'bounce' | 'deferral';
};

type ChipIcon = LucideIcon;

type DashboardFilters = {
  from: string;
  to: string;
};

const EMPTY_RESOURCE_OPTIONS: Record<ResourceKey, string[]> = {
  recipientDomains: [],
  sendingIps: [],
  ipPools: [],
  campaigns: [],
  mailboxProviders: [],
  mailboxProviderRegions: [],
  sendingDomains: [],
  subaccounts: [],
};

type DiagnosticFilters = {
  isp: string;
  bounceClass: string;
  query: string;
};

type IpFilters = {
  pool: string;
  ip: string;
};

type IspSummaryFilters = {
  isp: string;
  query: string;
};

type DeliverabilitySharedFilters = {
  isp: string;
  bounceClass: string;
  query: string;
  pool: string;
  ip: string;
};

const EMPTY_DELIVERABILITY_SHARED_FILTERS: DeliverabilitySharedFilters = {
  isp: '',
  bounceClass: '',
  query: '',
  pool: '',
  ip: '',
};

type DeliverabilityFilterField = keyof DeliverabilitySharedFilters;

const DELIVERABILITY_FILTER_LABELS: Record<DeliverabilityFilterField, string> = {
  isp: 'Mailbox provider',
  bounceClass: 'Bounce class',
  query: 'Text search',
  pool: 'IP pool',
  ip: 'IP address',
};

const DELIVERABILITY_FILTER_ORDER: DeliverabilityFilterField[] = ['isp', 'bounceClass', 'pool', 'ip', 'query'];

type DeliverabilityPanelFilterKey =
  | 'volume'
  | 'deliveries'
  | 'ipVolume'
  | 'ispSummary'
  | 'eventTypes'
  | 'deferralTrend'
  | 'bounceTrend'
  | 'bounceClassOverall'
  | 'bounceClassByIsp'
  | 'bounceReason'
  | 'deferralReason'
  | 'deferralIsp'
  | 'rawDeferrals';

type DeliverabilityPanelKey = DeliverabilityPanelFilterKey;
type DeliverabilitySubview = 'delivery' | 'bounces' | 'deferrals';

const DELIVERABILITY_SUBVIEWS: Array<{ id: DeliverabilitySubview; label: string; icon: string }> = [
  { id: 'delivery', label: 'Delivery', icon: 'monitoring' },
  { id: 'bounces', label: 'Bounces', icon: 'report' },
  { id: 'deferrals', label: 'Deferrals', icon: 'schedule' },
];

const DELIVERABILITY_SUBVIEW_PANELS: Record<DeliverabilitySubview, DeliverabilityPanelKey[]> = {
  delivery: ['volume', 'deliveries', 'ipVolume', 'ispSummary', 'eventTypes'],
  bounces: ['bounceTrend', 'bounceClassOverall', 'bounceClassByIsp', 'bounceReason'],
  deferrals: ['deferralTrend', 'deferralReason', 'deferralIsp', 'rawDeferrals'],
};

const PANEL_FILTER_DEFAULTS: Record<DeliverabilityPanelFilterKey, DeliverabilitySharedFilters> = {
  volume: EMPTY_DELIVERABILITY_SHARED_FILTERS,
  deliveries: EMPTY_DELIVERABILITY_SHARED_FILTERS,
  ipVolume: EMPTY_DELIVERABILITY_SHARED_FILTERS,
  ispSummary: EMPTY_DELIVERABILITY_SHARED_FILTERS,
  eventTypes: EMPTY_DELIVERABILITY_SHARED_FILTERS,
  deferralTrend: EMPTY_DELIVERABILITY_SHARED_FILTERS,
  bounceTrend: EMPTY_DELIVERABILITY_SHARED_FILTERS,
  bounceClassOverall: EMPTY_DELIVERABILITY_SHARED_FILTERS,
  bounceClassByIsp: EMPTY_DELIVERABILITY_SHARED_FILTERS,
  bounceReason: EMPTY_DELIVERABILITY_SHARED_FILTERS,
  deferralReason: EMPTY_DELIVERABILITY_SHARED_FILTERS,
  deferralIsp: EMPTY_DELIVERABILITY_SHARED_FILTERS,
  rawDeferrals: EMPTY_DELIVERABILITY_SHARED_FILTERS,
};

type MasterMetricKey = string;
type MasterMetricDef = {
  key: MasterMetricKey;
  label: string;
  description: string;
  color: string;
  type: 'bar' | 'line';
  group: MetricGroup;
  kind: MetricDef['kind'];
};

const METRIC_COLORS: Record<MetricGroup, string[]> = {
  'Injection Metrics': [BRAZE_PURPLE, BRAZE_PINK, BRAZE_ORANGE, BRAZE_PURPLE_LIGHT, BRAZE_PINK_LIGHT, BRAZE_ORANGE_LIGHT],
  'Delivery Metrics': [BRAZE_ORANGE, BRAZE_PURPLE, BRAZE_PINK, BRAZE_ORANGE_LIGHT, BRAZE_PURPLE_LIGHT, BRAZE_PINK_LIGHT, BRAZE_ORANGE_DARK, BRAZE_PINK_DARK, BRAZE_PURPLE_DARK],
  'Deliverability Metrics': [BRAZE_PINK, BRAZE_PURPLE_LIGHT, BRAZE_ORANGE, BRAZE_PINK_LIGHT, BRAZE_PURPLE, BRAZE_ORANGE_LIGHT],
  'Engagement Metrics': [BRAZE_PURPLE, BRAZE_PINK_DARK, BRAZE_ORANGE, BRAZE_PINK, BRAZE_PURPLE_LIGHT, BRAZE_ORANGE_DARK],
};

function metricDescription(metric: MetricDef) {
  if (!metric.available) return 'Included from the full provider metric picker; approximated for this demo data.';
  if (metric.kind === 'rate') return 'Calculated from the selected date and provider scope.';
  if (metric.kind === 'latency') return 'Average latency projected from the selected ticket window.';
  if (metric.kind === 'size') return 'Average message size projected from selected send volume.';
  return 'Count for the selected date and provider scope.';
}

const makeMasterMetrics = (catalog: MetricDef[]): MasterMetricDef[] => catalog.map((metric, index) => {
  const colors = METRIC_COLORS[metric.group];
  return {
    key: metric.key,
    label: metric.label,
    description: metricDescription(metric),
    color: colors[index % colors.length],
    type: metric.kind === 'rate' ? 'line' : 'bar',
    group: metric.group,
    kind: metric.kind,
  };
});

const MASTER_METRICS: MasterMetricDef[] = makeMasterMetrics(METRIC_CATALOG);

const DEFAULT_GLOBAL_METRICS: MasterMetricKey[] = [
  'count_sent',
  'count_accepted',
  'count_delivered_first',
  'count_delayed',
  'count_bounce',
  'accepted_rate',
  'bounce_rate',
];

const PANEL_METRIC_KEYS: Record<DeliverabilityPanelFilterKey, MasterMetricKey[]> = {
  volume: ['count_sent', 'count_delivered_first', 'count_delivered_subsequent'],
  deliveries: ['count_delivered_first', 'count_delivered_subsequent'],
  ipVolume: ['count_delivered_first', 'count_delivered_subsequent'],
  ispSummary: ['count_sent', 'count_delivered_first', 'count_delivered_subsequent', 'hard_bounce_rate', 'count_hard_bounce', 'block_bounce_rate', 'count_block_bounce', 'bounce_rate'],
  eventTypes: DEFAULT_GLOBAL_METRICS,
  deferralTrend: ['count_delivered_first', 'count_delivered_subsequent', 'count_delayed', 'delayed_rate'],
  bounceTrend: ['count_delivered_first', 'count_delivered_subsequent', 'count_hard_bounce', 'hard_bounce_rate'],
  bounceClassOverall: ['count_bounce', 'bounce_rate', 'count_hard_bounce', 'count_soft_bounce'],
  bounceClassByIsp: ['count_bounce', 'bounce_rate', 'count_hard_bounce', 'count_soft_bounce'],
  bounceReason: ['count_bounce', 'count_hard_bounce', 'count_soft_bounce', 'bounce_rate'],
  deferralReason: ['count_delayed', 'count_delayed_first', 'delayed_rate'],
  deferralIsp: ['count_delayed', 'delayed_rate'],
  rawDeferrals: ['count_delayed', 'delayed_rate', 'count_delayed_first'],
};

const ALL_METRIC_KEYS: MasterMetricKey[] = MASTER_METRICS.map(metric => metric.key);
const PANEL_SUPPORTED_METRIC_KEYS: Record<DeliverabilityPanelFilterKey, MasterMetricKey[]> = {
  volume: ALL_METRIC_KEYS,
  deliveries: ALL_METRIC_KEYS,
  ipVolume: PANEL_METRIC_KEYS.ipVolume,
  ispSummary: PANEL_METRIC_KEYS.ispSummary,
  eventTypes: ALL_METRIC_KEYS,
  deferralTrend: ALL_METRIC_KEYS,
  bounceTrend: ALL_METRIC_KEYS,
  bounceClassOverall: PANEL_METRIC_KEYS.bounceClassOverall,
  bounceClassByIsp: PANEL_METRIC_KEYS.bounceClassByIsp,
  bounceReason: PANEL_METRIC_KEYS.bounceReason,
  deferralReason: PANEL_METRIC_KEYS.deferralReason,
  deferralIsp: PANEL_METRIC_KEYS.deferralIsp,
  rawDeferrals: PANEL_METRIC_KEYS.rawDeferrals,
};

const SEARCHABLE_PANEL_KEYS = new Set<DeliverabilityPanelFilterKey>([
  'ipVolume',
  'ispSummary',
  'bounceClassOverall',
  'bounceReason',
  'deferralReason',
  'rawDeferrals',
]);

const uniqueMetrics = (metrics: MasterMetricKey[]) => [...new Set(metrics)];
const supportedMetricSet = (key: DeliverabilityPanelFilterKey) => new Set(PANEL_SUPPORTED_METRIC_KEYS[key]);

const DEFAULT_PANEL_METRIC_SELECTIONS = Object.fromEntries(
  (Object.keys(PANEL_METRIC_KEYS) as DeliverabilityPanelFilterKey[]).map(key => [key, PANEL_METRIC_KEYS[key]])
) as Record<DeliverabilityPanelFilterKey, MasterMetricKey[]>;

function defaultPanelMetricSelectionsForProvider(provider?: string | null) {
  const enabled = new Set(getEnabledMetricKeysForProvider(provider));
  return Object.fromEntries(
    (Object.keys(PANEL_METRIC_KEYS) as DeliverabilityPanelFilterKey[]).map(key => {
      const scoped = PANEL_METRIC_KEYS[key].filter(metric => enabled.has(metric));
      return [key, scoped.length ? scoped : ['count_sent'].filter(metric => enabled.has(metric))];
    })
  ) as Record<DeliverabilityPanelFilterKey, MasterMetricKey[]>;
}

function commonPanelMetrics(selections: Record<DeliverabilityPanelFilterKey, MasterMetricKey[]>) {
  const keys = Object.keys(PANEL_METRIC_KEYS) as DeliverabilityPanelFilterKey[];
  const [firstKey, ...restKeys] = keys;
  if (!firstKey) return [];
  const common = new Set(selections[firstKey] ?? []);
  restKeys.forEach(key => {
    const panelSet = new Set(selections[key] ?? []);
    [...common].forEach(metric => {
      if (!panelSet.has(metric)) common.delete(metric);
    });
  });
  return MASTER_METRICS.map(metric => metric.key).filter(metric => common.has(metric));
}

function activePanelMetrics(selections: Record<DeliverabilityPanelFilterKey, MasterMetricKey[]>) {
  const active = new Set<MasterMetricKey>();
  (Object.keys(PANEL_METRIC_KEYS) as DeliverabilityPanelFilterKey[]).forEach(key => {
    (selections[key] ?? []).forEach(metric => active.add(metric));
  });
  return MASTER_METRICS.map(metric => metric.key).filter(metric => active.has(metric));
}

function formatInt(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return '-';
  return intFmt.format(Math.round(value));
}

function formatPct(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return '-';
  return `${(value * 100).toFixed(2)}%`;
}

function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatMasterMetricValue(metric: MasterMetricDef | undefined, value: number) {
  if (!metric) return formatInt(value);
  if (metric.kind === 'rate') return formatPct(value);
  if (metric.kind === 'latency') return `${formatInt(value)} ms`;
  if (metric.kind === 'size') return `${(value / 1024).toFixed(1)} KB`;
  return formatInt(value);
}

function compact(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return `${Math.round(value)}`;
}

function parseDate(value?: string) {
  if (!value) return new Date();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function providerLabel(value: string) {
  const lower = value.toLowerCase();
  if (lower.includes('gmail') || lower.includes('google')) return 'gmail.com';
  if (lower.includes('yahoo')) return 'yahoo.com';
  if (lower.includes('aol')) return 'aol.com';
  if (lower.includes('microsoft') || lower.includes('outlook') || lower.includes('hotmail')) return 'outlook.com';
  if (lower.includes('icloud') || lower.includes('apple')) return 'icloud.com';
  if (lower.includes('gmx')) return 'gmx.de';
  if (lower.includes('onet')) return 'onet.pl';
  if (lower.includes('libero')) return 'libero.it';
  return value || 'Other';
}

function seeded(ticket: CaseRecord, i: number, salt = 0) {
  const seed = [...ticket.case_number].reduce((sum, char) => sum + char.charCodeAt(0), 0) + salt;
  return Math.sin((seed + i * 17) * 1.271);
}

function buildTrendRows(ticket: CaseRecord): TrendRow[] {
  const m = ticket.metrics;
  const end = parseDate(ticket.metric_end_date || ticket.case_updated_at || ticket.case_created_at);
  const rows: TrendRow[] = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(end);
    date.setDate(end.getDate() - i);
    const index = 29 - i;
    const weeklyLift = date.getDay() === 2 || date.getDay() === 3 ? 1.18 : date.getDay() === 0 ? 0.72 : 1;
    const pulse = 0.86 + Math.abs(seeded(ticket, index)) * 0.42;
    const spike = index === 18 || index === 24 ? 1.34 : 1;
    const factor = weeklyLift * pulse * spike;
    const targeted = Math.max(0, Math.round(((m.count_targeted || m.count_sent) / 30) * factor));
    const sent = Math.max(0, Math.round((m.count_sent / 30) * factor));
    const accepted = Math.max(0, Math.round((m.count_accepted / 30) * factor));
    const delivered = Math.max(0, Math.round(((m.count_delivered_first + m.count_delivered_subsequent) / 30) * factor * 0.98));
    const delivery = Math.max(0, Math.round((m.count_accepted / 30) * factor));
    const delay = Math.max(0, Math.round((m.count_delayed_first / 30) * (0.8 + Math.abs(seeded(ticket, index, 3)) * 0.65)));
    const deferred = Math.max(0, Math.round((m.count_delayed / 30) * (0.75 + Math.abs(seeded(ticket, index, 9)) * 0.8)));
    const bounce = Math.max(0, Math.round((m.count_bounce / 30) * (0.7 + Math.abs(seeded(ticket, index, 13)) * 0.9)));
    const hardbounce = Math.max(0, Math.round((m.count_hard_bounce / 30) * (0.75 + Math.abs(seeded(ticket, index, 19)) * 0.7)));
    const softbounce = Math.max(0, Math.round((m.count_soft_bounce / 30) * (0.75 + Math.abs(seeded(ticket, index, 23)) * 0.7)));
    const blocked = Math.max(0, Math.round((m.count_block_bounce / 30) * (0.75 + Math.abs(seeded(ticket, index, 29)) * 0.65)));
    const dropped = Math.max(0, Math.round((m.count_rejected / 30) * (0.5 + Math.abs(seeded(ticket, index, 31)) * 0.5)));
    const complaints = Math.max(0, Math.round((m.count_spam_complaint / 30) * (0.5 + Math.abs(seeded(ticket, index, 37)) * 0.75)));
    rows.push({
      day: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      date: date.toISOString().slice(0, 10),
      targeted,
      sent,
      accepted,
      delivered,
      delivery,
      delay,
      deferred,
      bounce,
      hardbounce,
      softbounce,
      blocked,
      dropped,
      complaints,
    });
  }

  return rows;
}

type BounceReasonTemplate = {
  className: string;
  default: string;
  gmail?: string;
  icloud?: string;
  microsoft?: string;
  yahoo?: string;
};

const bounceReasons: BounceReasonTemplate[] = [
  {
    className: 'Mailbox Full',
    gmail: "554-5.4.7 [internal] message timeout; 452-4.2.2 recipient inbox is out of storage space",
    icloud: '552 5.2.2 user is over quota',
    default: "452-4.2.2 The recipient's inbox is out of storage space",
  },
  {
    className: 'Transient Failure',
    microsoft: '451 4.3.0 [internal] Sending IP temporarily suspended',
    yahoo: '421 4.7.0 Resources temporarily unavailable; try again later',
    default: '554 5.4.7 [internal] message timeout; no mail servers could be reached',
  },
  {
    className: 'Mail Block',
    gmail: '421-4.7.28 Gmail has detected an unusual rate of unsolicited mail',
    microsoft: '550 5.7.1 Message rejected due to sender reputation policy',
    default: '554 5.7.1 recipient address was suppressed due to customer policy',
  },
  {
    className: 'Spam Content',
    gmail: '550-5.7.1 Gmail has detected that this message is likely unsolicited mail',
    yahoo: '554 5.7.9 Message not accepted for policy reasons',
    default: '550 5.7.1 message content rejected by mailbox provider filters',
  },
  {
    className: 'DNS Failure',
    default: '554 5.4.4 [internal] Domain does not exist',
  },
  {
    className: 'Admin Failure',
    default: '554 5.7.1 [internal] recipient address was suppressed due to system policy',
  },
];

function reasonFor(isp: string, offset: number) {
  const lower = isp.toLowerCase();
  const template = bounceReasons[offset % bounceReasons.length];
  if (lower.includes('gmail')) return { bounceClass: template.className, reason: template.gmail ?? template.default };
  if (lower.includes('outlook') || lower.includes('hotmail') || lower.includes('microsoft')) return { bounceClass: template.className, reason: template.microsoft ?? template.default };
  if (lower.includes('yahoo') || lower.includes('aol')) return { bounceClass: template.className, reason: template.yahoo ?? template.default };
  if (lower.includes('icloud')) return { bounceClass: template.className, reason: template.icloud ?? template.default };
  return { bounceClass: template.className, reason: template.default };
}

function buildDiagnosticRows(ticket: CaseRecord, kind: 'bounce' | 'deferral'): DiagnosticRow[] {
  const providers = Array.from(new Set([
    ...ticket.mailbox_providers.map(providerLabel),
    ...ticket.domains.map(providerLabel),
    'Other',
  ])).filter(Boolean).slice(0, 9);
  const total = kind === 'deferral'
    ? Math.max(ticket.metrics.count_delayed, ticket.metrics.count_delayed_first)
    : Math.max(ticket.metrics.count_bounce, ticket.bounces.reduce((sum, row) => sum + row.count, 0));
  const weights = [0.31, 0.19, 0.15, 0.11, 0.09, 0.06, 0.04, 0.03, 0.02];

  if (kind === 'bounce' && ticket.bounces.length >= 4) {
    return ticket.bounces
      .map((row, index) => ({
        isp: providerLabel(row.domain),
        bounceClass: normalizeBounceClass(row),
        reason: row.reason,
        count: row.count,
        kind,
        index,
      }))
      .sort((a, b) => b.count - a.count)
      .map(({ index: _index, ...row }) => row);
  }

  return providers.flatMap((isp, providerIndex) => {
    const rowCount = providerIndex < 3 ? 2 : 1;
    return Array.from({ length: rowCount }, (_, localIndex) => {
      const reason = reasonFor(isp, providerIndex + localIndex + (kind === 'deferral' ? 1 : 0));
      const ratio = (weights[providerIndex] ?? 0.02) / rowCount;
      const count = Math.max(1, Math.round(total * ratio * (kind === 'deferral' ? 1.08 : 1)));
      return {
        isp,
        bounceClass: kind === 'deferral' ? (providerIndex === 0 ? 'Mail Block' : 'Transient Failure') : reason.bounceClass,
        reason: kind === 'deferral'
          ? (isp.includes('gmail')
            ? '421-4.7.28 temporarily rate limited; review Bulk Email Sender Guidelines'
            : reason.reason.replace(/^5\d\d/, '451'))
          : reason.reason,
        count,
        kind,
      };
    });
  }).sort((a, b) => b.count - a.count);
}

function normalizeBounceClass(row: BounceDetail) {
  const text = `${row.classification} ${row.category} ${row.reason}`.toLowerCase();
  if (text.includes('mailbox') || text.includes('storage') || text.includes('quota')) return 'Mailbox Full';
  if (text.includes('spam')) return 'Spam Content';
  if (text.includes('block') || text.includes('policy')) return 'Mail Block';
  if (text.includes('dns') || text.includes('domain')) return 'DNS Failure';
  if (text.includes('admin')) return 'Admin Failure';
  if (text.includes('transient') || text.includes('timeout') || text.includes('temporary')) return 'Transient Failure';
  if (row.category === 'Hard') return 'Invalid Recipient';
  return row.classification || row.category || 'Unclassified';
}

function aggregate(rows: DiagnosticRow[], key: keyof DiagnosticRow) {
  const map = new Map<string, number>();
  rows.forEach(row => map.set(String(row[key]), (map.get(String(row[key])) ?? 0) + row.count));
  return Array.from(map, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

function sumRows(rows: TrendRow[], key: keyof TrendRow) {
  return rows.reduce((sum, row) => sum + (typeof row[key] === 'number' ? row[key] as number : 0), 0);
}

function scaleCount(value: number, ratio: number) {
  return Math.max(0, Math.round(value * ratio));
}

function metricValueForRow(key: MasterMetricKey, row: TrendRow) {
  const safe = (value: number, denom: number) => (denom > 0 ? value / denom : 0);
  const firstDelivered = Math.round(row.delivered * 0.86);
  const subsequentDelivered = Math.max(0, row.delivered - firstDelivered);
  const adminBounces = Math.round(row.dropped * 0.28);
  const policyRejections = Math.round(row.dropped * 0.42);
  const generationFailures = Math.round(row.dropped * 0.05);
  const generationRejections = Math.round(row.dropped * 0.08);
  const inbandBounces = Math.round(row.bounce * 0.62);
  const outofbandBounces = Math.max(0, row.bounce - inbandBounces);
  const undeterminedBounces = Math.max(0, row.bounce - row.hardbounce - row.softbounce - row.blocked);
  const inbox = Math.round(row.delivered * 0.86);
  const spam = Math.max(0, row.delivered - inbox);
  const movedToInbox = Math.round(spam * 0.08);
  const movedToSpam = Math.round(inbox * 0.018);
  const uniqueClicks = Math.round(row.accepted * 0.045);
  const clicks = Math.round(row.accepted * 0.062);
  const uniqueOpens = Math.round(row.accepted * 0.18);
  const bottomOpens = Math.round(row.accepted * 0.2);
  const topOpens = Math.round(row.accepted * 0.22);
  const unsubscribes = Math.round(row.accepted * 0.004);

  switch (key) {
    case 'admin_bounce_rate': return safe(adminBounces, row.targeted);
    case 'count_admin_bounce': return adminBounces;
    case 'count_generation_failed': return generationFailures;
    case 'count_generation_rejection': return generationRejections;
    case 'count_injected': return row.targeted;
    case 'count_policy_rejection': return policyRejections;
    case 'count_rejected': return row.dropped;
    case 'rejected_rate': return safe(row.dropped, row.targeted);
    case 'count_targeted': return row.targeted;
    case 'count_accepted': return row.accepted;
    case 'accepted_rate': return safe(row.accepted, row.sent);
    case 'avg_msg_size': return 72 * 1024;
    case 'avg_delivery_time_first': return 1800 + safe(row.delay, row.accepted) * 12000;
    case 'avg_delivery_time_subsequent': return 4200 + safe(row.deferred, row.accepted) * 18000;
    case 'block_bounce_rate': return safe(row.blocked, row.sent);
    case 'count_block_bounce': return row.blocked;
    case 'bounce_rate': return safe(row.bounce, row.sent);
    case 'count_bounce': return row.bounce;
    case 'count_delayed': return row.deferred;
    case 'count_delayed_first': return row.delay;
    case 'delayed_rate': return safe(row.delay, row.accepted);
    case 'count_delivered_first': return firstDelivered;
    case 'count_delivered_subsequent': return subsequentDelivered;
    case 'total_msg_volume': return row.sent * 72 * 1024;
    case 'hard_bounce_rate': return safe(row.hardbounce, row.sent);
    case 'count_hard_bounce': return row.hardbounce;
    case 'count_inband_bounce': return inbandBounces;
    case 'count_outofband_bounce': return outofbandBounces;
    case 'count_sent': return row.sent;
    case 'soft_bounce_rate': return safe(row.softbounce, row.sent);
    case 'count_soft_bounce': return row.softbounce;
    case 'undetermined_bounce_rate': return safe(undeterminedBounces, row.sent);
    case 'count_undetermined_bounce': return undeterminedBounces;
    case 'count_inbox': return inbox;
    case 'inbox_folder_rate': return safe(inbox, inbox + spam);
    case 'count_moved_to_inbox': return movedToInbox;
    case 'moved_to_inbox_rate': return safe(movedToInbox, inbox + spam);
    case 'count_moved_to_spam': return movedToSpam;
    case 'moved_to_spam_rate': return safe(movedToSpam, inbox + spam);
    case 'count_spam': return spam;
    case 'spam_folder_rate': return safe(spam, inbox + spam);
    case 'click_through_rate': return safe(uniqueClicks, row.accepted);
    case 'count_clicked': return clicks;
    case 'nonprefetched_open_rate': return safe(uniqueOpens, row.accepted);
    case 'count_nonprefetched_rendered': return bottomOpens;
    case 'count_nonprefetched_initial_rendered': return topOpens;
    case 'spam_complaint_rate': return safe(row.complaints, row.accepted);
    case 'count_spam_complaint': return row.complaints;
    case 'count_unique_clicked': return uniqueClicks;
    case 'count_nonprefetched_unique_confirmed_opened': return uniqueOpens;
    case 'unsubscribe_rate': return safe(unsubscribes, row.accepted);
    case 'count_unsubscribe': return unsubscribes;
    default: return 0;
  }
}

function metricDefsFor(keys: MasterMetricKey[], masterMetrics = MASTER_METRICS) {
  const selected = new Set(keys);
  return masterMetrics.filter(metric => selected.has(metric.key));
}

function buildMetricChartRows(rows: TrendRow[], keys: MasterMetricKey[], masterMetrics = MASTER_METRICS) {
  const metrics = metricDefsFor(keys, masterMetrics);
  return rows.map(row => {
    const point: Record<string, string | number> = { ...row };
    metrics.forEach(metric => {
      point[metric.key] = metricValueForRow(metric.key, row);
    });
    return point;
  });
}

function TrendMetricChart({
  rows,
  metricKeys,
  masterMetrics = MASTER_METRICS,
  height = 280,
}: {
  rows: TrendRow[];
  metricKeys: MasterMetricKey[];
  masterMetrics?: MasterMetricDef[];
  height?: number;
}) {
  const metrics = metricDefsFor(metricKeys, masterMetrics);
  const chartRows = buildMetricChartRows(rows, metricKeys, masterMetrics);
  if (!metrics.length) {
    return (
      <div className="flex h-full min-h-[220px] items-center justify-center rounded-xl border border-purple-300/15 text-[13px] font-bold text-purple-200/70">
        Select metrics to display.
      </div>
    );
  }

  return (
    <>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartRows} margin={{ top: 8, right: 18, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: SLATE, fontWeight: 700 }} axisLine={false} tickLine={false} interval={Math.max(0, Math.floor(chartRows.length / 6))} />
            <YAxis tick={{ fontSize: 11, fill: SLATE, fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={(value: number) => compact(value)} />
            {metrics.some(metric => metric.kind === 'rate') && (
              <YAxis yAxisId="rate" orientation="right" tick={{ fontSize: 11, fill: SLATE, fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={(value: number) => `${Math.round(value * 100)}%`} />
            )}
            <Tooltip content={<MasterChartTooltip masterMetrics={masterMetrics} />} />
            {metrics.filter(metric => metric.type === 'bar').map(metric => (
              <Bar key={metric.key} dataKey={metric.key} name={metric.label} fill={metric.color} radius={[5, 5, 0, 0]} />
            ))}
            {metrics.filter(metric => metric.type === 'line').map(metric => (
              <Line
                key={metric.key}
                yAxisId="rate"
                type="monotone"
                dataKey={metric.key}
                name={metric.label}
                stroke={metric.color}
                strokeWidth={2.8}
                dot={false}
                activeDot={{ r: 5, fill: metric.color, stroke: '#fff', strokeWidth: 2 }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap gap-4">
        {metrics.map(metric => <LegendDot key={metric.key} color={metric.color} label={metric.label} />)}
      </div>
    </>
  );
}

function trendMetricTableRows(rows: TrendRow[], metricKeys: MasterMetricKey[], masterMetrics = MASTER_METRICS) {
  const metrics = metricDefsFor(metricKeys, masterMetrics);
  return {
    columns: ['time per day', ...metrics.map(metric => metric.label)],
    rows: rows.slice(-9).reverse().map(row => [
      <span className="font-bold">{row.date}</span>,
      ...metrics.map(metric => formatMasterMetricValue(metric, metricValueForRow(metric.key, row))),
    ]),
  };
}

function buildIpRows(ticket: CaseRecord) {
  const total = ticket.metrics.count_delivered_first + ticket.metrics.count_delivered_subsequent;
  const pools = ticket.ip_pools.length ? ticket.ip_pools : ['transactional_pool', 'marketing_pool'];
  const ips = ticket.sending_ips.length ? ticket.sending_ips : ['192.174.92.110', '223.165.125.58'];
  return pools.flatMap((pool, poolIndex) => {
    const ip = ips[poolIndex % ips.length];
    const ratio = [0.28, 0.2, 0.16, 0.12, 0.1, 0.08][poolIndex] ?? 0.05;
    return {
      pool,
      ip,
      deliveries: Math.max(1, Math.round(total * ratio)),
    };
  }).sort((a, b) => b.deliveries - a.deliveries);
}

function KpiTileFlat({
  label,
  value,
  wowDiff,
  inverse = false,
}: {
  label: string;
  value: string;
  wowDiff?: number | null;
  inverse?: boolean;
}) {
  const valueSize = value.length > 11
    ? 'text-[15px] md:text-[17px] xl:text-[19px]'
    : value.length > 8
      ? 'text-[18px] md:text-[20px] xl:text-[22px]'
      : 'text-[22px] md:text-[25px]';

  const diffElement = useMemo(() => {
    if (wowDiff == null || isNaN(wowDiff)) return null;
    const isZero = Math.abs(wowDiff) < 0.0005;
    let color = '';
    let icon = '';
    let text = '';
    if (isZero) {
      color = 'text-[#FFA726]';
      icon = 'trending_flat';
      text = '0.0% WoW';
    } else if (wowDiff > 0) {
      color = inverse ? 'text-[#FF5252]' : 'text-[#66BB6A]';
      icon = 'trending_up';
      text = `+${(wowDiff * 100).toFixed(1)}% WoW`;
    } else {
      color = inverse ? 'text-[#66BB6A]' : 'text-[#FF5252]';
      icon = 'trending_down';
      text = `${(wowDiff * 100).toFixed(1)}% WoW`;
    }

    return (
      <div className={cn("flex items-center gap-0.5 text-[11.5px] font-extrabold mt-1.5", color)}>
        <span className="material-symbols-outlined text-[15px] leading-none font-extrabold">{icon}</span>
        <span>{text}</span>
      </div>
    );
  }, [wowDiff, inverse]);

  return (
    <div
      className="min-w-0 overflow-hidden bg-[#300266] rounded-2xl px-3 py-4 flex flex-col items-center justify-center text-center border border-purple-300/10 min-h-[110px] shadow-none"
      data-gem-panel
      data-gem-panel-label={label}
      data-gem-panel-content={`${label}: ${value}`}
    >
      <p className={cn('w-full max-w-full truncate font-black tabular-nums tracking-normal text-[#FFA4FB] leading-none mb-1.5', valueSize)} title={value}>{value}</p>
      <p className="max-w-full break-words text-[12px] font-bold text-[#FFD4BC] leading-tight sm:text-[13px]">{label}</p>
      {diffElement}
    </div>
  );
}

const PanelThemeContext = createContext<'dark' | 'light'>('dark');

function Panel({
  title,
  subtitle,
  icon: Icon,
  children,
  className = '',
  actions,
  theme = 'dark',
  motionDelay = 0,
}: {
  title: string;
  subtitle?: string;
  icon: ChipIcon;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  theme?: 'dark' | 'light';
  motionDelay?: number;
}) {
  const isDark = theme === 'dark';
  return (
    <PanelThemeContext.Provider value={theme}>
      <motion.section
        className={cn(
          isDark
            ? 'bg-[#300266] border-purple-300/10'
            : 'bg-[#F4F6FC] dark:bg-[#1E1C21] border-outline-variant/10',
          'relative rounded-2xl border shadow-none overflow-hidden flex flex-col',
          className
        )}
        data-gem-panel
        data-gem-panel-label={title}
        {...md3Enter}
        transition={{ duration: 0.36, ease: md3Ease, delay: motionDelay }}
      >
        <header className={cn(
          'flex items-center justify-between gap-4 px-5 py-4 border-b',
          isDark ? 'bg-[#300266] border-purple-300/10' : 'bg-transparent border-purple-200/40 dark:border-purple-300/10'
        )}>
          <div className="flex items-center min-w-0">
            <div className="min-w-0">
              <h3 className={cn('text-[17px] font-black truncate', isDark ? 'text-purple-100' : 'text-[#300266] dark:text-purple-100')}>{title}</h3>
            </div>
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{actions}</div>}
        </header>
        <div className="px-5 pt-5 pb-5 flex-1 overflow-hidden">{children}</div>
      </motion.section>
    </PanelThemeContext.Provider>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-[11px] font-black uppercase tracking-wide text-on-surface-variant dark:text-inverse-on-surface/65">
      {label}
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="h-10 rounded-xl border border-outline-variant/35 bg-white px-3 text-[13px] font-bold normal-case tracking-normal text-on-surface outline-none transition-colors focus:border-primary dark:bg-[#201F24] dark:text-inverse-on-surface"
      >
        <option value="">All</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function DeliverabilitySharedFilterControl({
  value,
  onChange,
  selectedMetrics,
  onApplyMetrics,
  ispOptions,
  classOptions,
  poolOptions,
  ipOptions,
}: {
  value: DeliverabilitySharedFilters;
  onChange: (value: DeliverabilitySharedFilters) => void;
  selectedMetrics: MasterMetricKey[];
  onApplyMetrics: (value: MasterMetricKey[]) => void;
  ispOptions: string[];
  classOptions: string[];
  poolOptions: string[];
  ipOptions: string[];
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'metrics' | 'filters'>('filters');
  const [collapsed, setCollapsed] = useState<Set<MetricGroup>>(new Set());
  const ref = useRef<HTMLDivElement | null>(null);
  const activeCount = [
    value.isp,
    value.bounceClass,
    value.query,
    value.pool,
    value.ip,
  ].filter(Boolean).length;

  useEffect(() => {
    const onDoc = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const metricGroups = useMemo(() => {
    const grouped = {} as Record<MetricGroup, MasterMetricDef[]>;
    METRIC_GROUPS.forEach(group => {
      grouped[group] = MASTER_METRICS.filter(metric => metric.group === group);
    });
    return grouped;
  }, []);
  const selectedMetricSet = new Set(selectedMetrics);
  const toggleMetric = (key: MasterMetricKey) => {
    if (selectedMetricSet.has(key)) {
      onApplyMetrics(selectedMetrics.filter(metric => metric !== key));
      return;
    }
    onApplyMetrics([...selectedMetrics, key]);
  };
  const toggleGroup = (group: MetricGroup) => {
    setCollapsed(current => {
      const next = new Set(current);
      next.has(group) ? next.delete(group) : next.add(group);
      return next;
    });
  };

  return (
    <div ref={ref} className="relative pointer-events-auto">
      <button
        type="button"
        onClick={() => setOpen(current => !current)}
        className={cn(
          'flex h-12 items-center gap-2 rounded-full border border-outline-variant/40 bg-white px-3.5 py-2 text-[13px] font-semibold leading-none text-on-surface transition-colors md3-state-layer dark:bg-[#121115] dark:text-inverse-on-surface',
          open && 'border-primary/35 bg-primary/5 text-primary'
        )}
      >
        <SlidersHorizontal size={18} strokeWidth={2.4} className="text-on-surface-variant" />
        Filters
        <span className={cn(
          'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-black leading-none',
          activeCount ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
        )}>
          {activeCount}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 flex max-h-[min(760px,calc(100vh-10rem))] w-[min(660px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-outline-variant/20 bg-white shadow-xl dark:bg-[#2A2930]">
          <div className="shrink-0 border-b border-outline-variant/15 px-5 pt-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-1">
                {(['metrics', 'filters'] as const).map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTab(item)}
                    className={cn(
                      'relative px-5 pb-3 pt-3 text-[15px] font-black capitalize transition-colors',
                      tab === item ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
                    )}
                  >
                    {item}
                    {tab === item && <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-t-full bg-primary" />}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  tab === 'filters' ? onChange(EMPTY_DELIVERABILITY_SHARED_FILTERS) : onApplyMetrics([]);
                }}
                className="rounded-full px-3 py-1.5 text-[12px] font-black text-primary transition-colors md3-state-layer hover:bg-primary/10"
              >
                Clear {tab}
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5 custom-scrollbar">
            {tab === 'filters' && (
              <div className="space-y-4">
                <div className="sticky top-0 z-10 -mx-2 rounded-2xl border border-outline-variant/15 bg-white/95 p-3 backdrop-blur dark:bg-[#2A2930]/95">
                  <p className="mb-3 text-[13px] font-black text-on-surface dark:text-inverse-on-surface">Quick filters</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <FilterSelect label="Mailbox provider" value={value.isp} options={ispOptions} onChange={isp => onChange({ ...value, isp })} />
                    <FilterSelect label="Bounce class" value={value.bounceClass} options={classOptions} onChange={bounceClass => onChange({ ...value, bounceClass })} />
                    <FilterSelect label="IP pool" value={value.pool} options={poolOptions} onChange={pool => onChange({ ...value, pool })} />
                    <FilterSelect label="IP address" value={value.ip} options={ipOptions} onChange={ip => onChange({ ...value, ip })} />
                  </div>
                </div>

                <div className="rounded-2xl border border-outline-variant/15 p-4">
                  <div className="mb-3">
                    <h3 className="text-[17px] font-black text-on-surface dark:text-inverse-on-surface">All filters</h3>
                    <p className="mt-1 text-[13px] font-semibold text-on-surface-variant dark:text-inverse-on-surface/70">
                      Applies to every Deliverability panel. The selected account MTA is applied automatically.
                    </p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <FilterSelect label="Mailbox provider" value={value.isp} options={ispOptions} onChange={isp => onChange({ ...value, isp })} />
                    <FilterSelect label="Bounce class" value={value.bounceClass} options={classOptions} onChange={bounceClass => onChange({ ...value, bounceClass })} />
                    <FilterSelect label="IP pool" value={value.pool} options={poolOptions} onChange={pool => onChange({ ...value, pool })} />
                    <FilterSelect label="IP address" value={value.ip} options={ipOptions} onChange={ip => onChange({ ...value, ip })} />
                    <label className="md:col-span-2 flex flex-col gap-1.5 text-[11px] font-black uppercase tracking-wide text-on-surface-variant dark:text-inverse-on-surface/65">
                      Reason or metric contains
                      <input
                        value={value.query}
                        onChange={event => onChange({ ...value, query: event.target.value })}
                        placeholder="e.g. temporarily suspended, mailbox full, gmail"
                        className="h-10 rounded-xl border border-outline-variant/35 bg-white px-3 text-[13px] font-bold normal-case tracking-normal text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/45 focus:border-primary dark:bg-[#201F24] dark:text-inverse-on-surface"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {tab === 'metrics' && (
              <div className="space-y-4">
                {METRIC_GROUPS.map(group => {
                  const isCollapsed = collapsed.has(group);
                  return (
                    <section key={group} className="rounded-2xl border border-outline-variant/15 p-4">
                      <button type="button" onClick={() => toggleGroup(group)} className="flex w-full items-start justify-between gap-3 text-left">
                        <div>
                          <h3 className="text-[17px] font-black text-on-surface dark:text-inverse-on-surface">{group}</h3>
                          <p className="mt-0.5 text-[13px] font-semibold text-on-surface-variant dark:text-inverse-on-surface/70">{METRIC_GROUP_SUBTITLES[group]}</p>
                        </div>
                        <span className={cn('text-[18px] font-black text-on-surface-variant transition-transform', isCollapsed && 'rotate-180')}>⌃</span>
                      </button>
                      {!isCollapsed && (
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          {metricGroups[group].map(metric => (
                            <button
                              key={metric.key}
                              type="button"
                              onClick={() => toggleMetric(metric.key)}
                              className="group flex items-start gap-3 rounded-xl p-2 text-left transition-colors hover:bg-primary/5"
                            >
                              <FilterCheck checked={selectedMetricSet.has(metric.key)} />
                              <span className="min-w-0">
                                <span className="block text-[14px] font-black text-on-surface group-hover:text-primary dark:text-inverse-on-surface">{metric.label}</span>
                                <span className="mt-0.5 block text-[12px] font-semibold leading-snug text-on-surface-variant dark:text-inverse-on-surface/65">{metric.description}</span>
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterCheck({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        'mt-0.5 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-[6px] border transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)]',
        checked ? 'scale-105 border-primary bg-primary text-white' : 'border-outline/70 bg-transparent text-transparent'
      )}
    >
      <span className={cn('text-[13px] font-black leading-none transition-transform duration-200', checked ? 'scale-100' : 'scale-0')}>✓</span>
    </span>
  );
}

function filterOptionsForField(field: DeliverabilityFilterField, options: {
  ispOptions: string[];
  classOptions: string[];
  poolOptions: string[];
  ipOptions: string[];
}) {
  if (field === 'isp') return options.ispOptions;
  if (field === 'bounceClass') return options.classOptions;
  if (field === 'pool') return options.poolOptions;
  if (field === 'ip') return options.ipOptions;
  return [];
}

function PanelFilterControl({
  value,
  onChange,
  ispOptions,
  classOptions,
  poolOptions,
  ipOptions,
  priorityFields,
}: {
  value: DeliverabilitySharedFilters;
  onChange: (value: DeliverabilitySharedFilters) => void;
  ispOptions: string[];
  classOptions: string[];
  poolOptions: string[];
  ipOptions: string[];
  priorityFields: DeliverabilityFilterField[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const activeCount = deliverabilityFilterCount(value);
  const orderedFields = [
    ...priorityFields,
    ...DELIVERABILITY_FILTER_ORDER.filter(field => !priorityFields.includes(field)),
  ];

  useEffect(() => {
    const onDoc = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Filter this panel"
        onClick={() => setOpen(current => !current)}
        className={cn(
          'relative flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/30 bg-white text-on-surface-variant transition-colors md3-state-layer hover:bg-primary/5 hover:text-primary dark:bg-[#201F24] dark:text-inverse-on-surface/75',
          open && 'border-primary/35 bg-primary/10 text-primary'
        )}
      >
        <SlidersHorizontal size={18} strokeWidth={2.5} />
        {activeCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black leading-none text-white">
            {activeCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-[min(390px,calc(100vw-2rem))] rounded-2xl border border-outline-variant/20 bg-white p-4 shadow-xl dark:bg-[#2A2930]">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h4 className="text-[15px] font-black text-on-surface dark:text-inverse-on-surface">Panel filter</h4>
              <p className="mt-0.5 text-[12px] font-semibold text-on-surface-variant dark:text-inverse-on-surface/65">Only changes this panel.</p>
            </div>
            <button
              type="button"
              onClick={() => onChange(EMPTY_DELIVERABILITY_SHARED_FILTERS)}
              className="rounded-full px-2.5 py-1 text-[11px] font-black text-primary transition-colors md3-state-layer hover:bg-primary/10"
            >
              Clear
            </button>
          </div>
          <div className="grid max-h-[440px] gap-3 overflow-y-auto pr-1 custom-scrollbar">
            {orderedFields.map(field => field === 'query' ? (
              <label key={field} className="flex flex-col gap-1.5 text-[11px] font-black uppercase tracking-wide text-on-surface-variant dark:text-inverse-on-surface/65">
                Search this panel
                <input
                  value={value.query}
                  onChange={event => onChange({ ...value, query: event.target.value })}
                  placeholder="Filter rows by text"
                  className="h-10 rounded-xl border border-outline-variant/35 bg-white px-3 text-[13px] font-bold normal-case tracking-normal text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/45 focus:border-primary dark:bg-[#201F24] dark:text-inverse-on-surface"
                />
              </label>
            ) : (
              <FilterSelect
                key={field}
                label={DELIVERABILITY_FILTER_LABELS[field]}
                value={value[field]}
                options={filterOptionsForField(field, { ispOptions, classOptions, poolOptions, ipOptions })}
                onChange={next => onChange({ ...value, [field]: next })}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-purple-300/15 bg-[#1F0144] px-3 py-2 shadow-lg text-xs">
      <p className="font-black text-purple-100 mb-1">{label}</p>
      <div className="space-y-1">
        {payload.map((item: any) => (
          <p key={item.dataKey} className="flex items-center gap-2 font-bold text-purple-200">
            <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
            <span>{item.name}: {formatInt(item.value)}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

function DataTable({ columns, rows, sum }: { columns: string[]; rows: Array<React.ReactNode[]>; sum?: number }) {
  const theme = useContext(PanelThemeContext);
  const isDark = theme === 'dark';
  return (
    <div className={cn('overflow-x-auto rounded-lg border', isDark ? 'border-purple-300/10' : 'border-purple-200/40 dark:border-purple-300/10')}>
      <table className="w-full min-w-[680px] text-left border-collapse">
        <thead>
          <tr className={cn(
            'text-[11px] font-black uppercase tracking-wide border-b',
            isDark
              ? 'bg-[#1F0144] text-purple-200 border-purple-300/10'
              : 'bg-[#EAE8FC] dark:bg-[#1F0144] text-[#300266] dark:text-purple-200 border-purple-200/40 dark:border-purple-300/10'
          )}>
            {columns.map(column => <th key={column} className="px-3 py-3">{column}</th>)}
          </tr>
        </thead>
        <tbody className={cn(
          'divide-y text-[12px] font-bold',
          isDark
            ? 'divide-purple-300/10 text-purple-100'
            : 'divide-purple-250 dark:divide-purple-300/10 text-purple-950 dark:text-purple-100'
        )}>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className={cn('transition-colors', isDark ? 'hover:bg-white/5' : 'hover:bg-purple-100/50 dark:hover:bg-white/5')}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className={cn('px-3 py-3 align-top', cellIndex === row.length - 1 && 'text-right font-black')}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {sum != null && (
          <tfoot>
            <tr className={cn(
              'text-[12px] font-black border-t',
              isDark
                ? 'bg-[#1F0144] text-purple-200 border-purple-300/10'
                : 'bg-[#EAE8FC] dark:bg-[#1F0144] text-[#300266] dark:text-purple-200 border-purple-200/40 dark:border-purple-300/10'
            )}>
              <td colSpan={columns.length} className="px-3 py-3 text-right">Sum: {formatInt(sum)}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  const theme = useContext(PanelThemeContext);
  const isDark = theme === 'dark';
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-bold', isDark ? 'text-purple-200' : 'text-[#300266] dark:text-purple-200')}>
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function MasterChartTooltip({ active, payload, label, masterMetrics = MASTER_METRICS }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-purple-300/15 bg-[#1F0144] px-3 py-2 shadow-lg text-xs">
      <p className="font-black text-purple-100 mb-2">{label}</p>
      <div className="space-y-1.5">
        {payload.map((item: any) => (
          <p key={item.dataKey} className="flex items-center gap-2 font-bold text-purple-200">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
            <span>
              {item.name}: {formatMasterMetricValue(masterMetrics.find((metric: MasterMetricDef) => metric.key === item.dataKey), item.value)}
            </span>
          </p>
        ))}
      </div>
    </div>
  );
}

function MasterDeliverabilityPanel({
  rows,
  selectedMetrics,
  masterMetrics = MASTER_METRICS,
  actions,
}: {
  rows: TrendRow[];
  selectedMetrics: MasterMetricKey[];
  masterMetrics?: MasterMetricDef[];
  actions?: React.ReactNode;
}) {
  const chartRows = rows.map(row => {
    const point: Record<string, string | number> = { ...row };
    masterMetrics.forEach(metric => {
      point[metric.key] = metricValueForRow(metric.key, row);
    });
    return point;
  });
  const selected = new Set(selectedMetrics);

  return (
    <motion.section
      className="relative overflow-visible bg-[#300266] rounded-2xl p-5 border border-purple-300/10 flex flex-col gap-4"
      data-gem-panel
      data-gem-panel-label="Event types over time"
      {...md3Enter}
      transition={{ duration: 0.36, ease: md3Ease, delay: 0.18 }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[18px] font-black text-purple-100">Event types over time</h3>
        {actions}
      </div>

      <div className="h-[360px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartRows} margin={{ top: 18, right: 18, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: SLATE, fontWeight: 800 }} axisLine={false} tickLine={false} interval={Math.max(0, Math.floor(chartRows.length / 9))} />
            <YAxis tick={{ fontSize: 12, fill: SLATE, fontWeight: 800 }} axisLine={false} tickLine={false} tickFormatter={(value: number) => compact(value)} />
            <YAxis yAxisId="rate" orientation="right" tick={{ fontSize: 12, fill: SLATE, fontWeight: 800 }} axisLine={false} tickLine={false} tickFormatter={(value: number) => `${Math.round(value * 100)}%`} />
            <Tooltip content={<MasterChartTooltip masterMetrics={masterMetrics} />} />
            {masterMetrics.filter(metric => selected.has(metric.key) && metric.type === 'bar').map(metric => (
              <Bar key={metric.key} dataKey={metric.key} name={metric.label} fill={metric.color} radius={[7, 7, 0, 0]} />
            ))}
            {masterMetrics.filter(metric => selected.has(metric.key) && metric.type === 'line').map(metric => (
              <Line
                key={metric.key}
                yAxisId="rate"
                type="monotone"
                dataKey={metric.key}
                name={metric.label}
                stroke={metric.color}
                strokeWidth={3}
                dot={{ r: 2.5, fill: metric.color, stroke: '#fff', strokeWidth: 1.5 }}
                activeDot={{ r: 6, fill: metric.color, stroke: '#fff', strokeWidth: 2 }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-4 pt-1">
        {masterMetrics.filter(metric => selected.has(metric.key)).map(metric => (
          <LegendDot key={metric.key} color={metric.color} label={metric.label} />
        ))}
      </div>
    </motion.section>
  );
}

function filterDiagnosticRows(rows: DiagnosticRow[], filters: DiagnosticFilters, ratio: number) {
  const query = filters.query.trim().toLowerCase();
  return rows
    .filter(row => !filters.isp || row.isp === filters.isp)
    .filter(row => !filters.bounceClass || row.bounceClass === filters.bounceClass)
    .filter(row => !query || `${row.isp} ${row.bounceClass} ${row.reason}`.toLowerCase().includes(query))
    .map(row => ({ ...row, count: scaleCount(row.count, ratio) }))
    .filter(row => row.count > 0)
    .sort((a, b) => b.count - a.count);
}

function filterIpRows(rows: ReturnType<typeof buildIpRows>, filters: IpFilters) {
  return rows.filter(row => (!filters.pool || row.pool === filters.pool) && (!filters.ip || row.ip === filters.ip));
}

function deliverabilityFilterCount(filters: DeliverabilitySharedFilters) {
  return Object.values(filters).filter(value => value.trim()).length;
}

function mergeDeliverabilityFilters(global: DeliverabilitySharedFilters, local: DeliverabilitySharedFilters): DeliverabilitySharedFilters {
  const globalQuery = global.query.trim();
  const localQuery = local.query.trim();
  return {
    isp: local.isp || global.isp,
    bounceClass: local.bounceClass || global.bounceClass,
    pool: local.pool || global.pool,
    ip: local.ip || global.ip,
    query: [globalQuery, localQuery].filter(Boolean).join(' '),
  };
}

function resourceFiltersFromDeliverability(filters: DeliverabilitySharedFilters): ResourceFilters {
  return {
    ...EMPTY_FILTERS,
    mailboxProviders: filters.isp ? [filters.isp] : [],
    ipPools: filters.pool ? [filters.pool] : [],
    sendingIps: filters.ip ? [filters.ip] : [],
  };
}

function deliverabilityFiltersFromResources(resources: ResourceFilters, previous: DeliverabilitySharedFilters): DeliverabilitySharedFilters {
  return {
    ...previous,
    isp: resources.mailboxProviders[0] ?? '',
    pool: resources.ipPools[0] ?? '',
    ip: resources.sendingIps[0] ?? '',
  };
}

function asDiagnosticFilters(filters: DeliverabilitySharedFilters): DiagnosticFilters {
  return {
    isp: filters.isp,
    bounceClass: filters.bounceClass,
    query: filters.query,
  };
}

function asIpFilters(filters: DeliverabilitySharedFilters): IpFilters {
  return {
    pool: filters.pool,
    ip: filters.ip,
  };
}

function textMatches(query: string, parts: Array<string | number>) {
  const clean = query.trim().toLowerCase();
  if (!clean) return true;
  return parts.join(' ').toLowerCase().includes(clean);
}

function filterIpRowsWithQuery(rows: ReturnType<typeof buildIpRows>, filters: DeliverabilitySharedFilters) {
  return filterIpRows(rows, asIpFilters(filters))
    .filter(row => textMatches(filters.query, [row.pool, row.ip, row.deliveries]));
}

function diagnosticSegmentRatio(rows: DiagnosticRow[], filters: DiagnosticFilters) {
  const query = filters.query.trim().toLowerCase();
  if (!filters.isp && !filters.bounceClass && !query) return 1;
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  if (!total) return 1;
  const matched = rows
    .filter(row => !filters.isp || row.isp === filters.isp)
    .filter(row => !filters.bounceClass || row.bounceClass === filters.bounceClass)
    .filter(row => !query || `${row.isp} ${row.bounceClass} ${row.reason}`.toLowerCase().includes(query))
    .reduce((sum, row) => sum + row.count, 0);
  return Math.max(0.04, Math.min(1, matched / total));
}

function scaleTrendRows(rows: TrendRow[], ratio: number): TrendRow[] {
  if (ratio === 1) return rows;
  return rows.map(row => ({
    ...row,
    targeted: scaleCount(row.targeted, ratio),
    sent: scaleCount(row.sent, ratio),
    accepted: scaleCount(row.accepted, ratio),
    delivered: scaleCount(row.delivered, ratio),
    delivery: scaleCount(row.delivery, ratio),
    delay: scaleCount(row.delay, ratio),
    deferred: scaleCount(row.deferred, ratio),
    bounce: scaleCount(row.bounce, ratio),
    hardbounce: scaleCount(row.hardbounce, ratio),
    softbounce: scaleCount(row.softbounce, ratio),
    blocked: scaleCount(row.blocked, ratio),
    dropped: scaleCount(row.dropped, ratio),
    complaints: scaleCount(row.complaints, ratio),
  }));
}

type IspComparisonRow = {
  isp: string;
  sent: number;
  delivered: number;
  deliveredRate: number;
  hardbounces: number;
  reputationBlocks: number;
  others: number;
};

function buildIspComparisonRows({
  ispOptions,
  bounceRows,
  deferralRows,
  sent,
}: {
  ispOptions: string[];
  bounceRows: DiagnosticRow[];
  deferralRows: DiagnosticRow[];
  sent: number;
}): IspComparisonRow[] {
  const providers = ispOptions.length ? ispOptions : ['Other'];
  const signals = providers.map((isp, index) => {
    const bounceCount = bounceRows.filter(row => row.isp === isp).reduce((sum, row) => sum + row.count, 0);
    const deferralCount = deferralRows.filter(row => row.isp === isp).reduce((sum, row) => sum + row.count, 0);
    return {
      isp,
      bounceCount,
      deferralCount,
      fallbackWeight: Math.max(1, providers.length - index),
    };
  });
  const totalSignal = signals.reduce((sum, row) => sum + row.bounceCount + row.deferralCount, 0);
  const totalFallback = signals.reduce((sum, row) => sum + row.fallbackWeight, 0);

  return signals
    .map(row => {
      const ratio = totalSignal
        ? (row.bounceCount + row.deferralCount) / totalSignal
        : row.fallbackWeight / Math.max(1, totalFallback);
      const rowSent = Math.max(1, scaleCount(sent, ratio));
      const hardbounceCount = Math.max(0, Math.round((row.bounceCount || rowSent * 0.0004) * 0.38));
      const blockCount = Math.max(0, Math.round((row.deferralCount || rowSent * 0.0012) * 0.16));
      const otherCount = Math.max(0, Math.round((row.bounceCount || rowSent * 0.001) - hardbounceCount));
      const delivered = Math.max(0, rowSent - hardbounceCount - blockCount - otherCount);
      return {
        isp: row.isp,
        sent: rowSent,
        delivered,
        deliveredRate: delivered / Math.max(1, rowSent),
        hardbounces: hardbounceCount / Math.max(1, rowSent),
        reputationBlocks: blockCount / Math.max(1, rowSent),
        others: otherCount / Math.max(1, rowSent),
      };
    })
    .sort((a, b) => b.sent - a.sent);
}

function filterIspSummaryRows(rows: IspComparisonRow[], filters: IspSummaryFilters) {
  const query = filters.query.trim().toLowerCase();
  return rows
    .filter(row => !filters.isp || row.isp === filters.isp)
    .filter(row => !query || `${row.isp} ${row.deliveredRate} ${row.hardbounces} ${row.reputationBlocks} ${row.others}`.toLowerCase().includes(query));
}

function StaticCustomizePreview({
  title,
  kind,
  theme = 'light',
  bars = [],
  line = false,
  tableColumns = [],
  tableRows = [],
  pieSlices = [],
}: {
  title: string;
  kind: 'bars' | 'table' | 'pie';
  theme?: 'light' | 'dark';
  bars?: number[];
  line?: boolean;
  tableColumns?: string[];
  tableRows?: string[][];
  pieSlices?: string[];
}) {
  const max = Math.max(1, ...bars);
  const dark = theme === 'dark';
  const columnCount = Math.max(1, tableColumns.length || tableRows[0]?.length || 3);
  const palette = dark
    ? [BRAZE_ORANGE, BRAZE_PINK, BRAZE_PURPLE_LIGHT, BRAZE_PINK_LIGHT]
    : [BRAZE_PURPLE, BRAZE_ORANGE, BRAZE_PINK_DARK, BRAZE_PURPLE_LIGHT];

  return (
    <div className={cn('h-full w-full p-3', dark ? 'bg-[#300266] text-white' : 'bg-[#F4F7FC] text-[#202124]')}>
      <p className={cn('mb-3 truncate text-[9px] font-black', dark ? 'text-white/90' : 'text-[#300266]')}>{title}</p>
      {kind === 'bars' && (
        <div className="relative flex h-[118px] items-end gap-1.5 border-b border-current/15 pl-1">
          {bars.slice(0, 22).map((value, index) => (
            <span
              key={index}
              className="min-w-0 flex-1 rounded-t-[2px]"
              style={{
                height: `${18 + (value / max) * 78}%`,
                backgroundColor: palette[index % palette.length],
                opacity: index % 3 === 0 ? 0.72 : 1,
              }}
            />
          ))}
          {line && (
            <span className="pointer-events-none absolute left-2 right-2 top-1/2 h-[2px] rounded-full bg-[#FFA4FB]/80 shadow-[0_0_0_2px_rgba(255,164,251,0.08)]" />
          )}
        </div>
      )}
      {kind === 'table' && (
        <div className={cn('overflow-hidden rounded-lg border text-[7px] font-bold', dark ? 'border-white/15' : 'border-[#DADCE0]')}>
          {tableColumns.length > 0 && (
            <div
              className={cn('grid gap-1 px-2 py-1.5 font-black', dark ? 'border-b border-white/10 bg-white/8' : 'border-b border-[#DADCE0] bg-[#E8E1F8] text-[#300266]')}
              style={{ gridTemplateColumns: `minmax(0,1.35fr) repeat(${Math.max(0, columnCount - 1)}, minmax(0,1fr))` }}
            >
              {tableColumns.slice(0, columnCount).map((column, index) => (
                <span key={column} className={cn('truncate', index > 0 && 'text-right')}>{column}</span>
              ))}
            </div>
          )}
          {tableRows.slice(0, 5).map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={cn('grid gap-1 px-2 py-1.5', dark ? 'border-b border-white/10' : 'border-b border-[#300266]/25')}
              style={{ gridTemplateColumns: `minmax(0,1.35fr) repeat(${Math.max(0, columnCount - 1)}, minmax(0,1fr))` }}
            >
              {Array.from({ length: columnCount }).map((_, columnIndex) => (
                <span
                  key={columnIndex}
                  className={cn('truncate', columnIndex > 0 && 'text-right', columnIndex === 3 && !dark && 'text-[#FFA524]')}
                >
                  {row[columnIndex] ?? ''}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
      {kind === 'pie' && (
        <div className="flex h-[118px] items-center justify-center gap-4">
          <div
            className="h-20 w-20 rounded-full"
            style={{
              background: `conic-gradient(${palette[0]} 0 32%, ${palette[1]} 32% 58%, ${palette[2]} 58% 78%, ${palette[3]} 78% 100%)`,
            }}
          >
            <div className={cn('m-5 h-10 w-10 rounded-full', dark ? 'bg-[#300266]' : 'bg-[#F4F7FC]')} />
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            {pieSlices.slice(0, 4).map((slice, index) => (
              <span key={slice} className="flex items-center gap-1.5 text-[7.5px] font-bold">
                <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: palette[index % palette.length] }} />
                <span className="max-w-[72px] truncate">{slice}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LazyDeliverabilityPanel({
  visible,
  resetKey,
  minHeight = 380,
  children,
}: {
  visible: boolean;
  resetKey: string;
  minHeight?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(false);
  }, [resetKey]);

  useEffect(() => {
    if (!visible || mounted) return;
    const el = ref.current;
    if (!el) return;
    const mount = () => setMounted(true);

    if (!('IntersectionObserver' in window)) {
      const id = globalThis.setTimeout(mount, 0);
      return () => globalThis.clearTimeout(id);
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          mount();
          observer.disconnect();
        }
      },
      { rootMargin: '700px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [mounted, visible]);

  if (!visible) return null;

  return (
    <div ref={ref} className="min-w-0" style={{ minHeight: mounted ? undefined : minHeight }}>
      {mounted ? children : (
        <div
          className="flex h-full min-h-[inherit] items-center justify-center rounded-2xl border border-outline-variant/15 bg-[#F4F6FC] dark:bg-[#1E1C21]"
          aria-hidden="true"
        >
          <div className="flex w-full max-w-[240px] flex-col gap-3 px-6">
            <span className="h-3 w-28 rounded-full bg-[#1a73e8]/25" />
            <span className="h-3 w-full rounded-full bg-[#1a73e8]/15" />
            <span className="h-3 w-3/4 rounded-full bg-[#1a73e8]/10" />
          </div>
        </div>
      )}
    </div>
  );
}

export function DeliverabilityDiagnosticsDashboard({
  ticket,
  dateRange,
  dateControl,
  caseHistory = [],
  initialResourceFilters,
}: {
  ticket: CaseRecord;
  dateRange?: DashboardFilters;
  dateControl?: React.ReactNode;
  caseHistory?: HistoricalMetricRecord[];
  initialResourceFilters?: ResourceFilters;
}) {
  const daily = useMemo(() => buildTrendRows(ticket), [ticket]);
  const allBounceRows = useMemo(() => buildDiagnosticRows(ticket, 'bounce'), [ticket]);
  const allDeferralRows = useMemo(() => buildDiagnosticRows(ticket, 'deferral'), [ticket]);
  const dates = useMemo(() => daily.map(row => row.date), [daily]);
  const [sharedFilters, setSharedFilters] = useState<DeliverabilitySharedFilters>(EMPTY_DELIVERABILITY_SHARED_FILTERS);
  const [panelFilters, setPanelFilters] = useState<Record<DeliverabilityPanelFilterKey, DeliverabilitySharedFilters>>(PANEL_FILTER_DEFAULTS);
  const [panelMetricSelections, setPanelMetricSelections] = useState<Record<DeliverabilityPanelFilterKey, MasterMetricKey[]>>(() => DEFAULT_PANEL_METRIC_SELECTIONS);
  const [masterResourceFilters, setMasterResourceFilters] = useState<ResourceFilters>(EMPTY_FILTERS);
  const [mainFilterOpen, setMainFilterOpen] = useState(false);
  const [filterContext, setFilterContext] = useState<DeliverabilityPanelFilterKey | null>(null);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deliverabilitySubview, setDeliverabilitySubview] = useState<DeliverabilitySubview>('delivery');
  const [hiddenPanels, setHiddenPanels] = useState<Set<DeliverabilityPanelKey>>(() => new Set());
  const providerMetricCatalog = useMemo(() => getMetricCatalogForProvider(ticket.email_service_provider), [ticket.email_service_provider]);
  const providerMasterMetrics = useMemo(() => makeMasterMetrics(providerMetricCatalog), [providerMetricCatalog]);
  const providerEnabledMetricKeys = useMemo(() => getEnabledMetricKeysForProvider(ticket.email_service_provider), [ticket.email_service_provider]);
  const providerEnabledMetricSet = useMemo(() => new Set(providerEnabledMetricKeys), [providerEnabledMetricKeys]);
  const isAmazonSes = normalizeMta(ticket.email_service_provider) === 'ses';

  const filteredHistory = useMemo(() => {
    if (!caseHistory || !caseHistory.length) return [];
    const from = dateRange?.from || '';
    const to = dateRange?.to || '';
    return caseHistory.filter(row => {
      if (from && row.metric_date < from) return false;
      if (to && row.metric_date > to) return false;
      return true;
    });
  }, [caseHistory, dateRange?.from, dateRange?.to]);

  const sesIspRows = useMemo(() => {
    if (!isAmazonSes || !filteredHistory.length) return [];
    const groups = new Map<string, HistoricalMetricRecord[]>();
    for (const r of filteredHistory) {
      const provider = r.mailbox_provider || 'Other';
      if (!groups.has(provider)) groups.set(provider, []);
      groups.get(provider)!.push(r);
    }
    return [...groups.entries()].map(([provider, rows]) => {
      const sent = rows.reduce((sum, r) => sum + (r.count_sent || 0), 0);
      const accepted = rows.reduce((sum, r) => sum + (r.count_accepted || 0), 0);
      const softBounce = rows.reduce((sum, r) => sum + (r.count_soft_bounce || 0), 0);
      const hardBounce = rows.reduce((sum, r) => sum + (r.count_hard_bounce || 0), 0);
      const complaints = rows.reduce((sum, r) => sum + (r.count_spam_complaint || 0), 0);
      const opens = rows.reduce((sum, r) => sum + (r.count_nonprefetched_unique_confirmed_opened || 0), 0);
      const clicks = rows.reduce((sum, r) => sum + (r.count_unique_clicked || 0), 0);
      return {
        isp: provider,
        sent,
        delivered: accepted,
        deliveredRate: sent > 0 ? accepted / sent : 0,
        transientBounceRate: sent > 0 ? softBounce / sent : 0,
        permanentBounceRate: sent > 0 ? hardBounce / sent : 0,
        complaintRate: accepted > 0 ? complaints / accepted : 0,
        openRate: accepted > 0 ? opens / accepted : 0,
        clickRate: accepted > 0 ? clicks / accepted : 0,
      };
    }).sort((a, b) => b.sent - a.sent);
  }, [isAmazonSes, filteredHistory]);

  const filteredSesIspRows = useMemo(() => {
    const query = sharedFilters.query.trim().toLowerCase();
    return sesIspRows
      .filter(row => !sharedFilters.isp || row.isp === sharedFilters.isp)
      .filter(row => !query || row.isp.toLowerCase().includes(query));
  }, [sesIspRows, sharedFilters.isp, sharedFilters.query]);

  useEffect(() => {
    setSharedFilters(EMPTY_DELIVERABILITY_SHARED_FILTERS);
    setPanelFilters(PANEL_FILTER_DEFAULTS);
    setPanelMetricSelections(defaultPanelMetricSelectionsForProvider(ticket.email_service_provider));
    setMasterResourceFilters(EMPTY_FILTERS);
    setMainFilterOpen(false);
    setFilterContext(null);
    setCustomizeOpen(false);
    setEditMode(false);
    setDeliverabilitySubview('delivery');
  }, [ticket.case_number, ticket.email_service_provider]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('edq:active-filters-changed', {
      detail: {
        dateRange: dateRange,
        sendingIps: masterResourceFilters.sendingIps,
        sendingDomains: masterResourceFilters.sendingDomains,
        recipientDomains: masterResourceFilters.recipientDomains,
        ipPools: masterResourceFilters.ipPools,
        mailboxProviders: masterResourceFilters.mailboxProviders,
        campaigns: masterResourceFilters.campaigns,
        subaccounts: masterResourceFilters.subaccounts,
        selectedIp: sharedFilters.ip,
        selectedPool: sharedFilters.pool,
        selectedIsp: sharedFilters.isp,
        selectedDomain: masterResourceFilters.sendingDomains[0] ?? '',
        selectedSendingDomain: masterResourceFilters.sendingDomains[0] ?? '',
        selectedCampaign: masterResourceFilters.campaigns[0] ?? '',
        selectedSubaccount: masterResourceFilters.subaccounts[0] ?? '',
        selectedBounceClass: sharedFilters.bounceClass,
      }
    }));
    return () => {
      window.dispatchEvent(new CustomEvent('edq:active-filters-changed', { detail: null }));
    };
  }, [masterResourceFilters, sharedFilters, dateRange]);

  const filteredDaily = useMemo(() => {
    const from = dateRange?.from || dates[0] || '';
    const to = dateRange?.to || dates[dates.length - 1] || '';
    return daily.filter(row => (!from || row.date >= from) && (!to || row.date <= to));
  }, [daily, dates, dateRange?.from, dateRange?.to]);
  const allIpRows = useMemo(() => buildIpRows(ticket), [ticket]);

  const ispOptions = useMemo(() => aggregate([...allBounceRows, ...allDeferralRows], 'isp').map(row => row.name), [allBounceRows, allDeferralRows]);
  const classOptions = useMemo(() => aggregate([...allBounceRows, ...allDeferralRows], 'bounceClass').map(row => row.name), [allBounceRows, allDeferralRows]);
  const poolOptions = useMemo(() => [...new Set(allIpRows.map(row => row.pool))], [allIpRows]);
  const ipOptions = useMemo(() => [...new Set(allIpRows.map(row => row.ip))], [allIpRows]);
  const sharedDiagnosticFilters = useMemo<DiagnosticFilters>(() => ({
    isp: sharedFilters.isp,
    bounceClass: sharedFilters.bounceClass,
    query: sharedFilters.query,
  }), [sharedFilters.bounceClass, sharedFilters.isp, sharedFilters.query]);
  const sharedIpFilters = useMemo<IpFilters>(() => ({
    pool: sharedFilters.pool,
    ip: sharedFilters.ip,
  }), [sharedFilters.ip, sharedFilters.pool]);

  const sharedResourceRatio = useMemo(() => {
    const ratios: number[] = [];
    if (sharedFilters.isp || sharedFilters.bounceClass || sharedFilters.query) {
      ratios.push(diagnosticSegmentRatio([...allBounceRows, ...allDeferralRows], sharedDiagnosticFilters));
    }
    if (sharedFilters.pool || sharedFilters.ip) {
      const total = allIpRows.reduce((sum, row) => sum + row.deliveries, 0);
      if (total) {
        const matched = filterIpRows(allIpRows, sharedIpFilters).reduce((sum, row) => sum + row.deliveries, 0);
        ratios.push(matched / total);
      }
    }
    return ratios.length ? Math.max(0.04, Math.min(1, Math.min(...ratios))) : 1;
  }, [allBounceRows, allDeferralRows, allIpRows, sharedDiagnosticFilters, sharedFilters.bounceClass, sharedFilters.ip, sharedFilters.isp, sharedFilters.pool, sharedFilters.query, sharedIpFilters]);

  const dateRatio = Math.max(0.05, (filteredDaily.length / Math.max(1, daily.length)) * sharedResourceRatio);
  const viewDaily = useMemo(() => scaleTrendRows(filteredDaily, sharedResourceRatio), [filteredDaily, sharedResourceRatio]);
  const classBounceRows = useMemo(() => filterDiagnosticRows(allBounceRows, sharedDiagnosticFilters, dateRatio), [allBounceRows, sharedDiagnosticFilters, dateRatio]);
  const reasonBounceRows = useMemo(() => filterDiagnosticRows(allBounceRows, sharedDiagnosticFilters, dateRatio), [allBounceRows, sharedDiagnosticFilters, dateRatio]);
  const deferralRows = useMemo(() => filterDiagnosticRows(allDeferralRows, sharedDiagnosticFilters, dateRatio), [allDeferralRows, sharedDiagnosticFilters, dateRatio]);
  const bounceClassRows = useMemo(() => aggregate(classBounceRows, 'bounceClass'), [classBounceRows]);
  const ispRows = useMemo(() => aggregate(classBounceRows, 'isp'), [classBounceRows]);
  const ipRows = useMemo(() => filterIpRows(allIpRows, sharedIpFilters), [allIpRows, sharedIpFilters]);
  const deliveryTableRatio = 1;
  const deliveryTableRows = useMemo(() => viewDaily.map(row => ({
    ...row,
    delivered: scaleCount(row.delivered, deliveryTableRatio),
  })), [deliveryTableRatio, viewDaily]);
  const masterOptions = useMemo<Record<ResourceKey, string[]>>(() => ({
    ...EMPTY_RESOURCE_OPTIONS,
    mailboxProviders: ispOptions,
    ipPools: poolOptions,
    sendingIps: ipOptions,
    sendingDomains: ticket.sending_domains ?? [],
    subaccounts: ticket.subaccounts ?? [],
  }), [ipOptions, ispOptions, poolOptions, ticket.sending_domains, ticket.subaccounts]);
  const applyMasterResourceFilters = (filters: ResourceFilters) => {
    setMasterResourceFilters(filters);
    setSharedFilters(current => ({
      ...current,
      isp: filters.mailboxProviders[0] ?? '',
      pool: filters.ipPools[0] ?? '',
      ip: filters.sendingIps[0] ?? '',
    }));
  };
  useEffect(() => {
    if (!initialResourceFilters) return;
    applyMasterResourceFilters(initialResourceFilters);
  }, [initialResourceFilters]); // Scope passed from Email Performance on an explicit cross-view drill-down.
  const sharedPanelMetrics = useMemo(
    () => commonPanelMetrics(panelMetricSelections),
    [panelMetricSelections]
  );
  const globalActiveMetrics = useMemo(() => {
    const common = commonPanelMetrics(panelMetricSelections);
    return common.length ? common : activePanelMetrics(panelMetricSelections);
  }, [panelMetricSelections]);
  const globalMetricsAreCommon = sharedPanelMetrics.length > 0;
  const activeSheetMetrics = useMemo(
    () => filterContext ? panelMetricSelections[filterContext] : globalActiveMetrics,
    [filterContext, globalActiveMetrics, panelMetricSelections]
  );
  const activeSheetEnabledMetrics = useMemo(
    () => {
      const base = filterContext ? PANEL_SUPPORTED_METRIC_KEYS[filterContext] : ALL_METRIC_KEYS;
      return base.filter(metric => providerEnabledMetricSet.has(metric));
    },
    [filterContext, providerEnabledMetricSet]
  );
  const activeSheetFilters = useMemo(
    () => filterContext ? resourceFiltersFromDeliverability(panelFilters[filterContext]) : masterResourceFilters,
    [filterContext, masterResourceFilters, panelFilters]
  );
  const applySheetMetrics = (metrics: string[]) => {
    if (filterContext) {
      const allowed = supportedMetricSet(filterContext);
      setPanelMetricSelections(current => ({
        ...current,
        [filterContext]: uniqueMetrics(metrics).filter(metric => allowed.has(metric) && providerEnabledMetricSet.has(metric)),
      }));
      return;
    }
    const nextGlobalMetrics = uniqueMetrics(metrics);
    const previousGlobalMetrics = new Set(globalActiveMetrics);
    const nextGlobalSet = new Set(nextGlobalMetrics);
    const added = nextGlobalMetrics.filter(metric => !previousGlobalMetrics.has(metric));
    const removed = [...previousGlobalMetrics].filter(metric => !nextGlobalSet.has(metric));
    setPanelMetricSelections(current => {
      const next = { ...current };
      (Object.keys(PANEL_METRIC_KEYS) as DeliverabilityPanelFilterKey[]).forEach(key => {
        const allowed = supportedMetricSet(key);
        const panelSet = new Set(next[key] ?? []);
        added.forEach(metric => {
          if (allowed.has(metric) && providerEnabledMetricSet.has(metric)) panelSet.add(metric);
        });
        removed.forEach(metric => panelSet.delete(metric));
        next[key] = MASTER_METRICS.map(metric => metric.key).filter(metric => panelSet.has(metric) && allowed.has(metric) && providerEnabledMetricSet.has(metric));
      });
      return next;
    });
  };
  const applySheetFilters = (filters: ResourceFilters) => {
    if (filterContext) {
      setPanelFilters(current => ({
        ...current,
        [filterContext]: deliverabilityFiltersFromResources(filters, current[filterContext]),
      }));
      return;
    }
    applyMasterResourceFilters(filters);
  };
  const activeResourceFilterCount = (Object.keys(masterResourceFilters) as ResourceKey[])
    .reduce((total, key) => total + masterResourceFilters[key].length, 0);
  const isPanelVisible = (key: DeliverabilityPanelKey) => !hiddenPanels.has(key);
  const isPanelInActiveView = (key: DeliverabilityPanelKey) => DELIVERABILITY_SUBVIEW_PANELS[deliverabilitySubview].includes(key);
  const isPanelVisibleInActiveView = (key: DeliverabilityPanelKey) => isPanelInActiveView(key) && isPanelVisible(key);
  const hidePanel = (key: DeliverabilityPanelKey) => {
    setHiddenPanels(current => {
      const next = new Set(current);
      next.add(key);
      return next;
    });
  };
  const showPanel = (key: string) => {
    setHiddenPanels(current => {
      const next = new Set(current);
      next.delete(key as DeliverabilityPanelKey);
      return next;
    });
  };
  const editProps = (_key: DeliverabilityPanelKey) => ({});
  const sent = sumRows(viewDaily, 'sent');
  const delivered = sumRows(viewDaily, 'delivered');
  const deferralTrendRows = useMemo(() => scaleTrendRows(viewDaily, diagnosticSegmentRatio(allDeferralRows, sharedDiagnosticFilters)), [allDeferralRows, sharedDiagnosticFilters, viewDaily]);
  const bounceTrendRows = useMemo(() => scaleTrendRows(viewDaily, diagnosticSegmentRatio(allBounceRows, sharedDiagnosticFilters)), [allBounceRows, sharedDiagnosticFilters, viewDaily]);
  const ispComparisonRows = useMemo(() => filterIspSummaryRows(buildIspComparisonRows({
    ispOptions,
    bounceRows: classBounceRows,
    deferralRows,
    sent,
  }), { isp: sharedFilters.isp, query: sharedFilters.query }), [classBounceRows, deferralRows, ispOptions, sharedFilters.isp, sharedFilters.query, sent]);
  const deferralIspRows = useMemo(() => aggregate(deferralRows, 'isp'), [deferralRows]);
  const deferredRawRows = useMemo(() => deferralRows.slice(0, 14).map((row, index) => ({
    time: viewDaily[index % Math.max(1, viewDaily.length)]?.date ?? dateRange?.to ?? '',
    mailboxProvider: row.isp,
    rawEvent: JSON.stringify({
      event_type: 'deferred',
      mailbox_provider: row.isp,
      bounce_class: row.bounceClass,
      reason: row.reason,
      count: row.count,
    }),
    count: row.count,
  })), [dateRange?.to, deferralRows, viewDaily]);
  const classColors = [BRAZE_ORANGE, BRAZE_PINK, BRAZE_PURPLE, BRAZE_ORANGE_LIGHT, BRAZE_PINK_LIGHT, BRAZE_PURPLE_LIGHT, BRAZE_ORANGE_DARK, BRAZE_PINK_DARK];
  const outerPie = classBounceRows.slice(0, 14).map((row, index) => ({
    name: `${row.bounceClass} - ${row.isp}`,
    count: row.count,
    color: classColors[index % classColors.length],
  }));

  const currentFrom = dateRange?.from || dates[0] || '';
  const currentTo = dateRange?.to || dates[dates.length - 1] || '';

  const prevRange = useMemo(() => {
    if (!currentFrom || !currentTo) return { from: '', to: '' };
    const fromDate = new Date(currentFrom + 'T00:00:00');
    const toDate = new Date(currentTo + 'T00:00:00');
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return { from: '', to: '' };
    const diffDays = Math.max(1, Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const prevFromDate = new Date(fromDate.getTime());
    prevFromDate.setDate(prevFromDate.getDate() - diffDays);
    const prevToDate = new Date(toDate.getTime());
    prevToDate.setDate(prevToDate.getDate() - diffDays);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    return { from: formatDate(prevFromDate), to: formatDate(prevToDate) };
  }, [currentFrom, currentTo]);

  const getMetricsForRange = (fromStr: string, toStr: string) => {
    const rangeDaily = daily.filter(row => (!fromStr || row.date >= fromStr) && (!toStr || row.date <= toStr));
    const rangeViewDaily = scaleTrendRows(rangeDaily, sharedResourceRatio);
    const rangeDateRatio = Math.max(0.05, (rangeDaily.length / Math.max(1, daily.length)) * sharedResourceRatio);

    const rangeClassBounces = filterDiagnosticRows(allBounceRows, sharedDiagnosticFilters, rangeDateRatio);
    const rangeDeferrals = filterDiagnosticRows(allDeferralRows, sharedDiagnosticFilters, rangeDateRatio);

    const tg = sumRows(rangeViewDaily, 'targeted');
    const ac = sumRows(rangeViewDaily, 'accepted');
    const bounceSig = rangeClassBounces.reduce((sum, row) => sum + row.count, 0);
    const hb = rangeClassBounces.reduce((sum, row) => {
      const cls = row.bounceClass.toLowerCase();
      return sum + (['admin', 'dns', 'invalid', 'spam', 'block', 'policy', 'undetermined'].some(token => cls.includes(token)) ? row.count : 0);
    }, 0);
    const sb = Math.max(0, bounceSig - hb);
    const df = rangeDeferrals.reduce((sum, row) => sum + row.count, 0);
    const bl = Math.max(
      0,
      rangeClassBounces.reduce((sum, row) => {
        const cls = row.bounceClass.toLowerCase();
        const reason = row.reason.toLowerCase();
        return sum + (cls.includes('block') || cls.includes('spam') || reason.includes('policy') || reason.includes('blocked') ? row.count : 0);
      }, 0) + Math.round(df * 0.16)
    );
    const rangeHasDiagnosticFilter = Boolean(sharedFilters.isp || sharedFilters.bounceClass || sharedFilters.query);
    const dr = rangeHasDiagnosticFilter
      ? Math.max(0, Math.round(bounceSig * 0.55) + bl)
      : sumRows(rangeViewDaily, 'dropped');
    const cp = sumRows(rangeViewDaily, 'complaints');

    return {
      targeted: tg,
      accepted: ac,
      acceptedRate: ac / Math.max(1, tg),
      deferred: df,
      bounceRate: (hb + sb) / Math.max(1, tg),
      complaints: cp,
      hardBounceRate: hb / Math.max(1, tg),
      softBounce: sb,
      softBounceRate: sb / Math.max(1, tg),
      blockRate: bl / Math.max(1, tg),
      deferredRate: df / Math.max(1, tg),
      blocked: bl,
      dropped: dr,
    };
  };

  const currentMetrics = useMemo(() => getMetricsForRange(currentFrom, currentTo), [currentFrom, currentTo, viewDaily, classBounceRows, deferralRows]);
  const prevMetrics = useMemo(() => {
    if (!prevRange.from || !prevRange.to) return null;
    return getMetricsForRange(prevRange.from, prevRange.to);
  }, [prevRange, daily, allBounceRows, allDeferralRows]);

  const getDiff = (key: keyof ReturnType<typeof getMetricsForRange>) => {
    if (!prevMetrics) return null;
    const curVal = currentMetrics[key];
    const prevVal = prevMetrics[key];
    if (prevVal === 0) return curVal > 0 ? 1 : 0;
    return (curVal - prevVal) / prevVal;
  };

  const {
    targeted, accepted, acceptedRate, deferred, bounceRate, complaints, softBounce,
    hardBounceRate, softBounceRate, blockRate, deferredRate, blocked, dropped
  } = currentMetrics;

  const updatePanelFilter = (key: DeliverabilityPanelFilterKey, next: DeliverabilitySharedFilters) => {
    setPanelFilters(current => ({ ...current, [key]: next }));
  };
  const scopedFilter = (key: DeliverabilityPanelFilterKey) => mergeDeliverabilityFilters(sharedFilters, panelFilters[key]);
  const scopedRatio = (filters: DeliverabilitySharedFilters) => {
    const ratios: number[] = [];
    if (filters.isp || filters.bounceClass || filters.query) {
      ratios.push(diagnosticSegmentRatio([...allBounceRows, ...allDeferralRows], asDiagnosticFilters(filters)));
    }
    if (filters.pool || filters.ip || filters.query) {
      const total = allIpRows.reduce((sum, row) => sum + row.deliveries, 0);
      if (total) {
        const matched = filterIpRowsWithQuery(allIpRows, filters).reduce((sum, row) => sum + row.deliveries, 0);
        ratios.push(matched / total);
      }
    }
    return ratios.length ? Math.max(0.04, Math.min(1, Math.min(...ratios))) : 1;
  };
  const panelDateRatio = (filters: DeliverabilitySharedFilters) => Math.max(0.05, (filteredDaily.length / Math.max(1, daily.length)) * scopedRatio(filters));
  const openPanelFilter = (key: DeliverabilityPanelFilterKey) => {
    setFilterContext(key);
    setMainFilterOpen(true);
  };
  const panelActions = (key: DeliverabilityPanelFilterKey, _priorityFields?: DeliverabilityFilterField[]) => {
    const localCount = deliverabilityFilterCount(panelFilters[key]);
    const metricCount = panelMetricSelections[key]?.length ?? 0;
    const actionCount = localCount + metricCount;
    return (
      <div className="flex items-center justify-end gap-2">
        {SEARCHABLE_PANEL_KEYS.has(key) && (
          <label className="relative flex h-10 w-[min(260px,34vw)] min-w-[128px] max-w-[260px] items-center">
            <SearchIcon size={16} strokeWidth={2.4} className="pointer-events-none absolute left-3 text-[#5F6368]" />
            <input
              value={panelFilters[key].query}
              onChange={event => updatePanelFilter(key, { ...panelFilters[key], query: event.target.value })}
              placeholder="Search"
              className="h-full w-full rounded-full border border-outline-variant/20 bg-white pl-9 pr-3 text-[13px] font-semibold text-on-surface outline-none transition-colors focus:border-[#1a73e8] dark:bg-[#242228] dark:text-inverse-on-surface"
            />
          </label>
        )}
        <button
          type="button"
          onClick={() => openPanelFilter(key)}
          className="relative inline-flex h-10 min-w-[58px] items-center justify-center gap-1.5 rounded-full bg-white px-3 text-[#4D4D57] transition-colors md3-state-layer hover:bg-[#E8F0FE] hover:text-[#1a73e8] dark:bg-white/10 dark:text-inverse-on-surface"
          aria-label={`Filter ${key}`}
        >
          <SlidersHorizontal size={18} strokeWidth={2.4} />
          {actionCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#801ED7] px-1.5 text-[10px] font-black leading-none text-white">
              {actionCount}
            </span>
          )}
        </button>
      </div>
    );
  };

  const eventTypesFilter = scopedFilter('eventTypes');
  const eventTypesRowsScoped = scaleTrendRows(filteredDaily, scopedRatio(eventTypesFilter));
  const volumeFilter = scopedFilter('volume');
  const volumeTrendRowsScoped = scaleTrendRows(filteredDaily, scopedRatio(volumeFilter));
  const volumeMetricSelection = panelMetricSelections.volume;
  const deliveriesFilter = scopedFilter('deliveries');
  const deliveryTableRowsScoped = scaleTrendRows(filteredDaily, scopedRatio(deliveriesFilter)).map(row => ({
    ...row,
    delivered: scaleCount(row.delivered, deliveryTableRatio),
  }));
  const deliveryMetricTable = trendMetricTableRows(deliveryTableRowsScoped, panelMetricSelections.deliveries, providerMasterMetrics);
  const ipVolumeFilter = scopedFilter('ipVolume');
  const ipRowsScoped = filterIpRowsWithQuery(allIpRows, ipVolumeFilter);
  const ipRowsScopedRatio = panelDateRatio(ipVolumeFilter);
  const ispSummaryFilter = scopedFilter('ispSummary');
  const ispSummaryDiagnosticFilters = asDiagnosticFilters(ispSummaryFilter);
  const ispSummaryRatio = panelDateRatio(ispSummaryFilter);
  const ispComparisonRowsScoped = filterIspSummaryRows(buildIspComparisonRows({
    ispOptions,
    bounceRows: filterDiagnosticRows(allBounceRows, ispSummaryDiagnosticFilters, ispSummaryRatio),
    deferralRows: filterDiagnosticRows(allDeferralRows, ispSummaryDiagnosticFilters, ispSummaryRatio),
    sent: sumRows(scaleTrendRows(filteredDaily, scopedRatio(ispSummaryFilter)), 'sent'),
  }), { isp: ispSummaryFilter.isp, query: ispSummaryFilter.query });
  const deferralTrendFilter = scopedFilter('deferralTrend');
  const deferralTrendRowsScoped = scaleTrendRows(filteredDaily, scopedRatio(deferralTrendFilter) * diagnosticSegmentRatio(allDeferralRows, asDiagnosticFilters(deferralTrendFilter)));
  const bounceTrendFilter = scopedFilter('bounceTrend');
  const bounceTrendRowsScoped = scaleTrendRows(filteredDaily, scopedRatio(bounceTrendFilter) * diagnosticSegmentRatio(allBounceRows, asDiagnosticFilters(bounceTrendFilter)));
  const bounceClassOverallFilter = scopedFilter('bounceClassOverall');
  const bounceClassRowsScoped = aggregate(filterDiagnosticRows(allBounceRows, asDiagnosticFilters(bounceClassOverallFilter), panelDateRatio(bounceClassOverallFilter)), 'bounceClass')
    .filter(row => textMatches(bounceClassOverallFilter.query, [row.name, row.count]));
  const bounceClassByIspFilter = scopedFilter('bounceClassByIsp');
  const classBounceRowsScoped = filterDiagnosticRows(allBounceRows, asDiagnosticFilters(bounceClassByIspFilter), panelDateRatio(bounceClassByIspFilter));
  const ispRowsScoped = aggregate(classBounceRowsScoped, 'isp');
  const outerPieScoped = classBounceRowsScoped.slice(0, 14).map((row, index) => ({
    name: `${row.bounceClass} - ${row.isp}`,
    count: row.count,
    color: classColors[index % classColors.length],
  }));
  const bounceReasonFilter = scopedFilter('bounceReason');
  const reasonBounceRowsScoped = filterDiagnosticRows(allBounceRows, asDiagnosticFilters(bounceReasonFilter), panelDateRatio(bounceReasonFilter));
  const deferralReasonFilter = scopedFilter('deferralReason');
  const deferralRowsScoped = filterDiagnosticRows(allDeferralRows, asDiagnosticFilters(deferralReasonFilter), panelDateRatio(deferralReasonFilter));
  const deferralIspFilter = scopedFilter('deferralIsp');
  const deferralIspRowsScoped = aggregate(filterDiagnosticRows(allDeferralRows, asDiagnosticFilters(deferralIspFilter), panelDateRatio(deferralIspFilter)), 'isp');
  const rawDeferralsFilter = scopedFilter('rawDeferrals');
  const rawDeferralsRows = filterDiagnosticRows(allDeferralRows, asDiagnosticFilters(rawDeferralsFilter), panelDateRatio(rawDeferralsFilter));
  const deferredRawRowsScoped = rawDeferralsRows.slice(0, 14).map((row, index) => ({
    time: viewDaily[index % Math.max(1, viewDaily.length)]?.date ?? dateRange?.to ?? '',
    mailboxProvider: row.isp,
    rawEvent: JSON.stringify({
      event_type: 'deferred',
      mailbox_provider: row.isp,
      bounce_class: row.bounceClass,
      reason: row.reason,
      count: row.count,
    }),
    count: row.count,
  }));

  const volumePreviewBars = volumeTrendRowsScoped.map(row => row.sent || row.accepted || row.delivered);
  const eventPreviewBars = eventTypesRowsScoped.map(row => row.sent || row.accepted || row.bounce);
  const deferralPreviewBars = deferralTrendRowsScoped.map(row => row.deferred || row.delay || row.accepted);
  const bouncePreviewBars = bounceTrendRowsScoped.map(row => row.hardbounce || row.bounce || row.delivered);
  const deliveriesPreviewColumns = deliveryMetricTable.columns.slice(0, 4);
  const deliveriesPreviewRows = deliveryMetricTable.rows.slice(0, 5).map(row => deliveriesPreviewColumns.map((_column, index) => String(row[index] ?? '')));
  const ipPreviewColumns = ['IP pool', 'IP address', 'Deliveries'];
  const ipPreviewRows = ipRowsScoped.slice(0, 5).map(row => [row.pool, row.ip, formatInt(scaleCount(row.deliveries, ipRowsScopedRatio))]);
  const ispPreviewColumns = ['ISP', 'Sent', 'Delivered', '% delivered', 'Hardbounces', 'Reputation / blocks', 'Others'];
  const ispPreviewRows = ispComparisonRowsScoped.slice(0, 5).map(row => [
    row.isp,
    formatInt(row.sent),
    formatInt(row.delivered),
    formatPct(row.deliveredRate),
    formatPct(row.hardbounces),
    formatPct(row.reputationBlocks),
    formatPct(row.others),
  ]);
  const bounceClassPreviewColumns = ['Bounce class', 'Count'];
  const bounceClassPreviewRows = bounceClassRowsScoped.slice(0, 5).map(row => [row.name, formatInt(row.count)]);
  const reasonPreviewColumns = ['ISP', 'Class', 'Reason', 'Count'];
  const bounceReasonPreviewRows = reasonBounceRowsScoped.slice(0, 5).map(row => [row.isp, row.bounceClass, row.reason, formatInt(row.count)]);
  const deferralReasonPreviewRows = deferralRowsScoped.slice(0, 5).map(row => [row.isp, row.bounceClass, row.reason, formatInt(row.count)]);
  const rawDeferralsPreviewColumns = ['@timestamp', 'Provider', 'Raw event', 'Count'];
  const rawDeferralsPreviewRows = deferredRawRowsScoped.slice(0, 5).map(row => [row.time, row.mailboxProvider, row.rawEvent, formatInt(row.count)]);

  const panelOutlineItems: PanelOutlineItem[] = [
    {
      key: 'volume',
      title: 'Volume by day',
      description: 'Delivery section. Provider mix by daily delivery volume.',
      visible: isPanelVisible('volume'),
      preview: <StaticCustomizePreview title="Volume by day" kind="bars" theme="dark" bars={volumePreviewBars} />,
    },
    {
      key: 'deliveries',
      title: 'Deliveries by day',
      description: 'Delivery section. Daily delivery totals.',
      visible: isPanelVisible('deliveries'),
      preview: <StaticCustomizePreview title="Deliveries by day" kind="table" tableColumns={deliveriesPreviewColumns} tableRows={deliveriesPreviewRows} />,
    },
    {
      key: 'ipVolume',
      title: 'Volume per IP pool & IP address',
      description: 'Delivery section. Delivery totals by pool and address.',
      visible: isPanelVisible('ipVolume'),
      preview: <StaticCustomizePreview title="Volume per IP pool & IP address" kind="table" tableColumns={ipPreviewColumns} tableRows={ipPreviewRows} />,
    },
    {
      key: 'ispSummary',
      title: 'Sent vs. Delivered vs. Bounces (top 20)',
      description: 'Delivery section. Mailbox-provider delivery quality.',
      visible: isPanelVisible('ispSummary'),
      preview: <StaticCustomizePreview title="Sent vs. Delivered vs. Bounces" kind="table" tableColumns={ispPreviewColumns} tableRows={ispPreviewRows} />,
    },
    {
      key: 'eventTypes',
      title: 'Event types over time',
      description: 'Delivery section. Selected event metrics over the active date range.',
      visible: isPanelVisible('eventTypes'),
      preview: <StaticCustomizePreview title="Event types over time" kind="bars" theme="dark" bars={eventPreviewBars} line />,
    },
    {
      key: 'deferralTrend',
      title: 'Deliveries vs. Deferrals',
      description: 'Deferrals section. Accepted mail versus temporary deferrals.',
      visible: isPanelVisible('deferralTrend'),
      preview: <StaticCustomizePreview title="Deliveries vs. Deferrals" kind="bars" theme="dark" bars={deferralPreviewBars} line />,
    },
    {
      key: 'bounceTrend',
      title: 'Deliveries vs. Hardbounces over time',
      description: 'Bounces section. Daily delivery area with hardbounce baseline.',
      visible: isPanelVisible('bounceTrend'),
      preview: <StaticCustomizePreview title="Deliveries vs. Hardbounces" kind="bars" theme="dark" bars={bouncePreviewBars} line />,
    },
    {
      key: 'bounceClassOverall',
      title: 'Bounce Class Overall',
      description: 'Bounces section. Bounce classes excluding deferrals.',
      visible: isPanelVisible('bounceClassOverall'),
      preview: <StaticCustomizePreview title="Bounce Class Overall" kind="table" tableColumns={bounceClassPreviewColumns} tableRows={bounceClassPreviewRows} />,
    },
    {
      key: 'bounceClassByIsp',
      title: 'Bounce Class by ISP',
      description: 'Bounces section. Class and ISP distribution.',
      visible: isPanelVisible('bounceClassByIsp'),
      preview: <StaticCustomizePreview title="Bounce Class by ISP" kind="pie" theme="dark" pieSlices={ispRowsScoped.map(row => row.name)} />,
    },
    {
      key: 'bounceReason',
      title: 'Bounce Class by ISP and Reason',
      description: 'Bounces section. Top bounce reason rows by count.',
      visible: isPanelVisible('bounceReason'),
      preview: <StaticCustomizePreview title="Bounce Class by ISP and Reason" kind="table" tableColumns={reasonPreviewColumns} tableRows={bounceReasonPreviewRows} />,
    },
    {
      key: 'deferralReason',
      title: 'Deferrals by ISP and Reason',
      description: 'Deferrals section. Temporary delivery failures and rate-limit responses.',
      visible: isPanelVisible('deferralReason'),
      preview: <StaticCustomizePreview title="Deferrals by ISP and Reason" kind="table" tableColumns={reasonPreviewColumns} tableRows={deferralReasonPreviewRows} />,
    },
    {
      key: 'deferralIsp',
      title: 'Deferred Events by ISP',
      description: 'Deferrals section. Mailbox providers contributing temporary failures.',
      visible: isPanelVisible('deferralIsp'),
      preview: <StaticCustomizePreview title="Deferred Events by ISP" kind="pie" theme="dark" pieSlices={deferralIspRowsScoped.map(row => row.name)} />,
    },
    {
      key: 'rawDeferrals',
      title: 'Deferred Events - Raw Discover table',
      description: 'Deferrals section. Raw-style rows behind the deferral distribution.',
      visible: isPanelVisible('rawDeferrals'),
      preview: <StaticCustomizePreview title="Deferred Events - Raw Discover table" kind="table" tableColumns={rawDeferralsPreviewColumns} tableRows={rawDeferralsPreviewRows} />,
    },
  ];
  const commonMetricDefs = metricDefsFor(globalActiveMetrics, providerMasterMetrics);
  const globalActionCount = activeResourceFilterCount + commonMetricDefs.length;
  const metricsMotionKey = [
    ticket.case_number,
    dateRange?.from ?? '',
    dateRange?.to ?? '',
    sharedFilters.isp,
    sharedFilters.bounceClass,
    sharedFilters.pool,
    sharedFilters.ip,
    sharedFilters.query,
  ].join(':');

  return (
    <div className="flex flex-col gap-7">
      <div className="sticky top-0 z-30 -mt-3 flex flex-wrap items-center justify-between gap-2 bg-transparent py-2.5 pointer-events-none">
        <div className="pointer-events-auto -my-2 shrink-0 px-2 py-2">
          <nav aria-label="Deliverability views" className="flex w-max items-center gap-[3px] overflow-visible rounded-[100px] border border-[rgba(218,220,224,0.8)] bg-white p-[6px] shadow-[0_4px_20px_rgba(32,33,36,0.08),0_1px_4px_rgba(32,33,36,0.04)] dark:border-white/[0.08] dark:bg-[#28272E]">
            {DELIVERABILITY_SUBVIEWS.map(item => {
              const active = deliverabilitySubview === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDeliverabilitySubview(item.id)}
                  className={cn(
                    'relative flex h-8 shrink-0 items-center gap-1.5 rounded-[100px] px-[12px] text-[13px] font-[500] transition-all duration-200 select-none whitespace-nowrap',
                    active
                      ? 'bg-[#E8F0FE] text-[#1A73E8] dark:bg-[#1A73E8]/20 dark:text-[#8AB4F8]'
                      : 'text-[#5F6368] hover:bg-[rgba(60,64,67,0.06)] hover:text-[#202124] dark:text-white/70 dark:hover:bg-white/8 dark:hover:text-white'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="material-symbols-outlined text-[16px] leading-none">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="pointer-events-auto ml-auto flex shrink-0 items-center justify-end gap-2">
          <div>{dateControl}</div>
          <button
            type="button"
            onClick={() => {
              setFilterContext(null);
              setMainFilterOpen(true);
            }}
            className="flex h-12 items-center gap-2 rounded-full border border-outline-variant/40 bg-white px-4 text-[13px] font-semibold text-on-surface shadow-[0_6px_18px_rgba(32,33,36,0.12)] transition-colors md3-state-layer hover:bg-[#F8FAFF] dark:bg-[#201F24] dark:text-inverse-on-surface dark:hover:bg-[#2A2930]"
          >
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">tune</span>
            <span className="shrink-0">Metrics &amp; filters</span>
            {globalActionCount > 0 && (
              <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#801ED7] px-1.5 text-[10px] font-black leading-none text-white">
                {globalActionCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditMode(true);
              setCustomizeOpen(true);
            }}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#D2E3FC] text-[#3C4043] transition-colors md3-state-layer hover:bg-[#C4D7F6]"
            aria-label="Customize panels"
          >
            <span className="material-symbols-outlined text-[24px]">edit</span>
          </button>
        </div>
        <MetricsFilterSheet
          key={filterContext ?? 'global-deliverability'}
          open={mainFilterOpen}
          onClose={() => {
            setMainFilterOpen(false);
            setFilterContext(null);
          }}
          selectedMetrics={activeSheetMetrics}
          onApplyMetrics={applySheetMetrics}
          filters={activeSheetFilters}
          onApplyFilters={applySheetFilters}
          options={masterOptions}
          metricCatalog={providerMetricCatalog}
          initialTab="metrics"
          highlightedMetrics={filterContext ? activeSheetMetrics : undefined}
          highlightLabel={filterContext ? 'Active for this panel' : globalMetricsAreCommon ? 'Common to every panel' : 'Active in panels'}
          enabledMetrics={activeSheetEnabledMetrics}
          tabUnderlineLayoutId="deliverability-sheet-underline"
        />
        <PanelCustomizeSheet
          open={customizeOpen}
          onClose={() => {
            setCustomizeOpen(false);
            setEditMode(false);
          }}
          title="Customize Deliverability panels"
          subtitle="Hide panels from this view or add them back later. Data stays synced to the selected date and filters."
          items={panelOutlineItems}
          onShow={showPanel}
          onHide={key => hidePanel(key as DeliverabilityPanelKey)}
        />
      </div>

      <motion.div
        key={metricsMotionKey}
        initial={{ y: 18 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.34, ease: md3Ease }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
      >
        <KpiTileFlat label="Targeted" value={formatInt(targeted)} wowDiff={getDiff('targeted')} />
        <KpiTileFlat label={isAmazonSes ? 'Delivered' : 'Accepted'} value={formatInt(accepted)} wowDiff={getDiff('accepted')} />
        <KpiTileFlat label={isAmazonSes ? 'Delivery Rate' : 'Accepted Rate'} value={formatPct(acceptedRate)} wowDiff={getDiff('acceptedRate')} />
        <KpiTileFlat label={isAmazonSes ? 'Transient Bounces' : 'Deferred'} value={formatInt(isAmazonSes ? softBounce : deferred)} wowDiff={getDiff(isAmazonSes ? 'softBounce' : 'deferred')} inverse={true} />
        <KpiTileFlat label="Bounce Rate" value={formatPct(bounceRate)} wowDiff={getDiff('bounceRate')} inverse={true} />
        <KpiTileFlat label="Complaints" value={formatInt(complaints)} wowDiff={getDiff('complaints')} inverse={true} />
        <KpiTileFlat label={isAmazonSes ? 'Permanent Bounce Rate' : 'Hard Bounce Rate'} value={formatPct(hardBounceRate)} wowDiff={getDiff('hardBounceRate')} inverse={true} />
        <KpiTileFlat label={isAmazonSes ? 'Transient Bounce Rate' : 'Soft Bounce Rate'} value={formatPct(softBounceRate)} wowDiff={getDiff('softBounceRate')} inverse={true} />
        <KpiTileFlat label="Block Rate" value={formatPct(blockRate)} wowDiff={getDiff('blockRate')} inverse={true} />
        <KpiTileFlat label="Deferred Rate" value={formatPct(deferredRate)} wowDiff={getDiff('deferredRate')} inverse={true} />
        <KpiTileFlat label="Blocked" value={formatInt(blocked)} wowDiff={getDiff('blocked')} inverse={true} />
        <KpiTileFlat label="Dropped" value={formatInt(dropped)} wowDiff={getDiff('dropped')} inverse={true} />
      </motion.div>

      <div className="h-1 bg-transparent" aria-hidden="true" />

      <Panel
        title="Volume by day"
        subtitle="Provider mix by daily delivery volume"
        icon={Globe2}
        actions={panelActions('volume', ['query'])}
        className={cn(!isPanelVisibleInActiveView('volume') && 'hidden')}
        motionDelay={0.04}
        {...editProps('volume')}
      >
        <TrendMetricChart rows={volumeTrendRowsScoped} metricKeys={volumeMetricSelection} masterMetrics={providerMasterMetrics} height={260} />
      </Panel>

      <div className="flex flex-col gap-6">
        <Panel
          title="Deliveries by day"
          subtitle="Daily delivery totals"
          icon={MailCheck}
          theme="light"
          actions={panelActions('deliveries', ['query'])}
          className={cn(!isPanelVisibleInActiveView('deliveries') && 'hidden')}
          motionDelay={0.08}
          {...editProps('deliveries')}
        >
          <DataTable
            columns={deliveryMetricTable.columns}
            rows={deliveryMetricTable.rows}
            sum={sumRows(deliveryTableRowsScoped, 'delivered')}
          />
        </Panel>

        <Panel
          title="Volume per IP pool & IP address"
          subtitle="Delivery totals by pool"
          icon={Server}
          theme="light"
          actions={panelActions('ipVolume', ['pool', 'ip', 'query'])}
          className={cn(!isPanelVisibleInActiveView('ipVolume') && 'hidden')}
          motionDelay={0.12}
          {...editProps('ipVolume')}
        >
          <DataTable
            columns={['IP Pool', 'IP Address', 'Deliveries']}
            rows={ipRowsScoped.map(row => [
              <span className="font-bold">{row.pool}</span>,
              <span className="font-bold">{row.ip}</span>,
              formatInt(scaleCount(row.deliveries, ipRowsScopedRatio)),
            ])}
            sum={ipRowsScoped.reduce((sum, row) => sum + scaleCount(row.deliveries, ipRowsScopedRatio), 0)}
          />
        </Panel>
      </div>

      <Panel
        title="Sent vs. Delivered vs. Bounces (top 20)"
        subtitle="Mailbox-provider delivery quality across the selected date window"
        icon={TableProperties}
        theme="light"
        actions={panelActions('ispSummary', ['isp', 'query'])}
        className={cn(!isPanelVisibleInActiveView('ispSummary') && 'hidden')}
        motionDelay={0.16}
        {...editProps('ispSummary')}
      >
        <DataTable
          columns={isAmazonSes
            ? ['ISP', 'Send volume', 'Delivered', 'Transient bounces', 'Permanent bounces', 'Complaints', 'Opens', 'Clicks']
            : ['ISP', 'Sent', 'Delivered', '% Delivered', 'Hardbounces', 'Reputation / Blocks', 'Others']}
          rows={isAmazonSes
            ? filteredSesIspRows.slice(0, 20).map(row => [
                <span className="font-bold">{row.isp}</span>,
                formatInt(row.sent),
                formatPct(row.deliveredRate),
                formatPct(row.transientBounceRate),
                formatPct(row.permanentBounceRate),
                row.complaintRate > 0 ? formatPct(row.complaintRate) : '—',
                formatPct(row.openRate),
                formatPct(row.clickRate),
              ])
            : ispComparisonRowsScoped.slice(0, 20).map(row => [
                <span className="font-bold">{row.isp}</span>,
                formatInt(row.sent),
                formatInt(row.delivered),
                <span className={cn('font-bold', row.deliveredRate < DELIVERABILITY_BENCHMARKS.deliveryRate.healthy ? 'text-[#FFA524]' : 'text-emerald-600 dark:text-emerald-450')}>{formatPct(row.deliveredRate)}</span>,
                formatPct(row.hardbounces),
                formatPct(row.reputationBlocks),
                <span className={cn('font-bold', row.others > DELIVERABILITY_BENCHMARKS.bounceRate.investigate ? 'text-red-650 dark:text-red-400' : '')}>{formatPct(row.others)}</span>,
              ])}
          sum={isAmazonSes
            ? filteredSesIspRows.reduce((sum, row) => sum + row.sent, 0)
            : ispComparisonRowsScoped.reduce((sum, row) => sum + row.sent, 0)}
        />
      </Panel>

      <LazyDeliverabilityPanel visible={isPanelVisibleInActiveView('eventTypes')} resetKey={`${ticket.case_number}:eventTypes`} minHeight={500}>
        <div className="relative overflow-visible">
          <MasterDeliverabilityPanel
            rows={eventTypesRowsScoped}
            selectedMetrics={panelMetricSelections.eventTypes}
            masterMetrics={providerMasterMetrics}
            actions={panelActions('eventTypes', ['isp', 'bounceClass', 'pool', 'ip', 'query'])}
          />
        </div>
      </LazyDeliverabilityPanel>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <LazyDeliverabilityPanel visible={isPanelVisibleInActiveView('deferralTrend')} resetKey={`${ticket.case_number}:deferralTrend`}>
          <Panel
          title="Deliveries vs. Deferrals"
          subtitle="Accepted mail versus temporary deferral responses"
          icon={MailWarning}
          actions={panelActions('deferralTrend', ['isp', 'bounceClass', 'query'])}
          motionDelay={0.22}
          {...editProps('deferralTrend')}
        >
            <TrendMetricChart rows={deferralTrendRowsScoped} metricKeys={panelMetricSelections.deferralTrend} masterMetrics={providerMasterMetrics} height={280} />
          </Panel>
        </LazyDeliverabilityPanel>

        <LazyDeliverabilityPanel visible={isPanelVisibleInActiveView('bounceTrend')} resetKey={`${ticket.case_number}:bounceTrend`}>
          <Panel
          title="Deliveries vs. Hardbounces over time"
          subtitle="Daily delivery area with hardbounce baseline"
          icon={AlertTriangle}
          actions={panelActions('bounceTrend', ['isp', 'bounceClass', 'query'])}
          motionDelay={0.26}
          {...editProps('bounceTrend')}
        >
            <TrendMetricChart rows={bounceTrendRowsScoped} metricKeys={panelMetricSelections.bounceTrend} masterMetrics={providerMasterMetrics} height={280} />
          </Panel>
        </LazyDeliverabilityPanel>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <LazyDeliverabilityPanel visible={isPanelVisibleInActiveView('bounceClassOverall')} resetKey={`${ticket.case_number}:bounceClassOverall`}>
          <Panel
            title="Bounce Class Overall"
            subtitle="Excluding deferrals"
            icon={TableProperties}
            theme="light"
            actions={panelActions('bounceClassOverall', ['bounceClass', 'query'])}
            motionDelay={0.3}
            {...editProps('bounceClassOverall')}
          >
            <DataTable
              columns={['Bounce Class', 'Count']}
              rows={bounceClassRowsScoped.map(row => [
                <span className="font-bold">{row.name}</span>,
                formatInt(row.count),
              ])}
              sum={bounceClassRowsScoped.reduce((sum, row) => sum + row.count, 0)}
            />
          </Panel>
        </LazyDeliverabilityPanel>

        <LazyDeliverabilityPanel visible={isPanelVisibleInActiveView('bounceClassByIsp')} resetKey={`${ticket.case_number}:bounceClassByIsp`} minHeight={455}>
          <Panel
            title="Bounce Class by ISP"
            subtitle="Inner ring: class. Outer ring: ISP and class."
            icon={ChartPie}
            actions={panelActions('bounceClassByIsp', ['isp', 'bounceClass', 'query'])}
            motionDelay={0.34}
            {...editProps('bounceClassByIsp')}
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4 items-center">
              <div className="h-[360px] min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart key={JSON.stringify(bounceClassRowsScoped)}>
                    <Tooltip content={<ChartTooltip />} />
                    <Pie data={bounceClassRowsScoped} dataKey="count" nameKey="name" innerRadius={64} outerRadius={116} paddingAngle={1}>
                      {bounceClassRowsScoped.map((_row, index) => <Cell key={index} fill={classColors[index % classColors.length]} />)}
                    </Pie>
                    <Pie data={outerPieScoped} dataKey="count" nameKey="name" innerRadius={122} outerRadius={164} paddingAngle={1}>
                      {outerPieScoped.map((row, index) => <Cell key={index} fill={row.color} opacity={0.82} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {ispRowsScoped.slice(0, 9).map((row, index) => (
                  <div key={row.name} className="flex items-center justify-between gap-2 text-[12px] font-bold">
                    <span className="inline-flex items-center gap-2 min-w-0">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: classColors[index % classColors.length] }} />
                      <span className="truncate text-purple-200">{row.name}</span>
                    </span>
                    <span className="text-purple-100">{compact(row.count)}</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </LazyDeliverabilityPanel>
      </div>

      <LazyDeliverabilityPanel visible={isPanelVisibleInActiveView('bounceReason')} resetKey={`${ticket.case_number}:bounceReason`}>
        <Panel
          title="Bounce Class by ISP and Reason"
          subtitle="Top reason rows by count"
          icon={Database}
          theme="light"
          actions={panelActions('bounceReason', ['isp', 'bounceClass', 'query'])}
          motionDelay={0.38}
          {...editProps('bounceReason')}
        >
          <DataTable
            columns={['ISP', 'Bounce Class', 'Bounce Reason', 'Count']}
            rows={reasonBounceRowsScoped.slice(0, 12).map(row => [
              <span className="font-bold">{row.isp}</span>,
              <span className="font-bold">{row.bounceClass}</span>,
              <span className="text-slate-600 dark:text-purple-300 leading-relaxed font-semibold">{row.reason}</span>,
              formatInt(row.count),
            ])}
            sum={reasonBounceRowsScoped.reduce((sum, row) => sum + row.count, 0)}
          />
        </Panel>
      </LazyDeliverabilityPanel>

      <LazyDeliverabilityPanel visible={isPanelVisibleInActiveView('deferralReason')} resetKey={`${ticket.case_number}:deferralReason`}>
        <Panel
          title="Deferrals by ISP and Reason"
          subtitle="Temporary delivery failures and rate-limit responses"
          icon={Inbox}
          theme="light"
          actions={panelActions('deferralReason', ['isp', 'bounceClass', 'query'])}
          motionDelay={0.42}
          {...editProps('deferralReason')}
        >
          <DataTable
            columns={['ISP', 'Bounce Class', 'Bounce Reason', 'Count']}
            rows={deferralRowsScoped.slice(0, 12).map(row => [
              <span className="font-bold">{row.isp}</span>,
              <span className="font-bold">{row.bounceClass}</span>,
              <span className="text-slate-600 dark:text-purple-300 leading-relaxed font-semibold">{row.reason}</span>,
              formatInt(row.count),
            ])}
            sum={deferralRowsScoped.reduce((sum, row) => sum + row.count, 0)}
          />
        </Panel>
      </LazyDeliverabilityPanel>

      <LazyDeliverabilityPanel visible={isPanelVisibleInActiveView('deferralIsp')} resetKey={`${ticket.case_number}:deferralIsp`} minHeight={420}>
        <Panel
          title="Deferred Events by ISP"
          subtitle="Mailbox providers contributing temporary failures"
          icon={ChartPie}
          actions={panelActions('deferralIsp', ['isp', 'bounceClass', 'query'])}
          motionDelay={0.46}
          {...editProps('deferralIsp')}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4 items-center">
            <div className="h-[320px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart key={JSON.stringify(deferralIspRowsScoped)}>
                  <Tooltip content={<ChartTooltip />} />
                  <Pie data={deferralIspRowsScoped} dataKey="count" nameKey="name" innerRadius={72} outerRadius={130} paddingAngle={1}>
                    {deferralIspRowsScoped.map((_row, index) => <Cell key={index} fill={classColors[index % classColors.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {deferralIspRowsScoped.slice(0, 9).map((row, index) => (
                <div key={row.name} className="flex items-center justify-between gap-2 text-[12px] font-bold">
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: classColors[index % classColors.length] }} />
                    <span className="truncate text-purple-200">{row.name}</span>
                  </span>
                  <span className="text-purple-100">{compact(row.count)}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </LazyDeliverabilityPanel>

      <LazyDeliverabilityPanel visible={isPanelVisibleInActiveView('rawDeferrals')} resetKey={`${ticket.case_number}:rawDeferrals`}>
        <Panel
          title="Deferred Events - Raw Discover table"
          subtitle="Raw-style rows behind the deferral distribution"
          icon={Database}
          theme="light"
          actions={panelActions('rawDeferrals', ['isp', 'bounceClass', 'query'])}
          motionDelay={0.5}
          {...editProps('rawDeferrals')}
        >
          <DataTable
            columns={['@timestamp', 'mailbox_provider', 'raw_event', 'Count']}
            rows={deferredRawRowsScoped.map(row => [
              <span className="font-bold">{row.time}</span>,
              <span className="font-bold">{row.mailboxProvider}</span>,
              <span className="font-mono text-[11px] leading-relaxed text-slate-500 dark:text-purple-300/70">{row.rawEvent}</span>,
              formatInt(row.count),
            ])}
            sum={deferredRawRowsScoped.reduce((sum, row) => sum + row.count, 0)}
          />
        </Panel>
      </LazyDeliverabilityPanel>
    </div>
  );
}
