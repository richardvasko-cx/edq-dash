import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../App';
import { Md3Checkbox } from '../md3/Md3Components';
import {
  METRIC_CATALOG, METRIC_GROUPS, METRIC_GROUP_SUBTITLES, type MetricGroup,
  type MetricDef,
} from '../../services/metricCatalog';
import {
  EMPTY_FILTERS,
  type ResourceFilters,
  type ResourceKey
} from './MetricsFilterTypes';

const EMPTY_OPTIONS: Record<ResourceKey, string[]> = {
  recipientDomains: [], sendingIps: [], ipPools: [], campaigns: [],
  mailboxProviders: [], mailboxProviderRegions: [], sendingDomains: [], subaccounts: [],
};

function asStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function normalizeFilters(filters?: Partial<ResourceFilters> | null): ResourceFilters {
  return {
    recipientDomains: asStringList(filters?.recipientDomains),
    sendingIps: asStringList(filters?.sendingIps),
    ipPools: asStringList(filters?.ipPools),
    campaigns: asStringList(filters?.campaigns),
    mailboxProviders: asStringList(filters?.mailboxProviders),
    mailboxProviderRegions: asStringList(filters?.mailboxProviderRegions),
    sendingDomains: asStringList(filters?.sendingDomains),
    subaccounts: asStringList(filters?.subaccounts),
  };
}

const RESOURCES: { key: ResourceKey; label: string }[] = [
  { key: 'recipientDomains', label: 'Recipient Domain' },
  { key: 'sendingIps', label: 'Sending IP' },
  { key: 'ipPools', label: 'IP Pool' },
  { key: 'campaigns', label: 'Campaign (ID)' },
  { key: 'mailboxProviders', label: 'Mailbox Provider' },
  { key: 'mailboxProviderRegions', label: 'Mailbox Provider Region' },
  { key: 'sendingDomains', label: 'Sending Domain' },
  { key: 'subaccounts', label: 'Subaccount' },
];

type Tab = 'metrics' | 'filters';

interface Props {
  open: boolean;
  onClose: () => void;
  selectedMetrics?: string[];
  onApplyMetrics: (keys: string[]) => void;
  filters?: Partial<ResourceFilters> | null;
  onApplyFilters: (f: ResourceFilters) => void;
  options?: Partial<Record<ResourceKey, string[]>>;
  topOffsetClass?: string;
  initialTab?: Tab;
  highlightedMetrics?: string[];
  highlightLabel?: string;
  enabledMetrics?: string[];
  metricCatalog?: MetricDef[];
  tabUnderlineLayoutId?: string;
}

function Check({ checked }: { checked: boolean }) {
  return (
    <Md3Checkbox
      checked={checked}
      onChange={() => {}}
      className="shrink-0"
    />
  );
}


export default function MetricsFilterSheet({ 
  open, 
  onClose, 
  selectedMetrics, 
  onApplyMetrics, 
  filters, 
  onApplyFilters, 
  options,
  topOffsetClass = 'top-[88px]',
  initialTab = 'metrics',
  highlightedMetrics = [],
  highlightLabel = 'Panel metrics',
  enabledMetrics,
  metricCatalog = METRIC_CATALOG,
  tabUnderlineLayoutId = 'sheet-tab-underline',
}: Props) {
  const [tab, setTab] = useState<Tab>('metrics');
  const [draftMetrics, setDraftMetrics] = useState<Set<string>>(() => new Set(selectedMetrics ?? []));
  const [draftFilters, setDraftFilters] = useState<ResourceFilters>(() => normalizeFilters(filters));
  const [collapsed, setCollapsed] = useState<Set<MetricGroup>>(new Set());
  const [resource, setResource] = useState<ResourceKey | ''>('');
  const [resourceMenu, setResourceMenu] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      // Use double requestAnimationFrame to ensure React has fully committed the DOM
      // and Framer Motion exit/enter elements are settled before querying.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const container = scrollContainerRef.current;
          if (!container) return;
          const highlightedEl = container.querySelector('[data-highlighted="true"]');
          if (highlightedEl) {
            const containerRect = container.getBoundingClientRect();
            const elementRect = highlightedEl.getBoundingClientRect();
            const targetScrollTop = container.scrollTop + (elementRect.top - containerRect.top) - 64; // 64px offset
            container.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
          }
        });
      });
    }
  }, [open]);

  const safeOptions = useMemo<Record<ResourceKey, string[]>>(() => {
    const next = { ...EMPTY_OPTIONS };
    (Object.keys(EMPTY_OPTIONS) as ResourceKey[]).forEach(key => {
      next[key] = asStringList(options?.[key]);
    });
    return next;
  }, [options]);

  useEffect(() => {
    if (open) {
      const nextFilters = normalizeFilters(filters);
      setDraftMetrics(new Set(selectedMetrics ?? []));
      setDraftFilters(nextFilters);
      setTab(initialTab);
      const activeResource = RESOURCES.find(r => nextFilters[r.key].length > 0)?.key
        ?? RESOURCES.find(r => (options?.[r.key]?.length ?? 0) > 0)?.key
        ?? '';
      setResource(activeResource);
      setResourceMenu(false);
    }
  }, [open, selectedMetrics, filters, initialTab, options]);
  
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const byGroup = useMemo(() => {
    const m = {} as Record<MetricGroup, MetricDef[]>;
    for (const g of METRIC_GROUPS) m[g] = metricCatalog.filter(x => x.group === g);
    return m;
  }, [metricCatalog]);

  const toggleMetric = (key: string) => setDraftMetrics(s => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const toggleGroup = (g: MetricGroup) => setCollapsed(s => { const n = new Set(s); n.has(g) ? n.delete(g) : n.add(g); return n; });
  const toggleFilterValue = (key: ResourceKey, value: string) => setDraftFilters(f => {
    const normalized = normalizeFilters(f);
    const cur = normalized[key];
    const next = cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value];
    return { ...normalized, [key]: next };
  });

  const apply = () => {
    onApplyMetrics([...draftMetrics].filter(isMetricEnabled));
    onApplyFilters(normalizeFilters(draftFilters));
    onClose();
  };
  const clear = () => {
    if (tab === 'metrics') setDraftMetrics(new Set());
    else if (tab === 'filters') setDraftFilters(normalizeFilters(EMPTY_FILTERS));
  };

  const footerLabel = tab === 'metrics' ? 'Metrics' : 'Filters';
  const highlightedSet = useMemo(() => new Set(highlightedMetrics), [highlightedMetrics]);
  const enabledMetricSet = useMemo(() => enabledMetrics ? new Set(enabledMetrics) : null, [enabledMetrics]);
  const isMetricEnabled = (key: string) => !enabledMetricSet || enabledMetricSet.has(key);

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[120] bg-black/20"
            onClick={onClose}
          />

          {/* Side sheet container */}
          <motion.aside
            initial={{ x: 'calc(100% + 24px)' }}
            animate={{ x: 0 }}
            exit={{ x: 'calc(100% + 24px)' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320, mass: 0.9 }}
            style={{ willChange: 'transform' }}
            className={cn(
              'fixed bottom-4 right-4 z-[121] flex w-[min(500px,calc(100vw-32px))] flex-col overflow-hidden',
              'max-h-[calc(100vh-6rem)] rounded-[24px] bg-white dark:bg-[#1E1D22] shadow-[0_12px_48px_rgba(0,0,0,0.16)] border border-outline-variant/10',
              topOffsetClass
            )}
            role="dialog"
            aria-modal="true"
          >
            {/* Header containing Tabs & Actions */}
            <div className="flex items-center justify-between border-b border-outline-variant/20 shrink-0 px-5 relative">
              {/* Left: Tab selectors */}
              <div className="flex gap-0 self-stretch pt-2 relative">
                {(['metrics', 'filters'] as Tab[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      'w-28 pb-3 pt-3 text-[15px] font-bold capitalize relative transition-colors rounded-t-xl z-10 text-center',
                      tab === t ? 'text-[#1a73e8] dark:text-[#8AB4F8]' : 'text-on-surface-variant hover:text-on-surface',
                    )}
                  >
                    <span>{t}</span>
                  </button>
                ))}
                {/* Underline */}
                <div
                  className="absolute bottom-0 h-[3px] w-28 rounded-t-full bg-[#1a73e8] dark:bg-[#8AB4F8] transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)]"
                  style={{
                    transform: tab === 'metrics' ? 'translateX(0)' : 'translateX(100%)',
                  }}
                />
              </div>

              {/* Right: Only Close Utility Icon */}
              <div className="flex items-center text-outline pr-1">
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <span className="material-symbols-outlined text-[24px]">close</span>
                </button>
              </div>
            </div>

            {/* Inner Content Area */}
            <div ref={scrollContainerRef} className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {tab === 'metrics' && METRIC_GROUPS.map(group => {
                const isCollapsed = collapsed.has(group);
                const list = byGroup[group];
                return (
                  <section key={group} className="rounded-xl border border-outline-variant/20 p-3.5 md:p-4 bg-surface-variant/5 mb-4">
                    <button onClick={() => toggleGroup(group)} className="w-full flex items-start justify-between gap-3 text-left">
                      <div>
                        <h3 className="text-[17px] font-bold text-on-surface dark:text-inverse-on-surface">{group}</h3>
                        <p className="text-[13px] text-on-surface-variant mt-0.5">{METRIC_GROUP_SUBTITLES[group]}</p>
                      </div>
                      <span className={cn('material-symbols-outlined text-[24px] text-on-surface-variant transition-transform duration-200', isCollapsed && 'rotate-180')}>expand_less</span>
                    </button>

                    <AnimatePresence initial={false}>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.24, ease: [0.2, 0, 0, 1] }}
                          className="overflow-hidden bg-transparent"
                        >
                          <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4 pb-2">
                            {list.map(def => {
                              const checked = draftMetrics.has(def.key);
                              const highlighted = highlightedSet.has(def.key);
                              const enabled = isMetricEnabled(def.key);
                              
                              return (
                                <button
                                  key={def.key}
                                  onClick={() => { if (enabled) toggleMetric(def.key); }}
                                  disabled={!enabled}
                                  title={enabled ? undefined : 'This panel does not support this metric'}
                                  data-highlighted={highlighted ? 'true' : undefined}
                                  className={cn(
                                    'w-full min-w-0 flex items-center gap-3 text-left group rounded-xl p-1.5 transition-colors',
                                    enabled ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-35 grayscale'
                                  )}
                                >
                                  <Check checked={checked} />
                                  <span className="min-w-0">
                                    <span className="block text-[14px] font-medium text-on-surface dark:text-inverse-on-surface leading-tight group-hover:text-primary transition-colors">
                                      {def.label}
                                    </span>
                                    {!enabled && (
                                      <span className="mt-1 inline-flex rounded-full bg-on-surface/8 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-on-surface-variant">
                                        Not supported
                                      </span>
                                    )}
                                    {highlighted && (
                                      <span className="mt-1 inline-flex rounded-[4px] bg-[#1a73e8] px-2 py-0.5 text-[10px] font-black text-white dark:bg-[#8AB4F8] dark:text-[#121115]">
                                        {highlightLabel}
                                      </span>
                                    )}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </section>
                );
              })}

              {tab === 'filters' && (
                <section className="rounded-xl border border-outline-variant/20 p-4 flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-2">
                    {RESOURCES.filter(r => draftFilters[r.key].length > 0).map(r => (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => setResource(r.key)}
                        className={cn(
                          'truncate rounded-full border px-3 py-2 text-left text-[12px] font-black transition-colors',
                          resource === r.key ? 'border-[#1a73e8] bg-[#E8F0FE] text-[#1a73e8]' : 'border-outline-variant/20 text-on-surface-variant'
                        )}
                      >
                        {r.label}: {draftFilters[r.key].length}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <p className="text-[15px] font-bold text-on-surface dark:text-inverse-on-surface mb-2">Type</p>
                    <button
                      onClick={() => setResourceMenu(v => !v)}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-outline-variant/40 text-[14px] text-on-surface dark:text-inverse-on-surface hover:bg-black/4 dark:hover:bg-white/5"
                    >
                      {resource ? (RESOURCES.find(r => r.key === resource)?.label ?? 'Select Resource') : <span className="text-on-surface-variant">Select Resource</span>}
                      <span className="material-symbols-outlined text-[20px] text-on-surface-variant">{resourceMenu ? 'expand_less' : 'expand_more'}</span>
                    </button>
                    {resourceMenu && (
                      <div className="absolute z-20 left-0 right-0 mt-1 rounded-xl bg-white dark:bg-[#2A2930] border border-outline-variant/20 shadow-lg overflow-hidden py-1 max-h-[320px] overflow-y-auto">
                        {RESOURCES.map(r => (
                          <button
                            key={r.key}
                            onClick={() => { setResource(r.key); setResourceMenu(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-[14px] text-on-surface dark:text-inverse-on-surface hover:bg-[#2155CD]/8"
                          >
                            <span className={cn('material-symbols-outlined text-[18px]', resource === r.key ? 'text-[#2155CD] dark:text-[#8AB4F8]' : 'text-transparent')}>check</span>
                            {r.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {resource && (
                    <div className="flex flex-col gap-2 pt-1">
                      {safeOptions[resource].length === 0 && <p className="text-[13px] text-on-surface-variant italic">No values available.</p>}
                      {safeOptions[resource].map(v => (
                        <button key={v} onClick={() => toggleFilterValue(resource, v)} className="flex items-center gap-3 text-left">
                          <Check checked={(draftFilters[resource] ?? []).includes(v)} />
                          <span className="text-[14px] text-on-surface dark:text-inverse-on-surface break-all">{v}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {RESOURCES.some(r => (draftFilters[r.key] ?? []).length > 0) && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-outline-variant/20">
                      {RESOURCES.flatMap(r => (draftFilters[r.key] ?? []).map(v => (
                        <span key={`${r.key}:${v}`} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#2155CD]/10 text-[#2155CD] dark:text-[#8AB4F8] text-[11px] font-semibold">
                          {v}
                          <button onClick={() => toggleFilterValue(r.key, v)}><span className="material-symbols-outlined text-[14px]">close</span></button>
                        </span>
                      )))}
                    </div>
                  )}
                </section>
              )}
            </div>

            {/* Footer Actions */}
            <div className="shrink-0 border-t border-outline-variant/10 p-4 flex items-center gap-4 bg-white dark:bg-[#1E1D22] rounded-b-[24px] shadow-[0_-8px_22px_rgba(255,255,255,0.92)] dark:shadow-[0_-8px_22px_rgba(30,29,34,0.92)]">
              <button
                onClick={apply}
                className="flex-1 py-3 px-5 rounded-full bg-[#2155CD] hover:bg-[#1a44a5] active:scale-[0.98] text-white text-[15px] font-bold transition-all shadow-sm"
              >
                Apply {footerLabel}
              </button>
              <button
                onClick={clear}
                className="flex-1 py-3 px-5 rounded-full border border-outline-variant hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98] text-[#2155CD] dark:text-[#8AB4F8] text-[15px] font-bold transition-all"
              >
                Clear {footerLabel}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
