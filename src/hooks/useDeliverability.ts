// Loads deliverability metrics for an account. The currently wired demo source is
// the SparkPost domain view; other Braze sending providers return explicit
// empty/unavailable states until their source views are connected.

import { useEffect, useState } from 'react';
import { loadSparkpostDomainMetrics, type AdapterStatus } from '../adapters/googleSheets/adapters';
import { sparkpostRatesFromRows, type SparkpostRates } from '../services/lookerRates';
import type { SparkpostDomainMetricsRow } from '../models/looker';

export interface DeliverabilityFunnel {
  targeted: number | null;
  sent: number | null;
  accepted: number | null;
  delivered: number | null;
  deferred: number | null;
  bounces: number | null;
  blocked: number | null;
  dropped: number | null;
  complaints: number | null;
}

export interface DeliverabilityData {
  status: 'loading' | AdapterStatus;
  funnel: DeliverabilityFunnel;
  rates: SparkpostRates | null;
  rows: SparkpostDomainMetricsRow[];
  error?: string;
}

const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();
const toBrazeSubaccount = (s: string | null | undefined) => {
  const compact = (s ?? '').replace(/&/g, '').replace(/[^A-Za-z0-9]/g, '');
  return compact ? `braze${compact}` : '';
};
const toFilterKeys = (accountName: string | null | undefined, subaccounts?: string[]) => {
  const keys = new Set<string>();
  for (const subaccount of subaccounts ?? []) {
    const key = norm(subaccount);
    if (key) keys.add(key);
  }
  const derived = norm(toBrazeSubaccount(accountName));
  if (derived) keys.add(derived);
  return keys;
};

function sum(rows: SparkpostDomainMetricsRow[], key: keyof SparkpostDomainMetricsRow): number | null {
  let total = 0, seen = false;
  for (const r of rows) { const v = r[key]; if (typeof v === 'number') { total += v; seen = true; } }
  return seen ? total : null;
}

export function useDeliverability(accountName: string | null | undefined, subaccounts?: string[]): DeliverabilityData {
  const [data, setData] = useState<DeliverabilityData>({
    status: 'loading', funnel: emptyFunnel(), rates: null, rows: [],
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await loadSparkpostDomainMetrics();
      if (cancelled) return;
      const keys = toFilterKeys(accountName, subaccounts);
      const matched = res.rows.filter(r => keys.has(norm(r.subaccount)));
      const rows = matched.length > 0 ? matched : (keys.size ? [] : res.rows);
      const status: DeliverabilityData['status'] =
        res.status === 'unavailable' ? 'unavailable' : rows.length === 0 ? 'empty' : 'available';
      setData({
        status,
        rows,
        rates: rows.length > 0 ? sparkpostRatesFromRows(rows) : null,
        funnel: {
          targeted: sum(rows, 'count_targeted'),
          sent: sum(rows, 'sent'),
          accepted: sum(rows, 'count_accepted'),
          delivered: sum(rows, 'delivered'),
          deferred: sum(rows, 'deferred'),
          bounces: sum(rows, 'bounces'),
          blocked: sum(rows, 'blocks'),
          dropped: sum(rows, 'drops'),
          complaints: sum(rows, 'spam_reports'),
        },
        error: res.error,
      });
    })();
    return () => { cancelled = true; };
  }, [accountName, subaccounts?.join('|')]);

  return data;
}

function emptyFunnel(): DeliverabilityFunnel {
  return { targeted: null, sent: null, accepted: null, delivered: null, deferred: null, bounces: null, blocked: null, dropped: null, complaints: null };
}
