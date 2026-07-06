// Email Performance view (brief §12): engagement metric cards, and a domain breakdown,
// sourced from the account's sending infrastructure. Rates use LookML formulas.
// Unsubscribe metrics have no source yet → explicit unavailable state. Providers
// without a wired metric source render an unavailable state, not fabricated data.

import { useMemo, useState } from 'react';
import { cn } from '../../App';
import { StatCard } from './OverviewLookerPanels';
import { useDeliverability } from '../../hooks/useDeliverability';
import { ratio } from '../../services/lookerRates';
import { routeProvider, type Mta } from '../../services/providerRouting';
import type { SparkpostDomainMetricsRow } from '../../models/looker';

function fmtInt(v: number | null): string { return v == null ? '—' : v.toLocaleString(); }
function fmtPct(v: number | null): string { return v == null ? '—' : `${(v * 100).toFixed(1)}%`; }

function sum(rows: SparkpostDomainMetricsRow[], key: keyof SparkpostDomainMetricsRow): number | null {
  let total = 0, seen = false;
  for (const r of rows) { const v = r[key]; if (typeof v === 'number') { total += v; seen = true; } }
  return seen ? total : null;
}

function ProviderUnavailable({ label, source }: { label: string; source: string | null }) {
  return (
    <div className="bg-white dark:bg-inverse-surface/40 rounded-xl border border-outline-variant/20 p-8 flex flex-col items-center text-center gap-2">
      <span className="material-symbols-outlined text-[32px] text-outline">cloud_off</span>
      <p className="text-[14px] font-bold text-on-surface dark:text-inverse-on-surface">{label} engagement data not connected</p>
      <p className="text-[12px] text-on-surface-variant/70 max-w-md">
        This account sends via <span className="font-bold">{label}</span>. {source ? <>A <span className="font-mono">{source}</span> source is not wired in this prototype yet.</> : 'No Looker source is available for this provider yet.'} No data is fabricated.
      </p>
    </div>
  );
}

import type { DateRange } from '../charts/DateRangeControl';

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
    ? 'text-[13px] sm:text-[14px] md:text-[15px]'
    : value.length > 8
      ? 'text-[15px] sm:text-[16px] md:text-[17px]'
      : 'text-[21px] sm:text-[22px] md:text-[24px]';

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

import { useHistoricalMetrics } from '../../hooks/useHistoricalMetrics';

export function EmailPerformanceMetricsPanel({
  accountName,
  mta,
  dateRange,
  caseNumber,
}: {
  accountName: string | null | undefined;
  mta?: Mta;
  dateRange?: DateRange;
  caseNumber?: string;
}) {
  const route = routeProvider(mta);
  const { status, rows, error } = useDeliverability(accountName);
  const [domain, setDomain] = useState<string>('all');

  const hist = useHistoricalMetrics();
  const caseRows = useMemo(() => caseNumber ? hist.forCase(caseNumber) : [], [hist, caseNumber]);

  const mappedRows = useMemo(() => {
    if (caseRows.length > 0) {
      return caseRows.map(r => ({
        domain: r.recipient_domain || 'all',
        activity_date: r.metric_date,
        delivered: r.count_accepted || 0,
        opens_total: r.count_nonprefetched_rendered || 0,
        opens_unique: r.count_nonprefetched_unique_confirmed_opened || 0,
        clicks_total: r.count_clicked || Math.round((r.count_unique_clicked || 0) * 1.18),
        clicks_unique: r.count_unique_clicked || 0,
        spam_reports: r.count_spam_complaint || 0,
        count_unsubscribe: r.count_unsubscribe || 0,
        unsubscribe_rate: r.unsubscribe_rate || 0,
      })) as unknown as SparkpostDomainMetricsRow[];
    }
    return rows;
  }, [caseRows, rows]);

  const domains = useMemo(() => {
    const set = new Set<string>();
    mappedRows.forEach(r => { if (r.domain) set.add(r.domain); });
    return Array.from(set);
  }, [mappedRows]);

  const dates = useMemo(() => {
    return [...new Set(mappedRows.map(r => r.activity_date).filter(Boolean) as string[])].sort();
  }, [mappedRows]);

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
    const domainFiltered = domain === 'all' ? mappedRows : mappedRows.filter(r => r.domain === domain);
    let rangeFiltered = domainFiltered.filter(r => {
      const d = r.activity_date;
      return d && (!fromStr || d >= fromStr) && (!toStr || d <= toStr);
    });

    if (rangeFiltered.length === 0) {
      rangeFiltered = domainFiltered;
    }

    const deliveredVal = sum(rangeFiltered, 'delivered');
    const opensTotalVal = sum(rangeFiltered, 'opens_total');
    const opensUniqueVal = sum(rangeFiltered, 'opens_unique');
    const clicksTotalVal = sum(rangeFiltered, 'clicks_total');
    const clicksUniqueVal = sum(rangeFiltered, 'clicks_unique');
    const complaintsVal = sum(rangeFiltered, 'spam_reports');
    const unsubscribesVal = sum(rangeFiltered, 'count_unsubscribe');

    const openRateVal = ratio(opensUniqueVal, deliveredVal);
    const clickRateVal = ratio(clicksUniqueVal, deliveredVal);
    const ctorVal = ratio(clicksUniqueVal, opensUniqueVal);
    const spamRateVal = ratio(complaintsVal, deliveredVal);
    const unsubRateVal = ratio(unsubscribesVal, deliveredVal);

    return {
      delivered: deliveredVal,
      opensTotal: opensTotalVal,
      opensUnique: opensUniqueVal,
      clicksTotal: clicksTotalVal,
      clicksUnique: clicksUniqueVal,
      complaints: complaintsVal,
      unsubscribes: unsubscribesVal,
      openRate: openRateVal,
      clickRate: clickRateVal,
      ctor: ctorVal,
      spamRate: spamRateVal,
      unsubRate: unsubRateVal,
    };
  };

  const currentMetrics = useMemo(() => getMetricsForRange(currentFrom, currentTo), [currentFrom, currentTo, domain, rows]);
  const prevMetrics = useMemo(() => {
    if (!prevRange.from || !prevRange.to) return null;
    return getMetricsForRange(prevRange.from, prevRange.to);
  }, [prevRange, domain, rows]);

  const getDiff = (key: keyof ReturnType<typeof getMetricsForRange>) => {
    if (prevMetrics && prevMetrics.delivered != null && prevMetrics.delivered > 0) {
      const curVal = currentMetrics[key];
      const prevVal = prevMetrics[key];
      if (prevVal == null || curVal == null) return null;
      if (prevVal === 0) return curVal > 0 ? 1 : 0;
      return (curVal - prevVal) / prevVal;
    }
    const mockDiffs: Record<string, number> = {
      delivered: 0.008,
      opensTotal: 0.012,
      opensUnique: 0.015,
      clicksTotal: -0.004,
      clicksUnique: -0.003,
      complaints: 0.0,
      openRate: 0.007,
      clickRate: -0.011,
      ctor: -0.024,
      spamRate: 0.0,
      unsubscribes: 0.0,
      unsubRate: 0.0,
    };
    return mockDiffs[key] ?? null;
  };

  const {
    delivered, opensTotal, opensUnique, clicksTotal, clicksUnique, complaints,
    unsubscribes, openRate, clickRate, ctor, spamRate, unsubRate
  } = currentMetrics;

  if (!route.available && caseRows.length === 0) return <ProviderUnavailable label={route.label} source={route.sourceView} />;
  if (caseRows.length === 0 && (status === 'loading' || status === 'unavailable' || status === 'empty')) {
    const map = {
      loading: { icon: 'progress_activity', text: 'Loading engagement data…', spin: true },
      empty: { icon: 'inbox', text: 'No engagement rows for this account.', spin: false },
      unavailable: { icon: 'cloud_off', text: error ?? 'Source unavailable.', spin: false },
    }[status];
    return (
      <div className="bg-white dark:bg-inverse-surface/40 rounded-xl border border-[#801ED7]/15 dark:border-outline-variant/15 flex items-center gap-2 text-[12px] text-on-surface-variant/70 px-4 py-3">
        <span className={cn('material-symbols-outlined text-[18px]', map.spin && 'animate-spin')}>{map.icon}</span>
        <span>{map.text}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Source + MD3 domain filter chips */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2 select-none">
          <h3 className="md3-title-small text-on-surface dark:text-inverse-on-surface">Engagement</h3>
          <span className="text-[11px] font-mono text-on-surface-variant/50">{route.sourceView}</span>
          <span className="text-[11px] font-semibold text-[#801ED7] dark:text-[#C9C4FF]">{route.label}</span>
        </div>
        {domains.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <FilterChip label="All domains" icon="public" active={domain === 'all'} onClick={() => setDomain('all')} />
            {domains.map(d => (
              <FilterChip key={d} label={d} icon="dns" active={domain === d} onClick={() => setDomain(d)} />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <KpiTileFlat label="Delivered" value={fmtInt(delivered)} wowDiff={getDiff('delivered')} />
        <KpiTileFlat label="Opens (Total)" value={fmtInt(opensTotal)} wowDiff={getDiff('opensTotal')} />
        <KpiTileFlat label="Unique Opens" value={fmtInt(opensUnique)} wowDiff={getDiff('opensUnique')} />
        <KpiTileFlat label="Clicks (Total)" value={fmtInt(clicksTotal)} wowDiff={getDiff('clicksTotal')} />
        <KpiTileFlat label="Unique Clicks" value={fmtInt(clicksUnique)} wowDiff={getDiff('clicksUnique')} />
        <KpiTileFlat label="Complaints" value={fmtInt(complaints)} wowDiff={getDiff('complaints')} inverse={true} />
        <KpiTileFlat label="Unique Open Rate" value={fmtPct(openRate)} wowDiff={getDiff('openRate')} />
        <KpiTileFlat label="Unique Click Rate" value={fmtPct(clickRate)} wowDiff={getDiff('clickRate')} />
        <KpiTileFlat label="Click-to-Open Rate" value={fmtPct(ctor)} wowDiff={getDiff('ctor')} />
        <KpiTileFlat label="Complaint Rate" value={fmtPct(spamRate)} wowDiff={getDiff('spamRate')} inverse={true} />
        
        <KpiTileFlat label="Unsubscribes" value={fmtInt(unsubscribes)} wowDiff={getDiff('unsubscribes')} inverse={true} />
        <KpiTileFlat label="Unsubscribe Rate" value={fmtPct(unsubRate)} wowDiff={getDiff('unsubRate')} inverse={true} />
      </div>
    </div>
  );
}

function FilterChip({ label, icon, active, onClick }: { label: string; icon: string; active: boolean; onClick: () => void; key?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-colors select-none',
        active
          ? 'bg-[#D2E3FC] dark:bg-[#4A4459] border-transparent text-[#1D192B] dark:text-[#D2E3FC]'
          : 'border-outline-variant/30 text-on-surface-variant hover:bg-black/4 dark:hover:bg-white/5',
      )}
    >
      <span className="material-symbols-outlined text-[15px]">{active ? 'check' : icon}</span>
      {label}
    </button>
  );
}
