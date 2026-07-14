import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion } from 'motion/react';
import { useSupportCases } from '../hooks/useSupportCases';
import { isOpenCase, type CaseRecord } from '../services/caseDataset';
import { md3Ease, md3Enter } from '../lib/md3Motion';
import HeaderUtilityChips from '../components/HeaderUtilityChips';

interface AtAGlanceProps {
  onNavigate?: (view: 'glance' | 'charts' | 'investigation' | 'tools' | 'user_guide') => void;
  setGlobalSearch?: (value: string) => void;
  onOpenTicket?: (caseNumber: string) => void;
}

function dateLabel(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function daysBetween(start: string, end: Date) {
  const date = new Date(start);
  return Number.isNaN(date.getTime()) ? 0 : Math.max(0, Math.floor((end.getTime() - date.getTime()) / 86_400_000));
}

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function formatCarr(value: number) {
  if (value >= 1_000_000) return `GBP ${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 1_000) return `GBP ${Math.round(value / 1_000)}k`;
  return `GBP ${Math.round(value)}`;
}

function startOfWeek(date: Date) {
  const result = new Date(date);
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  result.setHours(0, 0, 0, 0);
  return result;
}

function isHighImpact(caseRecord: CaseRecord, reference: Date) {
  const contractEnd = new Date(caseRecord.contract_end_date);
  return caseRecord.case_priority === 'Critical'
    || caseRecord.case_priority === 'High'
    || caseRecord.current_carr_gbp >= 250_000
    || (!Number.isNaN(contractEnd.getTime()) && contractEnd >= reference && contractEnd.getTime() - reference.getTime() <= 90 * 86_400_000);
}

function severity(caseRecord: CaseRecord, reference: Date) {
  const age = daysBetween(caseRecord.case_created_at, reference);
  return (caseRecord.case_priority === 'Critical' ? 100 : caseRecord.case_priority === 'High' ? 70 : 35)
    + (isHighImpact(caseRecord, reference) ? 25 : 0)
    + Math.min(age, 20);
}

function Panel({ children, className = '', delay = 0, style }: { children: React.ReactNode; className?: string; delay?: number; style?: React.CSSProperties }) {
  return (
    <motion.section
      {...md3Enter}
      transition={{ duration: 0.32, delay, ease: md3Ease }}
      className={`rounded-lg border border-[#E1E6ED] bg-white ${className}`}
      style={style}
    >
      {children}
    </motion.section>
  );
}

function PanelTitle({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="border-b border-[#E8ECF1] px-5 py-4">
      <h2 className="text-[16px] font-semibold text-[#30363D]">{title}</h2>
      {detail && <p className="mt-1 text-[12px] leading-snug text-[#727981]">{detail}</p>}
    </div>
  );
}

function StatusPill({ value }: { value: string }) {
  const styles = value === 'Critical'
    ? 'bg-[#FDE8E6] text-[#B5382D]'
    : value === 'High'
      ? 'bg-[#FFF1D6] text-[#9A6200]'
      : 'bg-[#E7F0FF] text-[#2769C7]';
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles}`}>{value}</span>;
}

export default function AtAGlance({ onOpenTicket }: AtAGlanceProps) {
  const support = useSupportCases();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [dashboardLayout, setDashboardLayout] = useState<'compact' | 'mid' | 'full'>('compact');
  const [selectedAgeBand, setSelectedAgeBand] = useState('All cases');

  useEffect(() => {
    const element = dashboardRef.current;
    if (!element) return;
    const update = () => {
      const width = element.clientWidth;
      const geminiOpen = Boolean(element.closest('.gemini-inline-open'));
      setDashboardLayout(width >= (geminiOpen ? 1_360 : 1_120) ? 'full' : width >= 760 ? 'mid' : 'compact');
    };
    update();
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(element);
    const scope = element.closest('.app-responsive-scope');
    const classObserver = scope ? new MutationObserver(update) : null;
    classObserver?.observe(scope, { attributes: true, attributeFilter: ['class'] });
    return () => {
      resizeObserver.disconnect();
      classObserver?.disconnect();
    };
  }, []);

  const dashboard = useMemo(() => {
    const allCases = support.cases;
    const open = allCases.filter(isOpenCase);
    const closed = allCases.filter(item => item.case_status === 'Closed' && item.case_closed_at);
    const latest = [...allCases.map(item => item.case_updated_at), ...closed.map(item => item.case_closed_at)].filter(Boolean).sort().at(-1);
    const reference = latest ? new Date(latest) : new Date();
    const ages = open.map(item => daysBetween(item.case_created_at, reference));
    const critical = open.filter(item => item.case_priority === 'Critical' || item.case_priority === 'High');
    const ageing = open.filter(item => daysBetween(item.case_created_at, reference) > 5);
    const highImpact = open.filter(item => isHighImpact(item, reference));
    const weekStart = startOfWeek(reference);
    const resolvedThisWeek = closed.filter(item => new Date(item.case_closed_at) >= weekStart && new Date(item.case_closed_at) <= reference).length;
    const weekAgo = new Date(reference);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const openAtWeekAgo = allCases.filter(item => {
      const created = new Date(item.case_created_at);
      const closedAt = item.case_closed_at ? new Date(item.case_closed_at) : null;
      return created <= weekAgo && (!closedAt || closedAt > weekAgo);
    });
    const priorPriority = openAtWeekAgo.filter(item => item.case_priority === 'Critical' || item.case_priority === 'High').length;
    const newThisWeek = allCases.filter(item => {
      const created = new Date(item.case_created_at);
      return created >= weekAgo && created <= reference;
    }).length;

    const queueDates = new Map<string, { key: string; date: string; opened: number; resolved: number; backlog: number }>();
    const ensureDate = (key: string) => {
      if (!queueDates.has(key)) queueDates.set(key, { key, date: dateLabel(key), opened: 0, resolved: 0, backlog: 0 });
      return queueDates.get(key)!;
    };
    allCases.forEach(item => {
      if (item.case_created_at) ensureDate(item.case_created_at.slice(0, 10)).opened += 1;
    });
    closed.forEach(item => {
      if (item.case_closed_at) ensureDate(item.case_closed_at.slice(0, 10)).resolved += 1;
    });
    let backlog = 0;
    const movement = [...queueDates.values()]
      .sort((a, b) => a.key.localeCompare(b.key))
      .map(item => ({ ...item, backlog: backlog += item.opened - item.resolved }))
      .slice(-14);

    const ageBands = [
      { label: 'New', detail: '< 24h', count: ages.filter(age => age < 1).length, color: '#5B8DEF' },
      { label: 'In progress', detail: '1-5d', count: ages.filter(age => age >= 1 && age <= 5).length, color: '#7C67D9' },
      { label: 'Ageing', detail: '6-10d', count: ages.filter(age => age > 5 && age <= 10).length, color: '#E6A21A' },
      { label: 'Escalation risk', detail: '> 10d', count: ages.filter(age => age > 10).length, color: '#D8564A' },
    ];

    const accountMap = new Map<string, CaseRecord[]>();
    open.forEach(item => accountMap.set(item.account_name, [...(accountMap.get(item.account_name) || []), item]));
    const accounts = [...accountMap.entries()].map(([account, cases]) => {
      const sorted = [...cases].sort((a, b) => severity(b, reference) - severity(a, reference));
      const lead = sorted[0];
      return {
        account,
        caseNumber: lead.case_number,
        count: cases.length,
        priority: lead.case_priority,
        age: Math.max(...cases.map(item => daysBetween(item.case_created_at, reference))),
        highImpact: cases.some(item => isHighImpact(item, reference)),
        issue: lead.case_subject,
        carr: Math.max(...cases.map(item => item.current_carr_gbp || 0)),
        renewalDays: !Number.isNaN(new Date(lead.contract_end_date).getTime())
          ? Math.max(0, daysBetween(reference.toISOString(), new Date(lead.contract_end_date)))
          : null,
        score: severity(lead, reference),
      };
    }).sort((a, b) => b.score - a.score).slice(0, 6);

    const attention = [...open].sort((a, b) => severity(b, reference) - severity(a, reference)).slice(0, 6).map(item => ({
      account: item.account_name,
      caseNumber: item.case_number,
      subject: item.case_subject,
      priority: item.case_priority,
      age: daysBetween(item.case_created_at, reference),
      carr: item.current_carr_gbp,
      reason: item.case_priority === 'Critical'
        ? 'Critical priority'
        : isHighImpact(item, reference)
          ? 'Business exposure'
          : daysBetween(item.case_created_at, reference) > 5
            ? 'Ageing case'
            : 'Priority case',
    }));

    return {
      openCount: open.length,
      accountCount: new Set(open.map(item => item.account_name)).size,
      criticalCount: critical.length,
      ageingCount: ageing.length,
      highImpactCount: highImpact.length,
      oldest: Math.max(0, ...ages),
      medianAge: median(ages),
      resolvedThisWeek,
      newThisWeek,
      backlogDelta: open.length - openAtWeekAgo.length,
      priorityDelta: critical.length - priorPriority,
      movement,
      ageBands,
      accounts,
      attention,
    };
  }, [support]);

  const openTicket = (caseNumber: string) => onOpenTicket?.(caseNumber);
  const selectedBand = selectedAgeBand === 'All cases'
    ? null
    : dashboard.ageBands.find(band => band.label === selectedAgeBand) ?? null;
  const totalAgeBandCount = dashboard.ageBands.reduce((sum, band) => sum + band.count, 0) || 1;

  return (
    <div ref={dashboardRef} className={`atglance-root atglance-${dashboardLayout}-layout h-full min-h-0 overflow-auto bg-white px-5 py-5`}>
      <div className="atglance-report-layout mx-auto max-w-[1480px]">
        <main className="atglance-control-surface min-w-0">
          <section className="grid grid-cols-4 gap-6">
            <Panel delay={0.04} className="flex h-[172px] flex-col items-center justify-center border-0 px-5 py-5 text-center" style={{ backgroundColor: '#F4F7FB' }}>
              <div className="text-[15px] font-semibold text-[#8B9093]">Open</div>
              <div className="mt-4 text-[56px] font-medium leading-none text-[#5A5F62]">{dashboard.openCount}</div>
              <div className="mt-5 text-[14px] font-bold text-[#16A923]">+ {dashboard.newThisWeek} <span className="text-[#8B9093]">new today</span></div>
            </Panel>
            <Panel delay={0.08} className="flex h-[172px] flex-col items-center justify-center border-0 px-5 py-5 text-center" style={{ backgroundColor: '#F4F7FB' }}>
              <div className="text-[15px] font-semibold text-[#8B9093]">Closed WTD</div>
              <div className="mt-4 text-[56px] font-medium leading-none text-[#5A5F62]">{dashboard.resolvedThisWeek}</div>
              <div className="mt-5 text-[14px] font-bold text-[#16A923]">+ 1 <span className="text-[#8B9093]">vs last week</span></div>
            </Panel>
            <Panel delay={0.12} className="h-[172px] border-0" style={{ backgroundColor: '#F4F7FB' }} />
            <Panel delay={0.16} className="h-[172px] border-0" style={{ backgroundColor: '#F4F7FB' }} />
          </section>

          <section className="mt-8 grid grid-cols-2 gap-7">
            <Panel delay={0.2} className="min-h-[318px] border-0 px-6 py-6" style={{ backgroundColor: '#F4F7FB' }}>
              <h2 className="text-center text-[16px] font-semibold text-[#8B9093]">Open ticket poriority</h2>
              <div className="mt-5 flex flex-col items-center">
                <div
                  className="relative h-[205px] w-[205px] rounded-full"
                  style={{ background: 'conic-gradient(#15B800 0 40%, #FDB114 40% 72%, #F11F14 72% 100%)' }}
                >
                  <div className="absolute inset-[55px] rounded-full bg-[#F4F7FB]" />
                  <div className="absolute left-[171px] top-[79px] z-10 -translate-x-1/2 -translate-y-1/2 text-[18px] font-bold text-white drop-shadow-sm">10</div>
                  <div className="absolute left-[75px] top-[173px] z-10 -translate-x-1/2 -translate-y-1/2 text-[18px] font-bold text-white drop-shadow-sm">8</div>
                  <div className="absolute left-[44px] top-[55px] z-10 -translate-x-1/2 -translate-y-1/2 text-[18px] font-bold text-white drop-shadow-sm">7</div>
                </div>
                <div className="mt-5 flex items-center justify-center gap-6 text-[14px] font-semibold text-[#1F2328]">
                  <span className="inline-flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-full bg-[#15B800]" />Low</span>
                  <span className="inline-flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-full bg-[#FDB114]" />Medium</span>
                  <span className="inline-flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-full bg-[#F11F14]" />High</span>
                </div>
              </div>
            </Panel>
            <Panel delay={0.24} className="min-h-[318px] border-0" style={{ backgroundColor: '#F4F7FB' }} />
          </section>
        </main>

        <motion.aside {...md3Enter} transition={{ duration: 0.32, delay: 0.18, ease: md3Ease }} className="atglance-daily-brief h-fit rounded-[28px] border border-[#E1E6ED] bg-[#F4F7FB] p-6">
          <div className="flex items-center justify-center gap-3">
            <img src="/dashboard/google-news-icon.svg" alt="" className="h-11 w-11 object-contain" />
            <h2 className="text-[25px] font-semibold text-[#2769C7]">Daily Briefing</h2>
          </div>
          <div className="mt-5 h-px bg-[#CBD1D8]" />
          <div className="mt-5 flex justify-center"><HeaderUtilityChips /></div>
          <div className="mt-7 space-y-5">
            <div className="rounded-[22px] bg-white px-5 py-4">
              <div className="text-[12px] font-semibold text-[#6D7681]">Today&apos;s focus</div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {[
                  ['Active', dashboard.openCount, '#2769C7'],
                  ['Priority', dashboard.criticalCount, '#B5382D'],
                  ['Ageing', dashboard.ageingCount, '#B46200'],
                  ['Exposed', dashboard.highImpactCount, '#5C337F'],
                ].map(([label, value, color]) => (
                  <div key={String(label)} className="rounded-[18px] bg-[#F7FAFD] px-3 py-3">
                    <div className="text-[26px] font-semibold leading-none" style={{ color: String(color) }}>{value}</div>
                    <div className="mt-2 text-[10px] font-semibold text-[#737A83]">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[22px] bg-white px-5 py-4">
              <div className="text-[12px] font-semibold text-[#6D7681]">Board movement</div>
              <div className="mt-3 space-y-3">
                <div className="flex items-baseline justify-between"><span className="text-[13px] text-[#525B65]">New this week</span><b className="text-[17px] text-[#300266]">{dashboard.newThisWeek}</b></div>
                <div className="flex items-baseline justify-between"><span className="text-[13px] text-[#525B65]">Resolved this week</span><b className="text-[17px] text-[#177A42]">{dashboard.resolvedThisWeek}</b></div>
                <div className="flex items-baseline justify-between"><span className="text-[13px] text-[#525B65]">Active queue change</span><b className={dashboard.backlogDelta > 0 ? 'text-[#B5382D]' : dashboard.backlogDelta < 0 ? 'text-[#177A42]' : 'text-[#68717A]'}>{dashboard.backlogDelta > 0 ? '+' : ''}{dashboard.backlogDelta}</b></div>
              </div>
            </div>

            <div className="rounded-[22px] bg-white px-5 py-4">
              <div className="text-[12px] font-semibold text-[#6D7681]">Focus accounts</div>
              <div className="mt-3 space-y-2.5">
                {dashboard.accounts.slice(0, 3).map(account => (
                  <button key={account.account} type="button" onClick={() => openTicket(account.caseNumber)} className="flex w-full items-center justify-between gap-3 rounded-[16px] bg-[#F7FAFD] px-3 py-3 text-left">
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold text-[#424A53]">{account.account}</div>
                      <div className="mt-1 truncate text-[11px] text-[#727A84]">{account.count} open case{account.count === 1 ? '' : 's'} · {formatCarr(account.carr)} CARR</div>
                    </div>
                    <span className="shrink-0 text-[18px] text-[#7A5BB5]">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
