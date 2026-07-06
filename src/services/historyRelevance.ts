// Deterministic historical-ticket relevance scoring (brief §15.5).
// Scores a historical/other ticket against the current one on shared deliverability signals.
// The AI may explain relevance, but this scoring is the source of truth — not the only mechanism.

import type { CaseRecord } from '../data';

export interface TicketEvidence {
  mta: string | null;
  mailboxProviders: string[];
  providerCodes: string[];
  classifications: string[];
  sendingDomains: string[];
}

export interface RelevanceResult {
  score: number;
  reasons: string[];
}

const MAILBOX_PROVIDER_DOMAINS: Record<string, string[]> = {
  gmail: ['gmail.com', 'googlemail.com'],
  microsoft: ['outlook.com', 'hotmail.com', 'live.com', 'msn.com'],
  yahoo: ['yahoo.com', 'ymail.com', 'rocketmail.com', 'aol.com'],
  apple: ['icloud.com', 'me.com', 'mac.com'],
};

function mailboxProviderOf(domain: string): string {
  const d = domain.toLowerCase();
  for (const [provider, domains] of Object.entries(MAILBOX_PROVIDER_DOMAINS)) {
    if (domains.includes(d)) return provider;
  }
  return d;
}

/** Pull deliverability signals from a case's fields + bounce data. */
export function extractEvidence(t: CaseRecord): TicketEvidence {
  const mailbox = new Set<string>();
  const codes = new Set<string>();
  const classifications = new Set<string>();

  for (const b of t.bounces ?? []) {
    if (b.domain) mailbox.add(mailboxProviderOf(b.domain));
    if (b.classification) classifications.add(b.classification.toLowerCase());
    // SMTP codes (e.g. 421, 550, 554) and Microsoft S-codes (S3140).
    for (const m of (b.reason ?? '').matchAll(/\b([45]\d{2})\b|\b(S\d{3,4})\b/g)) {
      codes.add((m[1] ?? m[2]).toUpperCase());
    }
  }

  return {
    mta: t.email_service_provider || null,
    mailboxProviders: [...mailbox],
    providerCodes: [...codes],
    classifications: [...classifications],
    sendingDomains: (t.sending_domains ?? []).map(d => d.toLowerCase()),
  };
}

function intersects(a: string[], b: string[]): boolean {
  const set = new Set(a);
  return b.some(x => set.has(x));
}

export function scoreHistoricalTicket(current: TicketEvidence, historical: TicketEvidence): RelevanceResult {
  let score = 0;
  const reasons: string[] = [];

  if (current.mta && current.mta === historical.mta) {
    score += 15; reasons.push('Same MTA');
  }
  if (intersects(current.mailboxProviders, historical.mailboxProviders)) {
    score += 20; reasons.push('Same mailbox provider');
  }
  if (intersects(current.providerCodes, historical.providerCodes)) {
    score += 25; reasons.push('Same provider response code');
  }
  if (intersects(current.classifications, historical.classifications)) {
    score += 20; reasons.push('Same deliverability classification');
  }
  if (intersects(current.sendingDomains, historical.sendingDomains)) {
    score += 25; reasons.push('Same sending domain');
  }

  return { score: Math.min(score, 100), reasons };
}

export interface ScoredTicket {
  ticket: CaseRecord;
  score: number;
  reasons: string[];
}

/** Rank candidate cases by relevance to the current case. Returns only score > 0, desc. */
export function rankRelevant(current: CaseRecord, candidates: CaseRecord[]): ScoredTicket[] {
  const cur = extractEvidence(current);
  return candidates
    .filter(c => c.case_number !== current.case_number)
    .map(c => {
      const { score, reasons } = scoreHistoricalTicket(cur, extractEvidence(c));
      return { ticket: c, score, reasons };
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);
}
