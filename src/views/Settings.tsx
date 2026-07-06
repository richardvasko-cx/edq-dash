import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '../App';
import type { ViewType } from '../App';
import { SettingsSparkIcon } from '../components/SparkIcons';
import GeminiIcon from '../components/GeminiIcon';
import { providerIcon } from '../services/providerRouting';

const PROVIDER_LOGOS: Record<string, string> = {
  'SparkPost': 'https://s3-eu-west-1.amazonaws.com/tpd/logos/5bfbc21ef53a780001418b10/0x0.png',
  'SendGrid': 'https://dkgakr8jhpwe5.cloudfront.net/static/SG_Twilio_Lockup_Social-56f3cfd2f6b0c62422980170d57fac64.png',
  'Amazon SES': 'https://docs.aws.amazon.com/assets/r/images/aws_logo_light.svg',
};

const PROVIDER_LOGO_STYLES: Record<string, string> = {
  'SparkPost': 'h-6',
  'SendGrid': 'h-11 -my-2.5', // Adjust for transparent padding in Twilio image to match SparkPost height
  'Amazon SES': 'h-8 -my-1',   // Adjust to match visual weight
};

interface ProviderStatus { configured: boolean; ok?: boolean; name?: string; error?: string; }
interface ProviderMetrics { configured: boolean; ok?: boolean; metrics?: Record<string, number>; error?: string; }
interface ProviderBounce { email?: string; domain?: string; reason?: string; }

function useProviderData(provider: 'sparkpost' | 'sendgrid' | 'ses') {
  const [status, setStatus] = React.useState<ProviderStatus | null>(null);
  const [metrics, setMetrics] = React.useState<ProviderMetrics | null>(null);
  const [bounces, setBounces] = React.useState<ProviderBounce[]>([]);
  const [loading, setLoading] = React.useState(false);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const [s, m, b] = await Promise.all([
        fetch(`/api/${provider}/status`).then(r => r.json()),
        fetch(`/api/${provider}/metrics`).then(r => r.json()),
        fetch(`/api/${provider}/bounces`).then(r => r.json()),
      ]);
      setStatus(s);
      setMetrics(m);
      setBounces(b.bounces || []);
    } catch {
      setStatus({ configured: false, ok: false, error: 'Provider endpoint is not wired in this prototype.' });
      setMetrics({ configured: false, ok: false, error: 'Provider endpoint is not wired in this prototype.' });
      setBounces([]);
    }
    setLoading(false);
  }, [provider]);

  React.useEffect(() => { refresh(); }, [refresh]);
  return { status, metrics, bounces, loading, refresh };
}

// Canonical provider metric labels (count_delivered and count_unique_rendered removed).
const SP_LABELS: Record<string, string> = {
  count_injected: 'Injected',
  count_accepted: 'Accepted',
  count_bounce: 'Bounced',
  count_delayed: 'Delayed',
  count_admin_bounce: 'Admin Bounces',
  count_rejected: 'Rejected',
  count_spam_complaint: 'Spam Complaints',
  count_unique_clicked: 'Unique Clicks',
  count_nonprefetched_unique_confirmed_opened: 'Confirmed Opens',
};
const SG_LABELS: Record<string, string> = {
  delivered: 'Delivered',
  requests: 'Requests',
  bounces: 'Bounced',
  spam_reports: 'Spam Reports',
  clicks: 'Clicks',
  opens: 'Opens',
  blocks: 'Blocks',
  deferred: 'Deferred',
};
const SES_LABELS: Record<string, string> = {
  send: 'Sent',
  delivery: 'Delivered',
  bounce: 'Bounced',
  complaint: 'Complaints',
  reject: 'Rejected',
  open: 'Opens',
  click: 'Clicks',
  rendering_failure: 'Rendering Failures',
};

type Section = 'connections' | 'dashboard' | 'about';

export default function SettingsView({ onNavigate }: { onNavigate: (v: ViewType) => void }) {
  const [section, setSection] = useState<Section>('connections');

  const sp = useProviderData('sparkpost');
  const sg = useProviderData('sendgrid');
  const ses = useProviderData('ses');

  const [pollingEnabled, setPollingEnabled] = useState(() => {
    try { return localStorage.getItem('edq_polling_enabled') !== 'false'; } catch { return true; }
  });
  const [hudCompact, setHudCompact] = useState(() => {
    try { return localStorage.getItem('edq_hud_compact') === 'true'; } catch { return false; }
  });

  const navItems: { id: Section; icon: string; label: string }[] = [
    { id: 'connections', icon: 'cable', label: 'Connections' },
    { id: 'dashboard', icon: 'dashboard_customize', label: 'Dashboard' },
    { id: 'about', icon: 'info', label: 'About' },
  ];

  return (
    <div className="flex h-[calc(100vh-68px)] w-full overflow-hidden">
      {/* Left nav — matches User Guide side panel exactly */}
      <aside className="w-[300px] shrink-0 border-r border-[#E8EAED] dark:border-outline-variant/15 bg-[#F8F9FA] dark:bg-[#121115] flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-3 pt-4 space-y-1.5">
          {navItems.map(item => (
            <div
              key={item.id}
              onClick={() => setSection(item.id)}
              className={cn(
                "py-2.5 px-3.5 rounded-xl flex items-center justify-between transition-all duration-150 cursor-pointer select-none group mb-1",
                section === item.id
                  ? "bg-[#E8F0FE] text-[#1A73E8] dark:bg-[#1A73E8]/20 dark:text-[#D2E3FC] font-bold"
                  : "text-on-surface dark:text-inverse-on-surface hover:bg-[#E8F0FE]/60 dark:hover:bg-[#1A73E8]/14 hover:text-[#1A73E8] dark:hover:text-[#D2E3FC]"
              )}
            >
              <div className="flex items-center gap-3 font-semibold text-[13px]">
                <span
                  className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-[#1A73E8] dark:group-hover:text-[#D2E3FC]"
                  style={{ fontVariationSettings: section === item.id ? "'FILL' 1" : '' }}
                >{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <span className={cn(
                "material-symbols-outlined text-[16px] transition-transform duration-250 text-neutral-400 group-hover:text-[#1A73E8] dark:group-hover:text-[#D2E3FC]",
                section === item.id && "text-[#1A73E8] dark:text-[#D2E3FC]"
              )}>chevron_right</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Content — white background, panels are grey */}
      <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-[#1C1B1F]">
        {section === 'connections' && (
          <ConnectionsSection sp={sp} sg={sg} ses={ses} />
        )}
        {section === 'dashboard' && (
          <DashboardSection
            pollingEnabled={pollingEnabled} setPollingEnabled={setPollingEnabled}
            hudCompact={hudCompact} setHudCompact={setHudCompact}
          />
        )}
        {section === 'about' && <AboutSection />}
      </div>
    </div>
  );
}

// ── Providers ──────────────────────────────────────────────────────────────

function ConnectionsSection({ sp, sg, ses }: { sp: ReturnType<typeof useProviderData>; sg: ReturnType<typeof useProviderData>; ses: ReturnType<typeof useProviderData> }) {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-xl font-bold text-on-surface dark:text-inverse-on-surface">Connections</h1>
        <p className="text-sm text-on-surface-variant dark:text-inverse-on-surface/60 mt-1">
          API keys are stored in your <code className="font-mono text-xs bg-surface-variant dark:bg-inverse-surface/40 px-1.5 py-0.5 rounded">.env</code> file and never exposed to the browser.
        </p>
      </div>
      <ProviderRow
        name="SparkPost"
        envVar="SPARKPOST_API_KEY"
        docsHint="api.sparkpost.com → Account → API Keys (Metrics: Read)"
        metricLabels={SP_LABELS}
        {...sp}
      />
      <ProviderRow
        name="SendGrid"
        envVar="SENDGRID_API_KEY"
        docsHint="app.sendgrid.com → Settings → API Keys (Stats: Read)"
        metricLabels={SG_LABELS}
        {...sg}
      />
      <ProviderRow
        name="Amazon SES"
        envVar="AWS_SES_API_KEY"
        docsHint="AWS IAM/API credentials with SES sending metrics permissions"
        metricLabels={SES_LABELS}
        {...ses}
      />
      <SettingsGroup label="AI">
        <GeminiAPIRow />
      </SettingsGroup>
      <SettingsGroup label="System">
        <RefreshServerRow />
      </SettingsGroup>
    </div>
  );
}

function ProviderRow({
  name, envVar, docsHint, metricLabels,
  status, metrics, bounces, loading, refresh,
}: {
  name: string; envVar: string; docsHint: string; metricLabels: Record<string, string>;
  status: ProviderStatus | null; metrics: ProviderMetrics | null; bounces: ProviderBounce[];
  loading: boolean; refresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const configured = status?.configured;
  const connected = configured && status?.ok;

  const statusLabel = !status ? 'Checking…' : !configured ? 'Not configured' : connected ? 'Connected' : 'Error';
  const statusColor = !status ? 'text-on-surface-variant' :
    !configured ? 'text-on-surface-variant' :
    connected ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500';
  const dotColor = !status ? '#aaa' : !configured ? '#aaa' : connected ? '#16a34a' : '#ef4444';

  return (
    <div className="border border-outline-variant/20 dark:border-outline-variant/10 rounded-xl bg-[#F8F9FA] dark:bg-[#28272e] overflow-hidden">
      {/* Row header */}
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {PROVIDER_LOGOS[name] ? (
            <img 
              src={PROVIDER_LOGOS[name]} 
              alt={name} 
              className={cn("w-auto object-contain object-left dark:brightness-110", PROVIDER_LOGO_STYLES[name] || "h-6")} 
            />
          ) : (
            <p className="text-sm font-bold text-on-surface dark:text-inverse-on-surface">{name}</p>
          )}
          <p className="text-xs font-mono text-on-surface-variant dark:text-inverse-on-surface/50 mt-1.5">{envVar}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className={cn('flex items-center gap-1.5 text-xs font-semibold', statusColor)}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: dotColor }} />
            {statusLabel}
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-[rgba(29,27,32,0.08)] dark:hover:bg-[rgba(255,255,255,0.08)] text-on-surface-variant dark:text-inverse-on-surface/50 transition-colors"
            title="Refresh"
          >
            <span className={cn('material-symbols-outlined text-[16px]', loading && 'animate-spin')}>refresh</span>
          </button>
          {configured && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="p-1.5 rounded-lg hover:bg-[rgba(29,27,32,0.08)] dark:hover:bg-[rgba(255,255,255,0.08)] text-on-surface-variant dark:text-inverse-on-surface/50 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">{expanded ? 'expand_less' : 'expand_more'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Not configured hint */}
      {!configured && status && (
        <div className="px-5 pb-4 border-t border-outline-variant/10 dark:border-outline-variant/5">
          <div className="mt-3 bg-neutral-50 dark:bg-inverse-surface/20 rounded-lg px-4 py-3 space-y-1">
            <p className="text-xs text-on-surface-variant dark:text-inverse-on-surface/60">
              Add your key to <code className="font-mono text-[11px] bg-surface-variant dark:bg-inverse-surface/40 px-1 rounded">.env</code>, then restart the server.
            </p>
            <p className="font-mono text-[11px] text-on-surface dark:text-inverse-on-surface">{envVar}=your_key_here</p>
            <p className="text-[10px] text-on-surface-variant/60 dark:text-inverse-on-surface/40 pt-1">{docsHint}</p>
          </div>
        </div>
      )}

      {/* Error */}
      {configured && !connected && status?.error && (
        <div className="px-5 pb-4 border-t border-outline-variant/10 dark:border-outline-variant/5">
          <p className="mt-3 text-xs font-mono text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg px-3 py-2 break-all">{status.error}</p>
        </div>
      )}

      {/* Expanded metrics & bounces */}
      {connected && expanded && (
        <div className="border-t border-outline-variant/10 dark:border-outline-variant/5">
          {/* Account */}
          {status?.name && (
            <div className="px-5 py-3 flex items-center gap-2 border-b border-outline-variant/10 dark:border-outline-variant/5">
              <span className="material-symbols-outlined text-[15px] text-on-surface-variant">person</span>
              <span className="text-xs text-on-surface dark:text-inverse-on-surface font-medium">{status.name}</span>
            </div>
          )}

          {/* Metrics grid */}
          {metrics?.ok && metrics.metrics && (
            <div className="px-5 py-4 border-b border-outline-variant/10 dark:border-outline-variant/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50 dark:text-inverse-on-surface/40 mb-3">Last 7 days</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {Object.entries(metrics.metrics)
                  .filter(([k]) => metricLabels[k])
                  .map(([k, v]) => (
                    <div key={k} className="text-center">
                      <p className="text-base font-bold text-on-surface dark:text-inverse-on-surface">{(v as number).toLocaleString()}</p>
                      <p className="text-[9px] text-on-surface-variant dark:text-inverse-on-surface/50 uppercase tracking-wide mt-0.5">{metricLabels[k]}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Bounces */}
          {bounces.length > 0 && (
            <div className="px-5 py-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50 dark:text-inverse-on-surface/40 mb-3">Recent Bounces</p>
              <div className="space-y-1">
                {bounces.slice(0, 8).map((b, i) => (
                  <div key={i} className="flex items-start gap-3 py-1.5 border-b border-outline-variant/10 dark:border-outline-variant/5 last:border-0">
                    <span className="material-symbols-outlined text-[14px] text-red-400 mt-0.5 shrink-0">cancel</span>
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-on-surface dark:text-inverse-on-surface truncate">{b.email || b.domain || '—'}</p>
                      {b.reason && <p className="text-[10px] text-on-surface-variant dark:text-inverse-on-surface/50 truncate mt-0.5">{b.reason}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {metrics?.ok && !metrics.metrics && (
            <p className="px-5 py-4 text-xs text-on-surface-variant italic">No metrics for the last 7 days.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Dashboard settings ─────────────────────────────────────────────────────

function DashboardSection({
  pollingEnabled, setPollingEnabled, hudCompact, setHudCompact,
}: {
  pollingEnabled: boolean; setPollingEnabled: (v: boolean) => void;
  hudCompact: boolean; setHudCompact: (v: boolean) => void;
}) {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-bold text-on-surface dark:text-inverse-on-surface">Dashboard</h1>
        <p className="text-sm text-on-surface-variant dark:text-inverse-on-surface/60 mt-1">UI behaviour and data refresh preferences.</p>
      </div>
      <SettingsGroup label="Data">
        <SettingRow
          label="Auto-Refresh Tick"
          desc="Poll the webhook endpoint every 3 seconds"
          control={
            <Toggle value={pollingEnabled} onChange={v => {
              setPollingEnabled(v);
              try { localStorage.setItem('edq_polling_enabled', String(v)); } catch {}
            }} />
          }
        />
        <SettingRow
          label="CSV / JSON Stream Parser"
          desc="High-speed Looker data matching"
          control={<StatusChip label="Enabled" />}
        />
      </SettingsGroup>
      <SettingsGroup label="Layout">
        <SettingRow
          label="Compact HUD Layout"
          desc="Synthesise dense grid tables in ticket view"
          control={
            <Toggle value={hudCompact} onChange={v => {
              setHudCompact(v);
              try {
                localStorage.setItem('edq_hud_compact', String(v));
                window.dispatchEvent(new Event('storage'));
              } catch {}
            }} />
          }
        />
      </SettingsGroup>
    </div>
  );
}

// ── Integrations ───────────────────────────────────────────────────────────


const GEMINI_TEXT_MODELS: { id: string; label: string; note?: string }[] = [
  { id: 'gemini-2.5-flash',       label: 'Gemini 2.5 Flash',       note: 'Recommended' },
  { id: 'gemini-2.5-pro',         label: 'Gemini 2.5 Pro',         note: 'High capability' },
  { id: 'gemini-2.5-flash-lite',  label: 'Gemini 2.5 Flash Lite',  note: 'Ultra fast' },
  { id: 'gemini-3.5-flash',       label: 'Gemini 3.5 Flash',       note: 'Latest gen' },
  { id: 'gemini-3.1-flash-lite',  label: 'Gemini 3.1 Flash Lite',  note: 'Fast · Low quota' },
  { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview',  note: 'Preview' },
  { id: 'gemini-3-pro-preview',   label: 'Gemini 3 Pro Preview',   note: 'Preview' },
  { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro Preview', note: 'Most capable · Preview' },
  { id: 'gemini-2.0-flash',       label: 'Gemini 2.0 Flash',       note: 'Previous gen' },
  { id: 'gemini-2.0-flash-lite',  label: 'Gemini 2.0 Flash-Lite',  note: 'Previous gen · Lite' },
  { id: 'gemini-flash-latest',    label: 'Gemini Flash (Latest)',   note: 'Always latest Flash' },
  { id: 'gemini-pro-latest',      label: 'Gemini Pro (Latest)',     note: 'Always latest Pro' },
];

function GeminiAPIRow() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [enabled, setEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('edq_gemini_api_enabled') !== 'false'; } catch { return true; }
  });
  const [activeModel, setActiveModel] = useState<string>('gemini-2.5-flash');
  const [modelSaving, setModelSaving] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const [dropPos, setDropPos] = React.useState<{ top?: number; bottom?: number; right: number; maxH: number } | null>(null);

  const openDropdown = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - r.bottom - 12;
      const spaceAbove = r.top - 12;
      const DROPDOWN_MIN = 220; // px — minimum useful height
      if (spaceBelow >= DROPDOWN_MIN || spaceBelow >= spaceAbove) {
        // open downward
        setDropPos({ top: r.bottom + 6, right: window.innerWidth - r.right, maxH: spaceBelow });
      } else {
        // open upward
        setDropPos({ bottom: window.innerHeight - r.top + 6, right: window.innerWidth - r.right, maxH: spaceAbove });
      }
    }
    setModelOpen(o => !o);
  };

  useEffect(() => {
    fetch('/api/gemini/status')
      .then(r => r.json())
      .then(d => setConfigured(d.configured))
      .catch(() => setConfigured(false));
    fetch('/api/gemini/model')
      .then(r => r.json())
      .then(d => { if (d.active) setActiveModel(d.active); })
      .catch(() => {});
  }, []);

  const handleToggle = (val: boolean) => {
    setEnabled(val);
    try {
      localStorage.setItem('edq_gemini_api_enabled', String(val));
      window.dispatchEvent(new Event('storage'));
    } catch {}
  };

  const handleModelChange = async (modelId: string) => {
    setModelOpen(false);
    if (modelId === activeModel) return;
    setModelSaving(true);
    try {
      const r = await fetch('/api/gemini/model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelId }),
      });
      const d = await r.json();
      if (d.active) setActiveModel(d.active);
    } catch {}
    setModelSaving(false);
  };

  const activeInfo = GEMINI_TEXT_MODELS.find(m => m.id === activeModel);

  return (
    <div>
      {/* Status + Toggle row */}
      <SettingRow
        label={
          <span className="flex items-center gap-2">
            <GeminiIcon className="w-5 h-5 shrink-0" />
            Google Gemini API
          </span>
        }
        desc="Cloud API via @google/genai — streaming RAG, multi-turn chat and workspace analysis"
        control={
          <div className="flex items-center gap-3">
            <StatusChip
              label={configured === null ? 'Checking…' : configured ? (enabled ? 'Active' : 'Disabled') : 'Not Configured'}
              color={configured && enabled ? 'green' : 'red'}
            />
            <Toggle value={enabled} onChange={handleToggle} />
          </div>
        }
      />

      {/* Model selector row */}
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-t border-outline-variant/10 dark:border-outline-variant/5">
        <div>
          <p className="text-sm font-semibold text-on-surface dark:text-inverse-on-surface">Model</p>
          <p className="text-[11px] text-on-surface-variant dark:text-inverse-on-surface/50 mt-0.5">
            Text-output model used for all AI calls
          </p>
        </div>
        <div className="shrink-0">
          <button
            ref={btnRef}
            onClick={openDropdown}
            disabled={modelSaving}
            className={cn(
              'flex items-center gap-2 text-[12px] font-semibold px-3 py-1.5 rounded-lg border transition-all',
              'border-outline-variant/30 dark:border-outline-variant/15',
              'bg-white dark:bg-[#28272e] text-on-surface dark:text-inverse-on-surface',
              'hover:bg-surface-variant/40 dark:hover:bg-white/5',
              modelSaving && 'opacity-60 cursor-wait'
            )}
          >
            {modelSaving
              ? <span className="material-symbols-outlined text-[15px] animate-spin text-[#1A73E8]">progress_activity</span>
              : <GeminiIcon className="w-4 h-4 shrink-0" />
            }
            <span>{activeInfo?.label ?? activeModel}</span>
            {activeInfo?.note && (
              <span className="text-[10px] font-normal text-on-surface-variant dark:text-inverse-on-surface/40 hidden sm:inline">
                · {activeInfo.note}
              </span>
            )}
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant dark:text-inverse-on-surface/50 ml-0.5">
              {modelOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {modelOpen && dropPos && (
            <>
              {/* backdrop */}
              <div className="fixed inset-0 z-40" onClick={() => setModelOpen(false)} />
              {/* dropdown — fixed so it escapes overflow:hidden on SettingsGroup */}
              <div
                className={cn(
                  'fixed z-50 w-72',
                  'bg-white dark:bg-[#28272e]',
                  'border border-outline-variant/20 dark:border-outline-variant/10',
                  'rounded-xl shadow-2xl overflow-y-auto'
                )}
                style={{ top: dropPos.top, bottom: dropPos.bottom, right: dropPos.right, maxHeight: dropPos.maxH }}
              >
                <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/50 dark:text-inverse-on-surface/40 px-3 pt-3 pb-1 sticky top-0 bg-white dark:bg-[#28272e] z-10 border-b border-outline-variant/10 dark:border-outline-variant/5">
                  Text-output models
                </p>
                {GEMINI_TEXT_MODELS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleModelChange(m.id)}
                    className={cn(
                      'w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors',
                      m.id === activeModel
                        ? 'bg-[#1A73E8]/8 dark:bg-[#1A73E8]/15 text-[#1A73E8] dark:text-[#D2E3FC]'
                        : 'hover:bg-surface-variant/40 dark:hover:bg-white/5 text-on-surface dark:text-inverse-on-surface'
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold truncate">{m.label}</p>
                      {m.note && <p className="text-[11px] text-on-surface-variant dark:text-inverse-on-surface/50 mt-0.5">{m.note}</p>}
                    </div>
                    {m.id === activeModel && (
                      <span className="material-symbols-outlined text-[18px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                    )}
                  </button>
                ))}
                <div className="px-3 py-2 border-t border-outline-variant/10 dark:border-outline-variant/5">
                  <p className="text-[10px] text-on-surface-variant/60 dark:text-inverse-on-surface/30">
                    Changes apply immediately — no restart needed
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


// ── System refresh actions ───────────────────────────────────────────────────

type ActionState = 'idle' | 'busy' | 'done' | 'error';

function ActionButton({ state, idleLabel, busyLabel, onClick }: {
  state: ActionState; idleLabel: string; busyLabel: string; onClick: () => void;
}) {
  const label = state === 'busy' ? busyLabel : state === 'done' ? 'Done' : state === 'error' ? 'Failed' : idleLabel;
  const icon = state === 'busy' ? 'progress_activity' : state === 'done' ? 'check_circle' : state === 'error' ? 'error' : 'restart_alt';
  return (
    <button
      onClick={onClick}
      disabled={state === 'busy'}
      className={cn(
        'flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors',
        state === 'busy' ? 'opacity-60 cursor-wait bg-[#1A73E8]/10 text-[#1A73E8] dark:text-[#D2E3FC]' :
        state === 'done' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' :
        state === 'error' ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400' :
        'bg-[#1A73E8]/8 dark:bg-[#1A73E8]/20 text-[#1A73E8] dark:text-[#D2E3FC] hover:bg-[#1A73E8]/15 dark:hover:bg-[#1A73E8]/30'
      )}
    >
      <span className={cn('material-symbols-outlined text-[16px]', state === 'busy' && 'animate-spin')}>{icon}</span>
      {label}
    </button>
  );
}

function RefreshServerRow() {
  const [state, setState] = useState<ActionState>('idle');
  const run = async () => {
    if (state === 'busy') return;
    setState('busy');
    try {
      await fetch('/api/server/restart', { method: 'POST' });
    } catch { /* expected — the server is going down */ }
    // Poll until the server answers again.
    let ok = false;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 1000));
      try {
        const r = await fetch('/api/gemini/status', { signal: AbortSignal.timeout(1500) });
        if (r.ok) { ok = true; break; }
      } catch { /* still restarting */ }
    }
    setState(ok ? 'done' : 'error');
    setTimeout(() => setState('idle'), 3000);
  };
  return (
    <SettingRow
      label="Refresh Server"
      desc="Restart the dev server to pick up backend changes (prompts, endpoints, .env)"
      control={<ActionButton state={state} idleLabel="Restart" busyLabel="Restarting…" onClick={run} />}
    />
  );
}

// ── About ──────────────────────────────────────────────────────────────────

function AboutSection() {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-bold text-on-surface dark:text-inverse-on-surface">About</h1>
        <p className="text-sm text-on-surface-variant dark:text-inverse-on-surface/60 mt-1">EDQ Dashboard — Deliverability Pro & Analytics</p>
      </div>
      <SettingsGroup label="Build">
        <SettingRow label="Version" desc="Prototype" control={<span className="text-xs font-mono text-on-surface-variant">v0.1.0</span>} />
        <SettingRow label="Stack" desc="React 19 · Vite · Tailwind 4 · Express" control={null} />
        <SettingRow label="AI Provider" desc="Google Gemini API — cloud streaming via @google/genai" control={null} />
      </SettingsGroup>
    </div>
  );
}

// ── Primitives ─────────────────────────────────────────────────────────────

function SettingsGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50 dark:text-inverse-on-surface/40 mb-3">{label}</p>
    <div className="border border-outline-variant/20 dark:border-outline-variant/10 rounded-xl bg-[#F8F9FA] dark:bg-[#28272e] divide-y divide-outline-variant/10 dark:divide-outline-variant/5 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function SettingRow({ label, desc, control }: { label: React.ReactNode; desc: string; control: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <div>
        <p className="text-sm font-semibold text-on-surface dark:text-inverse-on-surface">{label}</p>
        <p className="text-[11px] text-on-surface-variant dark:text-inverse-on-surface/50 mt-0.5" dangerouslySetInnerHTML={{ __html: desc }} />
      </div>
      {control && <div className="shrink-0">{control}</div>}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        'w-10 h-[22px] rounded-full flex items-center px-0.5 transition-colors duration-200 cursor-pointer shrink-0',
        value ? 'bg-[#1A73E8]' : 'bg-neutral-200 dark:bg-neutral-700'
      )}
    >
      <span className={cn(
        'w-[18px] h-[18px] bg-white rounded-full shadow transform transition-transform duration-200',
        value ? 'translate-x-[18px]' : 'translate-x-0'
      )} />
    </button>
  );
}

function StatusChip({ label, color = 'green' }: { label: string; color?: 'green' | 'yellow' | 'red' }) {
  const colors = {
    green: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400',
  };
  return (
    <span className={cn('text-[10px] font-black uppercase tracking-wide px-2 py-1 rounded-md', colors[color])}>
      {label}
    </span>
  );
}

function EnvChip() {
  return (
    <span className="text-[10px] font-mono text-on-surface-variant dark:text-inverse-on-surface/50 bg-surface-variant dark:bg-inverse-surface/30 px-2 py-1 rounded">
      .env
    </span>
  );
}
