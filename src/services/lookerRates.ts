// Rate calculators that encode the LookML formula semantics EXACTLY (brief §2 / §4).
//
// Rules:
// - Calculate a rate only when its measure is absent from the result.
// - Never average rate rows — recalculate from SUMMED counts using the same LookML formula.
// - Preserve the LookML denominator even where it differs from common provider conventions.
// - Returns null when inputs are missing or the denominator is 0/absent (never fabricate 0).

import type {
  PlatformEmailAggregationRow,
  SparkpostDomainMetricsRow,
  SparkpostSendingIpMetricsRow,
} from '../models/looker';

/** Safe ratio: null unless both operands are present and the denominator is non-zero. */
export function ratio(numerator: number | null, denominator: number | null): number | null {
  if (numerator == null || denominator == null) return null;
  if (denominator === 0) return null;
  return numerator / denominator;
}

function sum(rows: Array<Record<string, number | null>>, key: string): number | null {
  let total = 0;
  let seen = false;
  for (const row of rows) {
    const v = row[key];
    if (typeof v === 'number') {
      total += v;
      seen = true;
    }
  }
  return seen ? total : null;
}

// ── platform_email_aggregation ───────────────────────────────────────────────
// delivered_percent    = total_delivered / total_sent
// bounce_rate          = total_bounces  / total_delivered
// soft_bounce_rate_new = total_soft_bounces / total_sent
// dropped_rate         = total_dropped  / total_delivered
// spam_rate            = total_spam     / total_delivered
// unique_open_rate     = total_unique_opens  / total_delivered
// unique_click_rate    = total_unique_clicks / total_delivered

export interface PlatformRates {
  delivered_percent: number | null;
  bounce_rate: number | null;
  soft_bounce_rate_new: number | null;
  dropped_rate: number | null;
  spam_rate: number | null;
  unique_open_rate: number | null;
  unique_click_rate: number | null;
}

/** Recompute platform rates from summed counts across many rows (never averages rate columns). */
export function platformRatesFromRows(rows: PlatformEmailAggregationRow[]): PlatformRates {
  const r = rows as unknown as Array<Record<string, number | null>>;
  const sent = sum(r, 'total_sent');
  const delivered = sum(r, 'total_delivered');
  const bounces = sum(r, 'total_bounces');
  const soft = sum(r, 'total_soft_bounces');
  const dropped = sum(r, 'total_dropped');
  const spam = sum(r, 'total_spam');
  const uOpens = sum(r, 'total_unique_opens');
  const uClicks = sum(r, 'total_unique_clicks');

  return {
    delivered_percent: ratio(delivered, sent),
    bounce_rate: ratio(bounces, delivered),
    soft_bounce_rate_new: ratio(soft, sent),
    dropped_rate: ratio(dropped, delivered),
    spam_rate: ratio(spam, delivered),
    unique_open_rate: ratio(uOpens, delivered),
    unique_click_rate: ratio(uClicks, delivered),
  };
}

// ── sparkpost_domain_metrics / sparkpost_sending_ip_metrics ──────────────────
// delivered_percent  = delivered / sent
// bounce_rate        = bounces   / sent
// deferred_rate      = deferred  / delivered
// block_rate         = blocks    / sent
// dropped_rate       = drops     / delivered
// spam_rate          = spam_reports / delivered
// opens_unique_rate  = opens_unique  / delivered
// clicks_unique_rate = clicks_unique / delivered

export interface SparkpostRates {
  delivered_percent: number | null;
  bounce_rate: number | null;
  deferred_rate: number | null;
  block_rate: number | null;
  dropped_rate: number | null;
  spam_rate: number | null;
  opens_unique_rate: number | null;
  clicks_unique_rate: number | null;
}

export function sparkpostRatesFromRows(
  rows: Array<SparkpostDomainMetricsRow | SparkpostSendingIpMetricsRow>,
): SparkpostRates {
  const r = rows as unknown as Array<Record<string, number | null>>;
  const sent = sum(r, 'sent');
  const delivered = sum(r, 'delivered');
  const bounces = sum(r, 'bounces');
  const deferred = sum(r, 'deferred');
  const blocks = sum(r, 'blocks');
  const drops = sum(r, 'drops');
  const spam = sum(r, 'spam_reports');
  const opensUnique = sum(r, 'opens_unique');
  const clicksUnique = sum(r, 'clicks_unique');

  return {
    delivered_percent: ratio(delivered, sent),
    bounce_rate: ratio(bounces, sent),
    deferred_rate: ratio(deferred, delivered),
    block_rate: ratio(blocks, sent),
    dropped_rate: ratio(drops, delivered),
    spam_rate: ratio(spam, delivered),
    opens_unique_rate: ratio(opensUnique, delivered),
    clicks_unique_rate: ratio(clicksUnique, delivered),
  };
}

// ── dmarc_header_report fallback pass-rates ──────────────────────────────────
// spf_pass_rate   = spf_pass   / (spf_pass + spf_notpass)
// dkim_pass_rate  = dkim_pass  / (dkim_pass + dkim_notpass)
// dmarc_pass_rate = dmarc_pass / (dmarc_pass + dmarc_notpass)

export function passRate(pass: number | null, notPass: number | null): number | null {
  if (pass == null && notPass == null) return null;
  const p = pass ?? 0;
  const n = notPass ?? 0;
  const total = p + n;
  if (total === 0) return null;
  return p / total;
}
