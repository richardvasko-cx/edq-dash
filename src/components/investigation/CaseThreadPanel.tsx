// Support History → Case Thread. Deliberately mirrors the compact support-console
// composition: staggered pale rows, scope pills, message previews and disclosure.

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
        // Preserve the canonical support visibility so the thread labels reflect
        // the actual record rather than inferring scope from email direction.
        is_published: message.channel_scope === 'external',
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

function ThreadEntry({ e }: { e: CaseThreadEntry }) {
  const isEmail = e.communication_type === 'Email';
  const body = isEmail ? (e.text_body_cleaned || e.text_body) : e.comment_body;

  return (
    <article className="px-2 pb-5">
      {isEmail && e.subject && <p className="mb-2 text-[13px] font-medium text-[#202124] dark:text-inverse-on-surface">Subject: {e.subject}</p>}
      <p className="text-[14px] leading-relaxed text-[#5F6368] dark:text-inverse-on-surface/70">{body || 'No message content available.'}</p>
    </article>
  );
}

function ReplyEntry({ entry }: { entry: CaseThreadEntry }) {
  const isEmail = entry.communication_type === 'Email';
  const author = isEmail ? entry.from_address : entry.created_by_name ?? entry.created_by_id ?? 'Case contact';
  const body = isEmail ? (entry.text_body_cleaned || entry.text_body) : entry.comment_body;
  return (
    <article className="ml-4 border-l-2 border-dotted border-[#8AB4F8] py-3 pl-4 sm:ml-8">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] font-bold text-on-surface">Reply from {author}</span>
        <time className="text-[11px] text-on-surface-variant/70">{fmtTime(entry.communication_at)}</time>
      </div>
      <p className="mt-1.5 text-[13px] leading-relaxed text-on-surface-variant">{body || 'No message content available.'}</p>
    </article>
  );
}

function MessageAccordion({ entry, replies, open, onToggle }: { entry: CaseThreadEntry; replies: CaseThreadEntry[]; open: boolean; onToggle: () => void }) {
  const isEmail = entry.communication_type === 'Email';
  const author = isEmail ? entry.from_address : entry.created_by_name ?? entry.created_by_id;
  const scope = entry.is_published === true ? 'External' : 'Internal';

  return (
    <section className="overflow-hidden rounded-[24px] bg-surface-container-low shadow-[0_1px_2px_rgba(32,33,36,0.12)] dark:bg-inverse-surface/20">
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{isEmail ? 'mail' : 'comment'}</span>
        </span>
        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-[15px] font-bold text-on-surface dark:text-inverse-on-surface">{isEmail ? 'Email' : 'Comment'}</span>
          <span className="truncate text-[14px] font-medium text-on-surface-variant">{author || 'Case contact'}</span>
          <span className="rounded-lg border border-outline-variant px-2 py-1 text-[10px] font-bold text-on-surface-variant">{scope}</span>
          {replies.length > 0 && <span className="rounded-full bg-[#E8F0FE] px-2.5 py-1 text-[10px] font-bold text-[#1967D2]">{replies.length} {replies.length === 1 ? 'reply' : 'replies'} · expand</span>}
          <time className="ml-auto mr-1 whitespace-nowrap text-[12px] text-on-surface-variant/75">{fmtTime(entry.communication_at)}</time>
        </span>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={cn('h-7 w-7 shrink-0 text-[#1A73E8] transition-transform duration-300 ease-out', open && 'rotate-45')}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
      <div className={cn('grid transition-[grid-template-rows] duration-300 ease-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <div className="border-t border-outline-variant/60 bg-[#F8F9FA] px-5 pt-4 dark:bg-white/5">
            <ThreadEntry e={entry} />
            {replies.map(reply => <ReplyEntry key={reply.id} entry={reply} />)}
          </div>
        </div>
      </div>
    </section>
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
  const threadGroups = useMemo(() => {
    const groups: Array<{ entry: CaseThreadEntry; replies: CaseThreadEntry[] }> = [];
    for (let index = 0; index < displayEntries.length; index += 1) {
      const entry = displayEntries[index];
      const next = displayEntries[index + 1];
      const entryAuthor = entry.communication_type === 'Email' ? entry.from_address : entry.created_by_name ?? entry.created_by_id;
      const nextAuthor = next?.communication_type === 'Email' ? next.from_address : next?.created_by_name ?? next?.created_by_id;
      const isReply = Boolean(next && next.communication_type === 'Case Comment' && nextAuthor && nextAuthor !== entryAuthor);
      groups.push({ entry, replies: isReply ? [next] : [] });
      if (isReply) index += 1;
    }
    return groups;
  }, [displayEntries]);
  const [openMessageId, setOpenMessageId] = useState<string | null>(null);

  useEffect(() => {
    setOpenMessageId(current => {
      if (current && threadGroups.some(group => group.entry.id === current)) return current;
      return threadGroups[0]?.entry.id ?? null;
    });
  }, [threadGroups]);

  return (
    <div
      data-gem-panel
      data-gem-panel-label="Case Thread (Support History)"
      data-gem-panel-content={`Account: ${accountName} | Case: ${caseNumber ?? caseId} | ${displayEmailCount || emailCount} emails, ${displayCommentCount || commentCount} internal comments`}
      className="w-full"
    >
      <div className="flex flex-col gap-3">
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
          threadGroups.map(({ entry, replies }) => (
            <MessageAccordion
              key={entry.id}
              entry={entry}
              replies={replies}
              open={openMessageId === entry.id}
              onToggle={() => setOpenMessageId(current => current === entry.id ? null : entry.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
