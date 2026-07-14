// Overview — AI Suggested Next Steps.
//
// GENERATED (not a verbatim copy of the dataset actions): the model synthesises this
// case's data with (a) prior cases on THIS account, (b) similar resolved cases on OTHER
// accounts (identifiers redacted — no PII), and (c) email-deliverability best practice /
// User Guide guidance. Steps are practical and specific.
//
// Ownership framing: these are deliverability recommendations, NOT team task assignments.
// The customer owns their own actions (DNS records at their provider; segments, suppression,
// cadence, content and warm-up in Braze; their own mailbox-provider escalations). Customers
// do not have direct SparkPost, SendGrid, Amazon SES, MTA console, or Braze-managed IP access.
// "Email Ops" is only relevant for technical set-up inside Braze — never implied to act for
// the customer. We do not route steps to internal teams here unless a step genuinely cannot
// be done by the customer.

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../App';
import type { CaseRecord } from '../../data';
import { isClosedCase } from '../../data';
import { useCaseDataset } from '../../hooks/useCaseDataset';
import { rankRelevant } from '../../services/historyRelevance';

const pct = (v: number | undefined) => (v == null ? '—' : `${(v * 100).toFixed(1)}%`);

// Strip dataset owner prefixes ("Customer Email Ops: …", "Deliverability Team: …") so the
// instant seed reads as plain deliverability steps, not team assignments.
const stripOwner = (a: string) => a.replace(/^\s*(Customer\s+[A-Za-z /]+|Deliverability Team|Customer Contact)\s*:\s*/i, '').trim();

interface Precedent { sameAccount: string[]; crossAccount: string[]; topMatch: { score: number; resolution: string } | null }

function buildPrecedent(t: CaseRecord, all: CaseRecord[]): Precedent {
  const sameAccount = all
    .filter(c => c.account_id === t.account_id && c.case_number !== t.case_number && isClosedCase(c) && c.resolution_summary)
    .slice(0, 2)
    .map(c => `${c.case_subject}: ${c.resolution_summary}`);
  const ranked = rankRelevant(t, all.filter(c => c.account_id !== t.account_id && isClosedCase(c)));
  const crossAccount = ranked.slice(0, 3)
    .filter(r => r.ticket.resolution_summary)
    // Redacted — no other customer's name/identifiers, just the signal match + resolution.
    .map(r => `Similar case (${r.score}% signal match, ${r.reasons.join(', ').toLowerCase()}): ${r.ticket.resolution_summary}`);
  const top = ranked[0];
  return {
    sameAccount,
    crossAccount,
    topMatch: top && top.ticket.resolution_summary ? { score: top.score, resolution: top.ticket.resolution_summary } : null,
  };
}

function buildPrompt(t: CaseRecord, p: Precedent): string {
  const m = t.metrics;
  const top = t.bounces?.[0];
  const authLine = `SPF ${t.spf_status}, DKIM ${t.dkim_status}, DMARC ${t.dmarc_status} (${t.dmarc_policy || 'policy n/a'})`;
  return (
    `Produce the SUGGESTED NEXT STEPS to resolve this email deliverability case. Synthesise THREE inputs: (1) this case's data, (2) the precedent from prior/similar resolved cases provided below, and (3) standard email-deliverability best practice and Braze User Guide guidance (SPF/DKIM/DMARC alignment, throttling/deferral recovery, IP/domain warm-up, list hygiene & suppression, complaint/reputation management, audience segmentation & cadence).\n\n` +
    `THIS CASE — ${t.account_name} (${t.case_number}): ${t.root_cause_summary}\n` +
    `- Accepted ${pct(m.accepted_rate)}, bounce ${pct(m.bounce_rate)}, first-attempt delay ${pct(m.delayed_rate)}, confirmed open ${pct(m.nonprefetched_open_rate)}, complaints ${pct(m.spam_complaint_rate)}.\n` +
    `- Authentication: ${authLine}.\n` +
    (top ? `- Dominant signal: ${top.classification} at ${top.domain} — "${top.reason}".\n` : '') +
    (p.sameAccount.length ? `\nPRIOR CASES ON THIS ACCOUNT (what worked before):\n${p.sameAccount.map(s => `- ${s}`).join('\n')}\n` : '') +
    (p.crossAccount.length ? `\nSIMILAR RESOLVED CASES ON OTHER ACCOUNTS (anonymised — never name them):\n${p.crossAccount.map(s => `- ${s}`).join('\n')}\n` : '') +
    `\nOUTPUT RULES:\n` +
    `- 3–5 concise, specific steps, ordered by impact. One step per line, no numbering.\n` +
    `- These are DELIVERABILITY RECOMMENDATIONS, not team assignments. Do NOT prefix steps with an owner/team (no "Customer Email Ops:", "Deliverability Team:", etc.) and do NOT direct steps to internal teams unless a step genuinely cannot be done by the customer.\n` +
    `- The customer performs their own actions: DNS records at their DNS provider; segments, suppression, cadence, content and warm-up in Braze; and their own recipient mailbox-provider escalations, e.g. Microsoft/Outlook, Gmail/Google, Yahoo/AOL, or Apple/iCloud when those providers are blocking/deferring mail.\n` +
    `- Customers do NOT have direct access to SparkPost, SendGrid, Amazon SES, MTA consoles, or Braze-managed IP tooling. Never tell the customer to log into or change those systems; put Braze infrastructure changes under internal/cross-team follow-up if they are needed.\n` +
    `- Be concrete: name the actual record/threshold/segment/cadence. No vague filler like "improve reputation". Do not expose any other customer's identity.`
  );
}

export default function NextStepsPanel({ ticket }: { ticket: CaseRecord | null }) {
  const { cases } = useCaseDataset();
  const precedent = useMemo(
    () => (ticket ? buildPrecedent(ticket, cases) : { sameAccount: [], crossAccount: [], topMatch: null }),
    [ticket?.case_number, cases], // eslint-disable-line react-hooks/exhaustive-deps
  );
  // Instant offline seed — dataset actions with owner prefixes stripped.
  const seed = useMemo(
    () => (ticket?.recommended_actions ?? []).map(stripOwner).filter(Boolean),
    [ticket?.case_number], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const [steps, setSteps] = useState<string[]>(seed);
  const [loading, setLoading] = useState(false);
  const ranFor = useRef<string | null>(null);

  const generate = async () => {
    if (!ticket) return;
    if (localStorage.getItem('edq_gemini_api_enabled') === 'false') {
      setLoading(false);
      return;
    }
    setLoading(true);
    let answer = '';
    try {
      const res = await fetch('/api/workspace/section-stream', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: buildPrompt(ticket, precedent),
          ticketRef: { id: ticket.case_number, account: ticket.account_name },
          includeHistory: true, // server adds same-account history (PII-scrubbed cross-account)
        }),
      });
      if (!res.ok || !res.body) throw new Error('stream failed');
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
            if (parsed.token) answer += parsed.token;
            else if (parsed.done) answer = parsed.text || answer;
          } catch { /* partial frame */ }
        }
      }
      const parsed = answer
        .split('\n')
        .map(s => stripOwner(s.replace(/^\s*[\d.\-*•]+\s*/, '').trim()))
        .filter(s => s.length > 3)
        .slice(0, 5);
      if (parsed.length) setSteps(parsed);
    } catch { /* keep seed */ } finally { setLoading(false); }
  };

  // Generate once per case (reuse seed instantly; replace with grounded suggestions).
  useEffect(() => {
    setSteps(seed);
    if (!ticket || ranFor.current === ticket.case_number) return;
    ranFor.current = ticket.case_number;
    generate();
  }, [ticket?.case_number, cases]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ticket) return null;

  return (
    <div
      data-gem-panel data-gem-panel-label="AI Suggested Next Steps"
      data-gem-panel-content={`Next steps for ${ticket.case_number}: ${steps.join(' | ')}`}
      className="bg-white dark:bg-inverse-surface/40 rounded-xl p-6 shadow-none border border-[#1A73E8]/15 dark:border-outline-variant/15"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#1A73E8] dark:text-[#8AB4F8]">checklist</span>
          <h3 className="text-lg font-black text-on-surface dark:text-inverse-on-surface">Suggested Next Steps</h3>
        </div>
        <button onClick={generate} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold text-outline border border-outline-variant/30 hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50">
          <span className={cn('material-symbols-outlined text-[15px]', loading && 'animate-spin')}>{loading ? 'progress_activity' : 'autorenew'}</span>
          Regenerate
        </button>
      </div>
      <ol className="flex flex-col gap-2.5">
        {steps.map((s, i) => (
          <li key={i} className="flex items-start gap-3 text-[13px] text-on-surface-variant dark:text-inverse-on-surface/80 leading-relaxed">
            <span className="shrink-0 w-5 h-5 rounded-full bg-[#E8F0FE] dark:bg-[#1A73E8]/20 text-[#1A73E8] dark:text-[#8AB4F8] text-[11px] font-black flex items-center justify-center mt-0.5">{i + 1}</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
      {precedent.topMatch && (
        <div className="mt-4 pt-3 border-t border-outline-variant/15 flex items-start gap-2 text-[12px] text-on-surface-variant dark:text-inverse-on-surface/70">
          <span className="material-symbols-outlined text-[16px] text-[#137333] dark:text-[#81C995] mt-0.5">lightbulb</span>
          <span><span className="font-bold text-[#137333] dark:text-[#81C995]">Precedent (redacted): </span>A similar resolved case ({precedent.topMatch.score}% signal match) was resolved by: {precedent.topMatch.resolution}</span>
        </div>
      )}
    </div>
  );
}
