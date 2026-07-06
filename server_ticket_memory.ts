// ─────────────────────────────────────────────────────────────────────────────
// On-device historical-ticket memory for the deliverability agent.
//
// Gives the Gemini agent a "long-term memory" of past tickets, split into
// two retrieval lanes:
//   1. SAME ACCOUNT  — full fidelity (it's the customer's own history).
//   2. OTHER ACCOUNTS — PII-scrubbed: the deliverability *pattern and fix* is
//      shared, but account names, contacts, domains, campaign IDs and emails are
//      redacted so no account-specific data ever leaks across customers.
//
// Everything is keyword-scored locally — no data leaves the device.
// ─────────────────────────────────────────────────────────────────────────────

interface AnyTicket {
  id: string;
  subject: string;
  account: string;
  contact: string;
  tier?: string;
  campaignId?: string;
  status: string;
  priority?: string;
  assigned?: string;
  tags?: string[];
  rcaSummary?: string;
  deliveryRate?: string;
  bounceRate?: string;
  openRate?: string;
  spamRate?: string;
  domain?: string;
  dkimSelector?: string;
  spfStatus?: string; spfDesc?: string;
  dkimStatus?: string; dkimDesc?: string;
  dmarcStatus?: string; dmarcDesc?: string;
  bounceData?: { domain?: string; bounces?: string; reason?: string; category?: string; classification?: string }[];
  diagnosticsCard?: { title?: string; desc?: string; status?: string };
}

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'has', 'are', 'was',
  'what', 'why', 'how', 'when', 'which', 'into', 'about', 'a', 'an', 'of', 'to', 'in',
  'on', 'is', 'it', 'as', 'at', 'by', 'or', 'be', 'we', 'i', 'my', 'me', 'our', 'us',
  'ticket', 'account', 'rate', 'issue', 'please', 'help', 'can', 'you', 'do', 'does',
]);

function tokenize(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9.%_-]+/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOPWORDS.has(t));
}

/** A compact, case-folded blob of every signal worth matching on. */
function searchableBlob(t: AnyTicket): string {
  const parts: string[] = [
    t.subject || '',
    (t.tags || []).join(' '),
    t.rcaSummary || '',
    t.spfStatus || '', t.spfDesc || '',
    t.dkimStatus || '', t.dkimDesc || '',
    t.dmarcStatus || '', t.dmarcDesc || '',
    t.diagnosticsCard?.title || '', t.diagnosticsCard?.desc || '',
  ];
  (t.bounceData || []).forEach(b => parts.push(b.reason || '', b.classification || '', b.category || ''));
  return parts.join(' ');
}

/**
 * Build the list of literal strings that identify a given ticket's account and
 * must be stripped from any cross-account share.
 */
function identifiersOf(t: AnyTicket): string[] {
  const ids = new Set<string>();
  const add = (s?: string) => { if (s && s.trim().length > 1) ids.add(s.trim()); };
  add(t.account);
  add(t.contact);
  add(t.domain);
  add(t.campaignId);
  add(t.dkimSelector);
  add(t.assigned);
  // Individual significant words from the account name (e.g. "Acme", "Logistics").
  (t.account || '').split(/[^A-Za-z0-9]+/).forEach(w => { if (w.length > 2) add(w); });
  // Bounce-data domains are also account-identifying recipient/sender hints.
  (t.bounceData || []).forEach(b => add(b.domain));
  // Longest first so we redact "Acme Corp E-commerce" before "Acme".
  return Array.from(ids).sort((a, b) => b.length - a.length);
}

/** Redact emails, the ticket's own identifiers, campaign IDs and bare domains. */
function redact(text: string, identifiers: string[]): string {
  if (!text) return text;
  let out = text;
  // Emails first.
  out = out.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[email]');
  // The account's own identifying strings.
  for (const id of identifiers) {
    if (!id) continue;
    const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(esc, 'gi'), id.includes('.') ? '[domain]' : '[redacted]');
  }
  // Any remaining bare domains and campaign-style IDs.
  out = out.replace(/\b[a-z0-9-]+\.(?:com|net|org|io|co|biz|info)\b/gi, '[domain]');
  out = out.replace(/\bCMP-[A-Z0-9-]+\b/gi, '[campaign]');
  return out;
}

function resolutionOf(t: AnyTicket): string {
  const resolved = String(t.status).toLowerCase() === 'closed';
  const card = t.diagnosticsCard;
  if (card?.title || card?.desc) {
    return `${resolved ? 'Resolved' : 'Working theory'}: ${[card.title, card.desc].filter(Boolean).join(' — ')}`;
  }
  return resolved ? 'Resolved (see root-cause summary)' : 'Still open';
}

/** Full-fidelity block for a same-account historical ticket. */
function formatSameAccount(t: AnyTicket): string {
  const lines = [
    `• Ticket ${t.id} — "${t.subject}" [${t.status}]`,
    `  Root cause: ${t.rcaSummary || 'n/a'}`,
    `  Auth: SPF ${t.spfStatus || '?'} (${t.spfDesc || ''}), DKIM ${t.dkimStatus || '?'}, DMARC ${t.dmarcStatus || '?'} (${t.dmarcDesc || ''})`,
    `  Metrics: delivery ${t.deliveryRate || '?'}, bounce ${t.bounceRate || '?'}, spam ${t.spamRate || '?'}`,
    `  ${resolutionOf(t)}`,
  ];
  return lines.join('\n');
}

/** PII-scrubbed block for a cross-account historical ticket. */
function formatOtherAccount(t: AnyTicket, label: string): string {
  const ids = identifiersOf(t);
  const lines = [
    `• ${label} (similar deliverability pattern, ${t.tier ? 'comparable tier' : 'anonymized'})`,
    `  Symptom: ${redact(t.subject, ids)}`,
    `  Pattern: ${redact(t.rcaSummary || '', ids) || 'n/a'}`,
    `  Auth signals: SPF ${t.spfStatus || '?'}, DKIM ${t.dkimStatus || '?'}, DMARC ${t.dmarcStatus || '?'}`,
    `  What helped: ${redact(resolutionOf(t), ids)}`,
  ];
  // A representative bounce classification (domain scrubbed) is a useful, safe signal.
  const b = (t.bounceData || [])[0];
  if (b?.classification) lines.push(`  Bounce profile: ${b.classification} / ${b.category || 'n/a'}`);
  return lines.join('\n');
}

export interface TicketRef { id?: string; account?: string }

export interface HistoricalMemoryResult {
  block: string;          // Ready-to-inject prompt section ('' if nothing relevant).
  sameAccountCount: number;
  otherAccountCount: number;
}

/**
 * Retrieve the most relevant historical tickets for the current query/screen.
 * @param query   user prompt + serialized on-screen context
 * @param ref     identity of the ticket currently in focus (id/account)
 * @param tickets the full in-memory ticket list
 */
export function searchHistoricalTickets(
  query: string,
  ref: TicketRef | undefined,
  tickets: AnyTicket[],
): HistoricalMemoryResult {
  const empty: HistoricalMemoryResult = { block: '', sameAccountCount: 0, otherAccountCount: 0 };
  if (!Array.isArray(tickets) || tickets.length === 0) return empty;

  const queryTerms = new Set(tokenize(query));
  if (queryTerms.size === 0) return empty;

  const currentId = ref?.id?.toUpperCase().trim();
  const currentAccount = ref?.account?.toLowerCase().trim();

  type Scored = { t: AnyTicket; score: number; sameAccount: boolean };
  const scored: Scored[] = [];

  for (const t of tickets) {
    // Skip the ticket currently in focus — it's already injected as live context.
    if (currentId && t.id.toUpperCase().trim() === currentId) continue;

    const blobTerms = tokenize(searchableBlob(t));
    let score = 0;
    for (const term of blobTerms) if (queryTerms.has(term)) score += 1;
    if (score === 0) continue;

    const sameAccount = !!currentAccount && t.account.toLowerCase().trim() === currentAccount;
    if (sameAccount) score += 5; // strongly prefer the customer's own history
    scored.push({ t, score, sameAccount });
  }

  if (scored.length === 0) return empty;
  scored.sort((a, b) => b.score - a.score);

  const same = scored.filter(s => s.sameAccount).slice(0, 3);
  const other = scored.filter(s => !s.sameAccount).slice(0, 3);

  const sections: string[] = [];
  if (same.length) {
    sections.push(
      `SAME ACCOUNT — prior tickets for this customer (full history, safe to reference directly):\n` +
      same.map(s => formatSameAccount(s.t)).join('\n'),
    );
  }
  if (other.length) {
    sections.push(
      `OTHER ACCOUNTS — anonymized precedents (deliverability pattern only; account names, contacts and domains have been REDACTED to protect PII — never attempt to identify these accounts):\n` +
      other.map((s, i) => formatOtherAccount(s.t, `Peer account ${String.fromCharCode(65 + i)}`)).join('\n'),
    );
  }

  if (sections.length === 0) return empty;
  return {
    block: sections.join('\n\n'),
    sameAccountCount: same.length,
    otherAccountCount: other.length,
  };
}
