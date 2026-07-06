// Cached loader + filterable accessor for the historical provider-level metrics.
// Parses the history CSV once (module-level promise cache), builds case/date indexes,
// and exposes a memoised filter. The history dataset is the source for all time-series
// charts. Cross-checks every historical case_number against the case dataset.

import { useEffect, useMemo, useState } from 'react';
import {
  HISTORY_DATASET_URL,
  parseHistoricalDataset,
  validateAgainstCases,
  buildIndex,
  type HistoricalMetricRecord,
  type HistoryIndex,
} from '../services/historicalMetricsDataset';
import { loadCaseDataset } from './useCaseDataset';

export interface HistoricalFilters {
  caseNumber?: string;
  accountName?: string;
  dateFrom?: string;
  dateTo?: string;
  mailboxProviders?: string[];
  recipientDomains?: string[];
  sendingDomains?: string[];
  sendingIps?: string[];
  ipPools?: string[];
  campaigns?: string[];
  subaccounts?: string[];
  phases?: string[];
  impactedOnly?: boolean;
}

interface Loaded { records: HistoricalMetricRecord[]; index: HistoryIndex; errors: string[]; }
let cache: Promise<Loaded> | null = null;

export function loadHistoricalMetrics(): Promise<Loaded> {
  if (!cache) {
    cache = Promise.all([
      fetch(HISTORY_DATASET_URL).then(r => { if (!r.ok) throw new Error(`Failed to load history (${r.status})`); return r.text(); }),
      loadCaseDataset(),
    ]).then(([text, caseResult]) => {
      const { records, errors } = parseHistoricalDataset(text);
      const caseNumbers = new Set(caseResult.records.map(c => c.case_number));
      const joinErrors = validateAgainstCases(records, caseNumbers);
      const allErrors = [...errors, ...joinErrors];
      if (allErrors.length) console.warn('[historicalMetrics] validation issues:', allErrors);
      return { records, index: buildIndex(records), errors: allErrors };
    }).catch(err => { cache = null; throw err; });
  }
  return cache;
}

const inList = (v: string, list?: string[]) => !list || list.length === 0 || list.includes(v);

/** Pure filter over historical rows. caseNumber short-circuits via the index for speed. */
export function filterHistory(loaded: Loaded, f: HistoricalFilters): HistoricalMetricRecord[] {
  const base = f.caseNumber ? (loaded.index.byCase.get(f.caseNumber) ?? []) : loaded.records;
  return base.filter(r =>
    (!f.accountName || r.account_name === f.accountName) &&
    (!f.dateFrom || r.metric_date >= f.dateFrom) &&
    (!f.dateTo || r.metric_date <= f.dateTo) &&
    inList(r.mailbox_provider, f.mailboxProviders) &&
    inList(r.recipient_domain, f.recipientDomains) &&
    inList(r.sending_domain, f.sendingDomains) &&
    inList(r.sending_ip, f.sendingIps) &&
    inList(r.ip_pool, f.ipPools) &&
    inList(r.campaign, f.campaigns) &&
    inList(r.subaccount, f.subaccounts) &&
    inList(r.phase, f.phases) &&
    (!f.impactedOnly || r.is_impacted_provider),
  );
}

export interface UseHistoricalMetrics {
  loading: boolean;
  error: string | null;
  validationErrors: string[];
  all: HistoricalMetricRecord[];
  index: HistoryIndex | null;
  /** Apply a filter set against the loaded rows (memoise the args at the call site). */
  filter: (f: HistoricalFilters) => HistoricalMetricRecord[];
  forCase: (caseNumber: string) => HistoricalMetricRecord[];
}

export function useHistoricalMetrics(): UseHistoricalMetrics {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    loadHistoricalMetrics()
      .then(l => { if (alive) setLoaded(l); })
      .catch(e => { if (alive) setError(String(e?.message || e)); });
    return () => { alive = false; };
  }, []);

  return useMemo<UseHistoricalMetrics>(() => ({
    loading: !loaded && !error,
    error,
    validationErrors: loaded?.errors ?? [],
    all: loaded?.records ?? [],
    index: loaded?.index ?? null,
    filter: (f) => (loaded ? filterHistory(loaded, f) : []),
    forCase: (cn) => loaded?.index.byCase.get(cn) ?? [],
  }), [loaded, error]);
}
