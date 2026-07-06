// Looker-backed Overview panels, styled to match the app's established card visual.
//   - AccountDetailsPanel: the original icon-card "Account Details" design, enriched with
//     companies_all_view context (cluster, provider/MTA, status).
//   - PlatformMetricsPanel: streamlined at-a-glance metric cards (platform_email_aggregation),
//     LookML-recomputed rates. Explicit loading / empty / unavailable states; never fabricates.

import { cn } from '../../App';
import { useLookerOverview } from '../../hooks/useLookerOverview';
import { providerDisplayName } from '../../services/providerRouting';

function fmtInt(v: number | null): string {
  return v == null ? '—' : v.toLocaleString();
}
function fmtPct(v: number | null): string {
  return v == null ? '—' : `${(v * 100).toFixed(1)}%`;
}

// ── Icon card used by Account Details (matches original design) ──
function IconCard({
  icon, label, value, sub, accent = 'blue', danger = false, badge,
}: {
  icon: string; label: string; value: string; sub?: string | null;
  accent?: 'blue' | 'amber' | 'green'; danger?: boolean;
  badge?: { text: string; tone: 'internal' | 'external' };
}) {
  const tone = {
    blue: 'bg-[#1A73E8]/5 dark:bg-primary/20 text-[#1A73E8]',
    amber: 'bg-[#ffa500]/5 dark:bg-primary/20 text-[#FFA500]',
    green: 'bg-[#137333]/5 dark:bg-primary/20 text-[#137333] dark:text-[#81C995]',
  }[accent];
  return (
    <div className="flex items-center gap-4">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', danger ? 'bg-red-500/10 text-red-600 dark:text-red-400' : tone)}>
        <span className="material-symbols-outlined text-[20px]" style={accent === 'amber' && !danger ? { fontVariationSettings: "'FILL' 1" } : undefined}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-on-surface-variant/70 dark:text-inverse-on-surface/60 uppercase tracking-wider">{label}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className={cn('text-xs font-black leading-tight truncate', danger ? 'text-red-600 dark:text-red-400' : 'text-on-surface dark:text-inverse-on-surface')}>{value}</p>
          {badge && (
            <span className={cn('text-[8px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wide shrink-0',
              badge.tone === 'internal'
                ? 'text-[#1A73E8] bg-[#E8F0FE] border-[#D2E3FC] dark:bg-[#1A73E8]/15 dark:border-[#1A73E8]/30 dark:text-[#8AB4F8]'
                : 'text-[#137333] bg-[#E6F4EA] border-[#C8E6C9] dark:bg-[#137333]/15 dark:border-[#137333]/30 dark:text-[#81C995]')}>
              {badge.text}
            </span>
          )}
        </div>
        {sub && <p className="text-[10px] text-on-surface-variant dark:text-inverse-on-surface/65 mt-0.5 leading-none truncate">{sub}</p>}
      </div>
    </div>
  );
}

/** True if an ISO/Y-M-D date is within `months` of today. */
function within(dateStr: string | null, months: number): boolean {
  if (!dateStr) return false;
  const d = Date.parse(dateStr);
  if (Number.isNaN(d)) return false;
  const limit = new Date();
  limit.setMonth(limit.getMonth() + months);
  return d <= limit.getTime();
}

// ── Stat card used by Platform Metrics (matches Performance Metrics Grid) ──
export function StatCard({
  label, value, icon, looker, accent = 'blue',
}: {
  label: string; value: string; icon: string; looker: string;
  accent?: 'blue' | 'red' | 'amber' | 'green';
}) {
  const valTone = {
    blue: 'text-on-surface dark:text-inverse-on-surface',
    red: 'text-red-600 dark:text-red-400',
    amber: 'text-orange-500 dark:text-orange-400',
    green: 'text-[#137333] dark:text-[#81C995]',
  }[accent];
  const iconTone = {
    blue: 'border-purple-200/30 bg-purple-500/5 text-[#1A73E8]',
    red: 'border-red-200/30 bg-red-500/5 text-red-600',
    amber: 'border-orange-200/30 bg-orange-500/5 text-orange-500',
    green: 'border-green-200/30 bg-green-500/5 text-[#137333] dark:text-[#81C995]',
  }[accent];
  return (
    <div className="bg-white dark:bg-inverse-surface/40 rounded-xl p-5 shadow-none border border-[#1A73E8]/15 dark:border-outline-variant/15 flex items-center justify-between">
      <div className="min-w-0">
        <h4 className="text-[10px] font-extrabold text-on-surface-variant/70 dark:text-inverse-on-surface/80 uppercase tracking-wide">{label}</h4>
        <p className={cn('text-2xl font-black mt-1', valTone)}>{value}</p>
        <p className="text-[9px] font-mono text-on-surface-variant/45 dark:text-inverse-on-surface/35 mt-1">{looker}</p>
      </div>
      <div className={cn('w-10 h-10 rounded-xl border flex items-center justify-center shrink-0', iconTone)}>
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
    </div>
  );
}

function StateRow({ kind, error }: { kind: 'loading' | 'empty' | 'unavailable'; error?: string }) {
  const map = {
    loading: { icon: 'progress_activity', text: 'Loading Looker data…', spin: true },
    empty: { icon: 'inbox', text: 'No platform_email_aggregation rows for this account yet.', spin: false },
    unavailable: { icon: 'cloud_off', text: error ?? 'Looker source unavailable.', spin: false },
  }[kind];
  return (
    <div className="bg-white dark:bg-inverse-surface/40 rounded-xl border border-[#1A73E8]/15 dark:border-outline-variant/15 flex items-center gap-2 text-[12px] text-on-surface-variant/70 dark:text-inverse-on-surface/60 px-4 py-3">
      <span className={cn('material-symbols-outlined text-[18px]', map.spin && 'animate-spin')}>{map.icon}</span>
      <span>{map.text}</span>
    </div>
  );
}

/** Original icon-card Account Details, enriched with Looker account context. */
export function AccountDetailsPanel({
  accountName, tier, campaignId, contactName,
}: {
  accountName: string | null | undefined;
  tier?: string | null; campaignId?: string | null; contactName?: string | null;
}) {
  const { account } = useLookerOverview(accountName);
  const name = (contactName ?? '').split(' (')[0] || (accountName ?? '');
  const email = contactName && contactName.includes('(') ? contactName.split('(')[1].replace(')', '') : null;
  const isInternal = !!email && (email.includes('@braze.com') || email.includes('@appboy.com'));
  const contractSoon = within(account?.contract_end_date ?? null, 3);
  const provider = providerDisplayName(account?.email_service_provider, '—');

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[11px] font-black text-on-surface-variant/80 dark:text-inverse-on-surface/80 uppercase tracking-widest font-mono select-none">Account Details</h3>
      <div
        data-gem-panel
        data-gem-panel-label="Account Details"
        data-gem-panel-content={`Account: ${accountName} | MTA: ${provider} | cluster: ${account?.cluster} | region: ${account?.region} | edition: ${account?.platform_edition} | contract_end: ${account?.contract_end_date} | macro: ${account?.macro_classification} | industry_rollup: ${account?.industry_rollup} | CARR: ${account?.current_carr}`}
        className="bg-white dark:bg-inverse-surface/40 rounded-xl p-5 shadow-none border border-[#1A73E8]/15 dark:border-outline-variant/15"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <IconCard icon="domain" label="Account" value={accountName ?? '—'} sub={account?.c_id ? `[${account.c_id}]` : null} />
          <IconCard icon="person" label="Raised By" value={name || '—'} sub={email ? `[${email}]` : null} badge={{ text: isInternal ? 'Internal' : 'External', tone: isInternal ? 'internal' : 'external' }} />
          <IconCard icon="cloud" label="Provider (MTA)" value={provider} />
          <IconCard icon="dns" label="Cluster" value={account?.cluster ?? '—'} />
          <IconCard icon="public" label="Region" value={account?.region ?? '—'} />
          <IconCard icon="workspace_premium" label="Platform Edition" value={account?.platform_edition ?? '—'} accent="amber" />
          <IconCard icon="event_busy" label="Contract End" value={account?.contract_end_date ?? '—'} danger={contractSoon} sub={contractSoon ? 'Renewal within 3 months' : null} />
          <IconCard icon="category" label="Macro Classification" value={account?.macro_classification ?? '—'} />
          <IconCard icon="storefront" label="Industry (Roll-Up)" value={account?.industry_rollup ?? '—'} />
          <IconCard icon="payments" label="Current CARR" value={account?.current_carr ?? '—'} accent="green" />
        </div>
      </div>
    </div>
  );
}

/** Streamlined at-a-glance platform email metrics (Looker), in the established card visual. */
export function PlatformMetricsPanel({ accountName }: { accountName: string | null | undefined }) {
  const { status, rates, totals, error } = useLookerOverview(accountName);

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[11px] font-black text-on-surface-variant/80 dark:text-inverse-on-surface/80 uppercase tracking-widest font-mono select-none">
        Platform Email Metrics · <span className="text-on-surface-variant/50">platform_email_aggregation</span>
      </h3>

      {status === 'loading' ? <StateRow kind="loading" />
        : status === 'unavailable' ? <StateRow kind="unavailable" error={error} />
        : status === 'empty' ? <StateRow kind="empty" />
        : (
          <>
            <div
              data-gem-panel
              data-gem-panel-label="Platform Email Metrics (Looker)"
              data-gem-panel-content={`total_sent: ${totals.total_sent} | total_delivered: ${totals.total_delivered} | delivered_percent: ${rates?.delivered_percent} | bounce_rate: ${rates?.bounce_rate} | spam_rate: ${rates?.spam_rate}`}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              <StatCard label="Sent" value={fmtInt(totals.total_sent)} icon="send" looker="total_sent" />
              <StatCard label="Delivered" value={fmtInt(totals.total_delivered)} icon="mark_email_read" looker="total_delivered" accent="green" />
              <StatCard label="Hard Bounces" value={fmtInt(totals.total_bounces)} icon="error" looker="total_bounces" accent="red" />
              <StatCard label="Soft Bounces" value={fmtInt(totals.total_soft_bounces)} icon="schedule" looker="total_soft_bounces" accent="amber" />
              <StatCard label="Complaints" value={fmtInt(totals.total_spam)} icon="report" looker="total_spam" accent="amber" />
              <StatCard label="Unique Opens" value={fmtInt(totals.total_unique_opens)} icon="visibility" looker="total_unique_opens" />
              <StatCard label="Unique Clicks" value={fmtInt(totals.total_unique_clicks)} icon="ads_click" looker="total_unique_clicks" />
              <StatCard label="Delivery Rate" value={fmtPct(rates?.delivered_percent ?? null)} icon="percent" looker="delivered_percent" accent="green" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-1">
              <StatCard label="Hard Bounce Rate" value={fmtPct(rates?.bounce_rate ?? null)} icon="trending_down" looker="bounce_rate" accent="red" />
              <StatCard label="Soft Bounce Rate" value={fmtPct(rates?.soft_bounce_rate_new ?? null)} icon="trending_down" looker="soft_bounce_rate_new" accent="amber" />
              <StatCard label="Complaint Rate" value={fmtPct(rates?.spam_rate ?? null)} icon="flag" looker="spam_rate" accent="amber" />
              <StatCard label="Unique Open Rate" value={fmtPct(rates?.unique_open_rate ?? null)} icon="visibility" looker="unique_open_rate" />
              <StatCard label="Unique Click Rate" value={fmtPct(rates?.unique_click_rate ?? null)} icon="ads_click" looker="unique_click_rate" />
              <StatCard label="Dropped Rate" value={fmtPct(rates?.dropped_rate ?? null)} icon="block" looker="dropped_rate" accent="red" />
            </div>
          </>
        )}
    </div>
  );
}
