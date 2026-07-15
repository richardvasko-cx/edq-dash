import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';
import {
  BRAND, CHART_CARD, CHART_GRID, CHART_GRID_OPACITY, CHART_AXIS_TICK, CHART_TOOLTIP,
  CHART_BAR_RADIUS, CHART_CURSOR, CHART_SERIES,
} from '../brand';
import { useCaseDataset } from '../hooks/useCaseDataset';
import { weightedMetrics, type CaseRecord } from '../services/caseDataset';

function fmtNum(n: number | null): string {
  if (n === null) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(Math.round(n));
}

function fmtPct(n: number | null, decimals = 1): string {
  if (n === null) return '—';
  return `${(n * 100).toFixed(decimals)}%`;
}

function formatDateLabel(d: string): string {
  if (!d) return '';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Short, stable label for an account on a categorical axis.
function shortName(c: CaseRecord): string {
  const n = c.account_name || c.account_id || c.case_number;
  return n.length > 16 ? `${n.slice(0, 15)}…` : n;
}

export default function ChartsOverview() {
  const { cases, loading, error } = useCaseDataset();

  // ── Overall weighted KPIs across all cases ────────────────────────────────
  const wm = useMemo(() => weightedMetrics(cases), [cases]);
  const totalSent = useMemo(() => cases.reduce((t, c) => t + (c.metrics.count_sent || 0), 0), [cases]);

  // ── Per-account rate comparison rows ──────────────────────────────────────
  const rateRows = useMemo(
    () =>
      cases.map(c => ({
        name: shortName(c),
        accepted_rate: c.metrics.accepted_rate,
        bounce_rate: c.metrics.bounce_rate,
        confirmed_open_rate: c.metrics.nonprefetched_open_rate,
        complaint_rate: c.metrics.spam_complaint_rate,
      })),
    [cases]
  );

  // ── Per-account delivery composition (raw counts) ─────────────────────────
  const compositionRows = useMemo(
    () =>
      cases.map(c => ({
        name: shortName(c),
        accepted: c.metrics.count_accepted,
        delayed: c.metrics.count_delayed_first,
        bounced: c.metrics.count_bounce,
        rejected: c.metrics.count_rejected,
      })),
    [cases]
  );

  // ── Per-account inbox vs spam placement → inbox rate ──────────────────────
  const placementRows = useMemo(
    () =>
      cases.map(c => {
        const inbox = c.metrics.count_inbox;
        const spam = c.metrics.count_spam;
        const denom = inbox + spam;
        return {
          name: shortName(c),
          inbox,
          spam,
          inbox_rate: denom > 0 ? inbox / denom : 0,
        };
      }),
    [cases]
  );

  // ── Case volume by created-date (real per-case timestamps) ────────────────
  const volumeByDay = useMemo(() => {
    const byDay = new Map<string, number>();
    for (const c of cases) {
      const raw = c.case_created_at;
      if (!raw) continue;
      const dt = new Date(raw);
      if (isNaN(dt.getTime())) continue;
      const key = dt.toISOString().slice(0, 10);
      byDay.set(key, (byDay.get(key) || 0) + 1);
    }
    return [...byDay.entries()]
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([date, count]) => ({ label: formatDateLabel(date), count }));
  }, [cases]);

  const kpiTiles = [
    { label: 'Accepted rate', value: fmtPct(wm.acceptedRate), color: BRAND.purple, icon: 'mark_email_read', sub: `${fmtNum(totalSent)} sent` },
    { label: 'Bounce rate', value: fmtPct(wm.bounceRate, 2), color: BRAND.orangeDark, icon: 'unsubscribe', sub: 'of sent' },
    { label: 'Confirmed open rate', value: fmtPct(wm.confirmedOpenRate), color: BRAND.pinkDark, icon: 'drafts', sub: 'of accepted' },
    { label: 'Complaint rate', value: fmtPct(wm.complaintRate, 3), color: BRAND.orange, icon: 'report', sub: 'of accepted' },
    { label: 'Click-through rate', value: fmtPct(wm.clickThroughRate), color: BRAND.pink, icon: 'ads_click', sub: 'of accepted' },
    { label: 'Inbox rate', value: fmtPct(wm.inboxRate), color: BRAND.purple, icon: 'inbox', sub: 'inbox vs spam' },
    { label: 'Delayed rate', value: fmtPct(wm.delayedRate, 2), color: BRAND.purpleDark, icon: 'schedule', sub: 'of accepted' },
    { label: 'Rejection rate', value: fmtPct(wm.rejectionRate, 2), color: BRAND.orangeDark, icon: 'block', sub: 'of targeted' },
  ];

  if (error) {
    return (
      <div className="flex-1 bg-[#F6F8FC] dark:bg-[#121214] text-on-surface font-sans">
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-6">
          <h1 className="md3-title-large text-on-surface">Analytics</h1>
          <p className="md3-body-medium text-[#E9371F] mt-2">Failed to load dataset: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F6F8FC] dark:bg-[#121214] text-on-surface font-sans">
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-6 flex flex-col gap-6">

        <div>
          <h1 className="md3-title-large text-on-surface">Analytics</h1>
          <p className="md3-body-medium text-on-surface-variant mt-0.5">
            Weighted deliverability across {loading ? '—' : cases.length} support cases
          </p>
        </div>

        {/* Overall weighted KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiTiles.map(tile => (
            <motion.div
              key={tile.label}
              whileHover={{ y: -2 }}
              className="bg-white dark:bg-[#1E1E22] border border-[#801ED7]/15 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-32"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl" style={{ background: `${tile.color}1A`, color: tile.color }}>
                  <span className="material-symbols-outlined text-[18px]">{tile.icon}</span>
                </div>
                <span className="md3-label-medium text-on-surface-variant">{tile.label}</span>
              </div>
              <div>
                <div className="text-3xl font-black" style={{ color: tile.color }}>{loading ? '—' : tile.value}</div>
                <div className="md3-label-small text-on-surface-variant mt-0.5">{tile.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Per-account rate comparisons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className={`${CHART_CARD} rounded-2xl p-5 shadow-xl`}>
            <h2 className="md3-title-small text-white mb-1">Accepted &amp; open rate by account</h2>
            <p className="md3-body-small text-[#C9C4FF] mb-4">Per-case accepted rate and confirmed open rate</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rateRows} margin={{ left: -8, right: 8, top: 4, bottom: 4 }}>
                  <CartesianGrid vertical={false} stroke={CHART_GRID} opacity={CHART_GRID_OPACITY} />
                  <XAxis dataKey="name" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} interval={0} angle={-25} textAnchor="end" height={50} />
                  <YAxis tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={v => `${Math.round(v * 100)}%`} domain={[0, 1]} />
                  <Tooltip {...CHART_TOOLTIP} cursor={CHART_CURSOR} formatter={(v: number, name) => [fmtPct(v), name === 'accepted_rate' ? 'Accepted' : 'Confirmed open']} />
                  <Legend wrapperStyle={{ color: '#C9C4FF' }} formatter={v => v === 'accepted_rate' ? 'Accepted rate' : 'Confirmed open rate'} />
                  <Bar dataKey="accepted_rate" fill={BRAND.purple} radius={CHART_BAR_RADIUS} name="accepted_rate" />
                  <Bar dataKey="confirmed_open_rate" fill={BRAND.pink} radius={CHART_BAR_RADIUS} name="confirmed_open_rate" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`${CHART_CARD} rounded-2xl p-5 shadow-xl`}>
            <h2 className="md3-title-small text-white mb-1">Bounce &amp; complaint rate by account</h2>
            <p className="md3-body-small text-[#C9C4FF] mb-4">Per-case bounce rate and spam complaint rate</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rateRows} margin={{ left: -8, right: 8, top: 4, bottom: 4 }}>
                  <CartesianGrid vertical={false} stroke={CHART_GRID} opacity={CHART_GRID_OPACITY} />
                  <XAxis dataKey="name" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} interval={0} angle={-25} textAnchor="end" height={50} />
                  <YAxis tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={v => `${(v * 100).toFixed(1)}%`} domain={[0, 'auto']} />
                  <Tooltip {...CHART_TOOLTIP} cursor={CHART_CURSOR} formatter={(v: number, name) => [fmtPct(v, name === 'complaint_rate' ? 3 : 2), name === 'bounce_rate' ? 'Bounce' : 'Complaint']} />
                  <Legend wrapperStyle={{ color: '#C9C4FF' }} formatter={v => v === 'bounce_rate' ? 'Bounce rate' : 'Complaint rate'} />
                  <Bar dataKey="bounce_rate" fill={BRAND.orangeDark} radius={CHART_BAR_RADIUS} name="bounce_rate" />
                  <Bar dataKey="complaint_rate" fill={BRAND.orange} radius={CHART_BAR_RADIUS} name="complaint_rate" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Delivery composition + placement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className={`${CHART_CARD} rounded-2xl p-5 shadow-xl`}>
            <h2 className="md3-title-small text-white mb-1">Delivery composition by account</h2>
            <p className="md3-body-small text-[#C9C4FF] mb-4">Accepted, delayed, bounced and rejected counts</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compositionRows} margin={{ left: -8, right: 8, top: 4, bottom: 4 }}>
                  <CartesianGrid vertical={false} stroke={CHART_GRID} opacity={CHART_GRID_OPACITY} />
                  <XAxis dataKey="name" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} interval={0} angle={-25} textAnchor="end" height={50} />
                  <YAxis tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={v => fmtNum(v)} />
                  <Tooltip {...CHART_TOOLTIP} cursor={CHART_CURSOR} formatter={(v: number, name) => [fmtNum(v), String(name).charAt(0).toUpperCase() + String(name).slice(1)]} />
                  <Legend wrapperStyle={{ color: '#C9C4FF' }} formatter={v => String(v).charAt(0).toUpperCase() + String(v).slice(1)} />
                  <Bar stackId="d" dataKey="accepted" fill={BRAND.purple} name="accepted" />
                  <Bar stackId="d" dataKey="delayed" fill={BRAND.purpleLight} name="delayed" />
                  <Bar stackId="d" dataKey="bounced" fill={BRAND.orangeDark} name="bounced" />
                  <Bar stackId="d" dataKey="rejected" fill={BRAND.orange} radius={CHART_BAR_RADIUS} name="rejected" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`${CHART_CARD} rounded-2xl p-5 shadow-xl`}>
            <h2 className="md3-title-small text-white mb-1">Inbox placement by account</h2>
            <p className="md3-body-small text-[#C9C4FF] mb-4">Inbox rate (inbox vs spam panel/seed)</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={placementRows} margin={{ left: -8, right: 8, top: 4, bottom: 4 }}>
                  <CartesianGrid vertical={false} stroke={CHART_GRID} opacity={CHART_GRID_OPACITY} />
                  <XAxis dataKey="name" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} interval={0} angle={-25} textAnchor="end" height={50} />
                  <YAxis tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={v => `${Math.round(v * 100)}%`} domain={[0, 1]} />
                  <Tooltip {...CHART_TOOLTIP} cursor={CHART_CURSOR} formatter={(v: number) => [fmtPct(v), 'Inbox rate']} />
                  <Bar dataKey="inbox_rate" radius={CHART_BAR_RADIUS} name="inbox_rate">
                    {placementRows.map((row, i) => (
                      <Cell key={i} fill={BRAND.purple} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Case volume by created date (real per-case timestamps) */}
        <div className={`${CHART_CARD} rounded-2xl p-5 shadow-xl`}>
          <h2 className="md3-title-small text-white mb-1">Case volume by day</h2>
          <p className="md3-body-small text-[#C9C4FF] mb-4">Cases opened per day (from case_created_at)</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeByDay} margin={{ left: -8, right: 8, top: 4, bottom: 4 }}>
                <CartesianGrid vertical={false} stroke={CHART_GRID} opacity={CHART_GRID_OPACITY} />
                <XAxis dataKey="label" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...CHART_TOOLTIP} cursor={CHART_CURSOR} formatter={(v: number) => [String(v), 'Cases']} />
                <Bar dataKey="count" fill={CHART_SERIES[1]} radius={CHART_BAR_RADIUS} name="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
