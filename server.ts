import { registerMailProviderStatusRoute } from './server_mail_provider_status';
import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { randomUUID } from 'crypto';
import { exec, spawn } from "child_process";
import { GoogleGenAI } from "@google/genai";
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { GEMINI_BENCHMARK_POLICY } from './src/services/deliverabilityBenchmarks';

// Electron supplies these paths in packaged mode. Keeping the resource bundle
// read-only and all user-created state in userData makes the backend portable
// when it is launched from /Applications rather than the repository.
const RESOURCE_ROOT = process.env.EDQ_RESOURCE_PATH || process.cwd();
const USER_DATA_ROOT = process.env.EDQ_USER_DATA_PATH || RESOURCE_ROOT;
const ELECTRON_PACKAGED = process.env.EDQ_ELECTRON_PACKAGED === 'true';
const resourcePath = (...parts: string[]) => path.join(RESOURCE_ROOT, ...parts);

async function extractDocumentText(filename: string, base64Data: string): Promise<string> {
  const ext = path.extname(filename).toLowerCase();
  const cleanBase64 = base64Data.replace(/^data:.*;base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');
  if (ext === '.docx') return (await mammoth.extractRawText({ buffer })).value.trim();
  if (ext === '.xlsx' || ext === '.xls') {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    return workbook.SheetNames.map(name => {
      const rows = XLSX.utils.sheet_to_csv(workbook.Sheets[name]);
      return `Sheet: ${name}\n${rows}`;
    }).join('\n\n').trim();
  }
  return '';
}

type CheckMxStatus = 'critical' | 'warning' | 'info' | 'success';

function decodeCheckMxHtml(value: string) {
  return value
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseGoogleCheckMx(domain: string, html: string) {
  const statusMap: Record<string, CheckMxStatus> = {
    err: 'critical',
    warn: 'warning',
    info: 'info',
    ok: 'success',
  };
  const rowPattern = /<div class="[^"]*checkmx-result-row-(err|warn|info|ok)[^"]*">/g;
  const rows = [...html.matchAll(rowPattern)];
  const checks = rows.flatMap((row, index) => {
    const start = row.index ?? 0;
    const end = rows[index + 1]?.index ?? html.length;
    const chunk = html.slice(start, end);
    const titleMatch = chunk.match(/<div class="checkmx-test-name">([\s\S]*?)<\/div>/);
    if (!titleMatch) return [];
    const helpMatch = chunk.match(/<a href="([^"]+)"[^>]*>\s*Help center article/i);
    const detailMatch = chunk.match(/additional-info-notification">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/);
    const title = decodeCheckMxHtml(titleMatch[1]);
    return [{
      id: `google-checkmx-${index}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
      status: statusMap[row[1]],
      title,
      detail: detailMatch ? decodeCheckMxHtml(detailMatch[1]) : undefined,
      helpUrl: helpMatch ? new URL(helpMatch[1], 'https://toolbox.googleapps.com').toString() : undefined,
    }];
  });
  const pageText = decodeCheckMxHtml(html);
  const hasCritical = checks.some(check => check.status === 'critical');
  const hasWarnings = checks.some(check => check.status === 'warning');
  const mxRecords = [...html.matchAll(/class=['"]checkmx-mx-priority['"][^>]*>\s*(\d+)[\s\S]*?class=['"]checkmx-mx-name['"][^>]*>\s*([^<\s][^<]*?)\s*</g)]
    .map(match => ({ priority: Number(match[1]), host: decodeCheckMxHtml(match[2]) }))
    .filter(record => Number.isFinite(record.priority) && record.host);
  const summary = hasCritical
    ? 'There were critical problems detected with this domain. Mail flow is probably affected.'
    : hasWarnings
      ? 'There were configuration warnings detected with this domain. Review the recommendations below.'
      : 'No critical mail-flow problems were detected with this domain.';
  return { domain, summary: pageText.includes('critical problems detected') ? summary : 'Google CheckMX completed its domain checks.', checks, mxRecords, hasCritical, hasWarnings };
}

const geminiApiKey = process.env.GEMINI_API_KEY || '';
if (!geminiApiKey) {
  console.warn("Warning: GEMINI_API_KEY environment variable is not set. Gemini features will require this variable to work.");
}
const ai = new GoogleGenAI({ apiKey: geminiApiKey, httpOptions: { headers: { 'X-goog-api-key': geminiApiKey } } });

function redactDiagnostic(value: unknown) {
  return String(value ?? '')
    .replace(geminiApiKey, '[redacted]')
    .replace(/(?:AIza|AQ\.)[A-Za-z0-9._-]{20,}/g, '[redacted]');
}

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
const GEMINI_MODEL_STATE_PATH = process.env.EDQ_GEMINI_MODEL_FILE
  || path.join(USER_DATA_ROOT, 'settings', 'gemini_model');

const DEFAULT_GEMINI_MODEL = ELECTRON_PACKAGED ? 'gemini-3.1-flash-lite' : 'gemini-3.1-flash-lite';

let activeGeminiModel: string = (() => {
  try {
    const stored = fs.existsSync(GEMINI_MODEL_STATE_PATH)
      ? fs.readFileSync(GEMINI_MODEL_STATE_PATH, 'utf-8').trim()
      : !ELECTRON_PACKAGED && fs.existsSync('.gemini_model')
        ? fs.readFileSync('.gemini_model', 'utf-8').trim()
        : '';
    return GEMINI_TEXT_MODELS.some(m => m.id === stored) ? stored : DEFAULT_GEMINI_MODEL;
  } catch { return DEFAULT_GEMINI_MODEL; }
})();

const MODEL_BUDGETS = { guideChars: 80000, historyChars: 30000 };
const MODEL_INFO_PROMPT = "You are powered by Google Gemini via Cloud API. You have a massive context window; use the full depth of the provided context, RAG guide excerpts, and same-account history for highly detailed, intelligent, multi-turn diagnostics.";

// Product-level interaction contract: investigation pages are for evidence and
// validation; Workspace is the controlled place for any genuinely unavailable,
// customer-specific input. This keeps Gemini proactive without making the
// consultant repeatedly fetch information already held by the dashboard.
const INVESTIGATION_WORKSPACE_POLICY = `
INVESTIGATION VS WORKSPACE — interaction contract:
- On Overview, Authentication, Deliverability, Email Performance and Support History, act as an investigator: inspect the supplied ticket, metrics, selected panels, history and guide evidence; state observations, comparisons, contradictions and confidence. Do not interrupt the consultant with questions or tell them to manually look up/filter data that is already available in the dashboard context.
- Exhaust the available sources before saying a fact cannot be confirmed. If evidence is incomplete, distinguish clearly between supported, working and unverified conclusions; do not invent certainty.
- Ask for customer-specific input only as a last resort: it must be absent from the available sources, not safely inferable, materially affect the RCA or customer-facing wording, and be a business/customer decision rather than a retrievable technical fact.
- When an input is genuinely necessary outside Workspace, ask one concise, explainable question: name what is needed, why it matters, and which conclusion it affects. Never ask for an information-gathering task that the app can perform.
- In Workspace, treat consultant-provided context as confirmed evidence only when explicitly supplied. Preserve approved or edited wording; identify affected sections as needing review rather than silently overwriting drafts.
`;
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
  panelLabel?: string;
  toolPrefill?: 'sending_domain' | 'sending_ip';
};

function panelTargetFor(section: NonNullable<AppAction['ticketSection']>, text: string) {
  if (section === 'Email Performance') {
    if (/complaint|spam/.test(text)) return 'Recipient response over time';
    if (/click|open|engagement/.test(text)) return 'Email performance over time';
    if (/placement|inbox/.test(text)) return 'Placement summary';
    return 'Performance assessment';
  }
  if (section === 'Deliverability') {
    if (/ip pool|sending ip|reputation|shared pool/.test(text)) return 'Volume per IP pool & IP address';
    if (/defer|throttl|rate limit/.test(text)) return 'Deferrals by ISP and Reason';
    if (/bounce|block|550|421/.test(text)) return 'Bounce Class by ISP and Reason';
    return 'Event types over time';
  }
  if (section === 'Authentication') return 'Authentication Scan';
  if (section === 'Support History') return 'Support History';
  return undefined;
}

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
    add({ id: 'open-ip-warming', label: 'IP Warming Planner', description: 'Build or review the volume ramp plan.', icon: 'thermostat', view: 'tools', toolsTab: 'ip_warming', toolPrefill: 'sending_ip' });
  }
  if (/\b(google dig|dns lookup|spf|dkim|dmarc|txt record|dns record)\b/.test(text)) {
    add({ id: 'open-google-dig', label: 'Google Dig', description: 'Check DNS records for a sending domain.', icon: 'dns', view: 'tools', toolsTab: 'dig', toolPrefill: /\b(ip|pool|reputation|block|throttl)\b/.test(text) ? 'sending_ip' : 'sending_domain' });
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
  if (/\b(deliverability|bounce class|deferrals by isp|delivery funnel|hardbounces|softbounces)\b/.test(text)) {
    add({ id: 'open-ticket-deliverability', label: 'Deliverability', description: 'Review delivery, bounce, deferral, and ISP diagnostics.', icon: 'mark_email_unread', view: 'investigation', ticketSection: 'Deliverability', panelLabel: panelTargetFor('Deliverability', text) });
  }
  if (/\b(email performance|engagement|opens|clicks|open rate|click rate|unsubscribe)\b/.test(text)) {
    add({ id: 'open-ticket-email-performance', label: 'Email Performance', description: 'Review engagement and performance metrics.', icon: 'equalizer', view: 'investigation', ticketSection: 'Email Performance', panelLabel: panelTargetFor('Email Performance', text) });
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

const CONV_DIR = path.join(USER_DATA_ROOT, 'conversations');
if (!fs.existsSync(CONV_DIR)) fs.mkdirSync(CONV_DIR, { recursive: true });

// Programmatic seeding on startup
checkAndPrepopulate();

// ── Canonical case dataset (sole source of truth) ───────────────────────────
// Load the CSV server-side and parse it into CaseRecord[]. This replaces the old
// in-memory TICKETS array. The path is resolved robustly relative to this file so
// it works regardless of the process cwd.
function loadCases(): CaseRecord[] {
  const candidates = [
    resourcePath('public', 'data', 'uk_supermarket_email_deliverability_cases_final.csv'),
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
    resourcePath('public', 'data', 'uk_supermarket_email_deliverability_history_final.csv'),
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
  opens: number;
  clicks: number;
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

    const seed41 = [...ticket.case_number].reduce((sum, char) => sum + char.charCodeAt(0), 0) + 41;
    const opens = Math.max(0, Math.round((m.count_nonprefetched_unique_confirmed_opened / 30) * (0.72 + Math.abs(Math.sin((seed41 + index * 17) * 1.271)) * 0.64)));

    const seed43 = [...ticket.case_number].reduce((sum, char) => sum + char.charCodeAt(0), 0) + 43;
    const clicks = Math.max(0, Math.round((m.count_unique_clicked / 30) * (0.68 + Math.abs(Math.sin((seed43 + index * 17) * 1.271)) * 0.7)));

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
      opens,
      clicks,
    });
  }
  return rows;
}

function getScaledDailySeriesForTicket(ticket: CaseRecord): ServerTrendRow[] {
  const series = buildTrendRowsForServer(ticket);
  if (!series.length) return [];

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
  return series;
}

function getDailySeriesContext(caseNumber: string): string {
  const ticket = cases.find(c => c.case_number === caseNumber);
  if (!ticket) return '';

  const series = getScaledDailySeriesForTicket(ticket);
  if (!series.length) return '';

  const lines: string[] = [];
  lines.push("=== 30-DAY DAILY HISTORICAL METRICS ===");
  lines.push("Date | Targeted | Sent | Accepted | Accepted % | Bounces | Bounce % | Deferred | Delayed % | Opens | Open % | Clicks | Click % | Complaints | Complaint %");
  lines.push("---|---|---|---|---|---|---|---|---|---|---|---|---|---|---");
  for (const pt of series) {
    const d = new Date(pt.date);
    const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const accPct = (pt.sent > 0 ? (pt.accepted / pt.sent * 100) : 0).toFixed(1) + '%';
    const bncPct = (pt.sent > 0 ? (pt.bounce / pt.sent * 100) : 0).toFixed(1) + '%';
    const delPct = (pt.accepted > 0 ? (pt.delay / pt.accepted * 100) : 0).toFixed(1) + '%';
    const openPct = (pt.accepted > 0 ? (pt.opens / pt.accepted * 100) : 0).toFixed(1) + '%';
    const clickPct = (pt.accepted > 0 ? (pt.clicks / pt.accepted * 100) : 0).toFixed(1) + '%';
    const complaintPct = (pt.accepted > 0 ? (pt.complaints / pt.accepted * 100) : 0).toFixed(2) + '%';

    lines.push(`${dateStr} | ${pt.targeted.toLocaleString('en-GB')} | ${pt.sent.toLocaleString('en-GB')} | ${pt.accepted.toLocaleString('en-GB')} | ${accPct} | ${pt.bounce.toLocaleString('en-GB')} | ${bncPct} | ${pt.deferred.toLocaleString('en-GB')} | ${delPct} | ${pt.opens.toLocaleString('en-GB')} | ${openPct} | ${pt.clicks.toLocaleString('en-GB')} | ${clickPct} | ${pt.complaints.toLocaleString('en-GB')} | ${complaintPct}`);
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

function isGeminiQuotaError(err: any): boolean {
  const status = err?.code ?? err?.status ?? err?.error?.code;
  const message = String(err?.message || err?.error?.message || err || '').toLowerCase();
  return status === 429 || message.includes('quota') || message.includes('rate limit') || message.includes('resource_exhausted');
}

function modelUnavailablePayload(model = activeGeminiModel) {
  const label = GEMINI_TEXT_MODELS.find(item => item.id === model)?.label || model;
  return {
    error: `${label} is unavailable right now. Switch to Gemini 3.1 Flash Lite and try again.`,
    suggestedModel: 'gemini-3.1-flash-lite',
    suggestedModelLabel: 'Gemini 3.1 Flash Lite',
  };
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
    console.error("[Gemini API] callGemini failed:", redactDiagnostic(cleanGeminiErrorMessage(err)));
    const clean = cleanGeminiErrorMessage(err);
    const wrapped = new Error(isGeminiQuotaError(err) ? modelUnavailablePayload().error : clean);
    (wrapped as any).code = err?.code ?? err?.status;
    (wrapped as any).suggestedModel = isGeminiQuotaError(err) ? 'gemini-3.1-flash-lite' : undefined;
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

const EXPLICIT_CHART_RE = /\b(chart|graph|plot|visuali[sz]e|trend line|bar chart|pie chart)\b/i;
const TREND_CHART_RE = /\b(30[-\s]?day|trend|over time|time[-\s]?series|daily|day[-\s]?by[-\s]?day|trajectory|progression|spike|increase|decrease|degradation|improv(e|ement)|inflection)\b/i;
const COMPARISON_CHART_RE = /\b(compare|comparison|versus|vs\.?|breakdown|ranking|rank|top|share|distribution|composition|by provider|by domain|by isp|by campaign|by subaccount)\b/i;
const METRIC_CONTEXT_RE = /\b(metric|rate|count|accepted|delivery|delivered|deferred|delayed|bounce|block|complaint|spam|open|click|unsubscribe|inbox|sent|targeted|volume|throughput|performance)\b/i;

function chartMetricTokens(text: string): Set<string> {
  const lower = String(text || '').toLowerCase();
  const tokens = new Set<string>();
  const add = (...items: string[]) => items.forEach(item => tokens.add(item));
  if (/\b(accepted|acceptance|delivery|delivered|deliverability)\b/.test(lower)) add('accepted', 'delivery', 'delivered');
  if (/\b(bounce|bounces|bounced|block|blocked|550|421|deferral|defer|deferred|delay|delayed|throttle|throttling)\b/.test(lower)) add('bounce', 'bounces', 'block', 'blocked', 'deferred', 'delay', 'delayed');
  if (/\b(open|opens|opened|render|rendered)\b/.test(lower)) add('open', 'opens', 'opened', 'rendered');
  if (/\b(click|clicks|clicked|ctr)\b/.test(lower)) add('click', 'clicks', 'clicked');
  if (/\b(complaint|complaints|spam complaint|spam rate|spam)\b/.test(lower)) add('complaint', 'complaints', 'spam');
  if (/\b(unsubscribe|unsubscribes|unsub)\b/.test(lower)) add('unsubscribe');
  if (/\b(inbox|inbox placement|placement)\b/.test(lower)) add('inbox', 'placement');
  if (/\b(sent|send|targeted|volume|traffic|throughput)\b/.test(lower)) add('sent', 'targeted', 'volume');
  return tokens;
}

function textMentionsAnyMetric(text: string, tokens: Set<string>): boolean {
  if (!tokens.size) return true;
  const lower = String(text || '').toLowerCase();
  return Array.from(tokens).some(token => lower.includes(token));
}

type ChartSubject = 'authentication' | 'deliverability' | 'emailPerformance' | 'supportHistory' | 'workspace' | 'generic';

function chartSubjectFor(prompt = '', screenText = '', selectedPanelBlock = ''): ChartSubject {
  const focusedText = `${prompt}\n${selectedPanelBlock}`.toLowerCase();
  const fallbackText = String(screenText || '').toLowerCase();
  const weightedScore = (patterns: RegExp[]) => {
    const focused = patterns.reduce((sum, pattern) => sum + (pattern.test(focusedText) ? 3 : 0), 0);
    const fallback = patterns.reduce((sum, pattern) => sum + (pattern.test(fallbackText) ? 1 : 0), 0);
    return focused + fallback;
  };
  const scores: Record<ChartSubject, number> = {
    authentication: weightedScore([/\b(authentication|spf|dkim|dmarc|dns|return-path|rdns)\b/]),
    emailPerformance: weightedScore([/\b(email performance|engagement|open rate|opens|click|clicked|spam complaint|unsubscribe|inbox placement)\b/]),
    deliverability: weightedScore([/\b(deliverability|bounce|bounces|defer|deferred|delayed|accepted|delivery rate|mailbox provider|sender reputation|blocked)\b/]),
    supportHistory: weightedScore([/\b(support history|past cases|precedent|case thread)\b/]),
    workspace: weightedScore([/\b(final ticket response|recommended actions|next steps|handoff)\b/]),
    generic: 0,
  };
  const ordered: ChartSubject[] = ['emailPerformance', 'deliverability', 'authentication', 'supportHistory', 'workspace'];
  return ordered.reduce<ChartSubject>((best, subject) => {
    if (scores[subject] > scores[best]) return subject;
    return best;
  }, 'generic');
}

function chartMetricTokensForContext(prompt: string, screenText = '', selectedPanelBlock = ''): Set<string> {
  const subject = chartSubjectFor(prompt, screenText, selectedPanelBlock);
  const fromPrompt = chartMetricTokens(prompt);
  const tokens = new Set<string>();
  const add = (...items: string[]) => items.forEach(item => tokens.add(item));

  if (subject === 'authentication') return tokens;
  if (subject === 'emailPerformance') {
    add('open', 'opens', 'opened', 'rendered', 'click', 'clicks', 'clicked', 'complaint', 'complaints', 'spam', 'unsubscribe', 'inbox', 'placement');
    if (fromPrompt.size) return new Set(Array.from(tokens).filter(token => fromPrompt.has(token) || !/\b(bounce|deferred|accepted|delivery|sent|targeted|volume)\b/.test(token)));
    return tokens;
  }
  if (subject === 'deliverability') {
    add('accepted', 'delivery', 'delivered', 'bounce', 'bounces', 'block', 'blocked', 'deferred', 'delay', 'delayed', 'sent', 'targeted', 'volume', 'complaint', 'complaints', 'spam');
    return tokens;
  }
  if (fromPrompt.size) return fromPrompt;
  return chartMetricTokens(`${screenText}\n${selectedPanelBlock}`);
}

function chartMetricAllowedForSubject(chartMetricText: string, prompt: string, screenText = '', selectedPanelBlock = ''): boolean {
  const subject = chartSubjectFor(prompt, screenText, selectedPanelBlock);
  const lower = chartMetricText.toLowerCase();
  if (subject === 'authentication' || subject === 'supportHistory' || subject === 'workspace') return false;
  if (subject === 'emailPerformance') {
    return /\b(open|opened|render|rendered|click|clicked|complaint|spam|unsubscribe|inbox|placement|engagement)\b/.test(lower)
      && !/\b(bounce|bounces|defer|deferred|delay|delayed|accepted|delivery|delivered|sent|targeted)\b/.test(lower);
  }
  return true;
}

function isNonChartWorkspacePanelPrompt(prompt = ''): boolean {
  return /\b(Restate the customer's reported issue|Determine the single most likely ROOT CAUSE|Evaluate authentication for THIS case|Issue context for matching|Produce the internal action plan|Write the final deliverability HANDOFF NOTE)\b/i.test(prompt);
}

type ExistingChartOption = {
  id: string;
  label: string;
  description: string;
  metricKeys: string[];
  config: any;
};

function sampledDailyRows(ticket: CaseRecord) {
  const series = getScaledDailySeriesForTicket(ticket);
  const stride = Math.max(1, Math.floor(series.length / 10));
  return series
    .filter((_, index) => index % stride === 0 || index === series.length - 1)
    .slice(-12)
    .map(pt => {
      const d = new Date(pt.date);
      const day = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      return {
        day,
        accepted: pt.accepted,
        sent: pt.sent,
        targeted: pt.targeted,
        bounces: pt.bounce,
        deferred: pt.deferred,
        opens: pt.opens,
        clicks: pt.clicks,
        complaints: pt.complaints,
        accepted_rate: pt.sent > 0 ? Number(((pt.accepted / pt.sent) * 100).toFixed(1)) : 0,
        bounce_rate: pt.sent > 0 ? Number(((pt.bounce / pt.sent) * 100).toFixed(1)) : 0,
        delayed_rate: pt.accepted > 0 ? Number(((pt.delay / pt.accepted) * 100).toFixed(1)) : 0,
        open_rate: pt.accepted > 0 ? Number(((pt.opens / pt.accepted) * 100).toFixed(1)) : 0,
        click_rate: pt.accepted > 0 ? Number(((pt.clicks / pt.accepted) * 100).toFixed(1)) : 0,
        complaint_rate: pt.accepted > 0 ? Number(((pt.complaints / pt.accepted) * 100).toFixed(2)) : 0,
      };
    });
}

function longSeries(rows: Record<string, any>[], metrics: Array<{ key: string; label: string }>) {
  return rows.flatMap(row => metrics.map(metric => ({
    x: row.day,
    series: metric.label,
    value: Number(row[metric.key] ?? 0),
  })));
}

function existingDashboardChartOptions(ticketRef: any, prompt: string, answer = '', screenText = '', selectedPanelBlock = ''): ExistingChartOption[] {
  const ticket = ticketRef?.id ? cases.find(c => c.case_number === ticketRef.id) : null;
  if (!ticket) return [];
  const rows = sampledDailyRows(ticket);
  if (!rows.length) return [];
  const subject = chartSubjectFor(prompt, screenText, selectedPanelBlock);
  if (subject === 'authentication' || subject === 'supportHistory' || subject === 'workspace') return [];

  const metricDefinitions = [
    { id: 'accepted-rate', key: 'accepted_rate', label: 'Accepted rate', series: 'Accepted %', family: 'deliverability', aliases: /\b(accepted|acceptance|delivery rate|delivered)\b/i },
    { id: 'bounce-rate', key: 'bounce_rate', label: 'Bounce rate', series: 'Bounce %', family: 'deliverability', aliases: /\b(bounce|bounces|bounced|block|blocked|550|421)\b/i },
    { id: 'delayed-rate', key: 'delayed_rate', label: 'Delayed rate', series: 'Delayed %', family: 'deliverability', aliases: /\b(delay|delayed|defer|deferred|deferral|throttle|throttling)\b/i },
    { id: 'sent-volume', key: 'sent', label: 'Sent volume', series: 'Sent', family: 'deliverability', aliases: /\b(sent|send volume|traffic|throughput|volume)\b/i },
    { id: 'accepted-volume', key: 'accepted', label: 'Accepted volume', series: 'Accepted', family: 'deliverability', aliases: /\b(accepted volume|delivered volume)\b/i },
    { id: 'deferred-volume', key: 'deferred', label: 'Deferred volume', series: 'Deferred', family: 'deliverability', aliases: /\b(deferred volume|deferral count|deferred count)\b/i },
    { id: 'open-rate', key: 'open_rate', label: 'Open rate', series: 'Open %', family: 'emailPerformance', aliases: /\b(open rate|opens|opened|engagement)\b/i },
    { id: 'click-rate', key: 'click_rate', label: 'Click rate', series: 'Click %', family: 'emailPerformance', aliases: /\b(click rate|clicks|clicked|ctr)\b/i },
    { id: 'complaint-rate', key: 'complaint_rate', label: 'Complaint rate', series: 'Complaint %', family: 'emailPerformance', aliases: /\b(complaint rate|complaints|spam rate|spam complaint)\b/i },
    { id: 'open-volume', key: 'opens', label: 'Open volume', series: 'Opens', family: 'emailPerformance', aliases: /\b(open volume|open count)\b/i },
    { id: 'click-volume', key: 'clicks', label: 'Click volume', series: 'Clicks', family: 'emailPerformance', aliases: /\b(click volume|click count)\b/i },
    { id: 'complaint-volume', key: 'complaints', label: 'Complaint volume', series: 'Complaints', family: 'emailPerformance', aliases: /\b(complaint volume|complaint count)\b/i },
  ] as const;
  const focusedText = `${prompt}\n${answer}`;
  const familyDefinitions = metricDefinitions.filter(metric => subject === 'generic' || metric.family === subject);
  const explicitlyRelevant = familyDefinitions.filter(metric => metric.aliases.test(focusedText));
  const definitions = explicitlyRelevant.length ? explicitlyRelevant : familyDefinitions;

  return definitions.map(metric => ({
    id: `existing-${metric.id}-trend`,
    label: `${metric.label} trend`,
    description: `Existing dashboard daily ${metric.label.toLowerCase()} series. Contains only ${metric.series}; use only when that metric is central to the request.`,
    metricKeys: [metric.id],
    config: {
      type: 'chart',
      allowChart: true,
      chartType: metric.key.endsWith('_rate') ? 'line' : 'area',
      title: `${metric.label} trend`,
      xField: 'x',
      yField: 'value',
      seriesField: 'series',
      data: longSeries(rows, [{ key: metric.key, label: metric.series }]),
    },
  }));
}

function shouldAttemptChart(prompt: string, answer: string, selectedPanelBlock = '', screenText = ''): boolean {
  const text = `${prompt}\n${answer}`;
  const promptExplicitlyRequestsChart = EXPLICIT_CHART_RE.test(prompt);
  if (isNonChartWorkspacePanelPrompt(prompt) && !promptExplicitlyRequestsChart) return false;
  const subject = chartSubjectFor(prompt, screenText, selectedPanelBlock);
  if ((subject === 'authentication' || subject === 'supportHistory' || subject === 'workspace') && !promptExplicitlyRequestsChart) return false;
  if (promptExplicitlyRequestsChart) return true;
  if (!METRIC_CONTEXT_RE.test(text)) return false;
  if (TREND_CHART_RE.test(text) || COMPARISON_CHART_RE.test(text)) return true;
  if (extractMarkdownTableLabels(answer).length >= 2) return true;
  return false;
}

function shouldIncludeDailyChartContext(prompt: string, answer: string, screenText = '', selectedPanelBlock = ''): boolean {
  const subject = chartSubjectFor(prompt, screenText, selectedPanelBlock);
  if (subject === 'authentication' || subject === 'supportHistory' || subject === 'workspace') return false;
  const text = `${prompt}\n${answer}`;
  return EXPLICIT_CHART_RE.test(text) || TREND_CHART_RE.test(text);
}

function normalizeGeminiChartDecision(decision: any, sourceAnswer = '', prompt = '', screenText = '', selectedPanelBlock = ''): any | null {
  const chart = decision?.chart;
  if (!decision?.shouldChart || !chart || typeof chart !== 'object') return null;
  let chartType = ['line', 'area', 'bar', 'pie'].includes(chart.chartType) ? chart.chartType : 'bar';
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
  const isTimeSeries = chartType === 'line' || chartType === 'area' || xFieldLooksTemporal;
  const chartMetricText = [
    chart.title,
    chart.yField,
    chart.seriesField,
    ...data.flatMap((row: any) => Object.keys(row || {})),
  ].filter(Boolean).join(' ');
  if (!chartMetricAllowedForSubject(chartMetricText, prompt, screenText, selectedPanelBlock)) return null;
  const metricTokens = chartMetricTokensForContext(prompt, screenText, selectedPanelBlock);
  if (!textMentionsAnyMetric(chartMetricText, metricTokens)) return null;

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
  if (!shouldAttemptChart(prompt, answer, selectedPanelBlock, screenText)) return answer;
  try {
    const existingChartOptions = existingDashboardChartOptions(ticketRef, prompt, answer, screenText, selectedPanelBlock);
    const existingChartMenu = existingChartOptions.length
      ? existingChartOptions.map(option => `- ${option.id}: ${option.label} — ${option.description}`).join('\n')
      : '(none available for this context)';
    const dailyHistoryBlock = ticketRef?.id && shouldIncludeDailyChartContext(prompt, answer, screenText, selectedPanelBlock) ? getDailySeriesContext(ticketRef.id) : '';
    const raw = await callGemini([
      {
        role: 'system',
        content: `You are a visualization decision API for a Braze deliverability dashboard. Decide whether the finished assistant answer should include a chart.

Return ONLY valid JSON with this exact shape:
{
  "shouldChart": boolean,
  "reason": "short reason",
  "existingChartId": null | "one of the provided existing chart ids",
  "chart": null | {
    "type": "chart",
    "allowChart": true,
    "chartType": "line" | "area" | "bar" | "pie",
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
- Prefer an existing dashboard chart whenever one fits. If an existing chart fits, set "existingChartId" to that id and set "chart": null. The application will render the existing Deliverability or Email Performance chart data and styling.
- Use custom "chart" JSON only when no existing chart fits but a visualization is still clearly useful.
- You decide the best chart type and metric(s). Prefer:
  - "line" for precise over-time trends, rate changes, spikes, degradation, or recovery.
  - "area" for volume over time where magnitude/throughput matters.
  - "bar" for ranking, provider/domain/campaign/subaccount comparison, or side-by-side metric comparison.
  - "pie" only for composition/share of a small number of categories.
- Use the metric(s) most relevant to the prompt and answer. Available deliverability metrics include targeted, sent, accepted, accepted %, bounces, bounce %, deferred, delayed %, opens, open %, clicks, click %, complaints, complaint %, inbox placement, unsubscribes, and any visible pinned metric. Do not default to bounces unless bounce/blocking is the actual subject.
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

EXISTING DASHBOARD CHART OPTIONS:
${existingChartMenu}

GUIDE SOURCES:
${sources.slice(0, 5).join('\n')}

HAS_TICKET_REF: ${Boolean(ticketRef?.id)}`
      },
    ], 0.1, { maxTokens: 1500, timeoutMs: 60_000 });
    const decision = extractJsonObject(raw);
    const selectedExistingChart = decision?.shouldChart && decision?.existingChartId
      ? existingChartOptions.find(option => option.id === decision.existingChartId)
      : null;
    if (selectedExistingChart) {
      return `${answer}\n\n\`\`\`json\n${JSON.stringify(selectedExistingChart.config, null, 2)}\n\`\`\``;
    }
    const chart = normalizeGeminiChartDecision(decision, answer, prompt, screenText, selectedPanelBlock);
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
    const fullPath = resourcePath("braze_user_guide_md", "docs", "User Guide", cleanPath);
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
  const baseDir = resourcePath("braze_user_guide_md");
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

const ARTICLE_INTENT_STOP_TERMS = new Set(['about', 'article', 'braze', 'can', 'create', 'do', 'first', 'for', 'guide', 'help', 'how', 'i', 'my', 'set', 'the', 'this', 'to', 'up', 'use', 'user', 'what', 'when', 'where', 'with', 'you', 'your']);

function selectSuggestedArticlePaths(prompt: string, sources: string[], maxCards: number, activeGuidePath?: string): string[] {
  const terms = (String(prompt).toLowerCase().match(/[a-z0-9_]+/g) || [])
    .filter(term => term.length > 2 && !ARTICLE_INTENT_STOP_TERMS.has(term));
  if (!terms.length) return [];
  const ranked = sources
    .filter(path => path !== activeGuidePath)
    .map((path, index) => {
      const searchable = path.replace(/^docs\/User Guide\//i, '').replace(/[_/.-]+/g, ' ').toLowerCase();
      const matches = terms.filter(term => searchable.includes(term)).length;
      return { path, matches, index };
    })
    .filter(item => item.matches > 0)
    .sort((a, b) => b.matches - a.matches || a.index - b.index);
  return [...new Set(ranked.map(item => item.path))].slice(0, maxCards);
}

// Turn a guide path into a display card { path, title, section }.
const GUIDE_LABEL_ACRONYMS: Record<string, string> = {
  api: 'API',
  apis: 'APIs',
  dkim: 'DKIM',
  dmarc: 'DMARC',
  dns: 'DNS',
  faq: 'FAQ',
  id: 'ID',
  ids: 'IDs',
  ip: 'IP',
  ips: 'IPs',
  qa: 'QA',
  sdk: 'SDK',
  sdks: 'SDKs',
  sms: 'SMS',
  spf: 'SPF',
  sql: 'SQL',
  sso: 'SSO',
  saml: 'SAML',
};

function formatGuideLabel(label: string): string {
  const clean = label.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
  const lower = clean.toLowerCase();
  if (GUIDE_LABEL_ACRONYMS[lower]) return GUIDE_LABEL_ACRONYMS[lower];
  return clean.replace(/\b[\w']+\b/g, word => GUIDE_LABEL_ACRONYMS[word.toLowerCase()] ?? (word.charAt(0).toUpperCase() + word.slice(1)));
}

function guidePathToCard(p: string): { path: string; title: string; section: string } {
  const base = path.basename(p).replace(/\.md$/i, '');
  const titleRaw = /^index$/i.test(base) ? path.basename(path.dirname(p)) : base;
  const title = formatGuideLabel(titleRaw);
  const parts = p.replace(/^docs\/User Guide\//, '').split('/');
  const section = parts.length > 1 ? formatGuideLabel(parts[parts.length - 2]) : 'User Guide';
  return { path: p, title, section };
}

// Evidence is assembled from the request we actually grounded on, rather than
// asking the model to self-report citations. This keeps the UI fast and avoids
// fabricated provenance.
type AnswerEvidence = {
  kind: 'live' | 'selected' | 'guide' | 'history' | 'best_practice';
  label: string;
  detail?: string;
  path?: string;
};

function buildAnswerEvidence(args: {
  ticketRef?: any;
  screenText: string;
  selectedPanelBlock?: string;
  sources: string[];
  sameAccountCount?: number;
  usedSourceKeys?: Set<string>;
}): AnswerEvidence[] {
  const { ticketRef, screenText, selectedPanelBlock = '', sources, sameAccountCount = 0, usedSourceKeys = new Set() } = args;
  const evidence: AnswerEvidence[] = [];
  if (usedSourceKeys.has('screen') && (ticketRef?.id || /Currently viewing:\s*Support ticket/i.test(screenText))) {
    evidence.push({ kind: 'live', label: 'Current ticket', detail: ticketRef?.id ? `Case ${ticketRef.id}` : 'Live dashboard context' });
  } else if (usedSourceKeys.has('screen') && screenText.trim()) {
    evidence.push({ kind: 'live', label: 'Current screen context' });
  }
  const activeGuidePath = screenText.match(/^Active guide path:\s*(.+)$/mi)?.[1]?.trim();
  if (activeGuidePath && usedSourceKeys.has(`guide:${activeGuidePath}`)) {
    const card = guidePathToCard(activeGuidePath);
    evidence.push({ kind: 'guide', label: card.title, detail: 'Article currently open', path: activeGuidePath });
  }
  const panels = (selectedPanelBlock.match(/^===\s*PANEL\s+\d+:\s*([^\[\n]+)/gim) || [])
    .map(line => line.replace(/^===\s*PANEL\s+\d+:\s*/i, '').trim());
  panels.forEach((label, index) => {
    if (usedSourceKeys.has(`panel:${index + 1}`)) evidence.push({ kind: 'selected', label });
  });
  const seenPaths = new Set<string>(activeGuidePath ? [activeGuidePath] : []);
  for (const source of sources) {
    if (seenPaths.has(source) || !usedSourceKeys.has(`guide:${source}`)) continue;
    seenPaths.add(source);
    const card = guidePathToCard(source);
    evidence.push({ kind: 'guide', label: card.title, detail: card.section, path: source });
    if (evidence.filter(item => item.kind === 'guide').length >= 3) break;
  }
  if (sameAccountCount > 0 && usedSourceKeys.has('history')) evidence.push({ kind: 'history', label: 'Same-account history' });
  // The best-practice layer applies to deliverability diagnosis, not to a
  // question about how to use the documentation viewer itself.
  if (usedSourceKeys.has('best_practice') && !activeGuidePath && !/Currently viewing:\s*User Guide/i.test(screenText)) {
    evidence.push({ kind: 'best_practice', label: 'Deliverability best practice' });
  }
  return evidence;
}

function buildSourceAttestationInstruction(screenText: string, selectedPanelBlock: string, sources: string[], sameAccountCount: number): string {
  const keys = ['screen'];
  const panels = (selectedPanelBlock.match(/^===\s*PANEL\s+\d+:/gim) || []);
  panels.forEach((_panel, index) => keys.push(`panel:${index + 1}`));
  if (sameAccountCount > 0) keys.push('history');
  if (!/Currently viewing:\s*User Guide/i.test(screenText)) keys.push('best_practice');
  const activeGuidePath = screenText.match(/^Active guide path:\s*(.+)$/mi)?.[1]?.trim();
  if (activeGuidePath) keys.push(`guide:${activeGuidePath}`);
  sources.forEach(source => keys.push(`guide:${source}`));
  return `SOURCE ATTESTATION — after the Markdown answer, append exactly one hidden HTML comment: <!-- EDQ_SOURCES: comma-separated keys -->. Include ONLY keys that materially shaped the final answer, not inputs merely considered. Available keys: ${[...new Set(keys)].join(', ')}. If no supplied evidence materially shaped the answer, use <!-- EDQ_SOURCES: -->.`;
}

function extractSourceAttestation(text: string): { text: string; usedSourceKeys: Set<string> } {
  const match = text.match(/<!--\s*EDQ_SOURCES\s*:\s*([\s\S]*?)-->/i);
  const usedSourceKeys = new Set((match?.[1] || '').split(',').map(key => key.trim()).filter(Boolean));
  return { text: text.replace(/\s*<!--\s*EDQ_SOURCES\s*:[\s\S]*?-->\s*/i, '\n').trim(), usedSourceKeys };
}

// Broad UI-help questions such as "How do I navigate the User Guide?" should be
// grounded in the live app map, not padded with unrelated documentation that
// happens to contain generic terms like "user" or "guide".
function shouldRetrieveGuideEvidence(prompt: string, screenText: string): boolean {
  const question = String(prompt || '').toLowerCase();
  const isGuideUiQuestion = /\b(how (do|can) i|where (do|can) i|navigate|use|find|browse)\b/.test(question)
    && /\b(user guide|guide)\b/.test(question)
    && (!/article\/content excerpt:/i.test(screenText) || /\b(this article|this user guide article)\b/.test(question));
  return !isGuideUiQuestion;
}

function isQuestionAboutActiveGuide(prompt: string): boolean {
  const question = String(prompt || '').toLowerCase();
  return /\b(this|current|open)\s+(article|page|guide)\b/.test(question)
    || /\b(summarize|summarise|explain|key concepts|key takeaways|walk me through)\b/.test(question) && /\b(article|page|guide|this)\b/.test(question);
}

// When the question explicitly refers to the open article, it is the source the
// agent is actually reading. For a new topic, normal focused retrieval still runs.
function getActiveGuideRagContext(screenText: string): { context: string; sources: string[] } | null {
  const guidePath = screenText.match(/^Active guide path:\s*(.+)$/mi)?.[1]?.trim();
  if (!guidePath) return null;
  const cleanPath = guidePath.replace(/^docs\/User Guide\//, '');
  const fullPath = resourcePath('braze_user_guide_md', 'docs', 'User Guide', cleanPath);
  if (!fs.existsSync(fullPath)) return null;
  const content = fs.readFileSync(fullPath, 'utf-8');
  return { context: `SOURCE FILE PATH: ${guidePath}\n---\n${content}\n---`, sources: [guidePath] };
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

type DnsRecordType = 'A' | 'AAAA' | 'CAA' | 'CNAME' | 'DNSKEY' | 'DS' | 'HTTPS' | 'MX' | 'NS' | 'PTR' | 'SOA' | 'SRV' | 'SVCB' | 'TLSA' | 'TSIG' | 'TXT';
type AuthFindingStatus = 'healthy' | 'warning' | 'error' | 'unknown';

const DNS_RECORD_TYPES = new Set<DnsRecordType>(['A', 'AAAA', 'CAA', 'CNAME', 'DNSKEY', 'DS', 'HTTPS', 'MX', 'NS', 'PTR', 'SOA', 'SRV', 'SVCB', 'TLSA', 'TSIG', 'TXT']);
const DNS_STATUS_TEXT: Record<number, string> = {
  0: 'NOERROR',
  1: 'FORMERR',
  2: 'SERVFAIL',
  3: 'NXDOMAIN',
  4: 'NOTIMP',
  5: 'REFUSED',
};
const dnsCache = new Map<string, { expiresAt: number; lookup: any }>();
type Availability = 'unknown' | 'available' | 'missing_key' | 'invalid_key' | 'quota' | 'model_unavailable' | 'offline' | 'timeout' | 'unavailable';
const runtimeHealth: { gemini: Availability; dns: Availability; checkedAt: string | null } = {
  gemini: geminiApiKey ? 'unknown' : 'missing_key',
  dns: 'unknown',
  checkedAt: null,
};

function normalizeDnsName(input: string): string {
  let name = String(input || '').trim();
  try {
    if (name.startsWith('http://') || name.startsWith('https://')) name = new URL(name).hostname;
    else if (name.includes('/')) name = name.split('/')[0];
  } catch {}
  return name.replace(/\.$/, '').toLowerCase();
}

function normalizeDnsType(input: string): DnsRecordType {
  const type = String(input || '').trim().toUpperCase() as DnsRecordType;
  return DNS_RECORD_TYPES.has(type) ? type : 'A';
}

function isIpv4(value: string): boolean {
  const parts = value.split('.');
  return parts.length === 4 && parts.every(part => /^\d{1,3}$/.test(part) && Number(part) >= 0 && Number(part) <= 255);
}

function ptrNameForIp(value: string): string {
  const ip = value.trim();
  if (isIpv4(ip)) return `${ip.split('.').reverse().join('.')}.in-addr.arpa`;
  return ip;
}

function cleanTxt(value: string): string {
  return String(value || '').replace(/^"|"$/g, '').replace(/"\s+"/g, '');
}

function answerText(answer: any): string {
  return cleanTxt(String(answer?.data || ''));
}

function statusFromRecord(records: any[], matcher: (text: string) => boolean): AuthFindingStatus {
  if (!records.length) return 'error';
  return records.some(record => matcher(answerText(record))) ? 'healthy' : 'warning';
}

async function resolveGoogleDnsInternal(rawName: string, rawType: string, options: { force?: boolean } = {}) {
  const normalizedName = normalizeDnsName(rawName);
  const queryType = normalizeDnsType(rawType);
  if (!normalizedName || normalizedName.length > 253 || /[^a-z0-9._:-]/i.test(normalizedName)) {
    throw new Error('Invalid DNS name');
  }
  const queryName = queryType === 'PTR' && isIpv4(normalizedName) ? ptrNameForIp(normalizedName) : normalizedName;
  const cacheKey = `${queryName}|${queryType}`;
  const cached = dnsCache.get(cacheKey);
  if (!options.force && cached && cached.expiresAt > Date.now()) {
    return { ...cached.lookup, source: 'cached' as const };
  }
  const url = `https://dns.google/resolve?name=${encodeURIComponent(queryName)}&type=${encodeURIComponent(queryType)}`;
  const response = await fetch(url);
  if (!response.ok) {
    const retryAfter = response.headers.get('retry-after');
    throw new Error(`Google Public DNS HTTP ${response.status}${retryAfter ? `; retry after ${retryAfter}s` : ''}`);
  }
  const raw = await response.json();
  const answers = Array.isArray(raw.Answer) ? raw.Answer : [];
  const authority = Array.isArray(raw.Authority) ? raw.Authority : [];
  const additional = Array.isArray(raw.Additional) ? raw.Additional : [];
  const ttls = [...answers, ...authority, ...additional].map((item: any) => Number(item.TTL)).filter((n: number) => Number.isFinite(n) && n > 0);
  const ttlMs = Math.min(Math.min(...(ttls.length ? ttls : [60])) * 1000, 10 * 60 * 1000);
  const lookup = {
    queryName,
    queryType,
    normalizedName,
    resolver: 'Google Public DNS',
    status: typeof raw.Status === 'number' ? raw.Status : null,
    statusText: typeof raw.Status === 'number' ? (DNS_STATUS_TEXT[raw.Status] || `DNS status ${raw.Status}`) : 'Unknown',
    source: 'live',
    checkedAt: new Date().toISOString(),
    answers,
    authority,
    additional,
    cnameChain: answers.filter((item: any) => item.type === 5).map((item: any) => answerText(item)),
    raw,
  };
  dnsCache.set(cacheKey, { expiresAt: Date.now() + ttlMs, lookup });
  return lookup;
}

function classifyGeminiAvailability(error: unknown): Availability {
  const message = redactDiagnostic(cleanGeminiErrorMessage(error)).toLowerCase();
  if (/quota|429|rate limit|resource exhausted/.test(message)) return 'quota';
  if (/model.*(?:not found|unavailable)|not supported/.test(message)) return 'model_unavailable';
  if (/invalid.*key|api key|unauthenticated|permission denied|403|401/.test(message)) return 'invalid_key';
  if (/timeout|timed out|abort/.test(message)) return 'timeout';
  if (/network|fetch|enotfound|econn|offline/.test(message)) return 'offline';
  return 'unavailable';
}

async function refreshRuntimeHealth() {
  try {
    await resolveGoogleDnsInternal('example.com', 'TXT', { force: true });
    runtimeHealth.dns = 'available';
  } catch {
    runtimeHealth.dns = 'offline';
  }

  if (!geminiApiKey) {
    runtimeHealth.gemini = 'missing_key';
  } else {
    try {
      await callGemini([{ role: 'user', content: 'Reply with OK.' }], 0, { maxTokens: 4, timeoutMs: 8_000 });
      runtimeHealth.gemini = 'available';
    } catch (error) {
      runtimeHealth.gemini = classifyGeminiAvailability(error);
    }
  }
  runtimeHealth.checkedAt = new Date().toISOString();
}

function uniq(values: Array<string | undefined | null>): string[] {
  return [...new Set(values.map(value => normalizeDnsName(String(value || ''))).filter(Boolean))];
}

function scanIdentitiesFromTicket(ticket: any) {
  // Authentication is about the company's configured sender identities.
  // `ticket.domains` contains recipient mailbox providers in this dataset
  // (gmail.com, outlook.com, etc.), so never scan it as account DNS.
  const domains = uniq(Array.isArray(ticket?.sending_domains) ? ticket.sending_domains : []);
  const visibleFromDomain = domains[0] || normalizeDnsName(ticket?.from_domain || '');
  const ips = [...new Set([...(Array.isArray(ticket?.sending_ips) ? ticket.sending_ips : [])].filter(Boolean))];
  return {
    visibleFromDomain,
    identities: [
      ...domains.map((domain, index) => ({ id: `domain-${domain}`, value: domain, role: index === 0 ? 'Visible From / Sending domain' : 'Account sending domain', kind: 'domain', checked: true })),
      ...ips.map(ip => ({ id: `ip-${ip}`, value: ip, role: 'Sending IP', kind: 'ip', checked: true })),
    ],
  };
}

async function runAuthenticationScan(ticket: any, options: { force?: boolean } = {}) {
  const { identities, visibleFromDomain } = scanIdentitiesFromTicket(ticket);
  const domains = identities.filter((item: any) => item.kind === 'domain').map((item: any) => item.value);
  const ips = identities.filter((item: any) => item.kind === 'ip').map((item: any) => item.value);
  const lookupRequests: Array<{ name: string; type: DnsRecordType }> = [];

  for (const domain of domains) {
    lookupRequests.push({ name: domain, type: 'TXT' }, { name: `_dmarc.${domain}`, type: 'TXT' }, { name: domain, type: 'MX' }, { name: domain, type: 'A' }, { name: domain, type: 'AAAA' });
  }
  for (const ip of ips) lookupRequests.push({ name: ptrNameForIp(ip), type: 'PTR' });

  const deduped = [...new Map(lookupRequests.map(item => [`${normalizeDnsName(item.name)}|${item.type}`, item])).values()];
  const lookups = await Promise.all(deduped.map(async item => {
    try {
      return await resolveGoogleDnsInternal(item.name, item.type, options);
    } catch (error: any) {
      return {
        queryName: normalizeDnsName(item.name),
        queryType: item.type,
        normalizedName: normalizeDnsName(item.name),
        resolver: 'Google Public DNS',
        status: null,
        statusText: 'HTTP/API error',
        source: 'live',
        checkedAt: new Date().toISOString(),
        answers: [],
        authority: [],
        additional: [],
        cnameChain: [],
        raw: null,
        error: error?.message || 'Lookup failed',
      };
    }
  }));
  const findLookup = (name: string, type: DnsRecordType) => lookups.find(item => item.queryName === normalizeDnsName(name) && item.queryType === type);
  const findings: any[] = [];

  for (const domain of domains) {
    const spf = findLookup(domain, 'TXT');
    const spfRecords = (spf?.answers || []).filter((answer: any) => /^v=spf1\b/i.test(answerText(answer)));
    findings.push({
      id: `spf-${domain}`,
      category: 'SPF',
      title: 'SPF configuration',
      subject: domain,
      status: statusFromRecord(spfRecords, text => /^v=spf1\b/i.test(text)),
      summary: spfRecords.length === 1 ? 'SPF TXT record found; DNS configuration can be inspected, but this is not message-level SPF pass.' : spfRecords.length > 1 ? 'Multiple SPF records found; receivers may treat this as invalid.' : 'No SPF TXT record found.',
      evidence: [`Query: TXT ${domain}`, `DNS status: ${spf?.statusText || 'not checked'}`, spfRecords[0] ? `Record: ${answerText(spfRecords[0])}` : 'Record: none'],
      lookupIds: [domain],
    });

    const dmarcName = `_dmarc.${domain}`;
    const dmarc = findLookup(dmarcName, 'TXT');
    const dmarcRecords = (dmarc?.answers || []).filter((answer: any) => /^v=DMARC1\b/i.test(answerText(answer)));
    const dmarcText = dmarcRecords[0] ? answerText(dmarcRecords[0]) : '';
    findings.push({
      id: `dmarc-${domain}`,
      category: 'DMARC',
      title: 'DMARC policy',
      subject: dmarcName,
      status: dmarcRecords.length === 1 ? 'healthy' : dmarcRecords.length > 1 ? 'warning' : 'error',
      summary: dmarcText ? `Policy published (${dmarcText.match(/\bp=([^;\s]+)/i)?.[1] || 'policy value not parsed'}).` : 'No DMARC TXT policy found.',
      evidence: [`Query: TXT ${dmarcName}`, `DNS status: ${dmarc?.statusText || 'not checked'}`, dmarcText ? `Record: ${dmarcText}` : 'Record: none'],
      lookupIds: [dmarcName],
    });

    const mx = findLookup(domain, 'MX');
    const a = findLookup(domain, 'A');
    const aaaa = findLookup(domain, 'AAAA');
    findings.push({
      id: `return-path-${domain}`,
      category: 'Return-Path',
      title: 'Return-Path identity',
      subject: domain,
      status: spfRecords.length && ((mx?.answers.length || 0) || (a?.answers.length || 0) || (aaaa?.answers.length || 0)) ? 'healthy' : spfRecords.length ? 'warning' : 'unknown',
      summary: 'Return-Path readiness is derived from SPF plus MX/A/AAAA presence for the same domain.',
      evidence: [`SPF records: ${spfRecords.length}`, `MX answers: ${mx?.answers.length || 0}`, `A/AAAA answers: ${(a?.answers.length || 0) + (aaaa?.answers.length || 0)}`],
      lookupIds: [domain],
    });
  }

  for (const ip of ips) {
    const ptrName = ptrNameForIp(ip);
    const ptr = findLookup(ptrName, 'PTR');
    const ptrHost = ptr?.answers?.[0] ? answerText(ptr.answers[0]).replace(/\.$/, '') : '';
    let forward: any = null;
    if (ptrHost) {
      try {
        forward = await resolveGoogleDnsInternal(ptrHost, isIpv4(ip) ? 'A' : 'AAAA', options);
        lookups.push(forward);
      } catch {}
    }
    const forwardMatches = !!forward?.answers?.some((answer: any) => answerText(answer).replace(/\.$/, '') === ip);
    findings.push({
      id: `ptr-${ip}`,
      category: 'PTR',
      title: 'PTR / reverse identity',
      subject: ip,
      status: ptrHost && forwardMatches ? 'healthy' : ptrHost ? 'warning' : 'error',
      summary: ptrHost && forwardMatches ? `PTR forward-confirms to ${ip}.` : ptrHost ? `PTR resolves to ${ptrHost}, but forward confirmation did not include ${ip}.` : 'No PTR hostname found.',
      evidence: [`PTR query: ${ptrName}`, ptrHost ? `PTR: ${ptrHost}` : 'PTR: none', `Forward-confirmed: ${forwardMatches ? 'yes' : 'no'}`],
      lookupIds: [ptrName],
    });
  }

  findings.push({
    id: 'observed-authentication',
    category: 'Observed',
    title: 'Observed message authentication',
    subject: ticket?.case_number || 'Current ticket',
    status: 'unknown',
    summary: 'No Authentication-Results header sample is available in this ticket data. DNS configuration is shown separately from message-level SPF/DKIM/DMARC pass.',
    evidence: [`Stored statuses: SPF ${ticket?.spf_status || 'n/a'}, DKIM ${ticket?.dkim_status || 'n/a'}, DMARC ${ticket?.dmarc_status || 'n/a'}`],
    lookupIds: [],
  });

  const errors = findings.filter(item => item.status === 'error').length;
  const warnings = findings.filter(item => item.status === 'warning').length;
  const assessmentStatus: AuthFindingStatus = errors ? 'error' : warnings ? 'warning' : 'healthy';
  const assessment = {
    label: errors ? 'Authentication exception found' : warnings ? 'Authentication needs review' : 'Braze-provisioned authentication looks healthy',
    summary: errors
      ? `${errors} live DNS checks failed or returned no usable record. Braze normally provisions these records at onboarding, so treat this as an exception to verify rather than a routine setup task.`
      : warnings
        ? `${warnings} checks need review. Braze normally sets authentication up during onboarding, but Raw DNS preserves the evidence for confirmation.`
        : 'Live DNS configuration is available and no setup exceptions were detected. Message-level pass still requires Authentication-Results header or event evidence.',
    status: assessmentStatus,
    evidence: findings.filter(item => item.status !== 'unknown').slice(0, 5).map(item => `${item.category}: ${item.summary}`),
  };

  return {
    account: ticket?.account_name || 'Current account',
    domain: domains[0] || '',
    visibleFromDomain,
    identities,
    findings,
    lookups,
    checkedAt: new Date().toISOString(),
    assessment,
  };
}

async function startServer() {
  const app = express();

  registerMailProviderStatusRoute(app);
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const HOST = process.env.EDQ_HOST || '127.0.0.1';

  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      backend: 'ok',
      gemini: { configured: !!geminiApiKey, status: runtimeHealth.gemini, defaultModel: DEFAULT_GEMINI_MODEL, activeModel: activeGeminiModel },
      dns: { status: runtimeHealth.dns, resolver: 'Google Public DNS' },
      checkedAt: runtimeHealth.checkedAt,
    });
  });





  // iCloud Mail status for Daily Briefing.

  // Refresh (restart) the dev server itself. Under `tsx watch`, bumping this
  // file's mtime triggers a clean process restart; if not watched, exit so an
  // external supervisor can relaunch.
  app.post('/api/server/restart', (_req, res) => {
    if (ELECTRON_PACKAGED) return res.status(403).json({ error: 'Restart is unavailable in the packaged app.' });
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
    try {
      fs.mkdirSync(path.dirname(GEMINI_MODEL_STATE_PATH), { recursive: true });
      fs.writeFileSync(GEMINI_MODEL_STATE_PATH, model, 'utf-8');
    } catch {}
    console.log(`[Gemini] Active model switched to: ${model}`);
    res.json({ active: activeGeminiModel });
  });

  app.post('/api/dns/lookup', async (req, res) => {
    try {
      const lookup = await resolveGoogleDnsInternal(String(req.body?.name || ''), String(req.body?.type || 'A'));
      res.json({ lookup });
    } catch (error: any) {
      res.status(400).json({ error: error?.message || 'DNS lookup failed' });
    }
  });

  app.get('/api/google-checkmx', async (req, res) => {
    const domain = String(req.query.domain || '').trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0].replace(/\.$/, '');
    if (!/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)) {
      return res.status(400).json({ error: 'Enter a valid domain name.' });
    }
    try {
      const response = await fetch(`https://toolbox.googleapps.com/apps/checkmx/check?domain=${encodeURIComponent(domain)}`, {
        headers: { 'User-Agent': 'EDQ Dashboard CheckMX integration' },
      });
      if (!response.ok) throw new Error(`Google CheckMX returned ${response.status}`);
      const html = await response.text();
      const report = parseGoogleCheckMx(domain, html);
      if (!report.checks.length) throw new Error('Google CheckMX did not return any checks for this domain.');
      res.json({ report });
    } catch (error: any) {
      res.status(502).json({ error: error?.message || 'Google CheckMX request failed.' });
    }
  });

  app.post('/api/dns/auth-scan', async (req, res) => {
    try {
      const scan = await runAuthenticationScan(req.body?.ticket || {}, { force: req.body?.force === true });
      res.json({ scan });
    } catch (error: any) {
      res.status(400).json({ error: error?.message || 'Authentication scan failed' });
    }
  });

  // Inline prompt completion for the Gemini pill. Keep the output as a suffix so
  // the client can render it as ghost text and accept it with Tab.
  app.post('/api/gemini/autocomplete', async (req, res) => {
    try {
      const text = String(req.body?.text || '').trimEnd();
      if (text.trim().length < 4) return res.json({ suggestion: '' });
      const screen = String(req.body?.screen || '').slice(0, 5000);
      const ticketRef = req.body?.ticketRef as { id?: string; account?: string } | undefined;
      const focusedCase = ticketRef?.id ? cases.find(item => item.case_number === ticketRef.id) : undefined;
      const accountCases = focusedCase
        ? cases.filter(item => item.account_id === focusedCase.account_id).slice(0, 8)
        : [];
      const accountContext = accountCases.map(item => [
        `Case ${item.case_number}: ${item.case_subject}`,
        `status ${item.case_status}`,
        item.root_cause_summary ? `RCA ${item.root_cause_summary}` : '',
        item.sending_domains.length ? `domains ${item.sending_domains.join(', ')}` : '',
      ].filter(Boolean).join(' | ')).join('\n');
      const { context: guideContext } = searchAndGetRAGContext(`${text} ${screen}`.slice(0, 900), 1);
      const response = await ai.models.generateContent({
        // Keep autocomplete on the model selected in Settings, too.
        model: activeGeminiModel,
        contents: `Use the following sources only to choose a relevant continuation.\n\nLIVE DASHBOARD CONTEXT:\n${screen || '(none)'}\n\nCURRENT ACCOUNT CONTEXT:\n${accountContext || '(none)'}\n\nRELEVANT USER GUIDE EXCERPT:\n${guideContext.slice(0, 3500) || '(none)'}\n\nGENERAL KNOWLEDGE SCOPE: email deliverability, sender reputation, authentication, recipient engagement, bounces, deferrals, complaints, and mailbox-provider behaviour.\n\nComplete only the fragment between <fragment> tags.\n<fragment>${text.slice(-700)}</fragment>`,
        config: {
          systemInstruction: 'You are a search-phrase autocomplete engine for an email deliverability workspace. Return only 1 to 5 words that extend the unfinished topic phrase. Never answer, explain, define, advise, or complete a question. Never begin with a verb, pronoun, article, or a phrase such as is, are, to, start, use, begin, you, we, the, a, an, for, with, or by. Do not repeat the fragment. No punctuation, markdown, labels, or line breaks. If the text is a question or no noun-phrase continuation is certain, return an empty response.',
          temperature: 0.1,
          maxOutputTokens: 16,
          thinkingConfig: { thinkingBudget: 0 },
        },
      });
      let suggestion = String(response.text || '')
        .replace(/[\r\n]+/g, ' ')
        .replace(/^['"`]+|['"`]+$/g, '')
        .split(/[.!?]/, 1)[0]
        .trim();
      if (suggestion.toLowerCase().startsWith(text.toLowerCase())) {
        suggestion = suggestion.slice(text.length).trimStart();
      }
      const wordCount = suggestion.split(/\s+/).filter(Boolean).length;
      const answerLikeStart = /^(is|are|was|were|to|start|use|begin|you|we|i|the|a|an|for|with|by|here|consider|try|make|build|create|follow|include|avoid|ensure)\b/i.test(suggestion);
      if (wordCount > 5 || answerLikeStart || /[.!?]/.test(suggestion)) {
        suggestion = '';
      }
      res.json({ suggestion: suggestion.slice(0, 60) });
    } catch (error: any) {
      res.status(200).json(isGeminiQuotaError(error)
        ? { suggestion: '', ...modelUnavailablePayload() }
        : { suggestion: '', error: cleanGeminiErrorMessage(error) });
    }
  });

  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { prompt, history, screen, ticketRef } = req.body;
      const screenText = typeof screen === 'string' ? screen.slice(0, 5000) : '';
      const { tickets: historyTickets, resolvedAccount } = buildHistoryTickets(ticketRef);
      const ticketMemory = searchHistoricalTickets(`${String(prompt)} ${screenText}`, { id: ticketRef?.id, account: resolvedAccount }, historyTickets);
      const { context: guideContext, sources: guideSources } = shouldRetrieveGuideEvidence(String(prompt), screenText)
        ? searchAndGetRAGContext(`${String(prompt)} ${screenText}`.slice(0, 900), 3)
        : { context: '', sources: [] as string[] };
      // Convert Gemini-format history { role, parts:[{text}] } → OpenAI format { role, content }
      const priorMessages = (history ?? []).map((m: any) => ({
        role: m.role === 'model' ? 'assistant' : m.role,
        content: Array.isArray(m.parts) ? m.parts.map((p: any) => p.text).join('') : m.content ?? '',
      }));
      const messages = [
        { role: 'system', content: `You are Gemini — an evidence-led email-deliverability specialist embedded in a Braze support dashboard. Answer the literal question first, then give a concise, useful interpretation in Markdown.\n\n${INVESTIGATION_WORKSPACE_POLICY}\n\nSOURCE DISCIPLINE:\n- Prioritise the current ticket and active investigation context. Use same-account history only to identify a recurring pattern, and cross-account history only as anonymised precedent.\n- Use User Guide evidence only when it directly applies. Do not say that every available source was used.\n- State whether an RCA is supported, working, or unverified when that distinction matters.\n- Never invent metrics, ticket facts, UI actions, or customer decisions.\n\n${GEMINI_CHART_POLICY}` },
        ...priorMessages,
        { role: 'user', content: `USER QUESTION:\n${String(prompt).slice(0, 2000)}\n\n=== LIVE INVESTIGATION CONTEXT ===\n${screenText || '(none)'}\n\n=== SAME-ACCOUNT / ANONYMISED PRECEDENT ===\n${ticketMemory.block || '(none)'}\n\n=== RELEVANT USER GUIDE ===\n${guideContext || '(none)'}\n\nSOURCE PATHS:\n${guideSources.join('\n') || '(none)'}` },
      ];
      const text = await callGemini(messages, 0.4, { maxTokens: 1200, timeoutMs: 240_000 });
      res.json({ text, role: 'model' });
    } catch (e: any) {
      console.error(e);
      res.status(isGeminiQuotaError(e) ? 200 : 500).json(isGeminiQuotaError(e)
        ? modelUnavailablePayload()
        : { error: cleanGeminiErrorMessage(e) });
    }
  });

  // User Guide API: Get list of documents and their sync status
  app.get("/api/user-guide/files", (req, res) => {
    try {
      const statePath = resourcePath("braze_user_guide_state.json");
      if (!fs.existsSync(statePath)) {
        return res.json({ files: [] });
      }
      const rawState = fs.readFileSync(statePath, "utf-8");
      const state = JSON.parse(rawState);

      // Let's check which files actually exist locally on the disk
      const mdDir = resourcePath("braze_user_guide_md");
      const filesList = Object.entries(state).map(([githubPath, details]: [string, any]) => {
        const localPath = resourcePath(details.local_path);
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
    if (ELECTRON_PACKAGED) return res.status(403).json({ error: 'User Guide sync is disabled in the packaged preview.' });
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
    if (ELECTRON_PACKAGED) return res.status(403).json({ error: 'User Guide sync is disabled in the packaged preview.' });
    try {
      const { path: githubPath } = req.body;
      if (!githubPath) {
        return res.status(400).json({ error: "Missing 'path' parameter." });
      }

      const statePath = resourcePath("braze_user_guide_state.json");
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
      const localPath = resourcePath(details.local_path);
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
      const fullPath = resourcePath("braze_user_guide_md", "docs", "User Guide", cleanPath);

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
      const mdDir = resourcePath("braze_user_guide_md");
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
      const ragQuery = /Currently viewing:\s*User Guide/i.test(screenText)
        ? String(prompt).slice(0, 600)
        : `${prompt} ${screenText}`.slice(0, 600);
      const activeGuideContext = isQuestionAboutActiveGuide(prompt) ? getActiveGuideRagContext(screenText) : null;
      const { context, sources } = activeGuideContext ?? (shouldRetrieveGuideEvidence(prompt, screenText)
        ? searchAndGetRAGContext(ragQuery, 3)
        : { context: '', sources: [] as string[] });

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
      const currentTicket = ticketRef?.id ? cases.find(item => item.case_number === ticketRef.id) : undefined;
      const accountInfrastructureBlock = currentTicket ? `
=== AUTHORITATIVE ACCOUNT INFRASTRUCTURE ===
Account: ${currentTicket.account_name}
Assigned IP pools: ${currentTicket.ip_pools.join(', ')}
Sending IPs: ${currentTicket.sending_ips.join(', ')}
Campaigns: ${currentTicket.campaigns.join(', ')}` : '';

      // Count distinct pinned panels (delimited as "=== PANEL N: ... ===" by the
      // client) so we can tell the model when to assess cross-panel relatedness.
      const pinnedPanelCount = (selectedPanelBlock.match(/^===\s*PANEL\s+\d+:/gim) || []).length;
      const multiPanelRule = pinnedPanelCount > 1 ? `
MULTI-PANEL RULE — the agent pinned ${pinnedPanelCount} separate panels (each delimited "=== PANEL N: <label> [scope: ...] ==="). The SELECTED CONTEXT block contains an authoritative "(RELATEDNESS: ...)" verdict — OBEY it; do not second-guess it from the content. Panels with different scopes are different cases.
- If the verdict says they are RELATED: give one integrated analysis that ties them together.
- If the verdict says they are UNRELATED: do NOT merge them and NEVER attribute one panel's metrics, rates, or values to another. Lead with the single most detailed / most case-specific panel (usually a ticket), summarise it fully, then for each other panel briefly note what it is and ASK the agent what they'd like you to do with it. Treat each panel as its own subject.
` : '';
      const sourceAttestation = buildSourceAttestationInstruction(screenText, selectedPanelBlock, sources, ticketMemory.sameAccountCount);

      // No longer restricted to "only the context" — the model is told to combine
      // its own knowledge, the Braze guide excerpts, and the live on-screen data.
      const systemPrompt = `You are Gemini — an email-deliverability troubleshooting expert embedded in a Braze support dashboard. Your job is to help a support agent diagnose and resolve customer deliverability issues quickly. You answer as a specialist, not a generalist.

WHAT TO WEIGH (in order of priority):
0. USER-PINNED PANEL DATA (see block below) — the agent manually selected these modules. If present, they are the primary subject. Analyse them directly and cite their specific values. If more than one panel is pinned, follow the MULTI-PANEL RULE below — do not assume the panels are related.
0.5. USER-ATTACHED FILES (see block below) — files explicitly uploaded by the user. If present, analyse their contents, answer questions about them, and reference them directly.
1. The current customer's live ticket details (LIVE ON-SCREEN CONTEXT) — the case in front of you, including account, metrics, RCA, bounce data, and auth results.
2. The same customer's past tickets (SAME-ACCOUNT history) — spot recurring patterns specific to this account.
3. Braze-specific best practice from the USER GUIDE EXCERPTS — authoritative for any Braze configuration question.
4. General email-deliverability best practice — SPF / DKIM / DMARC, IP warming, bounce / complaint thresholds, sender reputation, list hygiene, ESP behaviour.
5. Cross-account historical precedents (HISTORICAL TICKET CONTEXT, anonymized) — use ONLY to recognise patterns and suggest fixes that have worked. Do not centre your answer on them; they are a sanity check, not the main subject.

${APP_FEATURE_CONTEXT}

${APP_ACTION_GUIDANCE}

${INVESTIGATION_WORKSPACE_POLICY}

${GEMINI_BENCHMARK_POLICY}

SOURCE DISCIPLINE — only rely on a User Guide excerpt when it directly answers the user's subject. For questions about navigating or using this dashboard's User Guide, use the live app context and APP MAP; do not infer product navigation from unrelated Braze articles. Never imply that every retrieved source was used.
${sourceAttestation}

PII GUARDRAIL — non-negotiable: cross-account context is redacted before it reaches you. Treat anything in that section as an anonymized pattern. NEVER name, guess or imply which account a pattern came from. NEVER reproduce account names, contact names, email addresses, domains, campaign IDs, DKIM selectors, IPs, or any identifier from the cross-account block — even if it appears verbatim in the excerpt. If you reference a precedent, write it as "a peer account resolved this by…" or "we've seen this pattern when…". Never quote redacted blocks back.

CRITICAL — ANSWER, DON'T REDIRECT. Answer the question fully using your own knowledge, the guide and any available data. NEVER tell the user to navigate elsewhere, open another section/tab/page, or "check the dashboard". If a live value isn't available, give the substantive answer anyway.

NEVER INVENT UI ACTIONS — non-negotiable. Do NOT instruct the user to "select", "assign", "enable", "click", "toggle", or "configure" any control, field, button, or setting UNLESS that exact control is explicitly described in the on-screen context. The tools here are read-only planners/analyzers; most do not let the user assign or change values. If something isn't present, say plainly what the screen does show and answer the underlying question — never fabricate a step or feature that may not exist.

ANSWER THE LITERAL QUESTION FIRST — your opening sentence must directly address exactly what the user asked. If they ask for a value the screen does not contain (e.g. "Which IP is warming?" when no IP is shown), say so plainly up front ("No specific IP is shown here — this planner builds the ramp by volume and strategy, not a bound IP"), THEN add context. Never lead with a generic description of the tool while leaving the actual question unanswered.

TICKET CONTEXT RULE — when LIVE ON-SCREEN CONTEXT says "Currently viewing: Support ticket", treat the answer as about that specific account/case unless the user explicitly asks a general question. If ACTIVE FILTERS name a selected IP, sending domain, mailbox provider, IP pool, campaign, or subaccount, scope the diagnosis to that selected entity first and only widen to the ticket/account after. Use the active tab as visual focus, but correlate across the full ticket context: issue, case number, account, root cause, authentication state, deliverability metrics, email performance metrics, bounce/provider details, support history, sending domains, and subaccounts. Do not answer a clicked suggestion as generic best practice if ticket/account data is present.

ACCOUNT INFRASTRUCTURE FIDELITY — The live ticket's "Assigned IP pools", "Sending IPs", and "Campaigns" are authoritative account data. Every account has one or more assigned IP pools. When the user asks which pool is involved, name the listed pool or pools directly and connect them to the case evidence. Never say that an IP pool is unavailable, unidentified, absent, or requires checking elsewhere when "Assigned IP pools" contains a value. Only distinguish an exact pool from a broader shared-pool diagnosis when the data genuinely lists more than one pool.

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
${screenBlock}${accountInfrastructureBlock}
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
      const attested = extractSourceAttestation(rawText);
      let text = attested.text.replace(/\n\s*SUG\w*\s*:\s*[\s\S]*$/i, '').trim();
      // Strip any "[Suggested guide cards shown … ]" annotation the model echoes
      // back — that bracket note is internal history context, never user-facing.
      text = text.replace(/\[\s*Suggested guide cards shown[^\]]*\]/gi, '').trim();
      text = await appendGeminiDecidedChart({ prompt, answer: text, screenText, selectedPanelBlock, sources, ticketRef });
      let suggestions: string[] = [];

      // Suggest up to 3 relevant Braze User Guide articles. The concept-rule
      // routed pick is always first (it's the most relevant); the rest come
      // from the RAG sources in score order, deduped against the first pick.
      const toCard = guidePathToCard;
      const isFocusedGuideArticle = /^Active guide path:/mi.test(screenText) && isQuestionAboutActiveGuide(prompt);
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
      const activeGuidePath = screenText.match(/^Active guide path:\s*(.+)$/mi)?.[1]?.trim();
      const articlePaths = isFocusedGuideArticle ? [] : selectSuggestedArticlePaths(prompt, sources, maxCards, activeGuidePath);
      const articles = articlePaths.map(toCard);
      // Keep the legacy single-article field for backwards compatibility with
      // anything still reading `article`.
      const article = articles[0] ?? null;
      const actions = resolveAppActions(prompt, text);
      const evidence = buildAnswerEvidence({
        ticketRef, screenText, selectedPanelBlock, sources,
        sameAccountCount: ticketMemory.sameAccountCount,
        usedSourceKeys: attested.usedSourceKeys,
      });

      res.json({
        text, sources, evidence, suggestions, article, articles, actions,
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
      const { prompt, screen, ticketRef, history: chatHistory, highlightedText, highlightedContext, files, googleSearch } = req.body;
      if (!prompt) { send({ error: 'Missing prompt.' }); return res.end(); }

      let filesText = "";
      if (Array.isArray(files)) {
        for (const file of files) {
          if (!file.name || !file.mimeType) continue;
          const ext = path.extname(file.name).toLowerCase();
          if (ext === '.xlsx' || ext === '.docx') {
            if (file.data) {
              const text = await extractDocumentText(file.name, file.data);
              filesText += `\n\n=== ATTACHED DOCUMENT: ${file.name} ===\n${text}\n`;
            }
          } else if (file.mimeType.startsWith('text/') || ext === '.csv' || ext === '.json' || ext === '.txt' || ext === '.md') {
            let text = "";
            if (file.text) {
              text = file.text;
            } else if (file.data) {
              const cleanBase64 = file.data.replace(/^data:.*;base64,/, '');
              text = Buffer.from(cleanBase64, 'base64').toString('utf8');
            }
            filesText += `\n\n=== ATTACHED FILE: ${file.name} ===\n${text}\n`;
          }
        }
      }

      const screenText: string = typeof screen === 'string' ? screen : '';
      let ragQuery = /Currently viewing:\s*User Guide/i.test(screenText)
        ? String(prompt).slice(0, 600)
        : `${prompt} ${screenText}`.slice(0, 600);
      if (highlightedText) {
        const titleMatch = screenText.match(/Title:\s*([^\n]+)/);
        const articleTitle = titleMatch ? titleMatch[1].trim() : '';
        ragQuery = `${highlightedText} ${articleTitle}`.trim();
      }
      const activeGuideContext = isQuestionAboutActiveGuide(prompt) ? getActiveGuideRagContext(screenText) : null;
      const { context, sources } = activeGuideContext ?? (shouldRetrieveGuideEvidence(prompt, screenText)
        ? searchAndGetRAGContext(ragQuery, 3)
        : { context: '', sources: [] as string[] });
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
      const currentTicketS = ticketRef?.id ? cases.find(item => item.case_number === ticketRef.id) : undefined;
      const accountInfrastructureBlockS = currentTicketS ? `
=== AUTHORITATIVE ACCOUNT INFRASTRUCTURE ===
Account: ${currentTicketS.account_name}
Assigned IP pools: ${currentTicketS.ip_pools.join(', ')}
Sending IPs: ${currentTicketS.sending_ips.join(', ')}
Campaigns: ${currentTicketS.campaigns.join(', ')}` : '';

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
      const sourceAttestation = buildSourceAttestationInstruction(screenText, selectedPanelBlockS, sources, ticketMemory.sameAccountCount);

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

${INVESTIGATION_WORKSPACE_POLICY}

${GEMINI_BENCHMARK_POLICY}

SOURCE DISCIPLINE — only rely on a User Guide excerpt when it directly answers the user's subject. For questions about navigating or using this dashboard's User Guide, use the live app context and APP MAP; do not infer product navigation from unrelated Braze articles. Never imply that every retrieved source was used.
${sourceAttestation}

PII GUARDRAIL — non-negotiable: cross-account context is redacted before it reaches you. NEVER name, guess or imply which account a pattern came from. NEVER reproduce account names, contact names, email addresses, domains, campaign IDs, DKIM selectors, IPs, or any identifier from the cross-account block. If you reference a precedent, write it as "a peer account resolved this by…". Never quote redacted blocks back.

CRITICAL — ANSWER, DON'T REDIRECT. Answer the question fully using your own knowledge, the guide and any available data. NEVER tell the user to navigate elsewhere, open another section/tab/page, or "check the dashboard".

NEVER INVENT UI ACTIONS — non-negotiable. Do NOT instruct the user to "select", "assign", "enable", "click", "toggle", or "configure" any control, field, button, or setting UNLESS that exact control is explicitly described in the on-screen context. The tools here are read-only planners/analyzers; most do not let the user assign or change values. If something isn't present, say plainly what the screen does show and answer the underlying question — never fabricate a step or feature that may not exist.

ANSWER THE LITERAL QUESTION FIRST — your opening sentence must directly address exactly what the user asked. If they ask for a value the screen does not contain (e.g. "Which IP is warming?" when no IP is shown), say so plainly up front ("No specific IP is shown here — this planner builds the ramp by volume and strategy, not a bound IP"), THEN add context. Never lead with a generic description of the tool while leaving the actual question unanswered.

TICKET CONTEXT RULE — when LIVE ON-SCREEN CONTEXT says "Currently viewing: Support ticket", treat the answer as about that specific account/case unless the user explicitly asks a general question. If ACTIVE FILTERS name a selected IP, sending domain, mailbox provider, IP pool, campaign, or subaccount, scope the diagnosis to that selected entity first and only widen to the ticket/account after. Use the active tab as visual focus, but correlate across the full ticket context: issue, case number, account, root cause, authentication state, deliverability metrics, email performance metrics, bounce/provider details, support history, sending domains, and subaccounts. Do not answer a clicked suggestion as generic best practice if ticket/account data is present.

ACCOUNT INFRASTRUCTURE FIDELITY — The live ticket's "Assigned IP pools", "Sending IPs", and "Campaigns" are authoritative account data. Every account has one or more assigned IP pools. When the user asks which pool is involved, name the listed pool or pools directly and connect them to the case evidence. Never say that an IP pool is unavailable, unidentified, absent, or requires checking elsewhere when "Assigned IP pools" contains a value. Only distinguish an exact pool from a broader shared-pool diagnosis when the data genuinely lists more than one pool.

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
${screenBlock}${accountInfrastructureBlockS}${highlightedBlock}
${dailyHistoryBlockS ? `\n\n${dailyHistoryBlockS}` : ''}

=== BRAZE USER GUIDE EXCERPTS ===
${trimmedContext}

=== HISTORICAL TICKET CONTEXT ===
${ticketMemory.block || '(no relevant past tickets found)'}
${filesText ? `\n=== USER-ATTACHED FILES ===\n${filesText}` : ''}

Return ONLY the answer in Markdown. Do not add a "SUGGESTIONS" section.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...priorMessages,
        { role: 'user', content: String(prompt).slice(0, 800) },
      ];

      // Stream from Gemini API
      let fullText = '';
      let thoughtSummary = '';
      const searchEvidence: Array<{ label: string; path: string }> = [];
      try {
        // Interactions streams displayable thought summaries when the selected
        // Gemini model provides them alongside answer tokens.
        const interactionInput = [
          ...priorMessages.map(message => `${message.role.toUpperCase()}: ${message.content}`),
          `USER: ${String(prompt).slice(0, 800)}`,
        ].join('\n\n');
        const isLiteModel = /(?:^|-)lite\b/i.test(activeGeminiModel);
        // Some Gemini models reason without returning a displayable thought event.
        // Generate a short, safe user-facing summary of the evidence being weighed
        // so the Thinking disclosure is useful across every selected model.
        const visibleThinkingPromise: Promise<string> = isLiteModel ? Promise.resolve('') : ai.models.generateContent({
          model: activeGeminiModel,
          contents: `USER REQUEST:\n${String(prompt).slice(0, 800)}\n\nSCREEN CONTEXT:\n${screenText.slice(0, 1800)}`,
          config: {
            systemInstruction: 'Write one concise, user-facing analysis summary of the evidence you will weigh before answering. Do not answer the request, reveal private chain-of-thought, use markdown, or exceed 24 words.',
            temperature: 0.1,
            maxOutputTokens: 48,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }).then(response => String(response.text || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 180)).catch(() => '');

        const inputParts: any[] = [{ text: interactionInput }];
        if (Array.isArray(files)) {
          for (const f of files) {
            if (f.data && (f.mimeType.startsWith('image/') || f.mimeType === 'application/pdf')) {
              const cleanBase64 = f.data.replace(/^data:.*;base64,/, '');
              inputParts.push({
                inlineData: {
                  mimeType: f.mimeType,
                  data: cleanBase64
                }
              });
            }
          }
        }
        let visibleThinkingSent = false;
        if (inputParts.length > 1 || googleSearch) {
          const responseStream = await ai.models.generateContentStream({
            model: activeGeminiModel,
            contents: [{ role: 'user', parts: inputParts }],
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.55,
              maxOutputTokens: 1200,
              thinkingConfig: { thinkingBudget: 0 },
              ...(googleSearch ? { tools: [{ googleSearch: {} }] } : {}),
            },
          });
          for await (const chunk of responseStream) {
            const metadata = (chunk as any).candidates?.[0]?.groundingMetadata;
            for (const groundedChunk of metadata?.groundingChunks || []) {
              const web = groundedChunk?.web;
              if (web?.uri && !searchEvidence.some(item => item.path === web.uri)) {
                searchEvidence.push({ label: web.title || 'Google Search result', path: web.uri });
              }
            }
            const deltaText = String(chunk.text || '');
            if (!deltaText) continue;
            fullText += deltaText;
            send({ token: deltaText });
          }
        } else {
          const responseStream = await ai.interactions.create({
            model: activeGeminiModel,
            input: interactionInput,
            system_instruction: systemPrompt,
            generation_config: {
              temperature: 0.55,
              max_output_tokens: 1200,
              ...(isLiteModel ? {} : {
                thinking_level: 'low',
                thinking_summaries: 'auto',
              }),
            },
            stream: true,
          });

          for await (const event of responseStream) {
            if (event.event_type !== 'step.delta') continue;
            const delta = event.delta;
            if (!isLiteModel && delta.type === 'thought_summary' && delta.content?.type === 'text' && delta.content.text) {
              thoughtSummary += delta.content.text;
              send({ thought: delta.content.text });
              visibleThinkingSent = true;
            } else if (delta.type === 'text' && delta.text) {
              if (!isLiteModel && !visibleThinkingSent) {
                const fallback = await Promise.race([
                  visibleThinkingPromise,
                  new Promise<string>(resolve => setTimeout(() => resolve(''), 350)),
                ]);
                if (fallback) {
                  thoughtSummary = fallback;
                  send({ thought: fallback });
                  visibleThinkingSent = true;
                }
              }
              fullText += delta.text;
              send({ token: delta.text });
            }
          }
        }
        if (!isLiteModel && !visibleThinkingSent && inputParts.length === 1) {
          const fallback = await visibleThinkingPromise;
          if (fallback) {
            thoughtSummary = fallback;
            send({ thought: fallback });
          }
        }
        // A stream that completes without answer text is not a usable response.
        if (!fullText.trim()) {
          send(modelUnavailablePayload());
          return res.end();
        }
      } catch (err: any) {
        console.error("[Gemini API] Stream error:", err);
        send(isGeminiQuotaError(err) ? modelUnavailablePayload() : { error: cleanGeminiErrorMessage(err) });
        return res.end();
      }

      // Post-process full text
      const attested = extractSourceAttestation(fullText);
      const text = attested.text
        .replace(/\n\s*SUG\w*\s*:\s*[\s\S]*$/i, '')
        .replace(/\[\s*Suggested guide cards shown[^\]]*\]/gi, '')
        .trim();

      // Compute article cards (same logic as /ask)
      const toCard = guidePathToCard;
      const isFocusedGuideArticle = /^Active guide path:/mi.test(screenText) && isQuestionAboutActiveGuide(prompt);
      const lower = String(prompt).toLowerCase();
      const isMultiTopic = /\b(compare|comparison|vs\.?|versus|difference|differences|both|all three|all 3)\b/.test(lower) || (lower.match(/\band\b/g) || []).length >= 2 || (lower.match(/,/g) || []).length >= 2;
      const isBestPractice = /\b(best practice|best practices|recommend|guidance|guide|articles|documentation)\b/.test(lower);
      const isAboutSpecificTicket = !!ticketRef?.id && /\b(this ticket|this customer|this account|the ticket|the customer)\b/.test(lower);
      const maxCards = isAboutSpecificTicket ? 1 : (isMultiTopic || isBestPractice ? 3 : 1);
      const activeGuidePath = screenText.match(/^Active guide path:\s*(.+)$/mi)?.[1]?.trim();
      const articlePaths = isFocusedGuideArticle ? [] : selectSuggestedArticlePaths(prompt, sources, maxCards, activeGuidePath);
      const articles = articlePaths.map(toCard);

      const finalText = await appendGeminiDecidedChart({ prompt, answer: text, screenText, selectedPanelBlock: selectedPanelBlockS, sources, ticketRef });
      const actions = resolveAppActions(prompt, finalText);
      const evidence = buildAnswerEvidence({
        ticketRef, screenText, selectedPanelBlock: selectedPanelBlockS, sources,
        sameAccountCount: ticketMemory.sameAccountCount,
        usedSourceKeys: attested.usedSourceKeys,
      });
      if (googleSearch) {
        for (const source of searchEvidence.slice(0, 8)) {
          evidence.push({ kind: 'best_practice', label: source.label, detail: 'Google Search grounding', path: source.path });
        }
      }
      const thinking = thoughtSummary
        .split(/\n+/)
        .map(note => note
          .replace(/^[-•]\s*/, '')
          .replace(/^\*\*(.*?)\*\*$/, '$1')
          .replace(/\s+/g, ' ')
          .trim())
        .filter(Boolean)
        .slice(0, 4)
        .map(note => note.length > 480 ? `${note.slice(0, 477)}...` : note);

      send({ done: true, text: finalText, articles, actions, sources, evidence, suggestions: [], thinking });
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

OWNERSHIP — EDS only investigates and recommends here. EDS does NOT contact the customer, submit mailbox-provider (Microsoft/Google/Yahoo/Apple) tickets/delisting, follow up escalations, or monitor the account — so never write "we will submit/monitor/coordinate". Group recommendations under "For the customer to action (relay to them)" and "To raise internally (cross-team / platform ticket)". The customer has only the Braze dashboard + Looker, not direct access to Braze-managed sending infrastructure provider consoles (SparkPost, SendGrid, Amazon SES, raw MTA/IP tooling) — the customer submits their own mailbox-provider requests and monitors via scheduled Looker reports / Braze data; a Braze-side platform change they can't make (e.g. custom Return-Path domain) goes under "To raise internally". Follow any OWNERSHIP CONTEXT block in the user message exactly.

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
- Consultant-confirmed context in the user message is evidence. Use it only where it materially affects this section; never overwrite or contradict a consultant-approved draft.
- If the supplied evidence cannot safely support a conclusion, label the conclusion as working or unverified. Do not ask the consultant a question in this generated section; Workspace handles genuine information requests as structured cards.
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
      let thoughtSummary = '';
      try {
        const isLiteModel = /(?:^|-)lite\b/i.test(activeGeminiModel);
        const visibleThinkingPromise: Promise<string> = isLiteModel ? Promise.resolve('') : ai.models.generateContent({
          model: activeGeminiModel,
          contents: `WORKSPACE REQUEST:\n${String(prompt).slice(0, 900)}\n\nTICKET:\n${ticketRef?.id ? `Case ${ticketRef.id}` : 'Unknown case'}${ticketRef?.account ? ` for ${ticketRef.account}` : ''}`,
          config: {
            systemInstruction: 'Write one concise, user-facing analysis summary of the evidence you will weigh before answering. Do not answer the request, reveal private chain-of-thought, use markdown, or exceed 24 words.',
            temperature: 0.1,
            maxOutputTokens: 48,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }).then(response => String(response.text || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 180)).catch(() => '');
        let visibleThinkingSent = false;
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
            if (!isLiteModel && !visibleThinkingSent) {
              const fallback = await Promise.race([
                visibleThinkingPromise,
                new Promise<string>(resolve => setTimeout(() => resolve(''), 350)),
              ]);
              if (fallback) {
                thoughtSummary = fallback;
                send({ thought: fallback });
                visibleThinkingSent = true;
              }
            }
            fullText += token;
            send({ token });
          }
        }
        if (!isLiteModel && !visibleThinkingSent) {
          const fallback = await visibleThinkingPromise;
          if (fallback) {
            thoughtSummary = fallback;
            send({ thought: fallback });
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
      const thinking = thoughtSummary
        .split(/\n+/)
        .map(note => note
          .replace(/^[-•]\s*/, '')
          .replace(/^\*\*(.*?)\*\*$/, '$1')
          .replace(/\s+/g, ' ')
          .trim())
        .filter(Boolean)
        .slice(0, 4)
        .map(note => note.length > 480 ? `${note.slice(0, 477)}...` : note);
      send({ done: true, text, thinking });
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
      const messages: {role: string, content: string, chips?: any, articles?: any, actions?: any, evidence?: any}[] = [];
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
      if (fm.evidence_json) {
        try {
          const evidenceArr = JSON.parse(fm.evidence_json);
          messages.forEach((msg, i) => { if (evidenceArr[i]) msg.evidence = evidenceArr[i]; });
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
      const evidenceJson = JSON.stringify((messages || []).map((m: any) => m.evidence ?? null));
      const md = `---\nid: ${convId}\ntitle: ${convTitle}\ntimestamp: ${now}\npreview: ${preview.replace(/\n/g, ' ')}\nsource: ${source || 'pill'}\nchips_json: ${chipsJson}\narticles_json: ${articlesJson}\nactions_json: ${actionsJson}\nevidence_json: ${evidenceJson}\n---\n\n${body}`;
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
    const { createServer: createViteServer } = await import('vite');
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
    const distPath = resourcePath('dist');
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

  const server = app.listen(PORT, HOST, async () => {
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : PORT;
    console.log(`[EDQ] Backend ready on http://${HOST}:${port}`);
    const readyFile = process.env.EDQ_READY_FILE;
    if (readyFile) {
      try {
        fs.mkdirSync(path.dirname(readyFile), { recursive: true });
        fs.writeFileSync(readyFile, JSON.stringify({ host: HOST, port }), 'utf8');
      } catch (error) {
        console.error('[EDQ] Unable to write backend readiness file:', redactDiagnostic(error));
      }
    }
    void refreshRuntimeHealth();

    // A public tunnel is opt-in for local development only. Packaged previews
    // never create one: all API traffic remains on loopback.
    if (!ELECTRON_PACKAGED && process.env.EDQ_ENABLE_TUNNEL === 'true') {
      try {
        console.log(`[Tunnel] Opening local development tunnel for port ${port}...`);
        const tunnel = await localtunnel({ port });
      
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
    }
  });
}

startServer();
