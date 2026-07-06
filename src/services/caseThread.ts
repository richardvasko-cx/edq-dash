// Merges the external email thread (support_cases_email_message) and the internal comment thread
// (support_cases_case_comment) into one chronological CaseThreadEntry[] for a given case.
//
// This is a UI normalisation only — original Looker fields are preserved on each entry.

import type {
  CaseThreadEntry,
  EmailDirection,
  SupportCaseCommentRow,
  SupportCaseEmailMessageRow,
} from '../models/looker';

const BRAZE_DOMAINS = ['@braze.com', '@appboy.com'];

/** Direction is derived in-app until a native Salesforce incoming/outgoing field exists. */
export function deriveDirection(
  from: string | null | undefined,
  to: string | null | undefined,
): EmailDirection {
  const f = (from ?? '').toLowerCase();
  const t = (to ?? '').toLowerCase();
  const fromBraze = BRAZE_DOMAINS.some(d => f.includes(d));
  const toBraze = BRAZE_DOMAINS.some(d => t.includes(d));
  if (fromBraze && !toBraze) return 'outbound'; // Braze → customer
  if (toBraze && !fromBraze) return 'inbound'; // customer → Braze
  return 'unknown';
}

function ts(value: string | null | undefined): number {
  if (!value) return 0;
  const n = Date.parse(value);
  return Number.isNaN(n) ? 0 : n;
}

function emailToEntry(e: SupportCaseEmailMessageRow): CaseThreadEntry {
  return {
    id: e.id ?? '',
    case_id: e.case_id ?? '',
    communication_type: 'Email',
    communication_at: e.sent_time ?? e.created_time ?? null,
    created_by_id: e.created_by_id ?? null,
    direction: deriveDirection(e.from_address, e.to_address),
    from_address: e.from_address,
    to_address: e.to_address,
    subject: e.subject,
    text_body_cleaned: e.text_body_cleaned,
    text_body: e.text_body,
    has_attachment: e.has_attachment,
  };
}

function commentToEntry(c: SupportCaseCommentRow): CaseThreadEntry {
  return {
    id: c.id ?? '',
    case_id: c.case_id ?? '',
    communication_type: 'Case Comment',
    communication_at: c.created_time ?? null,
    created_by_id: c.created_by_id ?? null,
    created_by_name: c.created_by_name,
    created_by_role: c.created_by_role,
    created_by_team: c.created_by_team,
    comment_body: c.comment_body,
    is_published: c.is_published,
  };
}

/** Build one chronological thread for a case, oldest → newest. */
export function buildCaseThread(
  caseId: string,
  emails: SupportCaseEmailMessageRow[],
  comments: SupportCaseCommentRow[],
): CaseThreadEntry[] {
  const entries: CaseThreadEntry[] = [
    ...emails.filter(e => e.case_id === caseId).map(emailToEntry),
    ...comments.filter(c => c.case_id === caseId).map(commentToEntry),
  ];
  return entries.sort((a, b) => ts(a.communication_at) - ts(b.communication_at));
}
