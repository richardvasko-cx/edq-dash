// Loads platform email aggregation metrics, optionally filtered by company, ESP, or receiver domain.
// Sums counts across filtered rows then derives rates — never averages pre-computed rate columns.

import { useEffect, useState } from 'react';
import { loadPlatformEmailAggregation, type AdapterStatus } from '../adapters/googleSheets/adapters';
import type { PlatformEmailAggregationRow } from '../models/looker';

export interface PlatformEmailData {
  status: 'loading' | AdapterStatus;
  rows: PlatformEmailAggregationRow[];
  kpis: {
    total_sent: number | null;
    total_delivered: number | null;
    total_bounces: number | null;
    total_soft_bounces: number | null;
    total_dropped: number | null;
    total_spam: number | null;
    total_unique_opens: number | null;
    total_unique_clicks: number | null;
    delivered_percent: number | null;
    bounce_rate: number | null;
    soft_bounce_rate_new: number | null;
    dropped_rate: number | null;
    spam_rate: number | null;
    unique_open_rate: number | null;
    unique_click_rate: number | null;
  };
  trendByDate: { date: string; sent: number; delivered: number; bounces: number; opens: number; clicks: number }[];
  companies: string[];
  receiverDomains: string[];
  error?: string;
}

const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();

function sumField(rows: PlatformEmailAggregationRow[], key: keyof PlatformEmailAggregationRow): number | null {
  let total = 0, seen = false;
  for (const r of rows) { const v = r[key]; if (typeof v === 'number') { total += v; seen = true; } }
  return seen ? total : null;
}

function rate(numerator: number | null, denominator: number | null): number | null {
  if (numerator === null || denominator === null || denominator === 0) return null;
  return numerator / denominator;
}

function emptyKpis(): PlatformEmailData['kpis'] {
  return {
    total_sent: null,
    total_delivered: null,
    total_bounces: null,
    total_soft_bounces: null,
    total_dropped: null,
    total_spam: null,
    total_unique_opens: null,
    total_unique_clicks: null,
    delivered_percent: null,
    bounce_rate: null,
    soft_bounce_rate_new: null,
    dropped_rate: null,
    spam_rate: null,
    unique_open_rate: null,
    unique_click_rate: null,
  };
}

export function usePlatformEmail(filters?: { company?: string; esp?: string; receiverDomain?: string }): PlatformEmailData {
  const [data, setData] = useState<PlatformEmailData>({
    status: 'loading',
    rows: [],
    kpis: emptyKpis(),
    trendByDate: [],
    companies: [],
    receiverDomains: [],
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await loadPlatformEmailAggregation();
      if (cancelled) return;

      const allRows = res.rows;

      // Derive sorted unique dimension lists from ALL rows before filtering.
      const companies = Array.from(
        new Set(allRows.map(r => r.company_name).filter((v): v is string => v !== null && v.trim() !== ''))
      ).sort((a, b) => a.localeCompare(b));

      const receiverDomains = Array.from(
        new Set(allRows.map(r => r.receiver_domain).filter((v): v is string => v !== null && v.trim() !== ''))
      ).sort((a, b) => a.localeCompare(b));

      // Apply optional filters (case-insensitive).
      const companyKey = filters?.company ? norm(filters.company) : null;
      const espKey = filters?.esp ? norm(filters.esp) : null;
      const domainKey = filters?.receiverDomain ? norm(filters.receiverDomain) : null;

      const rows = allRows.filter(r => {
        if (companyKey && norm(r.company_name) !== companyKey) return false;
        if (espKey && norm(r.esp) !== espKey) return false;
        if (domainKey && norm(r.receiver_domain) !== domainKey) return false;
        return true;
      });

      const status: PlatformEmailData['status'] =
        res.status === 'unavailable' ? 'unavailable' : rows.length === 0 ? 'empty' : 'available';

      // Sum counts from filtered rows.
      const total_sent = sumField(rows, 'total_sent');
      const total_delivered = sumField(rows, 'total_delivered');
      const total_bounces = sumField(rows, 'total_bounces');
      const total_soft_bounces = sumField(rows, 'total_soft_bounces');
      const total_dropped = sumField(rows, 'total_dropped');
      const total_spam = sumField(rows, 'total_spam');
      const total_unique_opens = sumField(rows, 'total_unique_opens');
      const total_unique_clicks = sumField(rows, 'total_unique_clicks');

      // Derive rates from summed counts.
      const kpis: PlatformEmailData['kpis'] = {
        total_sent,
        total_delivered,
        total_bounces,
        total_soft_bounces,
        total_dropped,
        total_spam,
        total_unique_opens,
        total_unique_clicks,
        delivered_percent: rate(total_delivered, total_sent),
        bounce_rate: rate(total_bounces, total_delivered),
        soft_bounce_rate_new: rate(total_soft_bounces, total_sent),
        dropped_rate: rate(total_dropped, total_sent),
        spam_rate: rate(total_spam, total_delivered),
        unique_open_rate: rate(total_unique_opens, total_delivered),
        unique_click_rate: rate(total_unique_clicks, total_delivered),
      };

      // Build trend grouped by event_date, sorted ascending.
      const byDate = new Map<string, { sent: number; delivered: number; bounces: number; opens: number; clicks: number }>();
      for (const r of rows) {
        const date = r.event_date ?? '';
        if (!byDate.has(date)) {
          byDate.set(date, { sent: 0, delivered: 0, bounces: 0, opens: 0, clicks: 0 });
        }
        const bucket = byDate.get(date)!;
        if (typeof r.total_sent === 'number') bucket.sent += r.total_sent;
        if (typeof r.total_delivered === 'number') bucket.delivered += r.total_delivered;
        if (typeof r.total_bounces === 'number') bucket.bounces += r.total_bounces;
        if (typeof r.total_unique_opens === 'number') bucket.opens += r.total_unique_opens;
        if (typeof r.total_unique_clicks === 'number') bucket.clicks += r.total_unique_clicks;
      }
      const trendByDate = Array.from(byDate.entries())
        .map(([date, vals]) => ({ date, ...vals }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setData({ status, rows, kpis, trendByDate, companies, receiverDomains, error: res.error });
    })();
    return () => { cancelled = true; };
  }, [JSON.stringify(filters)]); // eslint-disable-line react-hooks/exhaustive-deps

  return data;
}
