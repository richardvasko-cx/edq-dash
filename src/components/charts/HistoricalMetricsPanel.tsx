// Per-case historical metrics panel — hosts the date-range picker, the MD3 Metrics/Filters
// side sheet, and the combo chart. The selected metrics drive the series (counts→bars,
// rates→right-axis lines); date range + resource filters scope the rows. Reusable across
// the Deliverability and Email Performance tabs (different default metric sets).

import { useEffect, useMemo, useState } from 'react';
import { cn } from '../../App';
import { useHistoricalMetrics } from '../../hooks/useHistoricalMetrics';
import { METRIC_BY_KEY, computeMetric, type MetricDef } from '../../services/metricCatalog';
import MetricComboChart, { type ComboPoint } from './MetricComboChart';
import MetricsFilterSheet from './MetricsFilterSheet';
import { EMPTY_FILTERS, type ResourceFilters, type ResourceKey } from './MetricsFilterTypes';
import DateRangeControl, { type DateRange } from './DateRangeControl';

const uniq = (rows: any[], k: string) => [...new Set(rows.map(r => r[k]).filter(Boolean) as string[])].sort();

export default function HistoricalMetricsPanel({
  caseNumber, title, defaultMetrics, range: controlledRange, onRangeChange, showDateControl = true,
  selected: controlledSelected, onSelectedChange,
  filters: controlledFilters, onFiltersChange,
  hideFilterButton = false,
  metricCatalog,
  enabledMetrics,
}: {
  caseNumber: string;
  title: string;
  defaultMetrics: string[];
  range?: DateRange;
  onRangeChange?: (range: DateRange) => void;
  showDateControl?: boolean;
  selected?: string[];
  onSelectedChange?: (m: string[]) => void;
  filters?: ResourceFilters;
  onFiltersChange?: (f: ResourceFilters) => void;
  hideFilterButton?: boolean;
  metricCatalog?: MetricDef[];
  enabledMetrics?: string[];
}) {
  const hist = useHistoricalMetrics();
  const caseRows = useMemo(() => hist.forCase(caseNumber), [hist, caseNumber]);
  const dates = useMemo(() => [...new Set(caseRows.map(r => r.metric_date))].sort(), [caseRows]);

  const [range, setRange] = useState<DateRange>({ from: '', to: '' });
  const activeRange = controlledRange ?? range;
  const updateRange = onRangeChange ?? setRange;
  const effectiveRange: DateRange = {
    from: activeRange.from || dates[0] || '',
    to: activeRange.to || dates[dates.length - 1] || '',
  };
  
  const [selectedState, setSelectedState] = useState<string[]>(defaultMetrics);
  const selected = controlledSelected ?? selectedState;
  const updateSelected = onSelectedChange ?? setSelectedState;

  const [filtersState, setFiltersState] = useState<ResourceFilters>(EMPTY_FILTERS);
  const filters = controlledFilters ?? filtersState;
  const updateFilters = onFiltersChange ?? setFiltersState;

  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    updateSelected(defaultMetrics);
  }, [defaultMetrics.join('|')]);

  // Resource filter options drawn from this case's history.
  const options = useMemo<Record<ResourceKey, string[]>>(() => ({
    recipientDomains: uniq(caseRows, 'recipient_domain'),
    sendingIps: uniq(caseRows, 'sending_ip'),
    ipPools: uniq(caseRows, 'ip_pool'),
    campaigns: uniq(caseRows, 'campaign'),
    mailboxProviders: uniq(caseRows, 'mailbox_provider'),
    mailboxProviderRegions: [],
    sendingDomains: uniq(caseRows, 'sending_domain'),
    subaccounts: uniq(caseRows, 'subaccount'),
  }), [caseRows]);

  // Filtered rows (date range + resource filters) via the shared, tested hook filter.
  const rows = useMemo(() => hist.filter({
    caseNumber,
    dateFrom: effectiveRange.from, dateTo: effectiveRange.to,
    recipientDomains: filters.recipientDomains, sendingIps: filters.sendingIps,
    ipPools: filters.ipPools, campaigns: filters.campaigns,
    mailboxProviders: filters.mailboxProviders, sendingDomains: filters.sendingDomains,
    subaccounts: filters.subaccounts,
  }), [hist, caseNumber, effectiveRange.from, effectiveRange.to, filters]);

  const metricByKey = useMemo(
    () => metricCatalog ? Object.fromEntries(metricCatalog.map(metric => [metric.key, metric])) as Record<string, MetricDef> : METRIC_BY_KEY,
    [metricCatalog]
  );
  const enabledMetricSet = useMemo(() => enabledMetrics ? new Set(enabledMetrics) : null, [enabledMetrics]);
  const defs = useMemo(
    () => selected.map(k => metricByKey[k]).filter(d => d && d.available && (!enabledMetricSet || enabledMetricSet.has(d.key))),
    [selected, metricByKey, enabledMetricSet]
  );

  // Aggregate selected rows per date and compute each selected metric (weighted).
  const data = useMemo<ComboPoint[]>(() => {
    const byDate = new Map<string, typeof rows>();
    for (const r of rows) { if (!byDate.has(r.metric_date)) byDate.set(r.metric_date, [] as any); byDate.get(r.metric_date)!.push(r); }
    return [...byDate.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([date, dr]) => {
      const point: ComboPoint = { date, _incident: dr.some(r => r.is_incident_marker), _current: dr.some(r => r.is_current_metric_window) };
      for (const def of defs) point[def.key] = computeMetric(def, dr);
      return point;
    });
  }, [rows, defs]);

  const activeFilterCount = (Object.keys(filters) as ResourceKey[]).reduce((n, k) => n + filters[k].length, 0);

  return (
    <div className="bg-white dark:bg-inverse-surface/40 rounded-2xl p-5 border border-outline-variant/40 dark:border-outline-variant/20 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[16px] font-black text-on-surface dark:text-inverse-on-surface">{title}</h3>
        <div className="flex items-center gap-2">
          {showDateControl && <DateRangeControl dates={dates} value={effectiveRange} onChange={updateRange} />}
          {!hideFilterButton && (
            <button
              onClick={() => setSheetOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-outline-variant/40 text-[13px] font-semibold text-on-surface dark:text-inverse-on-surface hover:bg-black/4 dark:hover:bg-white/5 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">tune</span>
              Metrics &amp; filters
              {activeFilterCount > 0 && <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-[#2155CD] text-white text-[10px] font-black leading-none">{activeFilterCount}</span>}
            </button>
          )}
        </div>
      </div>

      {hist.loading ? (
        <div className="h-[320px] flex items-center justify-center text-[13px] text-on-surface-variant/60">
          <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span> Loading historical metrics…
        </div>
      ) : hist.error ? (
        <div className="h-[200px] flex items-center justify-center text-[13px] text-[#C5221F]">{hist.error}</div>
      ) : data.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-[13px] text-on-surface-variant/60">No rows match the current filters.</div>
      ) : (
        <MetricComboChart data={data} metrics={defs} />
      )}

      {!hideFilterButton && (
        <MetricsFilterSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          selectedMetrics={selected}
          onApplyMetrics={updateSelected}
          filters={filters}
          onApplyFilters={updateFilters}
          options={options}
          metricCatalog={metricCatalog}
          enabledMetrics={enabledMetrics}
          tabUnderlineLayoutId="historical-metrics-sheet-underline"
        />
      )}
    </div>
  );
}
