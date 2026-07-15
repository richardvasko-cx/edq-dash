import { useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CheckCircle2, Lock, Search } from 'lucide-react';
import { cn } from '../../App';
import { md3Ease, md3Enter } from '../../lib/md3Motion';
import { AiPanelContext } from '../../contexts/AiPanel';
import GeminiIcon from '../GeminiIcon';
import type { ResourceFilters } from '../charts/MetricsFilterTypes';
import type { DateRange } from '../charts/DateRangeControl';
import { aggregate, type HistoricalMetricRecord } from '../../services/historicalMetricsDataset';
import { DELIVERABILITY_BENCHMARKS } from '../../services/deliverabilityBenchmarks';

export type EmailPerformanceSubview = 'overview' | 'audience' | 'campaigns';
export type EmailPerformancePanelKey =
  | 'performanceTrend'
  | 'recipientResponse'
  | 'engagementTrend'
  | 'receiverTrend';

type MetricTone = 'positive' | 'negative' | 'neutral' | 'warning';
type PanelTheme = 'dark' | 'light';
type SeriesKey =
  | 'sent'
  | 'confirmedOpens'
  | 'uniqueClicks'
  | 'confirmedOpenRate'
  | 'clickThroughRate'
  | 'clickToOpenRate'
  | 'complaintRate'
  | 'unsubscribeRate'
  | 'inboxFolderRate'
  | 'movedToSpamRate';

const BRAZE_ORANGE_LIGHT = '#FFD4BC';
const BRAZE_ORANGE = '#FFA524';
const BRAZE_PINK_LIGHT = '#F8D3E8';
const BRAZE_PINK = '#FFA4FB';
const BRAZE_PURPLE_LIGHT = '#C9C4FF';
const BRAZE_PURPLE = '#801ED7';
const GRID = '#4A2A82';

const intFmt = new Intl.NumberFormat('en-GB');
const compactFmt = new Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 });

const subviews: Array<{ id: EmailPerformanceSubview; label: string; soon?: boolean }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'audience', label: 'Audience & Engagement' },
  { id: 'campaigns', label: 'Campaigns & Canvases', soon: true },
];

const SERIES: Record<SeriesKey, { label: string; kind: 'count' | 'rate'; color: string; type: 'bar' | 'line' | 'area' }> = {
  sent: { label: 'Sent', kind: 'count', color: BRAZE_PURPLE, type: 'bar' },
  confirmedOpens: { label: 'Confirmed Unique Opens', kind: 'count', color: BRAZE_ORANGE, type: 'bar' },
  uniqueClicks: { label: 'Unique Clicks', kind: 'count', color: BRAZE_PINK, type: 'bar' },
  confirmedOpenRate: { label: 'Confirmed Open Rate', kind: 'rate', color: BRAZE_PINK, type: 'line' },
  clickThroughRate: { label: 'Click-through Rate', kind: 'rate', color: BRAZE_ORANGE_LIGHT, type: 'line' },
  clickToOpenRate: { label: 'Click-to-open Rate', kind: 'rate', color: BRAZE_PURPLE_LIGHT, type: 'line' },
  complaintRate: { label: 'Spam Complaint Rate', kind: 'rate', color: '#FF6D7A', type: 'line' },
  unsubscribeRate: { label: 'Unsubscribe Rate', kind: 'rate', color: '#FFB74D', type: 'line' },
  inboxFolderRate: { label: 'Inbox Folder Rate', kind: 'rate', color: '#66BB6A', type: 'line' },
  movedToSpamRate: { label: 'Moved to Spam Rate', kind: 'rate', color: '#FF5252', type: 'line' },
};

const metricToSeries: Record<string, SeriesKey> = {
  count_sent: 'sent',
  count_nonprefetched_unique_confirmed_opened: 'confirmedOpens',
  count_unique_clicked: 'uniqueClicks',
  nonprefetched_open_rate: 'confirmedOpenRate',
  click_through_rate: 'clickThroughRate',
  spam_complaint_rate: 'complaintRate',
  unsubscribe_rate: 'unsubscribeRate',
  inbox_folder_rate: 'inboxFolderRate',
  moved_to_spam_rate: 'movedToSpamRate',
};

export const EMAIL_PANEL_METRICS: Record<EmailPerformancePanelKey, string[]> = {
  performanceTrend: [
    'count_sent',
    'count_nonprefetched_unique_confirmed_opened',
    'count_unique_clicked',
    'nonprefetched_open_rate',
    'click_through_rate',
    'spam_complaint_rate',
    'unsubscribe_rate',
    'inbox_folder_rate',
  ],
  recipientResponse: [
    'count_unique_clicked',
    'unsubscribe_rate',
    'spam_complaint_rate',
    'moved_to_spam_rate',
    'click_through_rate',
  ],
  engagementTrend: [
    'count_nonprefetched_unique_confirmed_opened',
    'count_unique_clicked',
    'nonprefetched_open_rate',
    'click_through_rate',
  ],
  receiverTrend: [
    'nonprefetched_open_rate',
    'click_through_rate',
    'spam_complaint_rate',
  ],
};

export const EMAIL_PANEL_TITLES: Record<EmailPerformancePanelKey, string> = {
  performanceTrend: 'Email performance over time',
  recipientResponse: 'Recipient response over time',
  engagementTrend: 'Engagement quality over time',
  receiverTrend: 'Receiver trend comparison',
};

function number(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return 'Not available';
  return intFmt.format(Math.round(value));
}

function compact(value: number) {
  return compactFmt.format(Math.round(value));
}

function rate(value: number | null | undefined, digits = 1) {
  if (value == null || !Number.isFinite(value)) return 'Not available';
  return `${(value * 100).toFixed(digits)}%`;
}

function safeRatio(numerator: number, denominator: number) {
  return denominator > 0 ? numerator / denominator : null;
}

function sum<K extends keyof HistoricalMetricRecord>(rows: HistoricalMetricRecord[], key: K) {
  return rows.reduce((total, row) => total + (typeof row[key] === 'number' ? row[key] as number : 0), 0);
}

function uniqueDays(rows: HistoricalMetricRecord[]) {
  return new Set(rows.map(row => row.metric_date)).size;
}

function formatShortDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

function inRange(rows: HistoricalMetricRecord[], range: DateRange, filters: ResourceFilters) {
  const match = (value: string, selected: string[]) => selected.length === 0 || selected.includes(value);
  return rows.filter(row =>
    (!range.from || row.metric_date >= range.from) &&
    (!range.to || row.metric_date <= range.to) &&
    match(row.sending_ip, filters.sendingIps) &&
    match(row.sending_domain, filters.sendingDomains) &&
    match(row.recipient_domain, filters.recipientDomains) &&
    match(row.ip_pool, filters.ipPools) &&
    match(row.mailbox_provider, filters.mailboxProviders) &&
    match(row.campaign, filters.campaigns) &&
    match(row.subaccount, filters.subaccounts)
  );
}

function previousRange(range: DateRange): DateRange {
  if (!range.from || !range.to) return { from: '', to: '' };
  const from = new Date(`${range.from}T00:00:00`);
  const to = new Date(`${range.to}T00:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return { from: '', to: '' };
  const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1);
  const end = new Date(from);
  end.setDate(end.getDate() - 1);
  const start = new Date(end);
  start.setDate(end.getDate() - days + 1);
  const iso = (date: Date) => date.toISOString().slice(0, 10);
  return { from: iso(start), to: iso(end) };
}

function trailingWeekRange(rows: HistoricalMetricRecord[], endDate: string) {
  const availableDates = [...new Set(rows.map(row => row.metric_date))].sort();
  const end = endDate || availableDates.at(-1) || '';
  if (!end) return { from: '', to: '' };
  const endIndex = availableDates.lastIndexOf(end);
  const startIndex = Math.max(0, endIndex - 6);
  return { from: availableDates[startIndex] || end, to: end };
}

type ComparisonState = {
  available: boolean;
  currentDays: number;
  previousDays: number;
  reason?: string;
};

function comparisonState(currentRows: HistoricalMetricRecord[], previousRows: HistoricalMetricRecord[], range: DateRange): ComparisonState {
  const currentDays = uniqueDays(currentRows);
  const previousDays = uniqueDays(previousRows);
  if (!range.from || !range.to) return { available: false, currentDays, previousDays, reason: 'No complete selected date range' };
  if (!previousRows.length) return { available: false, currentDays, previousDays, reason: 'No previous-period data' };
  if (currentDays > 0 && previousDays < currentDays * 0.8) return { available: false, currentDays, previousDays, reason: 'Previous period is incomplete' };
  return { available: true, currentDays, previousDays };
}

function formatComparison(current: number | null, previous: number | null, kind: 'rate' | 'count', comparison: ComparisonState) {
  if (!comparison.available || current == null || previous == null || !Number.isFinite(current) || !Number.isFinite(previous)) {
    return 'Comparison unavailable';
  }
  if (kind === 'rate') {
    const points = (current - previous) * 100;
    return `${points >= 0 ? '+' : ''}${points.toFixed(1)} pp vs prior period`;
  }
  if (previous <= 0) return 'No prior volume';
  const percent = ((current - previous) / previous) * 100;
  return `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}% vs prior period`;
}

function periodChange(current: number | null, previous: number | null, comparison: ComparisonState) {
  if (!comparison.available || current == null || previous == null || !Number.isFinite(current) || !Number.isFinite(previous)) {
    return null;
  }
  if (previous === 0) return current > 0 ? 1 : 0;
  return (current - previous) / previous;
}

function wowDiffElement(wowDiff: number | null | undefined, inverse = false) {
  if (wowDiff == null || Number.isNaN(wowDiff)) return null;
  const isZero = Math.abs(wowDiff) < 0.0005;
  const color = isZero
    ? 'text-[#FFA726]'
    : wowDiff > 0
      ? inverse ? 'text-[#FF5252]' : 'text-[#66BB6A]'
      : inverse ? 'text-[#66BB6A]' : 'text-[#FF5252]';
  const icon = isZero ? 'trending_flat' : wowDiff > 0 ? 'trending_up' : 'trending_down';
  const text = isZero ? '0.0% WoW' : `${wowDiff > 0 ? '+' : ''}${(wowDiff * 100).toFixed(1)}% WoW`;
  return (
    <div className={cn('mt-1.5 flex items-center gap-0.5 text-[11.5px] font-extrabold', color)}>
      <span className="material-symbols-outlined text-[15px] font-extrabold leading-none">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

type TrendRow = {
  date: string;
  label: string;
  sent: number;
  accepted: number;
  confirmedOpens: number;
  uniqueClicks: number;
  complaints: number;
  unsubscribes: number;
  movedToSpam: number;
  confirmedOpenRate: number | null;
  clickThroughRate: number | null;
  clickToOpenRate: number | null;
  complaintRate: number | null;
  unsubscribeRate: number | null;
  inboxFolderRate: number | null;
  movedToSpamRate: number | null;
  issueMarker: boolean;
};

function buildTrendRows(rows: HistoricalMetricRecord[]): TrendRow[] {
  const grouped = new Map<string, HistoricalMetricRecord[]>();
  for (const row of rows) {
    grouped.set(row.metric_date, [...(grouped.get(row.metric_date) ?? []), row]);
  }
  return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, dayRows]) => {
    const sent = sum(dayRows, 'count_sent');
    const accepted = sum(dayRows, 'count_accepted');
    const confirmedOpens = sum(dayRows, 'count_nonprefetched_unique_confirmed_opened');
    const uniqueClicks = sum(dayRows, 'count_unique_clicked');
    const complaints = sum(dayRows, 'count_spam_complaint');
    const unsubscribes = sum(dayRows, 'count_unsubscribe');
    const movedToSpam = sum(dayRows, 'count_moved_to_spam');
    const inbox = sum(dayRows, 'count_inbox');
    const spam = sum(dayRows, 'count_spam');
    return {
      date,
      label: formatShortDate(date),
      sent,
      accepted,
      confirmedOpens,
      uniqueClicks,
      complaints,
      unsubscribes,
      movedToSpam,
      confirmedOpenRate: safeRatio(confirmedOpens, accepted),
      clickThroughRate: safeRatio(uniqueClicks, accepted),
      clickToOpenRate: safeRatio(uniqueClicks, confirmedOpens),
      complaintRate: safeRatio(complaints, accepted),
      unsubscribeRate: safeRatio(unsubscribes, accepted),
      inboxFolderRate: safeRatio(inbox, inbox + spam),
      movedToSpamRate: safeRatio(movedToSpam, accepted),
      issueMarker: dayRows.some(row => row.is_incident_marker),
    };
  });
}

function normaliseSeries(selectedMetrics: string[]) {
  const mapped = selectedMetrics.map(metric => metricToSeries[metric]).filter(Boolean) as SeriesKey[];
  return [...new Set(mapped)];
}

function panelSeries(panelKey: EmailPerformancePanelKey, selectedMetrics: string[]) {
  const allowed = new Set(EMAIL_PANEL_METRICS[panelKey]);
  const selected = selectedMetrics.filter(metric => allowed.has(metric));
  return normaliseSeries(selected);
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-purple-300/20 px-6 text-center">
      <p className="text-[15px] font-black text-purple-100">{title}</p>
      <p className="mt-1 max-w-md text-[12px] font-semibold text-purple-100/65">{body}</p>
    </div>
  );
}

function AnalyticsPanel({
  title,
  theme = 'light',
  actions,
  children,
  className,
  delay = 0,
  gemContent,
  includeGem = true,
}: {
  title: string;
  theme?: PanelTheme;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
  gemContent?: string;
  includeGem?: boolean;
}) {
  const dark = theme === 'dark';
  return (
    <motion.section
      {...md3Enter}
      transition={{ duration: 0.36, delay, ease: md3Ease }}
      className={cn(
        'relative overflow-hidden rounded-2xl border shadow-none',
        dark
          ? 'border-purple-300/10 bg-[#300266]'
          : 'border-outline-variant/10 bg-[#F4F6FC] dark:bg-[#1E1C21]',
        className
      )}
      {...(includeGem ? {
        'data-gem-panel': true,
        'data-gem-panel-label': title,
        'data-gem-panel-content': gemContent ?? title,
      } : {})}
    >
      <header className={cn('flex items-center justify-between gap-4 border-b px-5 py-4', dark ? 'border-purple-300/10' : 'border-purple-200/40 dark:border-purple-300/10')}>
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <h3 className={cn('truncate text-[17px] font-black tracking-normal', dark ? 'text-purple-100' : 'text-[#300266] dark:text-purple-100')}>{title}</h3>
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{actions}</div>}
      </header>
      <div className="p-5">{children}</div>
    </motion.section>
  );
}

function MetricTile({
  label,
  value,
  wowDiff,
  inverse = false,
  onClick,
}: {
  label: string;
  value: string;
  wowDiff?: number | null;
  inverse?: boolean;
  onClick?: () => void;
}) {
  const valueSize = value.length > 11
    ? 'text-[15px] md:text-[17px] xl:text-[19px]'
    : value.length > 8
      ? 'text-[18px] md:text-[20px] xl:text-[22px]'
      : 'text-[22px] md:text-[25px]';
  const comparison = useMemo(() => wowDiffElement(wowDiff, inverse), [inverse, wowDiff]);

  const content = (
    <>
      <p className={cn('mb-1.5 w-full max-w-full truncate font-black tabular-nums leading-none tracking-normal text-[#FFA4FB]', valueSize)} title={value}>{value}</p>
      <p className="max-w-full break-words text-[12px] font-bold leading-tight text-[#FFD4BC] sm:text-[13px]">{label}</p>
      {comparison}
    </>
  );
  // Match the Deliverability KPI cards exactly: the delta remains a dedicated
  // third row, so every square keeps the same visual rhythm.
  const className = 'min-h-[110px] min-w-0 overflow-hidden rounded-2xl border border-purple-300/10 bg-[#300266] px-3 py-4 text-center shadow-none flex flex-col items-center justify-center';

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={className}
        data-gem-panel
        data-gem-panel-label={label}
        data-gem-panel-content={`${label}: ${value}`}
      >
        {content}
      </button>
    );
  }
  return (
    <div
      className={className}
      data-gem-panel
      data-gem-panel-label={label}
      data-gem-panel-content={`${label}: ${value}`}
    >
      {content}
    </div>
  );
}

function SmallSignal({
  label,
  value,
  detail,
  wowDiff,
  tone = 'neutral',
  inverse = false,
  onClick,
}: {
  label: string;
  value: string;
  detail?: string;
  wowDiff?: number | null;
  tone?: MetricTone;
  inverse?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <p className="truncate text-[11px] font-black uppercase tracking-wide text-on-surface-variant">{label}</p>
      <p className={cn('mt-1 truncate text-[16px] font-black tabular-nums', tone === 'negative' ? 'text-[#B3261E]' : tone === 'positive' ? 'text-[#137333]' : tone === 'warning' ? 'text-[#B06000]' : 'text-on-surface dark:text-inverse-on-surface')} title={value}>{value}</p>
      {wowDiffElement(wowDiff, inverse)}
      {detail && <p className="mt-1 text-[11px] font-semibold leading-snug text-on-surface-variant">{detail}</p>}
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="border-l-2 border-transparent px-3 py-2 text-left transition-colors hover:border-primary hover:bg-primary/5">
        {content}
      </button>
    );
  }
  return <div className="border-l-2 border-outline-variant/25 px-3 py-2">{content}</div>;
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-purple-300/15 bg-[#20113D] px-3 py-2 text-[12px] shadow-[0_12px_36px_rgba(0,0,0,0.28)]">
      <p className="mb-1 font-black text-purple-100">{label}</p>
      <div className="space-y-1">
        {payload.map((entry: any) => {
          const def = SERIES[entry.dataKey as SeriesKey];
          if (!def) return null;
          return (
            <p key={entry.dataKey} className="flex items-center gap-2 font-semibold text-purple-100/80">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: def.color }} />
              <span>{def.label}: {def.kind === 'rate' ? rate(entry.value) : number(entry.value)}</span>
            </p>
          );
        })}
      </div>
    </div>
  );
}

function MixedMetricChart({ rows, series, height = 330 }: { rows: TrendRow[]; series: SeriesKey[]; height?: number }) {
  if (!rows.length) return <EmptyState title="No performance data" body="No qualifying email metrics were found for the selected scope." />;
  if (!series.length) return <EmptyState title="No selected metrics" body="Use Metrics & filters to select a metric supported by this panel." />;
  const activeSeries = series;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 8, right: 18, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: BRAZE_PINK_LIGHT, fontSize: 11, fontWeight: 700 }} />
          <YAxis yAxisId="count" axisLine={false} tickLine={false} tickFormatter={(value: number) => compact(value)} tick={{ fill: BRAZE_PINK_LIGHT, fontSize: 11, fontWeight: 700 }} />
          <YAxis yAxisId="rate" orientation="right" domain={[0, 'auto']} axisLine={false} tickLine={false} tickFormatter={(value: number) => `${Math.round(value * 100)}%`} tick={{ fill: BRAZE_PINK_LIGHT, fontSize: 11, fontWeight: 700 }} />
          <Tooltip content={<ChartTooltip />} />
          {activeSeries.map(key => {
            const def = SERIES[key];
            if (def.type === 'bar') {
              return <Bar key={key} yAxisId="count" dataKey={key} name={def.label} fill={def.color} radius={[5, 5, 0, 0]} maxBarSize={42} />;
            }
            return <Line key={key} yAxisId="rate" type="monotone" dataKey={key} name={def.label} stroke={def.color} strokeWidth={3} dot={false} connectNulls={false} />;
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function PanelMetricAction({ count, onClick, dark = false }: { count: number; onClick: () => void; dark?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative inline-flex h-10 min-w-[58px] items-center justify-center gap-1.5 rounded-full px-3 transition-colors md3-state-layer',
        dark
          ? 'bg-white/10 text-purple-100 hover:bg-white/15'
          : 'bg-white text-[#4D4D57] hover:bg-[#E8F0FE] hover:text-[#1a73e8] dark:bg-white/10 dark:text-inverse-on-surface'
      )}
      aria-label="Panel metrics and filters"
    >
      <SlidersHorizontalIcon />
      {count > 0 && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#801ED7] px-1.5 text-[10px] font-black leading-none text-white">
          {count}
        </span>
      )}
    </button>
  );
}

function SlidersHorizontalIcon() {
  return <span className="material-symbols-outlined text-[18px] leading-none">tune</span>;
}

function ReachFunnel({ currentRows }: { currentRows: HistoricalMetricRecord[] }) {
  const ctx = useContext(AiPanelContext);
  const current = aggregate(currentRows);
  const targeted = sum(currentRows, 'count_targeted');
  const sent = sum(currentRows, 'count_sent');
  const accepted = sum(currentRows, 'count_accepted');
  const opens = sum(currentRows, 'count_nonprefetched_unique_confirmed_opened');
  const clicks = sum(currentRows, 'count_unique_clicked');
  const stages = [
    { label: 'Targeted', value: targeted, conversion: null, color: '#300266', why: 'Eligible audience before send-time exclusions.', next: 'Review targeting and suppression rules if sent volume is materially lower.' },
    { label: 'Sent', value: sent, conversion: safeRatio(sent, targeted), color: '#801ED7', why: 'People can be excluded by eligibility, suppression, frequency caps, or campaign rules.', next: 'Compare the targeted and sent audience definitions.' },
    { label: 'Accepted', value: accepted, conversion: safeRatio(accepted, sent), color: '#B9186E', why: 'Loss here reflects mailbox rejection or deferral at delivery time.', next: 'Inspect receiver, authentication, and bounce or deferral signals.' },
    { label: 'Confirmed opens', value: opens, conversion: safeRatio(opens, accepted), color: '#E978F1', why: 'No confirmed open is not a delivery failure; it can reflect inbox placement, timing, or audience relevance.', next: 'Compare placement, engaged cohorts, and subject-line performance.' },
    { label: 'Unique clicks', value: clicks, conversion: safeRatio(clicks, opens), color: '#FFA524', why: 'Click loss reflects the message and call-to-action experience after an open.', next: 'Review the offer, link placement, and call-to-action clarity.' },
  ];
  const [selectedStage, setSelectedStage] = useState(2);
  const selected = stages[selectedStage];
  const prior = selectedStage > 0 ? stages[selectedStage - 1] : null;
  const retained = selected.conversion ?? 1;
  const lost = prior ? Math.max(0, prior.value - selected.value) : 0;
  const stageContext = `${prior ? `${prior.label}: ${number(prior.value)}; ` : ''}${selected.label}: ${number(selected.value)}; ${prior ? `${number(lost)} people did not progress; retention ${rate(retained)}.` : 'Starting audience.'}`;
  const askGemini = () => {
    ctx.openPill(
      `Explain the ${selected.label.toLowerCase()} transition in this Braze email performance funnel. ${stageContext} Full funnel: targeted ${number(targeted)}, sent ${number(sent)}, accepted ${number(accepted)}, confirmed opens ${number(opens)}, unique clicks ${number(clicks)}. Keep the answer grounded in the current metrics and tell me what to check next.`,
      `${selected.label} · funnel transition`
    );
  };
  const summaryTitle = prior
    ? `${compact(lost)} people did not progress from ${prior.label.toLowerCase()} to ${selected.label.toLowerCase()}`
    : `${compact(selected.value)} people entered the measured funnel`;
  const evidence = prior
    ? selected.label === 'Accepted'
      ? `${rate(current.acceptedRate)} of sent mail was accepted. Loss here sits in the receiver hand-off, before placement or engagement is known.`
      : selected.label === 'Confirmed opens'
        ? `${rate(retained)} of accepted mail produced a confirmed open. This is the first stage where placement, timing, and audience fit materially shape the result.`
        : selected.label === 'Unique clicks'
          ? `${rate(retained)} of confirmed openers clicked. This transition reflects post-open message relevance and call-to-action strength.`
          : `${rate(retained)} of the prior stage progressed to ${selected.label.toLowerCase()}.`
    : 'This is the eligible audience before send-time exclusions, suppression rules, and campaign gating are applied.';
  const limitation = selected.label === 'Accepted'
    ? 'Accepted volume does not tell you inbox versus spam placement, or whether users engaged afterward.'
    : selected.label === 'Confirmed opens'
      ? 'A missing confirmed open is not proof of a delivery failure. It can also reflect inbox visibility, timing, or audience quality.'
      : selected.label === 'Unique clicks'
        ? 'Click loss does not prove a delivery problem. It only shows that fewer recipients acted after the open.'
        : 'Targeted volume alone does not show how much of the audience could actually be mailed.';
  const nextCheck = selected.label === 'Accepted'
    ? 'Next check: compare bounce, deferral, and authentication evidence in Deliverability.'
    : selected.label === 'Confirmed opens'
      ? `Next check: compare ${current.inbox + current.spam > 0 ? `${rate(current.inboxFolderRate)} inbox placement in the measured sample` : 'placement evidence'} against receiver-specific open rates.`
      : selected.label === 'Unique clicks'
        ? `Next check: review click-through ${rate(current.clickThroughRate)} against click-to-open ${rate(safeRatio(clicks, opens))} to separate open interest from post-open drop-off.`
        : 'Next check: validate the targeted-to-sent gap before interpreting downstream engagement.';

  return <div className="space-y-4">
    <div className="grid gap-3 rounded-[18px] border border-[#E2D6F2] bg-[#FCFAFF] p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
      <div>
        <p className="text-[16px] font-black text-[#302A36]">{summaryTitle}</p>
        <p className="mt-1 text-[12px] leading-relaxed text-[#716A78]">{evidence}</p>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="rounded-full border border-[#E3D7F6] bg-[#F8F4FF] px-3 py-1.5 text-[11px] font-bold text-[#5A2E96]">{rate(safeRatio(clicks, targeted))} from targeted to click</span>
        <button
          type="button"
          onClick={askGemini}
          className="relative flex h-8 items-center gap-1.5 rounded-full bg-[#E8F0FE] px-3.5 text-[13px] font-bold text-[#1A73E8] transition-all hover:bg-[#D2E3FC] active:scale-[0.97]"
        >
          <GeminiIcon className="h-4 w-4 shrink-0" />
          <span>Ask Gemini</span>
        </button>
      </div>
    </div>
    <div className="overflow-x-auto pb-1 no-scrollbar"><div className="flex min-w-[820px] items-stretch rounded-[18px] border border-[#E2D6F2] bg-[#FCFAFF] px-2 py-2">
      {stages.map((stage, index) => <div key={stage.label} className="flex min-w-0 flex-1 items-center gap-1.5">
        <button type="button" onClick={() => setSelectedStage(index)} aria-pressed={selectedStage === index} className={cn('min-w-0 flex-1 rounded-[13px] bg-transparent p-3 text-left transition-colors duration-150 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#C9C4FF]', selectedStage === index ? 'bg-white' : 'hover:bg-white/75')}>
          <div className="h-2 rounded-full bg-[#F2ECF8]"><motion.div animate={{ width: `${Math.max(18, Math.round((stage.value / Math.max(targeted, 1)) * 100))}%` }} transition={{ type: 'spring', stiffness: 180, damping: 22 }} className="h-full rounded-full" style={{ backgroundColor: stage.color }} /></div>
          <p className="mt-3 text-[11px] font-bold text-[#716A78]">{stage.label}</p><p className="mt-1 text-[22px] font-black tabular-nums text-[#300266]">{compact(stage.value)}</p><p className="mt-1 text-[11px] font-semibold text-[#716A78]">{index === 0 ? 'Starting audience' : `${rate(stage.conversion)} retained`}</p>
        </button>
        {index < stages.length - 1 && <div className="flex w-[42px] shrink-0 flex-col items-center gap-1"><span className="h-px w-full bg-[#C9B8E5]" /><span className="text-[10px] font-bold text-[#9A78C2]">{compact(Math.max(0, stage.value - stages[index + 1].value))}</span></div>}
      </div>)}
    </div></div>
    <motion.div layout className="grid gap-3 rounded-[18px] border border-[#DED0F4] bg-[#FCFAFF] p-4 md:grid-cols-3">
      <div className="rounded-[16px] bg-white px-4 py-4">
        <p className="text-[11px] font-black text-[#6750A4]">What this establishes</p>
        <p className="mt-2 text-[13px] leading-relaxed text-[#4F4856]">{evidence}</p>
      </div>
      <div className="rounded-[16px] bg-white px-4 py-4">
        <p className="text-[11px] font-black text-[#6750A4]">What it does not establish</p>
        <p className="mt-2 text-[13px] leading-relaxed text-[#4F4856]">{limitation}</p>
      </div>
      <div className="rounded-[16px] bg-white px-4 py-4">
        <p className="text-[11px] font-black text-[#6750A4]">Best next check</p>
        <p className="mt-2 text-[13px] leading-relaxed text-[#4F4856]">{nextCheck}</p>
      </div>
    </motion.div>
  </div>;
}

function AssessmentPanel({
  currentRows,
  previousRows,
  comparison,
}: {
  currentRows: HistoricalMetricRecord[];
  previousRows: HistoricalMetricRecord[];
  comparison: ComparisonState;
}) {
  const current = aggregate(currentRows);
  const previous = aggregate(previousRows);
  const receivers = receiverGroups(currentRows);
  const weakestReceiver = receivers[0];
  const hasReceiverConcentration = Boolean(weakestReceiver && weakestReceiver.metrics.sent > current.sent * 0.12 && weakestReceiver.metrics.confirmedOpenRate + 0.02 < current.confirmedOpenRate);
  const areas = [
    { name: 'Delivery', metric: rate(current.acceptedRate), status: current.acceptedRate < DELIVERABILITY_BENCHMARKS.deliveryRate.healthy ? 'Needs attention' : 'Stable', observation: `${rate(current.delayedRate)} deferred and ${rate(current.bounceRate)} bounced in the selected scope.`, interpretation: 'This is mailbox hand-off. The source-backed operating target is around 99%; it does not, on its own, identify an inbox-placement or content problem.', action: 'Compare deferrals and bounces by mailbox provider before changing send volume.', color: '#801ED7' },
    { name: 'Placement', metric: current.inbox + current.spam > 0 ? rate(current.inboxFolderRate) : 'No sample', status: current.inbox + current.spam === 0 ? 'Unmeasured' : 'Contextual', observation: current.inbox + current.spam > 0 ? `${rate(current.spamFolderRate)} of the measured sample reached spam.` : 'No inbox or spam placement sample is available for this filter scope.', interpretation: 'Placement data represents a measured sample, not all accepted messages. No universal placement pass/fail threshold is applied.', action: 'Compare against the provider and campaign baseline before making inboxing or content conclusions.', color: '#B9186E' },
    { name: 'Engagement', metric: rate(current.confirmedOpenRate), status: 'Contextual', observation: `${rate(current.clickThroughRate)} click-through and ${rate(current.unsubscribeRate)} unsubscribe rate.`, interpretation: 'Confirmed opens exclude privacy-prefetched activity. The >25% open signal applies to IP warming only, so engagement is compared with a like-for-like campaign baseline.', action: 'Compare engaged cohorts, subject lines, and call-to-action performance.', color: '#E978F1' },
    { name: 'Receiver focus', metric: weakestReceiver?.provider ?? 'No receiver', status: hasReceiverConcentration ? 'Needs attention' : 'Stable', observation: hasReceiverConcentration && weakestReceiver ? `${weakestReceiver.provider} is below the account confirmed-open baseline.` : 'No mailbox provider is materially below the account confirmed-open baseline.', interpretation: 'Receiver differences help separate broad audience effects from provider-specific behaviour.', action: hasReceiverConcentration ? `Inspect ${weakestReceiver?.provider} separately for cadence, placement, and authentication.` : 'Monitor receiver performance as campaign volume changes.', color: '#FFA524' },
  ];
  const [selectedArea, setSelectedArea] = useState(0);
  const selected = areas[selectedArea];
  const comparisonContext = comparison.available
    ? `Prior period: confirmed opens ${formatComparison(current.confirmedOpenRate, previous.confirmedOpenRate, 'rate', comparison).toLowerCase()}.`
    : null;

  return <div className="space-y-4">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[13px] font-black text-[#302A36]">Assessment matrix</p><p className="mt-0.5 text-[12px] text-[#716A78]">Select a row to review the observed metric, its limits, and the next investigation.</p></div>{comparisonContext && <p className="max-w-[380px] text-right text-[11px] leading-relaxed text-[#716A78]">{comparisonContext}</p>}</div>
    <div className="overflow-x-auto rounded-[18px] border border-[#E2D6F2] bg-white"><div className="min-w-[760px]">
      <div className="grid grid-cols-[150px_130px_145px_minmax(220px,1fr)_minmax(240px,1.15fr)] border-b border-[#EAE4F2] bg-[#FCFAFF] px-4 py-2.5 text-[11px] font-bold text-[#6750A4]"><span>Area</span><span>Observed</span><span>State</span><span>Evidence</span><span>Recommended next move</span></div>
      {areas.map((area, index) => <button key={area.name} type="button" onClick={() => setSelectedArea(index)} className={cn('grid w-full grid-cols-[150px_130px_145px_minmax(220px,1fr)_minmax(240px,1.15fr)] items-center border-b border-[#F0EBF6] px-4 py-3 text-left transition-colors last:border-b-0', selectedArea === index ? 'bg-[#FBF8FF]' : 'hover:bg-[#FCFBFE]')}><span className="flex items-center gap-2 text-[13px] font-black text-[#302A36]"><span className="h-7 w-1 rounded-full" style={{ backgroundColor: area.color }} />{area.name}</span><span className="text-[17px] font-black text-[#300266]">{area.metric}</span><span><span className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold', area.status === 'Stable' ? 'bg-[#E7F5EC] text-[#137333]' : area.status === 'Unmeasured' || area.status === 'Contextual' ? 'bg-[#F1F3F4] text-[#5F6368]' : 'bg-[#FDE8E7] text-[#B3261E]')}>{area.status}</span></span><span className="pr-5 text-[11.5px] leading-relaxed text-[#5F5966]">{area.observation}</span><span className="text-[11.5px] leading-relaxed text-[#5F5966]">{area.action}</span></button>)}
    </div></div>
    <motion.div layout className="grid gap-3 rounded-[18px] border border-[#DED0F4] bg-[#FCFAFF] p-4 md:grid-cols-[150px_minmax(0,1fr)_minmax(0,1fr)]"><div><span className="block h-2 w-12 rounded-full" style={{ backgroundColor: selected.color }} /><p className="mt-3 text-[14px] font-black text-[#302A36]">{selected.name}</p><p className="mt-1 text-[12px] font-semibold text-[#6750A4]">{selected.metric} observed</p></div><div><p className="text-[11px] font-bold text-[#6750A4]">How to read this</p><p className="mt-1.5 text-[12px] leading-relaxed text-[#5F5966]">{selected.interpretation}</p></div><div><p className="text-[11px] font-bold text-[#6750A4]">Next investigation</p><p className="mt-1.5 text-[12px] leading-relaxed text-[#5F5966]">{selected.action}</p></div></motion.div>
  </div>;
}

function ComingSoonPanel() {
  return (
    <section className="flex min-h-[108px] items-center justify-between gap-4 rounded-2xl border border-outline-variant/15 bg-[#ECEFF3] px-5 py-4 text-on-surface-variant dark:bg-white/5">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/70 dark:bg-white/10">
          <Lock size={18} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-black text-on-surface dark:text-inverse-on-surface">Key Contributors</h3>
            <span className="rounded-full bg-on-surface/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide">Coming soon</span>
          </div>
          <p className="mt-1 max-w-3xl text-[12px] font-semibold">
            Campaign, Canvas, audience and content contribution analysis will appear here when the required data source is connected.
          </p>
        </div>
      </div>
    </section>
  );
}

function recipientResponseGem(currentRows: HistoricalMetricRecord[]) {
  return [
    `Unique clicks: ${number(sum(currentRows, 'count_unique_clicked'))}`,
    `Unsubscribes: ${number(sum(currentRows, 'count_unsubscribe'))}`,
    `Spam complaints: ${number(sum(currentRows, 'count_spam_complaint'))}`,
    `Moved to spam: ${number(sum(currentRows, 'count_moved_to_spam'))}`,
  ].join('. ');
}

function receiverGroups(rows: HistoricalMetricRecord[]) {
  const grouped = new Map<string, HistoricalMetricRecord[]>();
  rows.forEach(row => grouped.set(row.mailbox_provider || 'Other', [...(grouped.get(row.mailbox_provider || 'Other') ?? []), row]));
  const account = aggregate(rows);
  return [...grouped.entries()]
    .map(([provider, groupedRows]) => ({ provider, rows: groupedRows, metrics: aggregate(groupedRows) }))
    .filter(item => item.metrics.sent >= 100)
    .sort((a, b) => {
      const aGap = account.confirmedOpenRate - a.metrics.confirmedOpenRate;
      const bGap = account.confirmedOpenRate - b.metrics.confirmedOpenRate;
      return bGap - aGap || b.metrics.sent - a.metrics.sent;
    });
}

function receiverGroupMap(rows: HistoricalMetricRecord[]) {
  return new Map(receiverGroups(rows).map(item => [item.provider, item.metrics]));
}

type ReceiverTrendSeries = {
  key: string;
  provider: string;
  metric: SeriesKey;
  label: string;
  color: string;
  dash: string;
};

function receiverTrendSeries(providers: string[], metrics: SeriesKey[]): ReceiverTrendSeries[] {
  return metrics.flatMap(metric => providers.map((provider, providerIndex) => ({
    key: `${metric}:${provider}`,
    provider,
    metric,
    label: `${provider} - ${SERIES[metric].label}`,
    color: SERIES[metric].color,
    dash: RECEIVER_LINE_DASHES[providerIndex % RECEIVER_LINE_DASHES.length],
  })));
}

function buildReceiverTrendRows(rows: HistoricalMetricRecord[], series: ReceiverTrendSeries[]) {
  const dates = [...new Set(rows.map(row => row.metric_date))].sort();
  return dates.map(date => {
    const day: Record<string, string | number | null> = { date, label: formatShortDate(date) };
    for (const item of series) {
      const scoped = rows.filter(row => row.metric_date === date && row.mailbox_provider === item.provider);
      const metrics = aggregate(scoped);
      day[item.key] = scoped.length ? metrics[item.metric] : null;
    }
    return day;
  });
}

const RECEIVER_LINE_DASHES = ['', '9 5', '2 4', '12 4 2 4', '1 5', '14 5'];

function ReceiverTrendChart({ rows, providers, series }: { rows: HistoricalMetricRecord[]; providers: string[]; series: SeriesKey[] }) {
  const activeSeries = series.filter(key => SERIES[key]?.kind === 'rate');
  const lineSeries = useMemo(() => receiverTrendSeries(providers, activeSeries), [providers, activeSeries]);
  const chartRows = useMemo(() => buildReceiverTrendRows(rows, lineSeries), [rows, lineSeries]);
  if (!providers.length) return <EmptyState title="No receiver trend" body="Select at least one receiver group with sufficient volume." />;
  if (!activeSeries.length) return <EmptyState title="No selected metrics" body="Select a receiver metric in Metrics & filters to compare providers." />;
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2" aria-label={`Showing ${lineSeries.length} receiver metric series`}>
        {lineSeries.map(item => (
          <span key={item.key} className="inline-flex items-center gap-2 text-[11px] font-bold text-purple-100">
            <span
              aria-hidden="true"
              className="block h-0 w-5 border-t-[3px]"
              style={{
                borderColor: item.color,
                borderTopStyle: item.dash ? 'dashed' : 'solid',
              }}
            />
            {item.label}
          </span>
        ))}
      </div>
      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartRows} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: BRAZE_PINK_LIGHT, fontSize: 10, fontWeight: 700 }} />
            <YAxis axisLine={false} tickLine={false} domain={[0, 'auto']} tickFormatter={(value: number) => `${Math.round(value * 100)}%`} tick={{ fill: BRAZE_PINK_LIGHT, fontSize: 10, fontWeight: 700 }} width={38} />
            <Tooltip formatter={(value: number) => rate(value)} labelStyle={{ color: '#111' }} />
            {lineSeries.map(item => (
              <Line
                key={item.key}
                type="monotone"
                dataKey={item.key}
                name={item.label}
                stroke={item.color}
                strokeDasharray={item.dash || undefined}
                strokeWidth={2.5}
                dot={false}
                connectNulls={false}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Subnav({ view, onViewChange }: { view: EmailPerformanceSubview; onViewChange: (view: EmailPerformanceSubview) => void }) {
  return (
    <>
      {subviews.map(item => (
        <button
          key={item.id}
          type="button"
          onClick={() => !item.soon && onViewChange(item.id)}
          disabled={item.soon}
          title={item.soon ? 'Campaign- and Canvas-level performance data is not currently available.' : undefined}
          className={cn(
            'relative flex h-8 items-center gap-1.5 rounded-[100px] px-[12px] text-[13px] font-[500] transition-all duration-200 select-none whitespace-nowrap',
            view === item.id ? 'bg-[#E8F0FE] text-[#1A73E8] dark:bg-[#1A73E8]/20 dark:text-[#8AB4F8]' : 'text-[#5F6368] hover:bg-[rgba(60,64,67,0.06)] hover:text-[#202124] dark:text-white/70 dark:hover:bg-white/8 dark:hover:text-white',
            item.soon && 'cursor-not-allowed text-[#9AA0A6] pr-4 dark:text-white/55'
          )}
        >
          {item.label}
          {item.soon && (
            <span className="absolute -right-2 -top-2.5 rounded-full border border-white bg-[#F1F3F4] px-2 py-[3px] text-[8px] font-black uppercase tracking-wide text-[#9AA0A6] shadow-sm opacity-100 dark:border-[#28272E] dark:bg-[#3A3D46] dark:text-white/80">
              Coming soon
            </span>
          )}
        </button>
      ))}
    </>
  );
}

export function EmailPerformanceSubnav(props: { view: EmailPerformanceSubview; onViewChange: (view: EmailPerformanceSubview) => void }) {
  return <Subnav {...props} />;
}

export function EmailPerformanceDashboard({
  rows,
  range,
  filters,
  selectedMetrics,
  hiddenPanels,
  view,
  onViewChange,
  onOpenMetrics,
  toolbar,
}: {
  rows: HistoricalMetricRecord[];
  range: DateRange;
  filters: ResourceFilters;
  selectedMetrics: string[];
  hiddenPanels: Set<string>;
  view: EmailPerformanceSubview;
  onViewChange: (view: EmailPerformanceSubview) => void;
  onOpenMetrics?: (panelKey: EmailPerformancePanelKey) => void;
  toolbar?: ReactNode;
}) {
  const [receiverSearch, setReceiverSearch] = useState('');
  const [selectedReceivers, setSelectedReceivers] = useState<string[]>([]);
  const dashboardTopRef = useRef<HTMLDivElement | null>(null);

  // Mailbox-provider filtering is meaningful for receiver diagnostics only.
  // Account, audience, and campaign panels always retain the wider resource scope.
  const accountFilters = useMemo(() => ({ ...filters, mailboxProviders: [] }), [filters]);
  const currentRows = useMemo(() => inRange(rows, range, accountFilters), [rows, range, accountFilters]);
  const previousRows = useMemo(() => inRange(rows, previousRange(range), accountFilters), [rows, range, accountFilters]);
  const receiverRows = useMemo(() => inRange(rows, range, filters), [rows, range, filters]);
  const comparison = useMemo(() => comparisonState(currentRows, previousRows, range), [currentRows, previousRows, range]);
  // KPI WoW labels always compare the trailing complete week to the seven days
  // before it. This remains meaningful when the visible screen spans 30 days.
  const weeklyRange = useMemo(() => trailingWeekRange(rows, range.to), [rows, range.to]);
  const weeklyRows = useMemo(() => inRange(rows, weeklyRange, accountFilters), [rows, weeklyRange, accountFilters]);
  const weeklyPreviousRows = useMemo(() => inRange(rows, previousRange(weeklyRange), accountFilters), [rows, weeklyRange, accountFilters]);
  const tileComparison = useMemo<ComparisonState>(
    () => comparisonState(weeklyRows, weeklyPreviousRows, weeklyRange),
    [weeklyRows, weeklyPreviousRows, weeklyRange],
  );
  const current = useMemo(() => aggregate(currentRows), [currentRows]);
  const previous = useMemo(() => aggregate(previousRows), [previousRows]);
  const weekly = useMemo(() => aggregate(weeklyRows), [weeklyRows]);
  const weeklyPrevious = useMemo(() => aggregate(weeklyPreviousRows), [weeklyPreviousRows]);
  const trendRows = useMemo(() => buildTrendRows(currentRows), [currentRows]);
  const receivers = useMemo(() => receiverGroups(receiverRows), [receiverRows]);
  const defaultReceivers = useMemo(
    () => [...receivers]
      .sort((a, b) => b.metrics.sent - a.metrics.sent)
      .slice(0, 3)
      .map(item => item.provider),
    [receivers],
  );
  const explicitReceivers = selectedReceivers.filter(provider => receivers.some(item => item.provider === provider));
  const activeReceivers = explicitReceivers.length ? explicitReceivers : defaultReceivers;
  const filteredReceivers = receivers.filter(item => item.provider.toLowerCase().includes(receiverSearch.toLowerCase()));
  const opens = sum(currentRows, 'count_nonprefetched_unique_confirmed_opened');
  const clicks = sum(currentRows, 'count_unique_clicked');
  const complaints = sum(currentRows, 'count_spam_complaint');
  const unsubscribes = sum(currentRows, 'count_unsubscribe');
  const clickToOpenRate = safeRatio(clicks, opens);
  const weeklyClickToOpenRate = safeRatio(sum(weeklyRows, 'count_unique_clicked'), sum(weeklyRows, 'count_nonprefetched_unique_confirmed_opened'));
  const weeklyPreviousClickToOpenRate = safeRatio(sum(weeklyPreviousRows, 'count_unique_clicked'), sum(weeklyPreviousRows, 'count_nonprefetched_unique_confirmed_opened'));
  const panelVisible = (key: string, aliases: string[] = []) => ![key, ...aliases].some(alias => hiddenPanels.has(alias));
  const rangeLabel = range.from && range.to ? `${range.from} to ${range.to}` : `${uniqueDays(currentRows)}-day view`;
  const metricsFor = (panelKey: EmailPerformancePanelKey) => panelSeries(panelKey, selectedMetrics);
  const panelMetricCount = (panelKey: EmailPerformancePanelKey) => selectedMetrics.filter(metric => EMAIL_PANEL_METRICS[panelKey].includes(metric)).length;
  const panelActions = (panelKey: EmailPerformancePanelKey, dark = false) => (
    <PanelMetricAction count={panelMetricCount(panelKey)} dark={dark} onClick={() => onOpenMetrics?.(panelKey)} />
  );
  const changeView = (nextView: EmailPerformanceSubview) => {
    if (nextView === view) return;
    onViewChange(nextView);
    requestAnimationFrame(() => dashboardTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <div ref={dashboardTopRef} className="flex flex-col gap-6">
      {toolbar && (
        <motion.div
          className="sticky top-0 z-30 -mt-3 flex flex-wrap items-center justify-between gap-2 bg-transparent py-2.5 pointer-events-none"
          {...md3Enter}
          transition={{ duration: 0.34, ease: md3Ease }}
        >
          <div className="pointer-events-auto -my-2 shrink-0 px-2 py-2">
            <nav aria-label="Email Performance views" className="flex w-max items-center gap-[3px] overflow-visible rounded-[100px] border border-[rgba(218,220,224,0.8)] bg-white p-[6px] shadow-[0_4px_20px_rgba(32,33,36,0.08),0_1px_4px_rgba(32,33,36,0.04)] dark:border-white/[0.08] dark:bg-[#28272E]">
              <Subnav view={view} onViewChange={changeView} />
            </nav>
          </div>
          <div className="pointer-events-auto ml-auto flex shrink-0 items-center justify-end gap-2">
            {toolbar}
          </div>
        </motion.div>
      )}

      {view === 'campaigns' && <ComingSoonPanel />}

      {view === 'overview' && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            <MetricTile label="Sent" value={number(current.sent)} wowDiff={periodChange(weekly.sent, weeklyPrevious.sent, tileComparison)} onClick={() => onOpenMetrics?.('performanceTrend')} />
            <MetricTile label="Accepted" value={number(current.accepted)} wowDiff={periodChange(weekly.accepted, weeklyPrevious.accepted, tileComparison)} />
            <MetricTile label="Accepted Rate" value={rate(current.acceptedRate)} wowDiff={periodChange(weekly.acceptedRate, weeklyPrevious.acceptedRate, tileComparison)} />
            <MetricTile label="Confirmed Opens" value={number(opens)} wowDiff={periodChange(sum(weeklyRows, 'count_nonprefetched_unique_confirmed_opened'), sum(weeklyPreviousRows, 'count_nonprefetched_unique_confirmed_opened'), tileComparison)} onClick={() => onOpenMetrics?.('performanceTrend')} />
            <MetricTile label="Confirmed Open Rate" value={rate(current.confirmedOpenRate)} wowDiff={periodChange(weekly.confirmedOpenRate, weeklyPrevious.confirmedOpenRate, tileComparison)} onClick={() => onOpenMetrics?.('performanceTrend')} />
            <MetricTile label="Unique Clicks" value={number(clicks)} wowDiff={periodChange(sum(weeklyRows, 'count_unique_clicked'), sum(weeklyPreviousRows, 'count_unique_clicked'), tileComparison)} onClick={() => onOpenMetrics?.('recipientResponse')} />
            <MetricTile label="Click-through Rate" value={rate(current.clickThroughRate)} wowDiff={periodChange(weekly.clickThroughRate, weeklyPrevious.clickThroughRate, tileComparison)} onClick={() => onOpenMetrics?.('performanceTrend')} />
            <MetricTile label="Click-to-open Rate" value={rate(clickToOpenRate)} wowDiff={periodChange(weeklyClickToOpenRate, weeklyPreviousClickToOpenRate, tileComparison)} onClick={() => onOpenMetrics?.('engagementTrend')} />
            <MetricTile label="Unsubscribe Rate" value={rate(current.unsubscribeRate)} wowDiff={periodChange(weekly.unsubscribeRate, weeklyPrevious.unsubscribeRate, tileComparison)} inverse onClick={() => onOpenMetrics?.('recipientResponse')} />
            <MetricTile label="Spam Complaint Rate" value={rate(current.complaintRate, 2)} wowDiff={periodChange(weekly.complaintRate, weeklyPrevious.complaintRate, tileComparison)} inverse onClick={() => onOpenMetrics?.('recipientResponse')} />
            <MetricTile label="Inbox Rate" value={current.inbox + current.spam > 0 ? rate(current.inboxFolderRate) : 'Not available'} wowDiff={periodChange(weekly.inboxFolderRate, weeklyPrevious.inboxFolderRate, tileComparison)} />
            <MetricTile label="Bounce Rate" value={rate(current.bounceRate)} wowDiff={periodChange(weekly.bounceRate, weeklyPrevious.bounceRate, tileComparison)} inverse />
          </div>

          {panelVisible('performanceTrend', ['emailTrend']) && (
            <AnalyticsPanel
              title="Email performance over time"
              theme="dark"
              actions={panelActions('performanceTrend', true)}
              gemContent={`Email performance trend for ${rangeLabel}. ${compact(current.sent)} sent. Confirmed Open Rate ${rate(current.confirmedOpenRate)}. Click-through Rate ${rate(current.clickThroughRate)}.`}
            >
              <MixedMetricChart rows={trendRows} series={metricsFor('performanceTrend')} />
            </AnalyticsPanel>
          )}

          <div className="space-y-5">
            {panelVisible('funnel', ['engagementSummary']) && (
              <AnalyticsPanel title="Reach and engagement" theme="light" className="border-[#B79AEC] bg-white" gemContent={`Reach funnel: targeted ${number(current.targeted)}, sent ${number(current.sent)}, accepted ${number(current.accepted)}, confirmed opens ${number(opens)}, clicks ${number(clicks)}.`}>
                <ReachFunnel currentRows={currentRows} />
              </AnalyticsPanel>
            )}
            {panelVisible('assessment') && (
              <AnalyticsPanel title="Performance assessment" theme="light" className="border-[#B79AEC] bg-white" gemContent={`Performance assessment. Confirmed Open Rate ${rate(current.confirmedOpenRate)}. Comparison: ${comparison.available ? 'available' : comparison.reason ?? 'unavailable'}.`}>
                <AssessmentPanel currentRows={currentRows} previousRows={previousRows} comparison={comparison} />
              </AnalyticsPanel>
            )}
          </div>

          <div className="grid gap-5">
            {panelVisible('recipientResponse') && (
              <AnalyticsPanel
                title="Recipient response over time"
                theme="dark"
                actions={panelActions('recipientResponse', true)}
                gemContent={recipientResponseGem(currentRows)}
              >
              <MixedMetricChart rows={trendRows} series={metricsFor('recipientResponse')} height={300} />
              </AnalyticsPanel>
            )}
          </div>
        </>
      )}

      {view === 'audience' && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricTile label="Confirmed Open Rate" value={rate(current.confirmedOpenRate)} wowDiff={periodChange(weekly.confirmedOpenRate, weeklyPrevious.confirmedOpenRate, tileComparison)} onClick={() => onOpenMetrics?.('engagementTrend')} />
            <MetricTile label="Click-through Rate" value={rate(current.clickThroughRate)} wowDiff={periodChange(weekly.clickThroughRate, weeklyPrevious.clickThroughRate, tileComparison)} onClick={() => onOpenMetrics?.('engagementTrend')} />
            <MetricTile label="Click-to-open Rate" value={rate(clickToOpenRate)} wowDiff={periodChange(weeklyClickToOpenRate, weeklyPreviousClickToOpenRate, tileComparison)} onClick={() => onOpenMetrics?.('engagementTrend')} />
            <MetricTile label="Spam Complaint Rate" value={rate(current.complaintRate, 2)} wowDiff={periodChange(weekly.complaintRate, weeklyPrevious.complaintRate, tileComparison)} inverse onClick={() => onOpenMetrics?.('receiverTrend')} />
          </div>

          {panelVisible('engagementTrend') && (
            <AnalyticsPanel
              title="Engagement quality over time"
              theme="dark"
              actions={panelActions('engagementTrend', true)}
              gemContent={`Engagement quality: opens ${number(opens)}, clicks ${number(clicks)}, confirmed open rate ${rate(current.confirmedOpenRate)}, click-through rate ${rate(current.clickThroughRate)}.`}
            >
              <MixedMetricChart rows={trendRows} series={metricsFor('engagementTrend')} />
            </AnalyticsPanel>
          )}

          {panelVisible('receiverTrend') && (
            <AnalyticsPanel
              title="Receiver trend comparison"
              theme="dark"
              actions={
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-black text-purple-100">
                    {activeReceivers.length} provider{activeReceivers.length === 1 ? '' : 's'}
                  </span>
                  {panelActions('receiverTrend', true)}
                </div>
              }
              gemContent={`Receiver comparison for ${activeReceivers.join(', ') || 'no selected receivers'}.`}
            >
              <ReceiverTrendChart rows={receiverRows} providers={activeReceivers} series={metricsFor('receiverTrend')} />
            </AnalyticsPanel>
          )}

          {panelVisible('receiverTable') && (
            <AnalyticsPanel
              title="Mailbox-provider performance"
              theme="light"
              actions={<div className="relative"><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" /><input value={receiverSearch} onChange={event => setReceiverSearch(event.target.value)} placeholder="Search providers" className="h-9 rounded-full border border-outline-variant/30 bg-white pl-8 pr-3 text-[12px] font-bold outline-none focus:border-[#801ED7] dark:bg-[#201F24]" /></div>}
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-[12px]">
                  <thead className="border-b border-outline-variant/20 text-on-surface-variant">
                    <tr>{['Mailbox Provider', 'Sent', 'Accepted Rate', 'Confirmed Open Rate', 'CTR', 'CTO', 'Unsubscribe Rate', 'Complaint Rate', 'Inbox Rate'].map(head => <th key={head} className="p-2 font-black">{head}</th>)}</tr>
                  </thead>
                  <tbody>
                    {filteredReceivers.map(item => (
                      <tr key={item.provider} className="border-b border-outline-variant/10">
                        <td className="p-2 font-black text-on-surface dark:text-inverse-on-surface">{item.provider}</td>
                        <td className="p-2">{number(item.metrics.sent)}</td>
                        <td className="p-2">{rate(item.metrics.acceptedRate)}</td>
                        <td className="p-2">{rate(item.metrics.confirmedOpenRate)}</td>
                        <td className="p-2">{rate(item.metrics.clickThroughRate)}</td>
                        <td className="p-2">{rate(safeRatio(sum(item.rows, 'count_unique_clicked'), sum(item.rows, 'count_nonprefetched_unique_confirmed_opened')))}</td>
                        <td className="p-2">{rate(item.metrics.unsubscribeRate)}</td>
                        <td className="p-2">{rate(item.metrics.complaintRate, 2)}</td>
                        <td className="p-2">{item.metrics.inbox + item.metrics.spam > 0 ? rate(item.metrics.inboxFolderRate) : 'Not available'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AnalyticsPanel>
          )}

          {panelVisible('deliveryBridge') && (
            <AnalyticsPanel title="Delivery-to-engagement bridge" theme="light">
              <div className="grid gap-4 md:grid-cols-2">
                {receivers.slice(0, 4).map(item => {
                  const deliveryToOpen = safeRatio(item.metrics.confirmedOpens, item.metrics.accepted);
                  const openToClick = safeRatio(item.metrics.uniqueClicks, item.metrics.confirmedOpens);
                  const flagged = item.metrics.acceptedRate < current.acceptedRate - 0.015
                    || item.metrics.confirmedOpenRate < current.confirmedOpenRate - 0.02
                    || item.metrics.complaintRate > current.complaintRate + 0.0003;
                  return (
                    <button
                      key={item.provider}
                      type="button"
                      onClick={() => {
                        const next = activeReceivers.includes(item.provider)
                          ? activeReceivers.filter(provider => provider !== item.provider)
                          : [...activeReceivers, item.provider];
                        setSelectedReceivers(next);
                      }}
                      className={cn('rounded-[18px] border px-4 py-4 text-left transition-colors', activeReceivers.includes(item.provider) ? 'border-[#B79AEC] bg-[#FBF8FF]' : 'border-[#E2D6F2] bg-white hover:bg-[#FCFAFF]')}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[15px] font-black text-[#300266] dark:text-purple-100">{item.provider}</p>
                          <p className="mt-1 text-[12px] text-on-surface-variant">{compact(item.metrics.sent)} sent in current scope</p>
                        </div>
                        <span className={cn('rounded-full px-2.5 py-1 text-[10px] font-black', flagged ? 'bg-[#FDE8E7] text-[#B3261E]' : 'bg-[#E7F5EC] text-[#137333]')}>
                          {flagged ? 'Below baseline' : 'In line'}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        {[
                          { label: 'Accepted', value: rate(item.metrics.acceptedRate), tone: '#801ED7' },
                          { label: 'Opened', value: rate(deliveryToOpen), tone: '#E978F1' },
                          { label: 'Clicked', value: rate(openToClick), tone: '#FFA524' },
                        ].map((step, index) => (
                          <div key={step.label} className="flex min-w-0 flex-1 items-center gap-2">
                            <div className="min-w-0 flex-1 rounded-[14px] bg-[#F7F3FB] px-3 py-3">
                              <div className="h-1.5 rounded-full bg-white/70">
                                <div className="h-full rounded-full" style={{ width: `${Math.max(10, Number.parseFloat(step.value) || 0)}%`, backgroundColor: step.tone }} />
                              </div>
                              <p className="mt-2 text-[10px] font-black uppercase tracking-wide text-[#746B80]">{step.label}</p>
                              <p className="mt-1 text-[18px] font-black text-[#300266] dark:text-purple-100">{step.value}</p>
                            </div>
                            {index < 2 && <span className="text-[18px] text-[#AE92D8]">→</span>}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="rounded-[14px] bg-[#FFF8EE] px-3 py-2">
                          <p className="text-[10px] font-black uppercase tracking-wide text-[#8D6D2C]">Deferred</p>
                          <p className="mt-1 text-[14px] font-black text-[#B46200]">{rate(item.metrics.delayedRate)}</p>
                        </div>
                        <div className="rounded-[14px] bg-[#FFF6F4] px-3 py-2">
                          <p className="text-[10px] font-black uppercase tracking-wide text-[#8D5454]">Bounced</p>
                          <p className="mt-1 text-[14px] font-black text-[#B5382D]">{rate(item.metrics.bounceRate)}</p>
                        </div>
                        <div className="rounded-[14px] bg-[#FDF1F8] px-3 py-2">
                          <p className="text-[10px] font-black uppercase tracking-wide text-[#8A5875]">Complaints</p>
                          <p className="mt-1 text-[14px] font-black text-[#B9186E]">{rate(item.metrics.complaintRate, 2)}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </AnalyticsPanel>
          )}
        </>
      )}
    </div>
  );
}
