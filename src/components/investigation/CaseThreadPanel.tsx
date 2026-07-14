// Support History → Case thread. Single chronological thread of external customer
// emails + internal case comments rendered as clean accordion cards (mockup-aligned):
// each entry is a collapsed row with a clear type/direction label, expandable to show
// the body. Customer emails and internal comments stay visually distinct. The first
// (most recent context) entry is expanded by default.

import { useEffect, useMemo, useState } from 'react';
import { cn } from '../../App';
import { useCaseThread } from '../../hooks/useCaseThread';
import type { CaseThreadEntry } from '../../models/looker';
import type { CaseThreadMessage } from '../../services/caseDataset';

function canonicalThreadEntries(caseId: string | null | undefined, messages: CaseThreadMessage[] = []): CaseThreadEntry[] {
  return messages.map(message => {
    const isEmail = message.comm_type === 'email';
    const direction = message.direction === 'inbound' || message.direction === 'outbound'
      ? message.direction
      : 'unknown';

    if (isEmail) {
      return {
        id: message.message_id,
        case_id: caseId ?? '',
        communication_type: 'Email',
        communication_at: message.timestamp,
        created_by_id: null,
        direction,
        from_address: message.sender_name,
        to_address: message.recipient_name,
        subject: message.subject,
        text_body_cleaned: message.message,
        text_body: message.message,
        has_attachment: false,
      };
    }

    return {
      id: message.message_id,
      case_id: caseId ?? '',
      communication_type: 'Case Comment',
      communication_at: message.timestamp,
      created_by_id: null,
      created_by_name: message.sender_name,
      created_by_role: message.sender_type === 'owner' ? 'Deliverability Consultant' : 'Customer Contact',
      created_by_team: message.channel_scope === 'internal' ? 'Case team' : 'Customer team',
      comment_body: message.message,
      is_published: message.visibility === 'external',
    };
  });
}

function fmtTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function ThreadCard({ e, defaultOpen }: { key?: string; e: CaseThreadEntry; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [full, setFull] = useState(false);
  const isEmail = e.communication_type === 'Email';
  const outbound = e.direction === 'outbound';
  const published = e.is_published === true;
  const hasFull = isEmail && !!e.text_body && e.text_body !== e.text_body_cleaned;

  const label = isEmail
    ? `Customer Email · ${e.direction === 'unknown' ? 'INTERNAL' : outbound ? 'OUTBOUND' : 'INBOUND'}`
    : `Internal Comment${e.created_by_team ? ` · ${e.created_by_team}` : ''}`;

  const who = isEmail
    ? `${e.from_address ?? '—'} → ${e.to_address ?? '—'}`
    : `${e.created_by_name ?? e.created_by_id ?? 'Unknown'}${e.created_by_role ? ` · ${e.created_by_role}` : ''}`;

  return (
    <div className={cn(
      'rounded-xl border overflow-hidden transition-colors',
      open ? 'border-2 border-[#1A73E8] bg-white dark:bg-inverse-surface/40' : 'border-outline-variant/20 bg-surface-container-lowest dark:bg-inverse-surface/30',
    )}>
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
        <span className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0',
          isEmail ? 'bg-[#E8F0FE] text-[#1A73E8] dark:bg-[#1A73E8]/20 dark:text-[#8AB4F8]' : 'bg-[#FEF7E0] text-[#9A6700] dark:bg-[#F59E0B]/15 dark:text-[#FBD38D]',
        )}>
          <span className="material-symbols-outlined text-[18px]">{isEmail ? 'mail' : 'sticky_note_2'}</span>
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn('text-[10px] font-black uppercase tracking-wider', isEmail ? 'text-[#1A73E8] dark:text-[#8AB4F8]' : 'text-[#9A6700] dark:text-[#FBD38D]')}>{label}</span>
            {!isEmail && (
              <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full border',
                published ? 'text-[#137333] bg-[#E6F4EA] border-[#C8E6C9] dark:bg-[#137333]/15 dark:border-[#137333]/30 dark:text-[#81C995]' : 'text-outline bg-surface-variant border-outline-variant/30',
              )}>{published ? 'SHARED' : 'INTERNAL ONLY'}</span>
            )}
          </div>
          <p className="text-[12px] font-semibold text-on-surface dark:text-inverse-on-surface truncate mt-0.5">
            {isEmail ? (e.subject || '(no subject)') : who}
          </p>
        </div>
        <span className="text-[11px] text-outline shrink-0 hidden sm:block">{fmtTime(e.communication_at)}</span>
        <span className={cn('material-symbols-outlined text-[20px] text-outline transition-transform shrink-0', open && 'rotate-180')}>expand_more</span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0">
          <p className="text-[11px] text-outline mb-2 font-mono break-all">{who}{e.has_attachment && <span className="material-symbols-outlined text-[13px] ml-2 align-middle">attach_file</span>}</p>
          <p className="text-[13px] text-on-surface-variant dark:text-inverse-on-surface/85 leading-relaxed whitespace-pre-wrap">
            {isEmail ? (full && e.text_body ? e.text_body : e.text_body_cleaned) : e.comment_body}
          </p>
          {hasFull && (
            <button onClick={() => setFull(v => !v)} className="text-[11px] font-semibold text-[#1A73E8] dark:text-[#8AB4F8] mt-2 hover:underline">
              {full ? 'Show cleaned message' : 'View complete email'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function CaseThreadPanel({
  caseId,
  accountName,
  caseNumber,
  messages,
}: {
  caseId: string | null | undefined;
  accountName?: string | null;
  caseNumber?: string | null;
  messages?: CaseThreadMessage[];
}) {
  const { status, entries, emailCount, commentCount, error } = useCaseThread(caseId);
  const canonicalEntries = useMemo(() => canonicalThreadEntries(caseId, messages), [caseId, messages]);
  // The active case dataset is canonical for the demo. Legacy Looker fixtures are
  // retained only as a fallback for a case that has no embedded thread data.
  const displayEntries = canonicalEntries.length > 0 ? canonicalEntries : entries;
  const displayStatus = displayEntries.length > 0 ? 'available' : status;
  const displayEmailCount = displayEntries.filter(entry => entry.communication_type === 'Email').length;
  const displayCommentCount = displayEntries.filter(entry => entry.communication_type === 'Case Comment').length;
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => { setOpenId(displayEntries[0]?.id ?? null); }, [displayEntries]);

  return (
    <div
      data-gem-panel
      data-gem-panel-label="Case Thread (Support History)"
      data-gem-panel-content={`Account: ${accountName} | Case: ${caseNumber ?? caseId} | ${displayEmailCount || emailCount} emails, ${displayCommentCount || commentCount} internal comments`}
      className="flex flex-col gap-3"
    >
      {displayStatus === 'loading' ? (
        <div className="flex items-center gap-2 text-[13px] text-outline px-1 py-2">
          <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Loading case thread…
        </div>
      ) : displayStatus === 'unavailable' ? (
        <div className="flex items-center gap-2 text-[13px] text-outline px-1 py-2">
          <span className="material-symbols-outlined text-[18px]">cloud_off</span> {error ?? 'Communication sources unavailable.'}
        </div>
      ) : displayEntries.length === 0 ? (
        <div className="flex items-center gap-2 text-[13px] text-outline px-1 py-2">
          <span className="material-symbols-outlined text-[18px]">forum</span> No communications for this case yet.
        </div>
      ) : (
        displayEntries.map((entry, i) => (
          <ThreadCard key={entry.id} e={entry} defaultOpen={openId ? entry.id === openId : i === 0} />
        ))
      )}
    </div>
  );
}
