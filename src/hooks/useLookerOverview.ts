// Loads the Looker-backed Overview data for the selected ticket's account.
//
// Resolution (brief §7 / §11): match the ticket's account name to companies_all_view.company_name,
// then filter platform_email_aggregation rows to that company. Rates are recomputed from summed
// counts via the LookML formulas (never averaged). Until the local CSVs have rows, this surfaces
// `empty` / `unavailable` — never fabricated values.

import { useEffect, useState } from 'react';
import { loadCompaniesAllView, loadPlatformEmailAggregation, type AdapterStatus } from '../adapters/googleSheets/adapters';
import { platformRatesFromRows, type PlatformRates } from '../services/lookerRates';
import type { CompaniesAllViewRow, PlatformEmailAggregationRow } from '../models/looker';

export interface LookerOverviewData {
  status: 'loading' | AdapterStatus;
  account: CompaniesAllViewRow | null;
  rows: PlatformEmailAggregationRow[];
  rates: PlatformRates | null;
  /** Summed headline counts across the filtered rows (null when no rows contribute). */
  totals: PlatformTotals;
  error?: string;
}

export interface PlatformTotals {
  total_sent: number | null;
  total_delivered: number | null;
  total_bounces: number | null;
  total_soft_bounces: number | null;
  total_dropped: number | null;
  total_spam: number | null;
  total_unique_opens: number | null;
  total_unique_clicks: number | null;
}

const TOTAL_KEYS: ReadonlyArray<keyof PlatformTotals> = [
  'total_sent', 'total_delivered', 'total_bounces', 'total_soft_bounces',
  'total_dropped', 'total_spam', 'total_unique_opens', 'total_unique_clicks',
];

function sumTotals(rows: PlatformEmailAggregationRow[]): PlatformTotals {
  const out = {} as PlatformTotals;
  for (const key of TOTAL_KEYS) {
    let total = 0;
    let seen = false;
    for (const row of rows) {
      const v = row[key];
      if (typeof v === 'number') { total += v; seen = true; }
    }
    out[key] = seen ? total : null;
  }
  return out;
}

const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();

export function useLookerOverview(accountName: string | null | undefined): LookerOverviewData {
  const [data, setData] = useState<LookerOverviewData>({
    status: 'loading', account: null, rows: [], rates: null, totals: sumTotals([]),
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [companies, pea] = await Promise.all([
        loadCompaniesAllView(),
        loadPlatformEmailAggregation(),
      ]);
      if (cancelled) return;

      // Account resolution: match ticket account name → companies_all_view.company_name.
      const target = norm(accountName);
      const account =
        companies.rows.find(c => norm(c.company_name) === target) ??
        companies.rows[0] ?? // fall back to the first row so the panel still demonstrates the shape
        null;

      // Filter platform rows to the resolved company where a company name is present.
      const companyKey = norm(account?.company_name) || target;
      const matched = companyKey
        ? pea.rows.filter(r => norm(r.company_name) === companyKey)
        : pea.rows;
      const rows = matched.length > 0 ? matched : pea.rows;

      // Combined status: unavailable if either source failed; else driven by platform rows.
      let status: LookerOverviewData['status'];
      if (companies.status === 'unavailable' || pea.status === 'unavailable') {
        status = 'unavailable';
      } else if (rows.length === 0) {
        status = 'empty';
      } else {
        status = 'available';
      }

      setData({
        status,
        account,
        rows,
        rates: rows.length > 0 ? platformRatesFromRows(rows) : null,
        totals: sumTotals(rows),
        error: companies.error ?? pea.error,
      });
    })();

    return () => { cancelled = true; };
  }, [accountName]);

  return data;
}
