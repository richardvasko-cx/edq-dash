// AI-generated Root Cause for the Overview tab — same logic as the Workspace
// "Root Cause" panel: reasons across THIS case's ticket detail, deliverability and
// email metrics, and auth/bounce signals only. Never references other accounts or
// past cases. Streams from the same endpoint the Gemini pill/panel use.

import { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import { cn } from '../../App';
import type { CaseRecord } from '../../data';

marked.setOptions({ gfm: true, breaks: true });
const mdToHtml = (md: string) => ({ __html: marked.parse(md || '') as string });
const pct = (v: number | undefined) => (v == null ? '—' : `${(v * 100).toFixed(1)}%`);

function buildRootCausePrompt(t: CaseRecord): string {
  const m = t.metrics;
  const authLine = `SPF ${t.spf_status} (${t.spf_description}), DKIM ${t.dkim_status} (${t.dkim_description}), DMARC ${t.dmarc_status} (${t.dmarc_description})`;
  const top = t.bounces?.[0];
  return (
    `Determine the single most likely ROOT CAUSE of THIS case only. Do not reference any other account or past case.\n` +
    `- Issue: "${t.case_subject}" — ${t.root_cause_summary}\n- Accepted ${pct(m.accepted_rate)}, bounce ${pct(m.bounce_rate)}, first-attempt delay ${pct(m.delayed_rate)}\n- Open ${pct(m.nonprefetched_open_rate)}, complaints ${pct(m.spam_complaint_rate)}\n- Authentication: ${authLine}\n` +
    (top ? `- Dominant bounce/defer: ${top.classification} at ${top.domain} — "${top.reason}"\n` : '') +
    `\nOutput: one **bold one-line verdict**, then 2–4 evidence bullets that cite the actual numbers/codes, then a final line exactly "Confidence: High" / "Medium" / "Low". No other sections, no recommendations.`
  );
}

// Persists generated root-cause text per ticket across unmounts, so switching tabs
// and returning to Overview reuses the result instead of regenerating every time.
const rootCauseCache = new Map<string, string>();

export default function RootCauseBody({ ticket, isDark }: { ticket: CaseRecord; isDark?: boolean }) {
  const [text, setText] = useState(() => rootCauseCache.get(ticket.case_number) ?? '');
  const [streaming, setStreaming] = useState(false);
  const ranFor = useRef<string | null>(null);

  const generate = async () => {
    const t = ticket;
    if (localStorage.getItem('edq_gemini_api_enabled') === 'false') {
      setText(ticket.root_cause_summary);
      setStreaming(false);
      return;
    }
    setStreaming(true);
    setText('');
    let answer = '';
    try {
      const res = await fetch('/api/workspace/section-stream', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: buildRootCausePrompt(t),
          ticketRef: { id: t.case_number, account: t.account_name },
          includeHistory: false,
        }),
      });
      if (!res.ok || !res.body) throw new Error('Stream request failed');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          try {
            const parsed = JSON.parse(line.slice(5).trim());
            if (parsed.token) { answer += parsed.token; setText(answer); }
            else if (parsed.done) { answer = parsed.text || answer; setText(answer); }
            else if (parsed.error) {
              answer = parsed.error === 'Failed to reach Gemini API'
                ? '⚠️ **Gemini API is not configured.** Please check your settings or `.env` file.'
                : `⚠️ ${parsed.error}`;
              setText(answer);
            }
          } catch { /* ignore partial frames */ }
        }
      }
      if (answer && !answer.startsWith('⚠️')) rootCauseCache.set(t.case_number, answer);
    } catch (e: any) {
      // Fall back to the ticket's own summary if the model is unreachable.
      if (!answer) setText(ticket.root_cause_summary);
    } finally {
      setStreaming(false);
    }
  };

  // Generate once per ticket; reuse the cached result on remount (e.g. returning to Overview).
  useEffect(() => {
    if (ranFor.current === ticket.case_number) return;
    ranFor.current = ticket.case_number;
    const cached = rootCauseCache.get(ticket.case_number);
    if (cached) { setText(cached); return; }
    generate();
  }, [ticket.case_number]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-3">
      {streaming && !text ? (
        <div className="flex flex-col gap-2 pt-1">
          <div className="gemini-skel" style={{ width: '100%' }} />
          <div className="gemini-skel" style={{ width: '92%', animationDelay: '0.18s' }} />
          <div className="gemini-skel" style={{ width: '64%', animationDelay: '0.36s' }} />
        </div>
      ) : (
        <div
          className={cn('ai-prose text-sm leading-relaxed text-on-surface-variant dark:text-inverse-on-surface/85', isDark && 'ai-prose-dark')}
          dangerouslySetInnerHTML={mdToHtml(text || ticket.root_cause_summary)}
        />
      )}
      {!streaming && (
        <button
          onClick={generate}
          className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold text-outline hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-[15px]">autorenew</span>
          Refresh
        </button>
      )}
    </div>
  );
}
