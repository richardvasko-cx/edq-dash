import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { randomUUID } from 'crypto';
import { exec, spawn } from "child_process";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const geminiApiKey = process.env.GEMINI_API_KEY || '';
if (!geminiApiKey) {
  console.warn("Warning: GEMINI_API_KEY environment variable is not set. Gemini features will require this variable to work.");
}
const ai = new GoogleGenAI({ apiKey: geminiApiKey, httpOptions: { headers: { 'X-goog-api-key': geminiApiKey } } });

/** Text-output models available for selection. Keep in sync with Settings.tsx */
export const GEMINI_TEXT_MODELS: { id: string; label: string }[] = [
  { id: 'gemini-2.5-flash',      label: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.5-pro',        label: 'Gemini 2.5 Pro' },
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
  { id: 'gemini-3.5-flash',      label: 'Gemini 3.5 Flash' },
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite' },
  { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview' },
  { id: 'gemini-3-pro-preview',  label: 'Gemini 3 Pro Preview' },
  { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro Preview' },
  { id: 'gemini-2.0-flash',      label: 'Gemini 2.0 Flash' },
  { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash-Lite' },
  { id: 'gemini-flash-latest',   label: 'Gemini Flash (Latest)' },
  { id: 'gemini-pro-latest',     label: 'Gemini Pro (Latest)' },
];

/** Currently active model — mutable at runtime via POST /api/gemini/model */
let activeGeminiModel: string = (() => {
  try {
    const stored = fs.existsSync('.gemini_model') ? fs.readFileSync('.gemini_model', 'utf-8').trim() : '';
    return GEMINI_TEXT_MODELS.some(m => m.id === stored) ? stored : 'gemini-3.1-flash-lite';
  } catch { return 'gemini-2.5-flash'; }
})();

const MODEL_BUDGETS = { guideChars: 80000, historyChars: 30000 };
const MODEL_INFO_PROMPT = "You are powered by Google Gemini via Cloud API. You have a massive context window; use the full depth of the provided context, RAG guide excerpts, and same-account history for highly detailed, intelligent, multi-turn diagnostics.";
const GEMINI_CHART_POLICY = `CHART POLICY — charts are decided by a separate structured Gemini API call.
- Do NOT embed chart JSON in the main Markdown answer.
- In the main answer, use prose, bullets, or compact Markdown tables.
- A follow-up Gemini API call will decide whether a chart is useful and will return a structured chart object only when appropriate.`;
const APP_FEATURE_CONTEXT = `DASHBOARD APP MAP — you are embedded in this app and can help the user understand and navigate it:
- Dashboard: overview of demo email deliverability health, top accounts, alerts, and performance snapshots.
- Tickets: case list and investigation workspace for account-level deliverability issues. The list can be searched by account, case number, subject, and domain.
- Ticket workspace sections: Customer Issue, Root Cause, Authentication, Deliverability, Email Performance, Support History, and final workspace output.
- Tools > Google Dig: DNS lookup helper for SPF, DKIM, DMARC, MX, TXT, A and related DNS records.
- Tools > MX Tool: mail exchanger and routing checks.
- Tools > Message Header Analyzer: paste raw email headers to inspect authentication, hops, delays, and delivery signals.
- Tools > IP Warming Planner: build a demo ramp plan from target list size, strategy, audience size, target date, IP status, and traffic type; shows key plan metrics, volume projection, and a daily schedule table.
- User Guide: searchable Braze User Guide articles with copy-for-LLM, markdown view, and Ask Gemini.
- Settings: app, Gemini API/model, theme, and configuration controls.
When the user explicitly asks about a feature, panel, tab, or tool in this app, explain what it does, how to use it in this dashboard, and give one practical next step. The UI may attach a navigation button separately; do not fabricate controls beyond this map and the live screen context.`;
const APP_ACTION_GUIDANCE = `APP FEATURE SUGGESTIONS — keep app navigation secondary:
- Do not turn a deliverability concept question into a tool-first answer. If the user asks about IP warming, warm-up, deliverability, DNS, authentication, bounces, complaints, reputation, or best practices, answer the domain best practice and steps FIRST.
- Mention an app tool only as an optional final next step when it genuinely helps apply the advice in this dashboard.
- Only lead with a tool description when the user explicitly asks about the tool/panel itself (for example "what does the IP Warming Planner do?" or "how do I use this tool?").
- "Dashboard", "settings", "configuration", "analytics", and "health" are often Braze or third-party platform concepts. Do not treat those words as EDQ app navigation unless the user explicitly asks for this app's page, tab, nav, or Gemini/app settings.
- For IP warming concept questions, focus on: list quality and engaged cohorts, starting volume, gradual ramp, mailbox-provider monitoring, bounce/complaint thresholds, throttling, and when to pause or slow down. Then, if relevant, add that the IP Warming Planner can model the ramp schedule.`;

type AppAction = {
  id: string;
  label: string;
  description?: string;
  icon: string;
  view: 'glance' | 'investigation' | 'tools' | 'user_guide' | 'settings';
  toolsTab?: 'dig' | 'mx' | 'analyzer' | 'ip_warming';
  ticketSection?: 'Overview' | 'Authentication' | 'Deliverability' | 'Email Performance' | 'Support History' | 'Workspace';
};

function resolveAppActions(prompt: string, answer = ''): AppAction[] {
  const promptText = prompt.toLowerCase();
  const answerText = answer.toLowerCase();
  const text = `${promptText} ${answerText}`;
  const actions: AppAction[] = [];
  const add = (action: AppAction) => {
    if (!actions.some(a => a.id === action.id)) actions.push(action);
  };
  const hasExplicitNavIntent = (targetPattern: RegExp) =>
    new RegExp(`\\b(open|go to|navigate to|show|view|take me to|switch to|jump to)\\s+(the\\s+)?${targetPattern.source}\\b`, 'i').test(promptText);
  const mentionsApp = /\b(edq|this app|this dashboard|dashboard app|in this dashboard|in this app|gemini)\b/.test(text);
  const apiSettingsContext = /\b(gemini api|api key|model selection|model picker|theme toggle|localstorage|disabled in settings|enable it to chat|app settings)\b/.test(text);

  if (/\b(ip warming planner|warming planner|ip warming|warm[-\s]?up|ramp[-\s]?up|volume projection|daily schedule)\b/.test(text)) {
    add({ id: 'open-ip-warming', label: 'IP Warming Planner', description: 'Build or review the volume ramp plan.', icon: 'thermostat', view: 'tools', toolsTab: 'ip_warming' });
  }
  if (/\b(google dig|dns lookup|spf|dkim|dmarc|txt record|dns record)\b/.test(text)) {
    add({ id: 'open-google-dig', label: 'Google Dig', description: 'Check DNS records for a sending domain.', icon: 'dns', view: 'tools', toolsTab: 'dig' });
  }
  if (/\b(mx tool|mx record|mail exchanger|mail routing)\b/.test(text)) {
    add({ id: 'open-mx-tool', label: 'MX Tool', description: 'Inspect MX records and routing.', icon: 'mail', view: 'tools', toolsTab: 'mx' });
  }

  if (/\b(header analyzer|message header|email header|authentication results|received header)\b/.test(text)) {
    add({ id: 'open-header-analyzer', label: 'Message Header Analyzer', description: 'Inspect raw header hops and auth results.', icon: 'data_object', view: 'tools', toolsTab: 'analyzer' });
  }
  if (/\b(ticket|case|cases|investigation|customer issue|root cause)\b/.test(text)) {
    add({ id: 'open-tickets', label: 'Tickets', description: 'Search and investigate deliverability cases.', icon: 'confirmation_number', view: 'investigation' });
  }
  if (/\b(authentication|spf|dkim|dmarc|dns alignment)\b/.test(text)) {
    add({ id: 'open-ticket-authentication', label: 'Authentication', description: 'Review SPF, DKIM, DMARC, rDNS, and alignment.', icon: 'shield', view: 'investigation', ticketSection: 'Authentication' });
  }
  if (/\b(deliverability tab|deliverability section|deliverability over time|bounce class|deferrals by isp|delivery funnel|hardbounces|softbounces)\b/.test(text)) {
    add({ id: 'open-ticket-deliverability', label: 'Deliverability', description: 'Review delivery, bounce, deferral, and ISP diagnostics.', icon: 'mark_email_unread', view: 'investigation', ticketSection: 'Deliverability' });
  }
  if (/\b(email performance|engagement|opens|clicks|open rate|click rate|unsubscribe)\b/.test(text)) {
    add({ id: 'open-ticket-email-performance', label: 'Email Performance', description: 'Review engagement and performance metrics.', icon: 'equalizer', view: 'investigation', ticketSection: 'Email Performance' });
  }
  if (/\b(support history|case thread|historical ticket|previous ticket|timeline)\b/.test(text)) {
    add({ id: 'open-ticket-support-history', label: 'Support History', description: 'Review prior cases and account history.', icon: 'history', view: 'investigation', ticketSection: 'Support History' });
  }
  if (/\b(workspace|draft|handoff|customer note|final response|accept|reject and edit)\b/.test(text)) {
    add({ id: 'open-ticket-workspace', label: 'Workspace', description: 'Draft and review the final support workspace output.', icon: 'edit', view: 'investigation', ticketSection: 'Workspace' });
  }
  if (/\b(user guide|guide article|documentation|docs|best practice|best practices)\b/.test(text)) {
    add({ id: 'open-user-guide', label: 'User Guide', description: 'Browse Braze deliverability guidance.', icon: 'menu_book', view: 'user_guide' });
  }
  const wantsAppDashboard =
    hasExplicitNavIntent(/(?:dashboard|overview)/) ||
    /\b(edq|this|app)\s+(dashboard|overview)\b/.test(promptText) ||
    /\b(dashboard|overview)\s+(tab|page|view|section|nav|screen)\b/.test(promptText) ||
    (mentionsApp && /\b(total tickets|ticket queue|open tickets|closed tickets|queue health|dashboard)\b/.test(text));
  if (wantsAppDashboard) {
    add({ id: 'open-dashboard', label: 'Dashboard', description: 'Review the deliverability overview.', icon: 'grid_view', view: 'glance' });
  }
  const wantsAppSettings =
    hasExplicitNavIntent(/settings/) ||
    /\b(edq|this|app|gemini)\s+(settings|configuration)\b/.test(promptText) ||
    /\b(settings|configuration)\s+(tab|page|view|section|nav|screen)\b/.test(promptText) ||
    apiSettingsContext;
  if (wantsAppSettings) {
    add({ id: 'open-settings', label: 'Settings', description: 'Adjust app and Gemini configuration.', icon: 'settings', view: 'settings' });
  }

  const prioritized = actions.sort((a, b) => {
    const score = (action: AppAction) => {
      if (action.id === 'open-settings' && apiSettingsContext) return 0;
      if (hasExplicitNavIntent(new RegExp(action.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))) return 1;
      if (action.view === 'tools') return 2;
      if (action.ticketSection) return 3;
      return 4;
    };
    return score(a) - score(b);
  });
  return prioritized.slice(0, 4);
}

import { checkAndPrepopulate, searchAndGetRAGContext } from "./server_prepopulate";
import { searchHistoricalTickets } from "./server_ticket_memory";
import localtunnel from "localtunnel";
import { parse as csvParse } from "csv-parse";
import { readFileSync } from "fs";
import { parseCaseDataset, isClosedCase, type CaseRecord } from "./src/services/caseDataset";
import { parseHistoricalDataset, dailySeries, type HistoricalMetricRecord } from "./src/services/historicalMetricsDataset";

const CONV_DIR = path.join(process.cwd(), 'conversations');
if (!fs.existsSync(CONV_DIR)) fs.mkdirSync(CONV_DIR, { recursive: true });

// Programmatic seeding on startup
checkAndPrepopulate();

// ── Canonical case dataset (sole source of truth) ───────────────────────────
// Load the CSV server-side and parse it into CaseRecord[]. This replaces the old
// in-memory TICKETS array. The path is resolved robustly relative to this file so
// it works regardless of the process cwd.
function loadCases(): CaseRecord[] {
  const candidates = [
    path.join(process.cwd(), 'public', 'data', 'uk_supermarket_email_deliverability_cases_final.csv'),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const text = readFileSync(p, 'utf-8');
        const { records, errors } = parseCaseDataset(text);
        if (errors.length) console.warn(`[Dataset] Parsed ${records.length} case(s) with ${errors.length} validation note(s).`);
        return records;
      }
    } catch (e: any) {
      console.warn(`[Dataset] Failed reading ${p}: ${e?.message || e}`);
    }
  }
  console.error('[Dataset] Could not locate the case dataset CSV — case memory will be empty.');
  return [];
}

// Read-only array of canonical case records, used for on-device history retrieval
// and webhook matching. Treated as the live source of truth.
const cases: CaseRecord[] = loadCases();

function loadHistory(): HistoricalMetricRecord[] {
  const candidates = [
    path.join(process.cwd(), 'public', 'data', 'uk_supermarket_email_deliverability_history_final.csv'),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const text = readFileSync(p, 'utf-8');
        const { records, errors } = parseHistoricalDataset(text);
        if (errors.length) console.warn(`[History] Parsed ${records.length} row(s) with ${errors.length} validation note(s).`);
        return records;
      }
    } catch (e: any) {
      console.warn(`[History] Failed reading ${p}: ${e?.message || e}`);
    }
  }
  console.error('[History] Could not locate the case history CSV.');
  return [];
}

const historyRecords: HistoricalMetricRecord[] = loadHistory();

function providerLabel(value: string) {
  const lower = (value || '').toLowerCase();
  if (lower.includes('gmail') || lower.includes('google')) return 'gmail.com';
  if (lower.includes('yahoo')) return 'yahoo.com';
  if (lower.includes('aol')) return 'aol.com';
  if (lower.includes('microsoft') || lower.includes('outlook') || lower.includes('hotmail')) return 'outlook.com';
  if (lower.includes('icloud') || lower.includes('apple')) return 'icloud.com';
  if (lower.includes('gmx')) return 'gmx.de';
  if (lower.includes('onet')) return 'onet.pl';
  if (lower.includes('libero')) return 'libero.it';
  return value || 'Other';
}

function getVisualTotals(ticket: CaseRecord) {
  const providers = Array.from(new Set([
    ...ticket.mailbox_providers.map(providerLabel),
    ...ticket.domains.map(providerLabel),
    'Other',
  ])).filter(Boolean).slice(0, 9);

  // Bounce total calculation
  let targetBounce = 0;
  if (ticket.bounces && ticket.bounces.length >= 4) {
    targetBounce = ticket.bounces.reduce((sum, row) => sum + row.count, 0);
  } else {
    const total = Math.max(ticket.metrics.count_bounce, ticket.bounces ? ticket.bounces.reduce((sum, row) => sum + row.count, 0) : 0);
    const weights = [0.31, 0.19, 0.15, 0.11, 0.09, 0.06, 0.04, 0.03, 0.02];
    let sumCounts = 0;
    providers.forEach((isp, providerIndex) => {
      const rowCount = providerIndex < 3 ? 2 : 1;
      for (let localIndex = 0; localIndex < rowCount; localIndex++) {
        const ratio = (weights[providerIndex] ?? 0.02) / rowCount;
        const count = Math.max(1, Math.round(total * ratio * 1));
        sumCounts += count;
      }
    });
    targetBounce = sumCounts;
  }

  // Deferral total calculation
  let targetDeferred = 0;
  const totalDef = Math.max(ticket.metrics.count_delayed, ticket.metrics.count_delayed_first);
  const weightsDef = [0.31, 0.19, 0.15, 0.11, 0.09, 0.06, 0.04, 0.03, 0.02];
  let sumCountsDef = 0;
  providers.forEach((isp, providerIndex) => {
    const rowCount = providerIndex < 3 ? 2 : 1;
    for (let localIndex = 0; localIndex < rowCount; localIndex++) {
      const ratio = (weightsDef[providerIndex] ?? 0.02) / rowCount;
      const count = Math.max(1, Math.round(totalDef * ratio * 1.08));
      sumCountsDef += count;
    }
  });
  targetDeferred = sumCountsDef;

  return { targetBounce, targetDeferred };
}

interface ServerTrendRow {
  date: string;
  targeted: number;
  sent: number;
  accepted: number;
  delivered: number;
  delivery: number;
  delay: number;
  deferred: number;
  bounce: number;
  hardbounce: number;
  softbounce: number;
  blocked: number;
  dropped: number;
  complaints: number;
}

function buildTrendRowsForServer(ticket: CaseRecord): ServerTrendRow[] {
  const m = ticket.metrics;
  const endVal = ticket.metric_end_date || ticket.case_updated_at || ticket.case_created_at;
  const end = endVal ? new Date(endVal) : new Date();
  if (isNaN(end.getTime())) return [];
  
  const rows: ServerTrendRow[] = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(end);
    date.setDate(end.getDate() - i);
    const index = 29 - i;
    const weeklyLift = date.getDay() === 2 || date.getDay() === 3 ? 1.18 : date.getDay() === 0 ? 0.72 : 1;
    const seed = [...ticket.case_number].reduce((sum, char) => sum + char.charCodeAt(0), 0) + 0;
    const pulse = 0.86 + Math.abs(Math.sin((seed + index * 17) * 1.271)) * 0.42;
    const spike = index === 18 || index === 24 ? 1.34 : 1;
    const factor = weeklyLift * pulse * spike;
    
    const targeted = Math.max(0, Math.round(((m.count_targeted || m.count_sent) / 30) * factor));
    const sent = Math.max(0, Math.round((m.count_sent / 30) * factor));
    const accepted = Math.max(0, Math.round((m.count_accepted / 30) * factor));
    const delivered = Math.max(0, Math.round(((m.count_delivered_first + m.count_delivered_subsequent) / 30) * factor * 0.98));
    const delivery = Math.max(0, Math.round((m.count_accepted / 30) * factor));
    
    const seed3 = [...ticket.case_number].reduce((sum, char) => sum + char.charCodeAt(0), 0) + 3;
    const delay = Math.max(0, Math.round((m.count_delayed_first / 30) * (0.8 + Math.abs(Math.sin((seed3 + index * 17) * 1.271)) * 0.65)));
    
    const seed9 = [...ticket.case_number].reduce((sum, char) => sum + char.charCodeAt(0), 0) + 9;
    const deferred = Math.max(0, Math.round((m.count_delayed / 30) * (0.75 + Math.abs(Math.sin((seed9 + index * 17) * 1.271)) * 0.8)));
    
    const seed13 = [...ticket.case_number].reduce((sum, char) => sum + char.charCodeAt(0), 0) + 13;
    const bounce = Math.max(0, Math.round((m.count_bounce / 30) * (0.7 + Math.abs(Math.sin((seed13 + index * 17) * 1.271)) * 0.9)));
    
    const seed19 = [...ticket.case_number].reduce((sum, char) => sum + char.charCodeAt(0), 0) + 19;
    const hardbounce = Math.max(0, Math.round((m.count_hard_bounce / 30) * (0.75 + Math.abs(Math.sin((seed19 + index * 17) * 1.271)) * 0.7)));
    
    const seed23 = [...ticket.case_number].reduce((sum, char) => sum + char.charCodeAt(0), 0) + 23;
    const softbounce = Math.max(0, Math.round((m.count_soft_bounce / 30) * (0.75 + Math.abs(Math.sin((seed23 + index * 17) * 1.271)) * 0.7)));
    
    const seed29 = [...ticket.case_number].reduce((sum, char) => sum + char.charCodeAt(0), 0) + 29;
    const blocked = Math.max(0, Math.round((m.count_block_bounce / 30) * (0.75 + Math.abs(Math.sin((seed29 + index * 17) * 1.271)) * 0.65)));
    
    const seed31 = [...ticket.case_number].reduce((sum, char) => sum + char.charCodeAt(0), 0) + 31;
    const dropped = Math.max(0, Math.round((m.count_rejected / 30) * (0.5 + Math.abs(Math.sin((seed31 + index * 17) * 1.271)) * 0.5)));
    
    const seed37 = [...ticket.case_number].reduce((sum, char) => sum + char.charCodeAt(0), 0) + 37;
    const complaints = Math.max(0, Math.round((m.count_spam_complaint / 30) * (0.5 + Math.abs(Math.sin((seed37 + index * 17) * 1.271)) * 0.75)));

    rows.push({
      date: date.toISOString().slice(0, 10),
      targeted,
      sent,
      accepted,
      delivered,
      delivery,
      delay,
      deferred,
      bounce,
      hardbounce,
      softbounce,
      blocked,
      dropped,
      complaints,
    });
  }
  return rows;
}

function getDailySeriesContext(caseNumber: string): string {
  const ticket = cases.find(c => c.case_number === caseNumber);
  if (!ticket) return '';

  const series = buildTrendRowsForServer(ticket);
  if (!series.length) return '';

  // Sum the simulated values
  let sumDeferred = 0;
  let sumBounce = 0;
  for (const pt of series) {
    sumDeferred += pt.deferred;
    sumBounce += pt.bounce;
  }

  // Get target KPI card totals
  const { targetBounce, targetDeferred } = getVisualTotals(ticket);

  // Compute scaling factors
  const f_def = sumDeferred > 0 ? (targetDeferred / sumDeferred) : 1;
  const f_bnc = sumBounce > 0 ? (targetBounce / sumBounce) : 1;

  // Scale the simulated counts
  for (const pt of series) {
    pt.deferred = Math.round(pt.deferred * f_def);
    pt.bounce = Math.round(pt.bounce * f_bnc);
  }

  // Distribute rounding error to avoid single-unit discrepancies
  let currentSumDef = series.reduce((sum, pt) => sum + pt.deferred, 0);
  let diffDef = targetDeferred - currentSumDef;
  if (diffDef !== 0) {
    let maxIdx = 0;
    for (let i = 1; i < series.length; i++) {
      if (series[i].deferred > series[maxIdx].deferred) maxIdx = i;
    }
    series[maxIdx].deferred = Math.max(0, series[maxIdx].deferred + diffDef);
  }

  let currentSumBnc = series.reduce((sum, pt) => sum + pt.bounce, 0);
  let diffBnc = targetBounce - currentSumBnc;
  if (diffBnc !== 0) {
    let maxIdx = 0;
    for (let i = 1; i < series.length; i++) {
      if (series[i].bounce > series[maxIdx].bounce) maxIdx = i;
    }
    series[maxIdx].bounce = Math.max(0, series[maxIdx].bounce + diffBnc);
  }

  const lines: string[] = [];
  lines.push("=== 30-DAY DAILY HISTORICAL METRICS ===");
  lines.push("Date | Targeted | Sent | Accepted | Accepted % | Bounces | Bounce % | Deferred | Delayed %");
  lines.push("---|---|---|---|---|---|---|---|---");
  for (const pt of series) {
    const d = new Date(pt.date);
    const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const accPct = (pt.sent > 0 ? (pt.accepted / pt.sent * 100) : 0).toFixed(1) + '%';
    const bncPct = (pt.sent > 0 ? (pt.bounce / pt.sent * 100) : 0).toFixed(1) + '%';
    const delPct = (pt.accepted > 0 ? (pt.delay / pt.accepted * 100) : 0).toFixed(1) + '%';

    lines.push(`${dateStr} | ${pt.targeted.toLocaleString('en-GB')} | ${pt.sent.toLocaleString('en-GB')} | ${pt.accepted.toLocaleString('en-GB')} | ${accPct} | ${pt.bounce.toLocaleString('en-GB')} | ${bncPct} | ${pt.deferred.toLocaleString('en-GB')} | ${delPct}`);
  }
  return lines.join('\n');
}

// ── Adapter: CaseRecord → the AnyTicket shape searchHistoricalTickets expects ──
// searchHistoricalTickets (server_ticket_memory.ts) scores + PII-scrubs an
// AnyTicket-shaped record. We map the canonical CaseRecord field names onto it so
// the on-device history retrieval works over the new dataset without leaking the
// account_name / contact_name / contact_email of OTHER accounts (the redactor
// keys off account/contact/domain, which we populate per record).
type TicketLike = {
  id: string;
  subject: string;
  account: string;
  contact: string;
  campaignId?: string;
  status: string;
  assigned?: string;
  tags?: string[];
  rcaSummary?: string;
  domain?: string;
  dkimSelector?: string;
  spfStatus?: string;
  dkimStatus?: string;
  dmarcStatus?: string;
  spfDesc?: string;
  dkimDesc?: string;
  dmarcDesc?: string;
  bounceData?: { domain?: string; bounces?: string; reason?: string; category?: string; classification?: string }[];
  // Carry the canonical account id so we can split same- vs cross-account history.
  accountId?: string;
};

function caseToTicketLike(c: CaseRecord): TicketLike {
  return {
    id: c.case_number,
    subject: c.case_subject,
    account: c.account_name,
    contact: c.contact_name,
    campaignId: c.campaigns[0],
    status: c.case_status,
    assigned: c.case_owner,
    tags: c.tags,
    rcaSummary: c.root_cause_summary,
    domain: c.sending_domains[0],
    dkimSelector: c.dkim_selector,
    spfStatus: c.spf_status,
    dkimStatus: c.dkim_status,
    dmarcStatus: c.dmarc_status,
    spfDesc: c.spf_description,
    dkimDesc: c.dkim_description,
    dmarcDesc: c.dmarc_description,
    bounceData: c.bounces.map(b => ({
      domain: b.domain,
      bounces: String(b.count),
      reason: b.reason,
      category: b.category,
      classification: b.classification,
    })),
    accountId: c.account_id,
  };
}

// Build the historical-memory ticket list + resolve the focused account for a
// case reference. Only CLOSED cases count as "historical". Same-account history =
// other cases sharing account_id; cross-account = different account_id (the
// downstream scrubber redacts those accounts' names/contacts/domains). Because a
// shared account_id always implies a shared account_name, we resolve the focused
// case's account_name (via its 8-digit case_number) and let searchHistoricalTickets
// perform the same-/cross-account split on that string.
function buildHistoryTickets(ref: { id?: string; account?: string } | undefined): {
  tickets: TicketLike[];
  resolvedAccount?: string;
} {
  const refId = (ref?.id || '').trim();
  const focused = refId ? cases.find(c => c.case_number === refId) : undefined;
  const tickets = cases.filter(isClosedCase).map(caseToTicketLike);
  return { tickets, resolvedAccount: focused?.account_name ?? ref?.account };
}

// Read-only Looker webhook ingest. The canonical dataset is the sole source of
// truth, so incoming Looker rows are matched against existing cases by their
// 8-digit case_number (or, as a fallback, by sending domain / account name) and
// simply LOGGED — the in-memory `cases` array is never mutated.
function processLookerRecord(record: any) {
  // Extract a candidate case number (canonical 8-digit string).
  const rawCaseNumber = String(
    record.caseNumber ?? record.case_number ?? record.caseId ?? record.case_id ?? record.id ?? ''
  ).trim();
  const matchNumber = rawCaseNumber.match(/\b\d{8}\b/)?.[0] ?? '';

  let matched: CaseRecord | undefined = matchNumber
    ? cases.find(c => c.case_number === matchNumber)
    : undefined;

  if (matched) {
    console.log(`[Looker Webhook] Matched case by case_number: ${matched.case_number} (read-only; dataset unchanged).`);
    return;
  }

  // Fallback: match by sending domain or account name (read-only).
  const recDomain = String(record.domain ?? record.sending_domain ?? record.bounce_domain ?? '').toLowerCase();
  const recAccount = String(record.account ?? record.account_name ?? '').toLowerCase();
  matched = cases.find(c => {
    const domainMatch = !!recDomain && c.sending_domains.some(d => d.toLowerCase() === recDomain || recDomain.includes(d.toLowerCase()));
    const accountMatch = !!recAccount && !!c.account_name && recAccount.includes(c.account_name.toLowerCase());
    return domainMatch || accountMatch;
  });

  if (matched) {
    console.log(`[Looker Webhook] Fallback matched case ${matched.case_number} by domain/account (read-only; dataset unchanged).`);
  } else {
    console.log('[Looker Webhook] No matching case found for incoming record (read-only).');
  }
}

function convertMessagesToGemini(messages: { role: string; content: string }[]) {
  let systemInstruction = '';
  const contents: any[] = [];
  for (const m of messages) {
    if (m.role === 'system') {
      systemInstruction += (systemInstruction ? '\n' : '') + m.content;
    } else {
      const role = m.role === 'assistant' || m.role === 'model' ? 'model' : 'user';
      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts[0].text += '\n' + m.content;
      } else {
        contents.push({
          role,
          parts: [{ text: m.content }]
        });
      }
    }
  }
  return { systemInstruction, contents };
}

function cleanGeminiErrorMessage(err: any): string {
  if (!err) return 'Unknown error occurred';
  const msg = err.message || String(err);
  try {
    if (msg.trim().startsWith('{')) {
      const parsed = JSON.parse(msg);
      const innerMessage = parsed?.error?.message;
      if (innerMessage) {
        if (parsed.error.code === 429 || innerMessage.toLowerCase().includes('quota') || innerMessage.toLowerCase().includes('rate limit')) {
          return 'Rate limit exceeded (Gemini API quota exhausted). Please wait a moment and try again.';
        }
        return innerMessage;
      }
    }
  } catch {}

  if (msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate limit') || msg.includes('429')) {
    return 'Rate limit exceeded (Gemini API quota exhausted). Please wait a moment and try again.';
  }

  return msg;
}

async function callGemini(
  messages: { role: string; content: string }[],
  temperature = 0.4,
  opts: { maxTokens?: number; timeoutMs?: number } = {}
): Promise<string> {
  const { maxTokens = 1200 } = opts;
  try {
    const { systemInstruction, contents } = convertMessagesToGemini(messages);
    const response = await ai.models.generateContent({
      model: activeGeminiModel,
      contents,
      config: {
        systemInstruction: systemInstruction || undefined,
        temperature,
        maxOutputTokens: maxTokens,
      }
    });
    return response.text ?? '';
  } catch (err: any) {
    console.error("[Gemini API] callGemini failed:", err);
    const clean = cleanGeminiErrorMessage(err);
    const wrapped = new Error(clean);
    (wrapped as any).code = err?.code ?? err?.status;
    throw wrapped;
  }
}

function extractJsonObject(raw: string): any | null {
  const text = String(raw || '').trim();
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim();
  const candidate = fenced || text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
  if (!candidate || !candidate.startsWith('{')) return null;
  try { return JSON.parse(candidate); } catch { return null; }
}

function normalizeLabelForChart(value: any): string {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^\w]+/g, ' ')
    .trim();
}

function extractMarkdownTableLabels(markdown: string): string[] {
  const labels: string[] = [];
  const lines = String(markdown || '').split('\n');
  for (let i = 0; i < lines.length - 1; i++) {
    const header = lines[i].trim();
    const divider = lines[i + 1].trim();
    if (!header.startsWith('|') || !divider.startsWith('|') || !/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(divider)) continue;
    for (let j = i + 2; j < lines.length; j++) {
      const row = lines[j].trim();
      if (!row.startsWith('|') || !row.includes('|')) break;
      const cells = row.split('|').map(c => c.trim()).filter(Boolean);
      if (cells[0]) labels.push(cells[0]);
    }
  }
  return labels;
}

function normalizeGeminiChartDecision(decision: any, sourceAnswer = '', prompt = ''): any | null {
  const chart = decision?.chart;
  if (!decision?.shouldChart || !chart || typeof chart !== 'object') return null;
  let chartType = ['line', 'bar', 'pie'].includes(chart.chartType) ? chart.chartType : 'bar';
  const data = Array.isArray(chart.data) ? chart.data.slice(0, 12) : [];
  if (!data.length || !chart.xField || !chart.yField) return null;
  if (data.some((row: any) => Number.isNaN(Number(row?.[chart.yField])))) return null;

  const tableLabels = extractMarkdownTableLabels(sourceAnswer).map(normalizeLabelForChart).filter(Boolean);
  const chartLabels = data.map((row: any) => normalizeLabelForChart(row?.[chart.xField])).filter(Boolean);
  const explicitlyAskedForExpansion = /\b(day[-\s]?by[-\s]?day|daily|every day|full schedule|expand(ed)? chart|chart|graph|visuali[sz]e)\b/i.test(prompt);
  const wantsTrend = /\b(30[-\s]?day|trend|over time|time[-\s]?series|daily|day[-\s]?by[-\s]?day|inflection|spike|increase|degradation|trajectory|progression)\b/i.test(`${prompt}\n${sourceAnswer}`);
  const xFieldLooksTemporal = /^(day|date|time|month|year|metric_date|x)$/i.test(chart.xField)
    || chartLabels.some(label => /\b(\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|\d{4}-\d{2}-\d{2})\b/i.test(label));
  if (wantsTrend && !xFieldLooksTemporal) return null;
  if (wantsTrend) chartType = 'line';
  const isTimeSeries = chartType === 'line' || xFieldLooksTemporal;

  if (!isTimeSeries && tableLabels.length >= 2 && chartLabels.length > 0 && !explicitlyAskedForExpansion) {
    const tableSet = new Set(tableLabels);
    const matchingLabels = chartLabels.filter(label => tableSet.has(label)).length;
    const mostlyMatchesTable = matchingLabels >= Math.min(chartLabels.length, tableLabels.length) * 0.75;
    if (!mostlyMatchesTable || chartLabels.length > tableLabels.length) return null;
  }

  return {
    type: 'chart',
    allowChart: true,
    chartType,
    title: String(chart.title || 'Chart'),
    xField: String(chart.xField),
    yField: String(chart.yField),
    seriesField: chart.seriesField ? String(chart.seriesField) : undefined,
    data,
  };
}

async function appendGeminiDecidedChart(args: {
  prompt: string;
  answer: string;
  screenText: string;
  selectedPanelBlock?: string;
  sources?: string[];
  ticketRef?: any;
}): Promise<string> {
  const { prompt, answer, screenText, selectedPanelBlock = '', sources = [], ticketRef } = args;
  if (!geminiApiKey || !answer.trim()) return answer;
  try {
    const dailyHistoryBlock = ticketRef?.id ? getDailySeriesContext(ticketRef.id) : '';
    const raw = await callGemini([
      {
        role: 'system',
        content: `You are a visualization decision API for a Braze deliverability dashboard. Decide whether the finished assistant answer should include a chart.

Return ONLY valid JSON with this exact shape:
{
  "shouldChart": boolean,
  "reason": "short reason",
  "chart": null | {
    "type": "chart",
    "allowChart": true,
    "chartType": "line" | "bar" | "pie",
    "title": "short title",
    "xField": "x",
    "yField": "value",
    "seriesField": "series optional",
    "data": [{ "x": "Label", "value": 123 }]
  }
}

Decision rules:
- Create a chart only when a visualization materially improves understanding.
- Good reasons: the user explicitly asks for a chart/graph/visualization, or the answer analyzes live/pinned dashboard metrics, comparable rates, counts, or trends.
- Scope charts to the narrowest active selection in LIVE/PINNED context first: selected IP, sending domain, mailbox provider, IP pool, campaign, or subaccount. Do not chart the whole ticket/account when a narrower selected entity is present.
- For trend, 30-day, over-time, spike, inflection, degradation, or progression analysis, use chartType "line" and x-axis dates/days from the 30-day historical table. Do not replace a trend request with a category/provider bar chart.
- For category comparisons such as ISP/provider/domain rankings, use chartType "bar". For composition/share, use "pie".
- Do not chart documentation, checklists, best-practice articles, IP warming guidance, thresholds, examples, or numbered steps merely because they contain numbers.
- Do not create charts from User Guide excerpts alone.
- If the answer contains a Markdown table and you chart that table, the chart x-axis labels MUST match the visible row labels in the table. Do not expand ranges such as "Days 2-5" into inferred rows unless the user explicitly asked for a day-by-day chart.
- Never invent data. Use only values present in LIVE/PINNED context or explicitly stated in the answer.
- For time-series/trend charts, include at most 10-12 data points representing key dates or intervals (e.g. spacing out by 2-3 days) to keep the chart clean and concise, rather than plotting all 30 days.
- If unsure, return {"shouldChart":false,"reason":"not needed","chart":null}.`
      },
      {
        role: 'user',
        content: `USER PROMPT:
${String(prompt).slice(0, 1000)}

ANSWER:
${answer.slice(0, 2500)}

LIVE/PINNED CONTEXT:
${(selectedPanelBlock || screenText || '').slice(0, 2500)}
${dailyHistoryBlock ? `\n\n${dailyHistoryBlock}` : ''}

GUIDE SOURCES:
${sources.slice(0, 5).join('\n')}

HAS_TICKET_REF: ${Boolean(ticketRef?.id)}`
      },
    ], 0.1, { maxTokens: 1500, timeoutMs: 60_000 });
    const decision = extractJsonObject(raw);
    const chart = normalizeGeminiChartDecision(decision, answer, prompt);
    if (!chart) return answer;
    return `${answer}\n\n\`\`\`json\n${JSON.stringify(chart, null, 2)}\n\`\`\``;
  } catch (err) {
    console.warn('[Gemini chart decision] skipped:', cleanGeminiErrorMessage(err));
    return answer;
  }
}

function generateOfflineRAGAnswer(prompt: string, context: string, sources: string[]): string {
  if (sources.length === 0) {
    return "The indexed User Guide source does not contain enough information to answer this confidently. Please ensure the Gemini API key is configured to enable the AI-powered Search Assistant.";
  }

  try {
    const mainSource = sources[0];
    const cleanPath = mainSource.replace(/^docs\/User Guide\//, "");
    const fullPath = path.join(process.cwd(), "braze_user_guide_md", "docs", "User Guide", cleanPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      // Clean up headers and text
      const lines = content.split('\n');
      const paragraphs: string[] = [];
      let headerCount = 0;

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith('#')) {
          if (headerCount < 4) {
            paragraphs.push(trimmed);
            headerCount++;
          }
        } else if (!trimmed.startsWith('```') && !trimmed.startsWith('---') && paragraphs.length < 12 && paragraphs.join('\n').length < 1000) {
          paragraphs.push(trimmed);
        }
      }

      return `### Selected Chapter: ${path.basename(mainSource).replace(/\.md$/, '').replace(/_/g, ' ').toUpperCase()}

${paragraphs.slice(0, 10).join('\n\n')}

---
**Sources Cited:**
- \`${mainSource}\`

*Note: This response was processed directly from high-scoring local documentation files because Gemini API is not configured. To activate fully comprehensive AI answers, please configure your Gemini API Key.*`;
    }
  } catch (err) {
    console.error("Offline extraction failed, generic fallback:", err);
  }

  return `### Documentation Matches

The search query matched the following user guide documents:
${sources.map(s => `- **${path.basename(s).replace(/\.md$/, '').replace(/_/g, ' ')}** (\`${s}\`)`).join('\n')}

*Note: Please configure your Gemini API Key in your Settings to enable the conversational AI Assistant.*`;
}

// Find the first synced guide file whose path contains a fragment; returns the
// githubPath form (or null). Used to map a topic to a known Braze doc.
function findGuideByFragment(fragment: string): string | null {
  const baseDir = path.join(process.cwd(), "braze_user_guide_md");
  if (!fs.existsSync(baseDir)) return null;
  const frag = fragment.toLowerCase();
  let found: string | null = null;
  (function walk(dir: string) {
    if (found) return;
    for (const file of fs.readdirSync(dir)) {
      if (found) return;
      const full = path.join(dir, file);
      if (fs.statSync(full).isDirectory()) { walk(full); continue; }
      if (!file.endsWith(".md")) continue;
      const rel = path.relative(baseDir, full).replace(/\\/g, "/");
      if (rel.toLowerCase().includes(frag)) {
        found = rel.startsWith("docs/User Guide/") ? rel : `docs/User Guide/${rel}`;
      }
    }
  })(baseDir);
  return found;
}

// Map the deliverability topic of a query to the most relevant Braze doc, so the
// suggested article is on-point even when the keyword scorer favours large docs.
// Topic → guide-path fragment rules. Order is priority order for suggestions.
const ARTICLE_TOPIC_RULES: [RegExp, string][] = [
  [/\b(spf|dkim|dmarc|authenticat|dns record|alignment|signature)\b/, 'email_setup/authentication'],
  [/\b(ip warm|warming|ramp|new ip|dedicated ip)\b/, 'email_setup/ip_warming'],
  [/\b(spam trap|pitfall|blocklist|blacklist|honeypot|junk folder)\b/, 'deliverability_pitfalls_and_spam_traps'],
  [/\b(list hygiene|sunset|stale|invalid recipient|suppress|inactive)\b/, 'best_practices/improve_deliverability'],
  [/\b(deliverab|inbox placement|sender reputation|reputation|bounce|complaint|spam rate|blocked|throttl|defer)\b/, 'best_practices/improve_deliverability'],
  [/\b(sending domain|subdomain|set up ip|setup ip|configure domain)\b/, 'email_setup/setting_up_ips_and_domains'],
  [/\b(subscription|unsubscrib|opt-in|opt out|opt-out|preference center)\b/, 'channels/email/subscriptions'],
  [/\b(deliverability center|dashboard|analytics)\b/, 'deliverability_center'],
];

// All guide paths whose topic concept appears in the text, in rule (priority)
// order. Prefers a RAG-retrieved source for a concept, else resolves from disk.
function mapAllArticlePaths(queryText: string, ragSources: string[]): string[] {
  const q = (queryText || '').toLowerCase();
  const out: string[] = [];
  const seenFrag = new Set<string>();
  for (const [re, frag] of ARTICLE_TOPIC_RULES) {
    if (seenFrag.has(frag) || !re.test(q)) continue;
    seenFrag.add(frag);
    const inSources = ragSources.find(s => s.toLowerCase().includes(frag));
    const resolved = inSources || findGuideByFragment(frag);
    if (resolved && !out.includes(resolved)) out.push(resolved);
  }
  return out;
}

function pickArticlePath(queryText: string, ragSources: string[]): string | null {
  return mapAllArticlePaths(queryText, ragSources)[0] ?? null; // first concept — caller decides fallback
}

// Turn a guide path into a display card { path, title, section }.
function guidePathToCard(p: string): { path: string; title: string; section: string } {
  const base = path.basename(p).replace(/\.md$/i, '');
  const titleRaw = /^index$/i.test(base) ? path.basename(path.dirname(p)) : base;
  const title = titleRaw.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  const parts = p.replace(/^docs\/User Guide\//, '').split('/');
  const section = parts.length > 1 ? parts[parts.length - 2].replace(/[-_]/g, ' ') : 'User Guide';
  return { path: p, title, section };
}

// Resolve up to `maxCards` User Guide article cards relevant to a block of text
// (e.g. the synthesised final customer draft). Reuses the same RAG retrieval and
// topic-mapping the chat endpoints use, so suggestions stay on-topic with the
// draft's actual content rather than a fixed keyword list.
function buildArticleCards(queryText: string, maxCards = 4): Array<{ path: string; title: string; section: string }> {
  const q = (queryText || '').slice(0, 1200);
  if (!q.trim()) return [];
  const { sources } = searchAndGetRAGContext(q, Math.max(4, maxCards + 2));
  const seen = new Set<string>();
  const paths: string[] = [];
  const tryAdd = (p?: string | null) => { if (p && !seen.has(p)) { seen.add(p); paths.push(p); } };
  // High-precision topic-mapped concepts first (auth, deliverability, sunset,
  // subscriptions, …), then top up remaining slots with RAG sources — but only
  // ones that are on-domain (email/deliverability), so a broad draft can't pull
  // in tangential docs like SQL segments or accessibility.
  mapAllArticlePaths(q, sources).forEach(tryAdd);
  const onDomain = /(email|deliverab|sender|bounce|spam|reputation|authentication|subscription|inbox)/i;
  sources.filter((s: string) => onDomain.test(s)).forEach((s: string) => tryAdd(s));
  return paths.slice(0, maxCards).map(guidePathToCard);
}

function parseFrontmatter(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!raw.startsWith('---')) return result;
  const end = raw.indexOf('---', 3);
  if (end < 0) return result;
  const fm = raw.slice(3, end);
  for (const line of fm.split('\n')) {
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    result[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return result;
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());



  // Refresh (restart) the dev server itself. Under `tsx watch`, bumping this
  // file's mtime triggers a clean process restart; if not watched, exit so an
  // external supervisor can relaunch.
  app.post('/api/server/restart', (_req, res) => {
    res.json({ ok: true });
    setTimeout(() => {
      try {
        const now = new Date();
        fs.utimesSync(path.resolve('server.ts'), now, now);
      } catch {
        process.exit(0);
      }
    }, 200);
  });

  // API Routes
  app.get('/api/gemini/status', (_req, res) => {
    res.json({ configured: !!geminiApiKey });
  });

  /** Return the list of selectable models + the currently active one */
  app.get('/api/gemini/model', (_req, res) => {
    res.json({ models: GEMINI_TEXT_MODELS, active: activeGeminiModel });
  });

  /** Switch the active model at runtime */
  app.post('/api/gemini/model', (req, res) => {
    const { model } = req.body as { model?: string };
    if (!model || !GEMINI_TEXT_MODELS.some(m => m.id === model)) {
      return res.status(400).json({ error: 'Invalid model ID' });
    }
    activeGeminiModel = model;
    try { fs.writeFileSync('.gemini_model', model, 'utf-8'); } catch {}
    console.log(`[Gemini] Active model switched to: ${model}`);
    res.json({ active: activeGeminiModel });
  });

  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { prompt, history } = req.body;
      // Convert Gemini-format history { role, parts:[{text}] } → OpenAI format { role, content }
      const priorMessages = (history ?? []).map((m: any) => ({
        role: m.role === 'model' ? 'assistant' : m.role,
        content: Array.isArray(m.parts) ? m.parts.map((p: any) => p.text).join('') : m.content ?? '',
      }));
      const messages = [
        { role: 'system', content: `You are a deliverability and analytics AI assistant for Braze. Help the user analyze metrics, troubleshoot email deliverability, suggest fixes, and understand metrics. Present your output cleanly with markdown. Limit responses to concise, helpful advice focused on the data.\n\n${GEMINI_CHART_POLICY}` },
        ...priorMessages,
        { role: 'user', content: prompt },
      ];
      const text = await callGemini(messages, 0.4, { maxTokens: 1200, timeoutMs: 240_000 });
      res.json({ text, role: 'model' });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: cleanGeminiErrorMessage(e) });
    }
  });

  // User Guide API: Get list of documents and their sync status
  app.get("/api/user-guide/files", (req, res) => {
    try {
      const statePath = path.join(process.cwd(), "braze_user_guide_state.json");
      if (!fs.existsSync(statePath)) {
        return res.json({ files: [] });
      }
      const rawState = fs.readFileSync(statePath, "utf-8");
      const state = JSON.parse(rawState);

      // Let's check which files actually exist locally on the disk
      const mdDir = path.join(process.cwd(), "braze_user_guide_md");
      const filesList = Object.entries(state).map(([githubPath, details]: [string, any]) => {
        const localPath = path.join(process.cwd(), details.local_path);
        const existsLocally = fs.existsSync(localPath);
        return {
          githubPath,
          filename: details.filename,
          section: details.section,
          rawUrl: details.raw_url,
          isSynced: existsLocally,
          sha: details.sha,
          lastSyncedAt: details.last_synced_at,
        };
      });

      res.json({ files: filesList });
    } catch (e: any) {
      console.error("Error reading user guide files:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // User Guide API: Trigger file synchronization using python sync script
  app.post("/api/user-guide/sync", (req, res) => {
    console.log("Triggering python syncer script...");
    exec("python3 sync_user_guide.py", (error, stdout, stderr) => {
      if (error) {
        console.error("Sync error:", error);
        return res.status(500).json({
          error: error.message,
          stdout: stdout || "",
          stderr: stderr || ""
        });
      }
      res.json({ success: true, stdout, stderr });
    });
  });

  // User Guide API: Sync a single file directly from raw.githubusercontent.com bypassing rate-limit
  app.post("/api/user-guide/sync-single", async (req, res) => {
    try {
      const { path: githubPath } = req.body;
      if (!githubPath) {
        return res.status(400).json({ error: "Missing 'path' parameter." });
      }

      const statePath = path.join(process.cwd(), "braze_user_guide_state.json");
      if (!fs.existsSync(statePath)) {
        return res.status(500).json({ error: "State file not found." });
      }
      const rawState = fs.readFileSync(statePath, "utf-8");
      const state = JSON.parse(rawState);

      const details = state[githubPath];
      if (!details) {
        return res.status(404).json({ error: `Path not defined in state: ${githubPath}` });
      }

      console.log(`Syncing single file from raw URL: ${details.raw_url}`);
      const response = await fetch(details.raw_url);
      if (!response.ok) {
        throw new Error(`Failed to fetch raw file from GitHub: ${response.statusText}`);
      }
      const markdownContent = await response.text();

      // Write locally
      const localPath = path.join(process.cwd(), details.local_path);
      fs.mkdirSync(path.dirname(localPath), { recursive: true });
      fs.writeFileSync(localPath, markdownContent, "utf-8");

      // Update state item status
      details.last_synced_at = new Date().toISOString();
      fs.writeFileSync(statePath, JSON.stringify(state, null, 2), "utf-8");

      res.json({ success: true, content: markdownContent });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Failed to download file." });
    }
  });

  // User Guide API: Fetch markdown content for a single file
  app.get("/api/user-guide/content", (req, res) => {
    try {
      const githubPath = req.query.path as string;
      if (!githubPath) {
        return res.status(400).json({ error: "Missing 'path' query parameter." });
      }

      const cleanPath = githubPath.replace(/^docs\/User Guide\//, "");
      const fullPath = path.join(process.cwd(), "braze_user_guide_md", "docs", "User Guide", cleanPath);

      if (!fs.existsSync(fullPath)) {
        return res.status(404).json({ error: `File not found locally: ${githubPath}. You might need to sync it.` });
      }

      const content = fs.readFileSync(fullPath, "utf-8");
      res.json({ content });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // Guide keyword search for the header search dropdown — returns titles only (no full content)
  app.get("/api/search", (req, res) => {
    try {
      const q = (req.query.q as string || "").toLowerCase().trim();
      if (!q || q.length < 2) return res.json({ guides: [] });
      const tokens = q.split(/\s+/).filter(t => t.length > 1);
      const mdDir = path.join(process.cwd(), "braze_user_guide_md");
      if (!fs.existsSync(mdDir)) return res.json({ guides: [] });

      const results: { path: string; title: string; score: number }[] = [];

      function walkSearch(dir: string, baseDir: string) {
        for (const file of fs.readdirSync(dir)) {
          const full = path.join(dir, file);
          if (fs.statSync(full).isDirectory()) { walkSearch(full, baseDir); continue; }
          if (!file.endsWith(".md")) continue;
          const rel = path.relative(baseDir, full).replace(/\\/g, "/");
          const title = path.basename(rel, ".md").replace(/[-_]/g, " ");
          const titleLow = title.toLowerCase();
          const relLow = rel.toLowerCase();
          let score = 0;
          for (const tok of tokens) {
            if (titleLow.includes(tok)) score += 5;
            if (relLow.includes(tok)) score += 2;
          }
          if (score === 0) {
            // light content scan (first 4kb only to stay fast)
            const snippet = fs.readFileSync(full, "utf-8").slice(0, 4096).toLowerCase();
            for (const tok of tokens) { if (snippet.includes(tok)) score += 1; }
          }
          if (score > 0) results.push({ path: rel, title, score });
        }
      }

      walkSearch(mdDir, mdDir);
      results.sort((a, b) => b.score - a.score);
      res.json({ guides: results.slice(0, 8) });
    } catch (e: any) {
      res.status(500).json({ guides: [], error: e.message });
    }
  });

  // User Guide API: Search assistant (RAG + Q&A with Gemini)
  app.post("/api/user-guide/ask", async (req, res) => {
    try {
      const { prompt, screen, ticketRef, history: chatHistory, mode } = req.body;
      if (!prompt) return res.status(400).json({ error: "Missing prompt." });

      // === REFINE FAST PATH ===
      // Refine pills ("Shorter", "Technical", "+ Data") rewrite the most recent
      // assistant answer. We deliberately IGNORE the current `screen` and
      // `ticketRef` here — if the user has navigated to a different view since
      // the original answer, the pill must still operate on the previous reply,
      // not pull fresh RAG for the new screen. Only typed messages trigger new
      // RAG/screen-context retrieval.
      if (mode === 'shorter' || mode === 'technical' || mode === 'data' || mode === 'cleanup') {
        // Skip refine-trigger messages and error messages when locating the real
        // last answer + its question. Refining must operate on the ACTUAL prior
        // exchange, not on an error or on the user's refine-click label.
        const REFINE_LABELS = new Set([
          'make this shorter',
          'expand the context and provide technical detail',
          'show the supporting data',
        ]);
        const isError = (c: any) => String(c || '').startsWith('⚠️');
        const isRefineClick = (c: any) => REFINE_LABELS.has(String(c || '').trim().toLowerCase());
        const cleanHistory = (Array.isArray(chatHistory) ? chatHistory : [])
          .filter((m: any) => m?.role && m?.content && !isError(m.content) && !isRefineClick(m.content));
        // Find the most recent real assistant answer + the user question that preceded it.
        let lastAssistantIdx = -1;
        for (let i = cleanHistory.length - 1; i >= 0; i--) {
          if (cleanHistory[i].role === 'assistant') { lastAssistantIdx = i; break; }
        }
        if (lastAssistantIdx < 0) {
          return res.json({ text: '', error: 'No previous answer to refine.' });
        }
        const lastAssistant = cleanHistory[lastAssistantIdx];
        const priorUserQ = (() => {
          for (let i = lastAssistantIdx - 1; i >= 0; i--) {
            if (cleanHistory[i].role === 'user') return cleanHistory[i];
          }
          return null;
        })();
        const directive =
          mode === 'shorter'   ? "Rewrite your previous answer to be significantly shorter and more concise. Preserve all key facts; cut the fluff. Use bullets where natural. Output only the rewritten answer."
        : mode === 'technical' ? "Expand your previous answer with full technical context and specifics — keep the SAME topic as before, but add exact values, configuration details, thresholds, protocol/spec references, and concrete commands or examples where relevant. Output only the expanded answer."
        : mode === 'cleanup'   ? "The consultant edited your draft for the section described in ORIGINAL TASK above. Produce an improved version that STAYS STRICTLY within that section's scope and constraints — do NOT add sections, diagnosis, analysis, recommendations, or next steps the ORIGINAL TASK did not ask for. (For example, if the task is only to restate the customer's reported issue, do not add delivery analysis or recommended actions.) Incorporate the consultant's edits and additions that fit the section's scope, and improve grammar, clarity and flow. Anything the consultant attributes to the customer (what they reported / mentioned) is a reported statement — always keep it; it does not need ticket-data support. The data-support check applies to two kinds of consultant additions:\n1. CONTRADICTED FACTS/VALUES: the consultant states a specific value, metric, status, or fact that CONFLICTS with the ticket signals — e.g. they write 'open rate is 50%' but the signals show 16.1%, or 'SPF failed' when SPF shows PASS. Do NOT silently overwrite or silently drop it. Keep the answer accurate (use the real value from the signals), and you MUST flag the discrepancy.\n2. UNSUPPORTED DIAGNOSTIC CLAIMS: the consultant asserts a diagnosis/cause/recommendation the ticket signals contain no evidence for (e.g. they claim Gmail throttling but the captured signals show only Microsoft). Do NOT present it as established fact or invent confirmed steps for it.\nIn EITHER case, after the answer, output a line containing exactly §§ADVISORY§§ on its own, followed by a short note addressed TO THE CONSULTANT (never the customer) that for each flagged item: (a) names exactly what they wrote, (b) states the actual ticket data — for a contradicted value give BOTH their figure and the real figure (e.g. 'you entered 50%, but the ticket shows 16.1%'), for an unsupported claim state there is no supporting data and show the relevant current data, and (c) asks them to correct it or provide supporting detail before it goes to the customer. NEVER silently change or remove a consultant-entered fact without an advisory. If nothing qualifies, do NOT output §§ADVISORY§§ at all. Output only the answer, optionally followed by the §§ADVISORY§§ block."
        :                       "Rewrite your previous answer as a data-driven response. Lead with numbers; present them as bullets or a compact Markdown table. Keep prose minimal. Output only the rewritten answer.";
        try {
          const refineMessages: any[] = [
            { role: 'system', content: 'You are a Braze deliverability expert. The user is asking you to refine your previous answer on a specific topic. Stay strictly on that topic. No preamble. No greeting. Just the refined answer in Markdown.' },
          ];
          // Cleanup needs the full ticket-signal context to judge what's supported;
          // give it a roomier budget than the other refine modes.
          const qCap = mode === 'cleanup' ? 2600 : 1200;
          if (priorUserQ) refineMessages.push({ role: 'user', content: String(priorUserQ.content).slice(0, qCap) });
          refineMessages.push({ role: 'assistant', content: String(lastAssistant.content).slice(0, 2400) });
          refineMessages.push({ role: 'user', content: directive });
          const refined = await callGemini(refineMessages, 0.3, { maxTokens: mode === 'cleanup' ? 1000 : 800, timeoutMs: 120_000 });
          // Cleanup may append a consultant-only advisory flagging unsupported claims,
          // delimited by §§ADVISORY§§. Split it out so the client can render it as a
          // distinct note rather than folding it into the customer-facing draft.
          if (mode === 'cleanup' && refined.includes('§§ADVISORY§§')) {
            const [text, ...rest] = refined.split('§§ADVISORY§§');
            return res.json({ text: text.trim(), advisory: rest.join('§§ADVISORY§§').trim(), article: null, suggestions: [] });
          }
          return res.json({ text: refined, advisory: null, article: null, suggestions: [] });
        } catch (e: any) {
          return res.json({ text: '', error: cleanGeminiErrorMessage(e) });
        }
      }

      // Retrieve Braze User Guide excerpts using the question AND the on-screen
      // subject (so a ticket about "DMARC errors" pulls the DMARC guide pages).
      const screenText: string = typeof screen === 'string' ? screen : '';
      const ragQuery = `${prompt} ${screenText}`.slice(0, 600);
      const { context, sources } = searchAndGetRAGContext(ragQuery, 3);

      // Retrieve relevant historical cases — same account at full fidelity,
      // other accounts PII-scrubbed — entirely on-device over the closed cases.
      const { tickets: historyTickets, resolvedAccount } = buildHistoryTickets(ticketRef);
      const ticketMemory = searchHistoricalTickets(`${prompt} ${screenText}`, { id: ticketRef?.id, account: resolvedAccount }, historyTickets);

      // Cap the guide context to leave room for history + answer within the
      // model's context window (budget scales with the configured model).
      const MAX_CONTEXT_CHARS = MODEL_BUDGETS.guideChars;
      const trimmedContext = context && context.length > MAX_CONTEXT_CHARS
        ? context.slice(0, MAX_CONTEXT_CHARS) + '\n\n[...truncated...]'
        : (context || '(no specific guide excerpt retrieved)');

      // Carry the prior conversation so follow-ups understand earlier turns.
      // Keep the most recent turns within a char budget so we don't blow the window.
      const HISTORY_CHAR_BUDGET = MODEL_BUDGETS.historyChars;
      const priorMessages: { role: string; content: string }[] = [];
      if (Array.isArray(chatHistory)) {
        let used = 0;
        for (let i = chatHistory.length - 1; i >= 0; i--) {
          const m = chatHistory[i];
          if (!m || !m.content) continue;
          const role = m.role === 'assistant' ? 'assistant' : 'user';
          const content = String(m.content).slice(0, 1200);
          if (used + content.length > HISTORY_CHAR_BUDGET) break;
          used += content.length;
          priorMessages.unshift({ role, content });
        }
      }

      // Refine pills ask the model to recast its most recent answer.
      const refineDirective =
        mode === 'shorter'   ? "Rewrite your most recent answer to be significantly shorter and more concise. Preserve the key facts and the context of this conversation; drop the rest."
      : mode === 'technical' ? "Rewrite your most recent answer focusing on the technical specifics (DNS, SPF/DKIM/DMARC, IP/reputation, protocol-level detail). Back each point with concrete supporting data or metrics."
      : mode === 'data'      ? "Rewrite your most recent answer as a concise, data-driven response. Lead with the numbers and present them as bullet points or a compact Markdown table. Keep prose to a minimum."
      : '';

      // Split chip-selected panel data out of screenText so it gets its own
      // high-priority block rather than being buried at the end of screenBlock.
      const PANEL_SEP = '\n\n--- SELECTED CONTEXT ---\n';
      const panelSepIdx = screenText.indexOf(PANEL_SEP);
      const baseScreen = panelSepIdx >= 0 ? screenText.slice(0, panelSepIdx) : screenText;
      const selectedPanelBlock = panelSepIdx >= 0 ? screenText.slice(panelSepIdx + PANEL_SEP.length).trim() : '';

      const screenBlock = baseScreen
        ? baseScreen.slice(0, 2000)
        : '(the user is not focused on a specific record)';

      const dailyHistoryBlock = ticketRef?.id ? getDailySeriesContext(ticketRef.id) : '';

      // Count distinct pinned panels (delimited as "=== PANEL N: ... ===" by the
      // client) so we can tell the model when to assess cross-panel relatedness.
      const pinnedPanelCount = (selectedPanelBlock.match(/^===\s*PANEL\s+\d+:/gim) || []).length;
      const multiPanelRule = pinnedPanelCount > 1 ? `
MULTI-PANEL RULE — the agent pinned ${pinnedPanelCount} separate panels (each delimited "=== PANEL N: <label> [scope: ...] ==="). The SELECTED CONTEXT block contains an authoritative "(RELATEDNESS: ...)" verdict — OBEY it; do not second-guess it from the content. Panels with different scopes are different cases.
- If the verdict says they are RELATED: give one integrated analysis that ties them together.
- If the verdict says they are UNRELATED: do NOT merge them and NEVER attribute one panel's metrics, rates, or values to another. Lead with the single most detailed / most case-specific panel (usually a ticket), summarise it fully, then for each other panel briefly note what it is and ASK the agent what they'd like you to do with it. Treat each panel as its own subject.
` : '';

      // No longer restricted to "only the context" — the model is told to combine
      // its own knowledge, the Braze guide excerpts, and the live on-screen data.
      const systemPrompt = `You are Gemini — an email-deliverability troubleshooting expert embedded in a Braze support dashboard. Your job is to help a support agent diagnose and resolve customer deliverability issues quickly. You answer as a specialist, not a generalist.

WHAT TO WEIGH (in order of priority):
0. USER-PINNED PANEL DATA (see block below) — the agent manually selected these modules. If present, they are the primary subject. Analyse them directly and cite their specific values. If more than one panel is pinned, follow the MULTI-PANEL RULE below — do not assume the panels are related.
1. The current customer's live ticket details (LIVE ON-SCREEN CONTEXT) — the case in front of you, including account, metrics, RCA, bounce data, and auth results.
2. The same customer's past tickets (SAME-ACCOUNT history) — spot recurring patterns specific to this account.
3. Braze-specific best practice from the USER GUIDE EXCERPTS — authoritative for any Braze configuration question.
4. General email-deliverability best practice — SPF / DKIM / DMARC, IP warming, bounce / complaint thresholds, sender reputation, list hygiene, ESP behaviour.
5. Cross-account historical precedents (HISTORICAL TICKET CONTEXT, anonymized) — use ONLY to recognise patterns and suggest fixes that have worked. Do not centre your answer on them; they are a sanity check, not the main subject.

${APP_FEATURE_CONTEXT}

${APP_ACTION_GUIDANCE}

PII GUARDRAIL — non-negotiable: cross-account context is redacted before it reaches you. Treat anything in that section as an anonymized pattern. NEVER name, guess or imply which account a pattern came from. NEVER reproduce account names, contact names, email addresses, domains, campaign IDs, DKIM selectors, IPs, or any identifier from the cross-account block — even if it appears verbatim in the excerpt. If you reference a precedent, write it as "a peer account resolved this by…" or "we've seen this pattern when…". Never quote redacted blocks back.

CRITICAL — ANSWER, DON'T REDIRECT. Answer the question fully using your own knowledge, the guide and any available data. NEVER tell the user to navigate elsewhere, open another section/tab/page, or "check the dashboard". If a live value isn't available, give the substantive answer anyway.

NEVER INVENT UI ACTIONS — non-negotiable. Do NOT instruct the user to "select", "assign", "enable", "click", "toggle", or "configure" any control, field, button, or setting UNLESS that exact control is explicitly described in the on-screen context. The tools here are read-only planners/analyzers; most do not let the user assign or change values. If something isn't present, say plainly what the screen does show and answer the underlying question — never fabricate a step or feature that may not exist.

ANSWER THE LITERAL QUESTION FIRST — your opening sentence must directly address exactly what the user asked. If they ask for a value the screen does not contain (e.g. "Which IP is warming?" when no IP is shown), say so plainly up front ("No specific IP is shown here — this planner builds the ramp by volume and strategy, not a bound IP"), THEN add context. Never lead with a generic description of the tool while leaving the actual question unanswered.

TICKET CONTEXT RULE — when LIVE ON-SCREEN CONTEXT says "Currently viewing: Support ticket", treat the answer as about that specific account/case unless the user explicitly asks a general question. If ACTIVE FILTERS name a selected IP, sending domain, mailbox provider, IP pool, campaign, or subaccount, scope the diagnosis to that selected entity first and only widen to the ticket/account after. Use the active tab as visual focus, but correlate across the full ticket context: issue, case number, account, root cause, authentication state, deliverability metrics, email performance metrics, bounce/provider details, support history, sending domains, and subaccounts. Do not answer a clicked suggestion as generic best practice if ticket/account data is present.

NEVER CONFUSE 30-DAY TOTALS WITH 7-DAY SNAPSHOTS — When the user asks for a 30-day trend or historical analysis, do NOT use the 7-day visual snapshot metrics (e.g., 9,175 deferred events or 95.3% accepted rate from pinned/screen cards) as the representative 30-day totals. Instead, reference the actual daily values and cumulative totals from the "=== 30-DAY DAILY HISTORICAL METRICS ===" table. If you write a summary table, report the 30-day values (e.g., total 39,321 deferred events or the peak daily count of 18,976) rather than copying the 7-day pinned value, or clearly label them as "7-day active window: 9,175 vs 30-day total: 39,321". Always be precise about the timeframes.

NEVER DISCLAIM MISSING CONTEXT — non-negotiable. You are a deliverability expert; answer from your own expertise. NEVER open with or include phrases like "There is no specific … defined in the provided documentation", "the documentation does not specify", "not defined in the live context", or any variation that frames the answer around the absence of pinned data, guide excerpts, or on-screen context. The user does not see "the documentation" — they see you. When no panel/context/guide is pinned, simply give the expert answer directly as if the question stood alone. Do not mention what you were or weren't given.

LABEL FIDELITY — When source data uses a named classification or label (e.g. "Moderate", "Conservative", "Aggressive", "Standard"), use that exact term. NEVER replace a source label with your own characterization. If the data says "Moderate strategy", say "Moderate" — do not call it "aggressive" or reinterpret it. Named attributes in the data are authoritative.

SUGGESTED GUIDE CARDS — Beneath your answers the dashboard displays up to 3 related User Guide cards, chosen by the system's guide-matcher (not by you). Prior turns may note "[Suggested guide cards shown to the user with this answer: …]". If the user asks why a particular guide was suggested, do NOT deny suggesting it — those cards are presented as part of your answer. Acknowledge it was surfaced and explain its relevance, or why it is secondary to the primary recommendation.

USER OVERRIDE — Honour explicit format and length requests (table, step-by-step, checklist, etc.). The defaults below apply only when the user hasn't specified a format.

STYLE DEFAULTS (when no user override):
- No preamble, greeting, role statement, or restatement of the question. Open with the substantive finding.
- When USER-PINNED PANEL DATA is present: you MUST reference specific numbers, rows, rates, or named values from it. A response that ignores the pinned data is wrong. Budget up to 300 words to cover it properly.
- When no panel data is pinned: ≤ 150 words. Lead with the diagnosis, then the fix.
- Prefer structure: bold labels, tight bullet lists, a Markdown table for metric comparisons.
- One concrete next step at the end. No filler.
${GEMINI_CHART_POLICY}
${multiPanelRule}${selectedPanelBlock ? `
=== USER-PINNED PANEL DATA ===
The agent pinned ${pinnedPanelCount > 1 ? `${pinnedPanelCount} panels` : 'this module'} for analysis. Cite specific values in your answer.
${selectedPanelBlock.slice(0, 2500)}` : ''}

=== LIVE ON-SCREEN CONTEXT ===
${screenBlock}
${dailyHistoryBlock ? `\n\n${dailyHistoryBlock}` : ''}

=== BRAZE USER GUIDE EXCERPTS ===
${trimmedContext}

=== HISTORICAL TICKET CONTEXT ===
${ticketMemory.block || '(no relevant past tickets found)'}

Return ONLY the answer in Markdown. Do not add a "SUGGESTIONS" section or follow-up questions — the UI generates those separately.`;

      const userContent = refineDirective || prompt.slice(0, 800);
      const rawText = await callGemini([
        { role: 'system', content: systemPrompt },
        ...priorMessages,
        { role: 'user', content: userContent },
      ], refineDirective ? 0.4 : 0.55);

      // Belt-and-braces: catch any "SUG*" trailing block the small model might
      // hallucinate (SUGGESTIONS, SUGREETINGS, SUGESTIONS, etc.) and strip it
      // from the visible answer. We no longer use these for the UI.
      let text = rawText.replace(/\n\s*SUG\w*\s*:\s*[\s\S]*$/i, '').trim();
      // Strip any "[Suggested guide cards shown … ]" annotation the model echoes
      // back — that bracket note is internal history context, never user-facing.
      text = text.replace(/\[\s*Suggested guide cards shown[^\]]*\]/gi, '').trim();
      text = await appendGeminiDecidedChart({ prompt, answer: text, screenText, selectedPanelBlock, sources, ticketRef });
      let suggestions: string[] = [];

      // Suggest up to 3 relevant Braze User Guide articles. The concept-rule
      // routed pick is always first (it's the most relevant); the rest come
      // from the RAG sources in score order, deduped against the first pick.
      const toCard = (p: string) => {
        const base = path.basename(p).replace(/\.md$/i, '');
        const titleRaw = /^index$/i.test(base) ? path.basename(path.dirname(p)) : base;
        const title = titleRaw.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const parts = p.replace(/^docs\/User Guide\//, '').split('/');
        const section = parts.length > 1 ? parts[parts.length - 2].replace(/[-_]/g, ' ') : 'User Guide';
        return { path: p, title, section };
      };
      const seen = new Set<string>();
      const articlePaths: string[] = [];
      const tryAdd = (p: string | null | undefined) => {
        if (!p || seen.has(p)) return;
        seen.add(p);
        articlePaths.push(p);
      };
      // Use only prompt + model answer for concept matching — NOT screenText.
      // Including screenText (full ticket context) triggers deliverability rules
      // even for unrelated questions like "who is the contact for this account".
      tryAdd(pickArticlePath(prompt, sources));
      tryAdd(pickArticlePath(`${prompt} ${text}`.slice(0, 900), sources));
      // Only fall back to RAG sources if at least one concept rule already matched,
      // so we don't surface random deliverability articles for non-technical questions.
      if (articlePaths.length > 0) sources.forEach(s => tryAdd(s));

      // How many cards to surface? Default 1 (the most relevant article).
      // Bump to up to 3 when the question spans multiple concepts, asks for
      // a comparison, or is about general best practice / a ticket roundup.
      const lower = String(prompt).toLowerCase();
      const isMultiTopic =
        /\b(compare|comparison|vs\.?|versus|difference|differences|both|all three|all 3)\b/.test(lower) ||
        (lower.match(/\band\b/g) || []).length >= 2 ||
        (lower.match(/,/g) || []).length >= 2;
      const isBestPractice = /\b(best practice|best practices|recommend|guidance|guide|articles|documentation)\b/.test(lower);
      const isAboutSpecificTicket = !!ticketRef?.id && /\b(this ticket|this customer|this account|the ticket|the customer)\b/.test(lower);
      const maxCards = isAboutSpecificTicket ? 1 : (isMultiTopic || isBestPractice ? 3 : 1);
      const articles = articlePaths.slice(0, maxCards).map(toCard);
      // Keep the legacy single-article field for backwards compatibility with
      // anything still reading `article`.
      const article = articles[0] ?? null;
      const actions = resolveAppActions(prompt, text);

      res.json({
        text, sources, suggestions, article, articles, actions,
        hasContext: sources.length > 0,
        memory: { sameAccount: ticketMemory.sameAccountCount, otherAccounts: ticketMemory.otherAccountCount },
      });
    } catch (e: any) {
      console.error("Error in User Guide ask endpoint:", e);
      res.status(500).json({ error: cleanGeminiErrorMessage(e) });
    }
  });

  // Streaming variant of /api/user-guide/ask — sends SSE tokens as they generate.
  // The client shows partial markdown immediately; "Finalizing" never happens.
  app.post("/api/user-guide/ask-stream", async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    const send = (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`);

    try {
      const { prompt, screen, ticketRef, history: chatHistory, highlightedText, highlightedContext } = req.body;
      if (!prompt) { send({ error: 'Missing prompt.' }); return res.end(); }

      const screenText: string = typeof screen === 'string' ? screen : '';
      let ragQuery = `${prompt} ${screenText}`.slice(0, 600);
      if (highlightedText) {
        const titleMatch = screenText.match(/Title:\s*([^\n]+)/);
        const articleTitle = titleMatch ? titleMatch[1].trim() : '';
        ragQuery = `${highlightedText} ${articleTitle}`.trim();
      }
      const { context, sources } = searchAndGetRAGContext(ragQuery, 3);
      const { tickets: historyTickets, resolvedAccount } = buildHistoryTickets(ticketRef);
      const ticketMemory = searchHistoricalTickets(`${prompt} ${screenText}`, { id: ticketRef?.id, account: resolvedAccount }, historyTickets);

      const trimmedContext = context && context.length > MODEL_BUDGETS.guideChars
        ? context.slice(0, MODEL_BUDGETS.guideChars) + '\n\n[...truncated...]'
        : (context || '(no specific guide excerpt retrieved)');

      const priorMessages: { role: string; content: string }[] = [];
      if (Array.isArray(chatHistory)) {
        let used = 0;
        for (let i = chatHistory.length - 1; i >= 0; i--) {
          const m = chatHistory[i];
          if (!m?.content) continue;
          const role = m.role === 'assistant' ? 'assistant' : 'user';
          const content = String(m.content).slice(0, 1200);
          if (used + content.length > MODEL_BUDGETS.historyChars) break;
          used += content.length;
          priorMessages.unshift({ role, content });
        }
      }

      const PANEL_SEP_S = '\n\n--- SELECTED CONTEXT ---\n';
      const panelSepIdxS = screenText.indexOf(PANEL_SEP_S);
      const baseScreenS = panelSepIdxS >= 0 ? screenText.slice(0, panelSepIdxS) : screenText;
      const selectedPanelBlockS = panelSepIdxS >= 0 ? screenText.slice(panelSepIdxS + PANEL_SEP_S.length).trim() : '';

      const screenBlock = baseScreenS ? baseScreenS.slice(0, 2000) : '(the user is not focused on a specific record)';

      const dailyHistoryBlockS = ticketRef?.id ? getDailySeriesContext(ticketRef.id) : '';

      let highlightedBlock = '';
      if (highlightedText) {
        const isUserGuide = screenText.includes("Currently viewing: User Guide");
        if (isUserGuide) {
          highlightedBlock = `\n\n=== USER HIGHLIGHTED TEXT IN USER GUIDE ===\nThe user has highlighted the term/phrase: "${highlightedText}" inside the active User Guide article.\n\nCRITICAL RULE: Explain this highlighted term in the context of the active User Guide article. If the highlighted term is a general platform concept (e.g. "Braze", "Workspace", "Campaign"), provide a high-level conceptual or platform overview of the term first. Do not get distracted by niche event tracking fields or technical code snippets from other guide excerpts unless they are directly relevant to the user's focus.`;
        } else {
          highlightedBlock = `\n\n=== USER HIGHLIGHTED METRIC/TEXT ===\nThe user has highlighted the value/metric: "${highlightedText}" on their dashboard/screen.\nLocal DOM Context of the selected text:\n${highlightedContext || '(no surrounding DOM context metadata)'}\n\nCRITICAL RULE: Correlate this highlighted text directly to the active ticket, account, or diagnostic metric. Explain exactly what this value means in this context, troubleshoot why it's occurring, and ground your response in this specific highlighted context first.`;
        }
      }

      const pinnedPanelCountS = (selectedPanelBlockS.match(/^===\s*PANEL\s+\d+:/gim) || []).length;
      const multiPanelRuleS = pinnedPanelCountS > 1 ? `
MULTI-PANEL RULE — the agent pinned ${pinnedPanelCountS} separate panels (each delimited "=== PANEL N: <label> [scope: ...] ==="). The SELECTED CONTEXT block contains an authoritative "(RELATEDNESS: ...)" verdict — OBEY it; do not second-guess it from the content. Panels with different scopes are different cases.
- If the verdict says they are RELATED: give one integrated analysis that ties them together.
- If the verdict says they are UNRELATED: do NOT merge them and NEVER attribute one panel's metrics, rates, or values to another. Lead with the single most detailed / most case-specific panel (usually a ticket), summarise it fully, then for each other panel briefly note what it is and ASK the agent what they'd like you to do with it. Treat each panel as its own subject.
` : '';

      const systemPrompt = `You are Gemini — an email-deliverability troubleshooting expert embedded in a Braze support dashboard. Your job is to help a support agent diagnose and resolve customer deliverability issues quickly. You answer as a specialist, not a generalist.

WHAT TO WEIGH (in order of priority):
0. USER-PINNED PANEL DATA (see block below) — the agent manually selected these modules. If present, they are the primary subject. Analyse them directly and cite their specific values. If more than one panel is pinned, follow the MULTI-PANEL RULE below — do not assume the panels are related.
1. The current customer's live ticket details (LIVE ON-SCREEN CONTEXT) — the case in front of you, including account, metrics, RCA, bounce data, and auth results.
2. The same customer's past tickets (SAME-ACCOUNT history) — spot recurring patterns specific to this account.
3. Braze-specific best practice from the USER GUIDE EXCERPTS — authoritative for any Braze configuration question.
4. General email-deliverability best practice — SPF / DKIM / DMARC, IP warming, bounce / complaint thresholds, sender reputation, list hygiene, ESP behaviour.
5. Cross-account historical precedents (HISTORICAL TICKET CONTEXT, anonymized) — use ONLY to recognise patterns and suggest fixes that have worked. Do not centre your answer on them; they are a sanity check, not the main subject.

${APP_FEATURE_CONTEXT}

${APP_ACTION_GUIDANCE}

PII GUARDRAIL — non-negotiable: cross-account context is redacted before it reaches you. NEVER name, guess or imply which account a pattern came from. NEVER reproduce account names, contact names, email addresses, domains, campaign IDs, DKIM selectors, IPs, or any identifier from the cross-account block. If you reference a precedent, write it as "a peer account resolved this by…". Never quote redacted blocks back.

CRITICAL — ANSWER, DON'T REDIRECT. Answer the question fully using your own knowledge, the guide and any available data. NEVER tell the user to navigate elsewhere, open another section/tab/page, or "check the dashboard".

NEVER INVENT UI ACTIONS — non-negotiable. Do NOT instruct the user to "select", "assign", "enable", "click", "toggle", or "configure" any control, field, button, or setting UNLESS that exact control is explicitly described in the on-screen context. The tools here are read-only planners/analyzers; most do not let the user assign or change values. If something isn't present, say plainly what the screen does show and answer the underlying question — never fabricate a step or feature that may not exist.

ANSWER THE LITERAL QUESTION FIRST — your opening sentence must directly address exactly what the user asked. If they ask for a value the screen does not contain (e.g. "Which IP is warming?" when no IP is shown), say so plainly up front ("No specific IP is shown here — this planner builds the ramp by volume and strategy, not a bound IP"), THEN add context. Never lead with a generic description of the tool while leaving the actual question unanswered.

TICKET CONTEXT RULE — when LIVE ON-SCREEN CONTEXT says "Currently viewing: Support ticket", treat the answer as about that specific account/case unless the user explicitly asks a general question. If ACTIVE FILTERS name a selected IP, sending domain, mailbox provider, IP pool, campaign, or subaccount, scope the diagnosis to that selected entity first and only widen to the ticket/account after. Use the active tab as visual focus, but correlate across the full ticket context: issue, case number, account, root cause, authentication state, deliverability metrics, email performance metrics, bounce/provider details, support history, sending domains, and subaccounts. Do not answer a clicked suggestion as generic best practice if ticket/account data is present.

NEVER CONFUSE 30-DAY TOTALS WITH 7-DAY SNAPSHOTS — When the user asks for a 30-day trend or historical analysis, do NOT use the 7-day visual snapshot metrics (e.g., 9,175 deferred events or 95.3% accepted rate from pinned/screen cards) as the representative 30-day totals. Instead, reference the actual daily values and cumulative totals from the "=== 30-DAY DAILY HISTORICAL METRICS ===" table. If you write a summary table, report the 30-day values (e.g., total 39,321 deferred events or the peak daily count of 18,976) rather than copying the 7-day pinned value, or clearly label them as "7-day active window: 9,175 vs 30-day total: 39,321". Always be precise about the timeframes.

NEVER DISCLAIM MISSING CONTEXT — non-negotiable. You are a deliverability expert; answer from your own expertise. NEVER open with or include phrases like "There is no specific … defined in the provided documentation", "the documentation does not specify", "not defined in the live context", or any variation that frames the answer around the absence of pinned data, guide excerpts, or on-screen context. The user does not see "the documentation" — they see you. When no panel/context/guide is pinned, simply give the expert answer directly as if the question stood alone. Do not mention what you were or weren't given.

LABEL FIDELITY — When source data uses a named classification or label (e.g. "Moderate", "Conservative", "Aggressive", "Standard"), use that exact term. NEVER replace a source label with your own characterization. If the data says "Moderate strategy", say "Moderate" — do not call it "aggressive" or reinterpret it. Named attributes in the data are authoritative.

SUGGESTED GUIDE CARDS — Beneath your answers the dashboard displays up to 3 related User Guide cards, chosen by the system's guide-matcher (not by you). Prior turns may note "[Suggested guide cards shown to the user with this answer: …]". If the user asks why a particular guide was suggested, do NOT deny suggesting it — those cards are presented as part of your answer. Acknowledge it was surfaced and explain its relevance, or why it is secondary to the primary recommendation.

USER OVERRIDE — Honour explicit format and length requests (table, step-by-step, checklist, etc.). The defaults below apply only when the user hasn't specified a format.

STYLE DEFAULTS (when no user override):
- No preamble, greeting, role statement, or restatement of the question. Open with the substantive finding.
- When USER-PINNED PANEL DATA is present: you MUST reference specific numbers, rows, rates, or named values from it. A response that ignores the pinned data is wrong. Budget up to 300 words to cover it properly.
- When no panel data is pinned: ≤ 150 words. Lead with the diagnosis, then the fix.
- Prefer structure: bold labels, tight bullet lists, a Markdown table for metric comparisons.
- One concrete next step at the end. No filler.
${GEMINI_CHART_POLICY}
${multiPanelRuleS}${selectedPanelBlockS ? `
=== USER-PINNED PANEL DATA ===
The agent pinned ${pinnedPanelCountS > 1 ? `${pinnedPanelCountS} panels` : 'this module'} for analysis. Cite specific values in your answer.
${selectedPanelBlockS.slice(0, 2500)}` : ''}

=== LIVE ON-SCREEN CONTEXT ===
${screenBlock}${highlightedBlock}
${dailyHistoryBlockS ? `\n\n${dailyHistoryBlockS}` : ''}

=== BRAZE USER GUIDE EXCERPTS ===
${trimmedContext}

=== HISTORICAL TICKET CONTEXT ===
${ticketMemory.block || '(no relevant past tickets found)'}

Return ONLY the answer in Markdown. Do not add a "SUGGESTIONS" section.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...priorMessages,
        { role: 'user', content: String(prompt).slice(0, 800) },
      ];

      // Stream from Gemini API
      let fullText = '';
      try {
        const { systemInstruction, contents } = convertMessagesToGemini(messages);
        const responseStream = await ai.models.generateContentStream({
          model: activeGeminiModel,
          contents,
          config: {
            systemInstruction: systemInstruction || undefined,
            temperature: 0.55,
            maxOutputTokens: 1200,
          }
        });

        for await (const chunk of responseStream) {
          const token = chunk.text;
          if (token) {
            fullText += token;
            send({ token });
          }
        }
      } catch (err: any) {
        console.error("[Gemini API] Stream error:", err);
        send({ error: cleanGeminiErrorMessage(err) });
        return res.end();
      }

      // Post-process full text
      const text = fullText
        .replace(/\n\s*SUG\w*\s*:\s*[\s\S]*$/i, '')
        .replace(/\[\s*Suggested guide cards shown[^\]]*\]/gi, '')
        .trim();

      // Compute article cards (same logic as /ask)
      const toCard = (p: string) => {
        const base = path.basename(p).replace(/\.md$/i, '');
        const titleRaw = /^index$/i.test(base) ? path.basename(path.dirname(p)) : base;
        const title = titleRaw.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
        const parts = p.replace(/^docs\/User Guide\//, '').split('/');
        const section = parts.length > 1 ? parts[parts.length - 2].replace(/[-_]/g, ' ') : 'User Guide';
        return { path: p, title, section };
      };
      const seen = new Set<string>();
      const articlePaths: string[] = [];
      const tryAdd = (p: string | null | undefined) => { if (p && !seen.has(p)) { seen.add(p); articlePaths.push(p); } };
      tryAdd(pickArticlePath(prompt, sources));
      tryAdd(pickArticlePath(`${prompt} ${text}`.slice(0, 900), sources));
      if (articlePaths.length > 0) sources.forEach((s: string) => tryAdd(s));
      const lower = String(prompt).toLowerCase();
      const isMultiTopic = /\b(compare|comparison|vs\.?|versus|difference|differences|both|all three|all 3)\b/.test(lower) || (lower.match(/\band\b/g) || []).length >= 2 || (lower.match(/,/g) || []).length >= 2;
      const isBestPractice = /\b(best practice|best practices|recommend|guidance|guide|articles|documentation)\b/.test(lower);
      const isAboutSpecificTicket = !!ticketRef?.id && /\b(this ticket|this customer|this account|the ticket|the customer)\b/.test(lower);
      const maxCards = isAboutSpecificTicket ? 1 : (isMultiTopic || isBestPractice ? 3 : 1);
      const articles = articlePaths.slice(0, maxCards).map(toCard);

      const finalText = await appendGeminiDecidedChart({ prompt, answer: text, screenText, selectedPanelBlock: selectedPanelBlockS, sources, ticketRef });
      const actions = resolveAppActions(prompt, finalText);

      send({ done: true, text: finalText, articles, actions, sources, suggestions: [] });
      res.end();
    } catch (e: any) {
      send({ error: e.message || 'Stream failed' });
      res.end();
    }
  });

  // Workspace section generator — streams ONE investigation section with a minimal
  // system prompt that strictly obeys the per-panel task (no diagnosis template, no
  // forced "Next Step"), so each panel reads differently. Optional anonymised
  // precedent is injected only when the panel asks for it (Support History).
  app.post("/api/workspace/section-stream", async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    const send = (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`);
    try {
      const { prompt, ticketRef, includeHistory, final: isFinal } = req.body;
      if (!prompt) { send({ error: 'Missing prompt.' }); return res.end(); }

      let historyBlock = '';
      if (includeHistory) {
        const { tickets: historyTickets, resolvedAccount } = buildHistoryTickets(ticketRef);
        const mem = searchHistoricalTickets(String(prompt).slice(0, 400), { id: ticketRef?.id, account: resolvedAccount }, historyTickets);
        if (mem.block) historyBlock = `\n\n=== SIMILAR PAST CASES (same account at full fidelity; other accounts anonymised) ===\n${mem.block}`;
      }

      // Two lean system prompts — both kept small so the whole request fits the
      // on-device model's 4096-token window. The "final" variant synthesises the
      // approved findings into a customer-facing reply (and may include next steps),
      // while the default variant writes one tightly-scoped investigation section.
      const systemPrompt = isFinal
        ? `You are an EDS (Email Deliverability Services) expert writing the final HANDOFF NOTE for a ticket. AUDIENCE: the internal colleague (CSM/support) who owns the customer relationship and will relay the relevant parts to the customer — this is NOT addressed to the customer directly (open with an internal greeting like "Hi team,", never "Hello [customer]"). Follow the user's instructions exactly. Synthesise the approved findings into ONE cohesive internal note — do not paste the sections back verbatim. Cover what we found, what it means, and the recommended actions. Be specific and ACCURATE to the supporting data — quote the real metrics and error codes exactly; never invent or round away figures. GitHub-flavoured Markdown.

OWNERSHIP — EDS only investigates and recommends here. EDS does NOT contact the customer, submit provider (Microsoft/Google) tickets/delisting, follow up escalations, or monitor the account — so never write "we will submit/monitor/coordinate". Group recommendations under "For the customer to action (relay to them)" and "To raise internally (cross-team / platform ticket)". The customer has only the Braze dashboard + Looker, not direct access to Braze-managed sending infrastructure provider consoles (SparkPost, SendGrid, Amazon SES, raw MTA/IP tooling) — the customer submits their own mailbox-provider requests and monitors via scheduled Looker reports / Braze data; a Braze-side platform change they can't make (e.g. custom Return-Path domain) goes under "To raise internally". Follow any OWNERSHIP CONTEXT block in the user message exactly.

SPECIFICITY RULE — non-negotiable. The point of support is to RESOLVE the issue, so every recommended step must be a concrete, named action the customer can actually take for THIS case's signals. NEVER write vague filler such as "investigate the reputation of your sending IP", "address the underlying reputation", "work with your email service provider on reputation", "look into deliverability", or "improve your sending practices". If a REMEDIATION PLAYBOOK is provided in the user message, base your next steps on those exact steps (specific tools, forms, records, thresholds, and sequencing). Tell the customer precisely WHAT to do and HOW, in order of impact.

PLATFORM ACCURACY — non-negotiable. If a BRAZE PLATFORM CONTEXT block is provided in the user message, obey it exactly. Braze customer sending infrastructure is one of SparkPost, SendGrid, or Amazon SES, but the customer does not use those provider consoles directly through this dashboard — never instruct them to use SparkPost, SendGrid, Amazon SES, MTA tooling, SNDS, or JMRP directly. Attribute provider/MTA-level work (and anything Braze pre-configures, like SNDS) to "our team". Only give the customer steps they can actually perform (their DNS records, DMARC policy, list/content/cadence in Braze, and Google Postmaster Tools if Gmail is involved). Do not claim a step is done in a tool the customer cannot access.
${GEMINI_CHART_POLICY}`
        : `You write ONE specific section of an internal email-deliverability case note for a Braze support agent. Follow the user's section instructions EXACTLY and output ONLY that section's content.
HARD RULES:
- Produce ONLY what the instructions ask for. Never add a section that wasn't requested. Never append "Next Step(s)", "Recommendation(s)", a summary, or a closing line unless the instructions explicitly ask for it.
- Do NOT dump the full list of metrics or authentication results unless the instructions ask for those exact values.
- No preamble, greeting, role statement, sign-off, or restatement of the task.
- GitHub-flavoured Markdown (bold lead-ins, tight bullets; a compact table only if asked).
- Ground every statement in the data given in the user message. Never invent values. Never name or imply another customer/account except as the anonymised precedent the instructions explicitly allow.
${GEMINI_CHART_POLICY}
${historyBlock}`;

      const messages = [
        { role: 'system', content: systemPrompt },
        // With the engine running at an 8192-token KV window, the system prompt +
        // output budget still leave room for a much larger input than the old 4096
        // allowed — so feed more of the approved findings / playbook / RAG context.
        { role: 'user', content: String(prompt).slice(0, 16000) },
      ];

      // Stream from Gemini API
      let fullText = '';
      try {
        const { systemInstruction, contents } = convertMessagesToGemini(messages);
        const responseStream = await ai.models.generateContentStream({
          model: activeGeminiModel,
          contents,
          config: {
            systemInstruction: systemInstruction || undefined,
            temperature: isFinal ? 0.55 : 0.5,
            maxOutputTokens: isFinal ? 1300 : 780,
          }
        });

        for await (const chunk of responseStream) {
          const token = chunk.text;
          if (token) {
            fullText += token;
            send({ token });
          }
        }
      } catch (err: any) {
        console.error("[Gemini API] Stream error:", err);
        send({ error: cleanGeminiErrorMessage(err) });
        return res.end();
      }

      // Strip a trailing "SUGGESTIONS" block from every section; only non-final
      // sections also strip a trailing "NEXT STEPS" — the final reply needs its
      // next steps.
      const text = (isFinal
        ? fullText.replace(/\n\s*SUG\w*\s*:?[\s\S]*$/i, '')
        : fullText.replace(/\n\s*(SUG\w*|NEXT STEPS?)\s*:?[\s\S]*$/i, '')
      ).trim();
      send({ done: true, text });
      res.end();
    } catch (e: any) {
      send({ error: e.message || 'Stream failed' });
      res.end();
    }
  });

  // Suggested guide cards for an arbitrary block of text (e.g. the Workspace final
  // customer draft). The Workspace final panel uses the lean section endpoint,
  // which doesn't surface articles, so this resolves them from the finished draft's
  // own content instead of a fixed keyword matcher.
  app.post("/api/user-guide/articles", (req, res) => {
    try {
      const { text, max } = req.body || {};
      if (!text) return res.json({ articles: [] });
      const maxCards = Math.min(Math.max(parseInt(String(max ?? 4), 10) || 4, 1), 6);
      res.json({ articles: buildArticleCards(String(text), maxCards) });
    } catch {
      res.json({ articles: [] });
    }
  });

  // User Guide API: generate fresh, contextual starter prompts (no static templates)
  app.post("/api/user-guide/suggest", async (req, res) => {
    try {
      const { screen } = req.body;
      const screenText: string = typeof screen === 'string' ? screen : '';

      // ── Heuristic: does the screen actually have a specific record on it? ──
      // The serializer always includes "Currently viewing: …" + "Title: …". A real
      // record adds Issue / Root cause / Metrics / domain / contact / ticket id.
      // Without those, the model invents nonsense ("the current Dashboard status").
      const hasRealRecord = /Issue:|Root cause|Metrics on screen|Reference:|Article\/content excerpt/i.test(screenText);

      if (!hasRealRecord) {
        // Curated deliverability starters — useful, specific, never nonsensical.
        // Shuffled lightly so the user doesn't see the same 3 every time.
        const DELIVERABILITY_STARTERS = [
          "Diagnose a Gmail bounce spike?",
          "Safe IP warming ramp rate?",
          "Move from p=quarantine to p=reject?",
          "Soft bounce: reputation or content?",
          "SPF PermError causes at Gmail?",
          "Yahoo bulk-sender complaint threshold?",
          "Re-engagement cadence before suppression?",
          "DKIM pass but DMARC fails?",
          "Read Microsoft SNDS for an IP?",
          "Shared IP vs dedicated pool?",
        ];
        const shuffled = [...DELIVERABILITY_STARTERS].sort(() => Math.random() - 0.5);
        return res.json({ suggestions: shuffled.slice(0, 3) });
      }

      // A User Guide article on screen needs topical "help me understand / how do
      // I" questions about its subject — NOT ticket-style diagnostics, which made
      // the model invent meta-nonsense like "What section is active?".
      const isGuideArticle = /Currently viewing:\s*User Guide article/i.test(screenText);

      const sys = isGuideArticle
        ? `You are Gemini inside a Braze User Guide. The reader is on a documentation article. Propose 3 short questions a Braze user would ask to go deeper on THIS article's topic.

Rules:
- Each question MUST reference a SPECIFIC concept, feature, term, or linked resource that literally appears in the article text below (e.g. a product name, a course, a setting, a concept it defines). Pull real nouns from the content — do not invent.
- Never meta questions about the page, sections, navigation, or what is "visible/active/detailed". Never just echo the article title.
- Phrase as a real user need: "How do I…", "What's the best way to…", "When should I…", "What is…".
- MAX 8 words each. Output ONLY the 3 questions, one per line. No numbering, bullets, quotes or preamble.

Example for a "Get Started" article that mentions the "Braze Foundations" course, colleagues, and users/segments:
What does the Braze Foundations course cover?
How do I add my colleagues?
How do users and segments differ?`
        : `You are Gemini inside a Braze email-deliverability dashboard. Propose 3 short follow-up questions about EXACTLY what is on the screen.

Rules:
- Each question MUST reference a concrete detail from the screen (issue, error, mailbox provider, metric, root cause). Never generic.
- MAX 5 words each. Tight, action-oriented. No filler.
- Output ONLY the 3 questions, one per line. No numbering, bullets, quotes or preamble.

Example for a Gmail bounce-spike ticket:
Why did Gmail bounces spike?
Fix SPF syntax on this domain?
Is Shared IP Pool B blocked?`;
      const user = isGuideArticle
        ? `Article on screen:\n${screenText.slice(0, 2400)}\n\nWrite 3 specific questions, each referencing a concrete concept or resource named in the article above.`
        : `Screen content:\n${screenText.slice(0, 1600)}\n\nWrite 3 specific questions grounded in the details above.`;
      const raw = await callGemini([
        { role: 'system', content: sys },
        { role: 'user', content: user },
      ], 0.95, { maxTokens: 200, timeoutMs: 60_000 });
      const suggestions = raw
        .split('\n')
        .map((l: string) => l.replace(/^[-*•\d.)\s]+/, '').replace(/^["']|["']$/g, '').trim())
        .filter((l: string) => l.length > 3 && l.length < 100)
        .slice(0, 3);
      res.json({ suggestions });
    } catch (e: any) {
      res.status(500).json({ error: e.message, suggestions: [] });
    }
  });

  // Inbound HTTP POST route at /api/looker-webhook to accept JSON or CSV arrays
  app.post("/api/looker-webhook", async (req, res) => {
    try {
      const contentType = req.headers['content-type'] || '';
      let recordsCount = 0;

      console.log(`[Looker Webhook] Incoming payload. Content-Type: ${contentType}`);

      if (contentType.includes('csv') || contentType.includes('text/plain')) {
        // Stream parse chunk of CSV data
        const parser = req.pipe(csvParse({ columns: true, skip_empty_lines: true }));
        for await (const record of parser) {
          processLookerRecord(record);
          recordsCount++;
        }
      } else {
        // Handle buffered or manually parsed JSON streaming arrays
        let data = req.body;
        if (!data || Object.keys(data).length === 0 || typeof data === 'string') {
          // Fallback if raw JSON or CSV is piped as text
          let bodyStr = '';
          for await (const chunk of req) {
            bodyStr += chunk;
          }
          if (bodyStr.trim()) {
            try {
              data = JSON.parse(bodyStr);
            } catch (e) {
              const parser = csvParse(bodyStr, { columns: true, skip_empty_lines: true });
              for await (const record of parser) {
                processLookerRecord(record);
                recordsCount++;
              }
            }
          }
        }

        if (data && typeof data !== 'string') {
          const dataArray = Array.isArray(data) ? data : (data.records || [data]);
          for (const record of dataArray) {
            processLookerRecord(record);
            recordsCount++;
          }
        }
      }

      console.log(`[Looker Webhook] Processed ${recordsCount} records to active views.`);
      res.json({ success: true, recordsProcessedCount: recordsCount });
    } catch (e: any) {
      console.error("[Looker Webhook Error] Failed to process payload:", e);
      res.status(500).json({ error: e.message || "Failed to process Looker webhook" });
    }
  });

  // ── SparkPost ──────────────────────────────────────────────────────────────

  app.get("/api/sparkpost/status", async (req, res) => {
    const key = process.env.SPARKPOST_API_KEY;
    const base = process.env.SPARKPOST_BASE_URL || "https://api.sparkpost.com";
    if (!key) return res.json({ configured: false });
    try {
      const r = await fetch(`${base}/api/v1/account`, {
        headers: { Authorization: key }
      });
      if (!r.ok) return res.json({ configured: true, ok: false, status: r.status, error: await r.text() });
      const data = await r.json();
      res.json({ configured: true, ok: true, name: data.results?.company_name || data.results?.username || "SparkPost Account" });
    } catch (e: any) {
      res.json({ configured: true, ok: false, error: e.message });
    }
  });

  app.get("/api/sparkpost/metrics", async (req, res) => {
    const key = process.env.SPARKPOST_API_KEY;
    const base = process.env.SPARKPOST_BASE_URL || "https://api.sparkpost.com";
    if (!key) return res.json({ configured: false, metrics: null });
    try {
      const now = new Date();
      const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const to = now.toISOString().split("T")[0];
      const params = new URLSearchParams({
        from,
        to,
        metrics: "count_injected,count_delivered,count_bounce,count_spam_complaint,count_unique_clicked,count_unique_rendered"
      });
      const r = await fetch(`${base}/api/v1/metrics/deliverability?${params}`, {
        headers: { Authorization: key }
      });
      if (!r.ok) return res.json({ configured: true, ok: false, status: r.status, error: await r.text() });
      const data = await r.json();
      res.json({ configured: true, ok: true, metrics: data.results });
    } catch (e: any) {
      res.json({ configured: true, ok: false, error: e.message });
    }
  });

  app.get("/api/sparkpost/bounces", async (req, res) => {
    const key = process.env.SPARKPOST_API_KEY;
    const base = process.env.SPARKPOST_BASE_URL || "https://api.sparkpost.com";
    if (!key) return res.json({ configured: false, bounces: [] });
    try {
      const now = new Date();
      const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const params = new URLSearchParams({
        events: "bounce",
        from,
        per_page: "25"
      });
      const r = await fetch(`${base}/api/v1/events/message?${params}`, {
        headers: { Authorization: key }
      });
      if (!r.ok) return res.json({ configured: true, ok: false, status: r.status });
      const data = await r.json();
      res.json({ configured: true, ok: true, bounces: data.results || [] });
    } catch (e: any) {
      res.json({ configured: true, ok: false, error: e.message, bounces: [] });
    }
  });

  // ── SendGrid ───────────────────────────────────────────────────────────────

  app.get("/api/sendgrid/status", async (req, res) => {
    const key = process.env.SENDGRID_API_KEY;
    if (!key) return res.json({ configured: false });
    try {
      const r = await fetch("https://api.sendgrid.com/v3/user/profile", {
        headers: { Authorization: `Bearer ${key}` }
      });
      if (!r.ok) return res.json({ configured: true, ok: false, status: r.status, error: await r.text() });
      const data = await r.json();
      res.json({ configured: true, ok: true, name: [data.first_name, data.last_name].filter(Boolean).join(" ") || data.username || "SendGrid Account" });
    } catch (e: any) {
      res.json({ configured: true, ok: false, error: e.message });
    }
  });

  app.get("/api/sendgrid/metrics", async (req, res) => {
    const key = process.env.SENDGRID_API_KEY;
    if (!key) return res.json({ configured: false, metrics: null });
    try {
      const now = new Date();
      const end = now.toISOString().split("T")[0];
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const params = new URLSearchParams({ start_date: start, end_date: end, aggregated_by: "week" });
      const r = await fetch(`https://api.sendgrid.com/v3/stats?${params}`, {
        headers: { Authorization: `Bearer ${key}` }
      });
      if (!r.ok) return res.json({ configured: true, ok: false, status: r.status, error: await r.text() });
      const data = await r.json();
      // Aggregate across all days
      const agg = (data as any[]).reduce((acc: any, day: any) => {
        const s = day.stats?.[0]?.metrics || {};
        for (const [k, v] of Object.entries(s)) acc[k] = (acc[k] || 0) + (v as number);
        return acc;
      }, {});
      res.json({ configured: true, ok: true, metrics: agg, raw: data });
    } catch (e: any) {
      res.json({ configured: true, ok: false, error: e.message });
    }
  });

  app.get("/api/sendgrid/bounces", async (req, res) => {
    const key = process.env.SENDGRID_API_KEY;
    if (!key) return res.json({ configured: false, bounces: [] });
    try {
      const r = await fetch("https://api.sendgrid.com/v3/suppression/bounces?limit=25", {
        headers: { Authorization: `Bearer ${key}` }
      });
      if (!r.ok) return res.json({ configured: true, ok: false, status: r.status, bounces: [] });
      const data = await r.json();
      res.json({ configured: true, ok: true, bounces: Array.isArray(data) ? data : [] });
    } catch (e: any) {
      res.json({ configured: true, ok: false, error: e.message, bounces: [] });
    }
  });

  // List conversations (index from filenames + frontmatter)
  app.get('/api/conversations', (_req, res) => {
    try {
      const files = fs.readdirSync(CONV_DIR).filter(f => f.endsWith('.md'));
      const list = files.map(f => {
        const raw = fs.readFileSync(path.join(CONV_DIR, f), 'utf8');
        const fm = parseFrontmatter(raw);
        return { id: fm.id, title: fm.title, timestamp: fm.timestamp, preview: fm.preview, source: fm.source };
      }).filter(c => c.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      res.json({ conversations: list });
    } catch { res.json({ conversations: [] }); }
  });

  // Get single conversation
  app.get('/api/conversations/:id', (req, res) => {
    try {
      const file = path.join(CONV_DIR, `${req.params.id}.md`);
      if (!fs.existsSync(file)) return res.status(404).json({ error: 'Not found' });
      const raw = fs.readFileSync(file, 'utf8');
      const fm = parseFrontmatter(raw);
      const body = raw.slice(raw.indexOf('---', 3) + 3).trim();
      // Parse body back into messages array
      const messages: {role: string, content: string, chips?: any, articles?: any, actions?: any}[] = [];
      const blocks = body.split(/\n(?=\*\*(User|Gemini):\*\*)/);
      for (const block of blocks) {
        const m = block.match(/^\*\*(User|Gemini):\*\*\s*([\s\S]*)/);
        if (m) messages.push({ role: m[1] === 'User' ? 'user' : 'assistant', content: m[2].trim() });
      }
      // Restore chips metadata if present
      if (fm.chips_json) {
        try {
          const chipsArr = JSON.parse(fm.chips_json);
          messages.forEach((msg, i) => { if (chipsArr[i]) msg.chips = chipsArr[i]; });
        } catch {}
      }
      if (fm.articles_json) {
        try {
          const articlesArr = JSON.parse(fm.articles_json);
          messages.forEach((msg, i) => { if (articlesArr[i]) msg.articles = articlesArr[i]; });
        } catch {}
      }
      if (fm.actions_json) {
        try {
          const actionsArr = JSON.parse(fm.actions_json);
          messages.forEach((msg, i) => { if (actionsArr[i]) msg.actions = actionsArr[i]; });
        } catch {}
      }
      res.json({ id: fm.id, title: fm.title, timestamp: fm.timestamp, source: fm.source, messages });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // Save / upsert conversation
  app.post('/api/conversations', (req, res) => {
    try {
      const { id, title, messages, source } = req.body;
      const convId = id || randomUUID().slice(0, 8);
      const now = new Date().toISOString();
      const firstUser = messages?.find((m: any) => m.role === 'user')?.content || '';
      const convTitle = title || firstUser.slice(0, 60).replace(/\n/g, ' ') || 'Conversation';
      const preview = firstUser.slice(0, 120);
      const body = (messages || []).map((m: any) =>
        `**${m.role === 'user' ? 'User' : 'Gemini'}:** ${m.content}`
      ).join('\n\n');
      const chipsJson = JSON.stringify((messages || []).map((m: any) => m.chips ?? null));
      const articlesJson = JSON.stringify((messages || []).map((m: any) => m.articles ?? null));
      const actionsJson = JSON.stringify((messages || []).map((m: any) => m.actions ?? null));
      const md = `---\nid: ${convId}\ntitle: ${convTitle}\ntimestamp: ${now}\npreview: ${preview.replace(/\n/g, ' ')}\nsource: ${source || 'pill'}\nchips_json: ${chipsJson}\narticles_json: ${articlesJson}\nactions_json: ${actionsJson}\n---\n\n${body}`;
      fs.writeFileSync(path.join(CONV_DIR, `${convId}.md`), md, 'utf8');
      res.json({ id: convId });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // Delete conversation
  app.delete('/api/conversations/:id', (req, res) => {
    try {
      const file = path.join(CONV_DIR, `${req.params.id}.md`);
      if (fs.existsSync(file)) fs.unlinkSync(file);
      res.json({ ok: true });
    } catch { res.json({ ok: true }); }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        // Conversations are persisted as .md files inside the project root. Without
        // this, every save/delete trips Vite's file watcher and triggers a full
        // page reload — which reset the Gemini pill/panel and looked like a crash.
        watch: { ignored: ['**/conversations/**'] },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Optional browser-tab lifecycle hook. Disabled by default so the local server
  // stays available even if the browser reconnects, reloads, or the tab sleeps.
  const autoShutdownOnHeartbeatLoss = process.env.EDQ_AUTO_SHUTDOWN_ON_HEARTBEAT_LOSS === 'true';
  let tabWatchdog: ReturnType<typeof setTimeout> | null = null;
  const resetTabWatchdog = () => {
    if (!autoShutdownOnHeartbeatLoss) return;
    if (tabWatchdog) clearTimeout(tabWatchdog);
    tabWatchdog = setTimeout(() => {
      console.log('\n[server] Browser tab closed — shutting down.');
      process.exit(0);
    }, 30_000);
  };
  app.post('/api/heartbeat', (_req, res) => { resetTabWatchdog(); res.json({ ok: true, autoShutdownOnHeartbeatLoss }); });

  app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);

    // Write a server startup script that programmatically opens a secure tunnel for port 3000
    try {
      console.log(`[Tunnel] Opening programmatically integrated secure connection tunnel for port ${PORT}...`);
      const tunnel = await localtunnel({ port: PORT });
      
      tunnel.on('error', (err) => {
        console.error('[Tunnel Error] Secure connection tunnel encountered an error:', err.message || err);
      });

      console.log(`\n================================================================`);
      console.log(`[Tunnel] SECURE TUNNEL ONLINE ENTRANCE`);
      console.log(`[Tunnel] Public Webhook URL: ${tunnel.url}/api/looker-webhook`);
      console.log(`================================================================\n`);

      tunnel.on('close', () => {
        console.log('[Tunnel] Secure connection tunnel has closed.');
      });
    } catch (err: any) {
      console.error('[Tunnel Error] Failed to open localtunnel connection gracefully:', err.message || err);
    }
  });
}

startServer();
