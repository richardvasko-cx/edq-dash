// AI-generated Root Cause for the Overview tab — same logic as the Workspace
// "Root Cause" panel: reasons across THIS case's ticket detail, deliverability and
// email metrics, and auth/bounce signals only. Never references other accounts or
// past cases. Streams from the same endpoint the Gemini pill/panel use.

import { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../App';
import GeminiIcon from '../GeminiIcon';
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
    `\nOutput: one **bold one-line verdict**, then 2–4 evidence bullets that cite the actual numbers/codes, then two final lines exactly in this format:\n"Confidence: NN% (High|Medium|Low)"\n"Confidence basis: one concise sentence explaining why the available evidence supports that percentage."\nNo other sections, no recommendations.`
  );
}

// Persists generated root-cause text per ticket across unmounts, so switching tabs
// and returning to Overview reuses the result instead of regenerating every time.
const ROOT_CAUSE_PROMPT_VERSION = 'numeric-confidence-v2';
const rootCauseCache = new Map<string, string>();
const rootCauseUpdatedAtCache = new Map<string, number>();

function cacheKey(ticket: CaseRecord) {
  return `${ROOT_CAUSE_PROMPT_VERSION}:${ticket.case_number}`;
}

function fallbackConfidence(ticket: CaseRecord) {
  const metrics = ticket.metrics;
  let score = 42;
  if (ticket.root_cause_summary) score += 12;
  if (ticket.bounces?.[0]?.reason) score += 18;
  if (metrics.bounce_rate > 0.02 || metrics.delayed_rate > 0.02) score += 10;
  if ([ticket.spf_status, ticket.dkim_status, ticket.dmarc_status].some(status => status === 'FAIL')) score += 8;
  return Math.max(35, Math.min(score, 88));
}

export default function RootCauseBody({ ticket, isDark, onUpdatedAt }: { ticket: CaseRecord; isDark?: boolean; onUpdatedAt?: (updatedAt: number) => void }) {
  const [text, setText] = useState(() => rootCauseCache.get(cacheKey(ticket)) ?? '');
  const [streaming, setStreaming] = useState(false);
  const [confidenceExpanded, setConfidenceExpanded] = useState(false);
  const ranFor = useRef<string | null>(null);

  const generate = async () => {
    const t = ticket;
    if (localStorage.getItem('edq_gemini_api_enabled') === 'false') {
      setText(ticket.root_cause_summary);
      const updatedAt = Date.now();
      rootCauseUpdatedAtCache.set(cacheKey(ticket), updatedAt);
      onUpdatedAt?.(updatedAt);
      setStreaming(false);
      return;
    }
    setStreaming(true);
    setText('');
    let answer = '';
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch('/api/workspace/section-stream', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
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
      if (answer && !answer.startsWith('⚠️')) {
        rootCauseCache.set(cacheKey(t), answer);
        const updatedAt = Date.now();
        rootCauseUpdatedAtCache.set(cacheKey(t), updatedAt);
        onUpdatedAt?.(updatedAt);
      }
    } catch (e: any) {
      // Fall back to the ticket's own summary if the model is unreachable.
      if (!answer) {
        setText(ticket.root_cause_summary);
        const updatedAt = Date.now();
        rootCauseUpdatedAtCache.set(cacheKey(t), updatedAt);
        onUpdatedAt?.(updatedAt);
      }
    } finally {
      window.clearTimeout(timeout);
      setStreaming(false);
    }
  };

  // Generate once per ticket; reuse the cached result on remount (e.g. returning to Overview).
  useEffect(() => {
    if (ranFor.current === ticket.case_number) return;
    ranFor.current = ticket.case_number;
    const cached = rootCauseCache.get(cacheKey(ticket));
    if (cached) {
      setText(cached);
      const updatedAt = rootCauseUpdatedAtCache.get(cacheKey(ticket));
      if (updatedAt) onUpdatedAt?.(updatedAt);
      return;
    }
    generate();
  }, [ticket.case_number]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderedText = text || ticket.root_cause_summary;
  const confidenceMatch = renderedText.match(/Confidence:\s*(\d{1,3})%\s*(?:\((High|Medium|Low)\))?/i);
  const confidencePct = confidenceMatch ? Math.max(0, Math.min(Number(confidenceMatch[1]), 100)) : fallbackConfidence(ticket);
  const confidence = confidenceMatch?.[2]?.toLowerCase() ?? (confidencePct >= 70 ? 'high' : confidencePct < 45 ? 'low' : 'medium');
  const confidenceLabel = confidence.charAt(0).toUpperCase() + confidence.slice(1);
  const confidenceBasisMatch = renderedText.match(/Confidence basis:\s*([^\n]+)/i);
  const confidenceBasis = confidenceBasisMatch?.[1]?.trim()
    ?? 'The score is calculated from the available case-specific diagnosis, bounce pattern, delivery metrics, and authentication signals.';
  const evidenceText = renderedText
    .replace(/\n?\**Confidence:\s*(?:\d{1,3}%\s*(?:\((?:High|Medium|Low)\))?|High|Medium|Low)\**\.?/i, '')
    .replace(/\n?\**Confidence basis:\s*[^\n]*\**\.?/i, '')
    .trim();
  const topBounce = ticket.bounces?.[0];
  const supportSignals = [
    { label: 'Delivery pattern', value: `Accepted ${pct(ticket.metrics.accepted_rate)} · bounce ${pct(ticket.metrics.bounce_rate)} · delayed ${pct(ticket.metrics.delayed_rate)}` },
    { label: 'Engagement signal', value: `Confirmed open ${pct(ticket.metrics.nonprefetched_open_rate)} · complaints ${pct(ticket.metrics.spam_complaint_rate)}` },
    { label: 'Authentication', value: `SPF ${ticket.spf_status} · DKIM ${ticket.dkim_status} · DMARC ${ticket.dmarc_status}` },
    ...(topBounce ? [{ label: 'Dominant mailbox response', value: `${topBounce.classification} at ${topBounce.domain}: ${topBounce.reason}` }] : []),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <div
          className={cn('ai-prose rounded-2xl bg-[#E7EDF8] px-5 py-4 text-sm leading-relaxed text-[#4E5869] dark:bg-[#2C3140] dark:text-inverse-on-surface/85', isDark && 'ai-prose-dark')}
          dangerouslySetInnerHTML={mdToHtml(evidenceText)}
        />
        {streaming && (
          <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-on-surface-variant dark:text-inverse-on-surface/60">
            <GeminiIcon className="h-3.5 w-3.5 gemini-twinkle" />
            Gemini is refreshing this assessment…
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setConfidenceExpanded(current => !current)}
          className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm font-bold text-on-surface-variant transition-colors hover:bg-black/5 dark:text-inverse-on-surface/75 dark:hover:bg-white/5"
          aria-expanded={confidenceExpanded}
        >
          <span>Confidence</span>
          <span className={cn('rounded-full px-2.5 py-1 text-xs font-black text-white', confidence === 'high' ? 'bg-[#137333]' : confidence === 'low' ? 'bg-[#C26400]' : 'bg-[#1A73E8]')}>{confidencePct}%</span>
          <span>{confidenceLabel}</span>
          <span className="material-symbols-outlined text-[19px]">{confidenceExpanded ? 'expand_less' : 'expand_more'}</span>
        </button>
        {!streaming && (
          <button onClick={generate} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold text-outline transition-colors hover:bg-black/5 dark:hover:bg-white/5">
            <span className="material-symbols-outlined text-[18px]">autorenew</span>
            Refresh
          </button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {confidenceExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-outline-variant/40 pt-4 dark:border-white/10">
              <div className="mb-2 flex items-center gap-2 text-xs font-black text-on-surface dark:text-inverse-on-surface">
                <GeminiIcon className="h-4 w-4" />
                Gemini confidence rationale
              </div>
              <p className="text-xs leading-relaxed text-on-surface-variant dark:text-inverse-on-surface/65">{confidenceBasis}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {supportSignals.map(signal => (
                  <div key={signal.label} className="rounded-xl border border-outline-variant/35 bg-white/60 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.03]">
                    <p className="text-[10px] font-black uppercase tracking-wide text-primary">{signal.label}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-on-surface-variant dark:text-inverse-on-surface/65">{signal.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
