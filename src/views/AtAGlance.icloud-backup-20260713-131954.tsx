import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Bar, BarChart, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import HeaderUtilityChips from '../components/HeaderUtilityChips';
import { useSupportCases } from '../hooks/useSupportCases';
import { isOpenCase, type CaseRecord } from '../services/caseDataset';
import { md3Ease, md3Enter } from '../lib/md3Motion';

interface AtAGlanceProps {
  onNavigate?: (view: 'glance' | 'charts' | 'investigation' | 'tools' | 'user_guide') => void;
  setGlobalSearch?: (val: string) => void;
}

const NEWS_ICON_URL = '/dashboard/google-news-icon.svg';
const TOPIC_GROUPS: Record<string, string[]> = {
  'Microsoft blocking': ['microsoft', 'outlook', 'hotmail', 's3150', 'block'],
  'Gmail deferrals': ['gmail', 'deferral', 'throttle', 'rate limit'],
  'Authentication / DNS': ['spf', 'dkim', 'dmarc', 'dns', 'authentication'],
  'Bounce spike': ['bounce', 'hard bounce', 'soft bounce', 'invalid recipient'],
  'Complaint / reputation': ['complaint', 'reputation', 'jmrp'],
  'Spam placement / engagement': ['spam placement', 'inbox placement', 'open rate', 'engagement'],
  'Reporting discrepancy': ['reporting', 'duplicate', 'event', 'webhook', 'metrics'],
  'IP warming / volume': ['warming', 'volume', 'ramp', 'send increase'],
  'Configuration / setup': ['configuration', 'setup', 'subdomain', 'domain setup'],
};
const TOPIC_COLORS = ['#2976E6', '#7BAAFF', '#40A96B', '#E6A21A', '#E56859'];

function dateLabel(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function daysBetween(start: string, end: Date) {
  const startDate = new Date(start);
  return Number.isNaN(startDate.getTime()) ? 0 : Math.max(0, Math.floor((end.getTime() - startDate.getTime()) / 86_400_000));
}

function median(values: number[]) {
  if (!values.length) return 0;
  const ordered = [...values].sort((a, b) => a - b);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
}

function startOfWeek(date: Date) {
  const result = new Date(date);
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  result.setHours(0, 0, 0, 0);
  return result;
}

function isSameDay(iso: string, target: Date) {
  return Boolean(iso) && iso.slice(0, 10) === target.toISOString().slice(0, 10);
}

function topicForCase(caseRecord: CaseRecord) {
  // Receiver dimensions are deliberately excluded: they are broad filters, not the case's topic.
  const source = [caseRecord.case_subject, caseRecord.issue_type, caseRecord.root_cause_summary, caseRecord.tags.join(' ')].join(' ').toLowerCase();
  return Object.entries(TOPIC_GROUPS).find(([, terms]) => terms.some(term => source.includes(term)))?.[0] ?? (caseRecord.issue_type || 'Other');
}

function receiverFamily(value: string) {
  const text = value.toLowerCase();
  if (/(outlook|hotmail|live|msn|microsoft)/.test(text)) return 'Microsoft';
  if (/(gmail|googlemail|google)/.test(text)) return 'Gmail';
  if (/(yahoo|aol|verizon)/.test(text)) return 'Yahoo / AOL';
  if (/(icloud|apple|\.me$|mac\.com)/.test(text)) return 'Apple Mail';
  return 'Corporate / B2B';
}

function receiverSignals(caseRecord: CaseRecord) {
  if (caseRecord.bounces.length) return caseRecord.bounces.map(bounce => bounce.domain);
  const text = [caseRecord.case_subject, caseRecord.issue_type, caseRecord.root_cause_summary, caseRecord.tags.join(' ')].join(' ').toLowerCase();
  const matched = ['Microsoft', 'Gmail', 'Yahoo / AOL', 'Apple Mail'].filter(receiver => receiverFamily(receiver) && (
    (receiver === 'Microsoft' && /(microsoft|outlook|hotmail)/.test(text))
    || (receiver === 'Gmail' && /(gmail|googlemail)/.test(text))
    || (receiver === 'Yahoo / AOL' && /(yahoo|aol)/.test(text))
    || (receiver === 'Apple Mail' && /(apple|icloud|mailbox-full)/.test(text))
  ));
  return matched.length ? matched : [caseRecord.mailbox_providers[0] || 'Corporate / B2B'];
}

function isHighImpact(caseRecord: CaseRecord, reference: Date) {
  const contractEnd = new Date(caseRecord.contract_end_date);
  return caseRecord.case_priority === 'High'
    || caseRecord.case_priority === 'Critical'
    || caseRecord.current_carr_gbp >= 250_000
    || (!Number.isNaN(contractEnd.getTime()) && contractEnd >= reference && contractEnd.getTime() - reference.getTime() <= 90 * 86_400_000);
}

function hasCustomerReplyToday(caseRecord: CaseRecord, reference: Date) {
  return caseRecord.case_thread.some(message => isSameDay(message.timestamp, reference) && message.direction === 'inbound' && (message.sender_type === 'contact' || message.sender_type === 'external'));
}

function Panel({ children, className = '', delay }: { children: React.ReactNode; className?: string; delay: number }) {
  return <motion.section {...md3Enter} transition={{ duration: 0.34, delay, ease: md3Ease }} className={`rounded-[20px] bg-[#F4F7FB] shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] ${className}`}>{children}</motion.section>;
}

function SectionTitle({ children, supporting }: { children: React.ReactNode; supporting?: string }) {
  return <div><h2 className="text-[20px] font-semibold leading-tight text-[#4F565E]">{children}</h2>{supporting && <p className="mt-1 text-[12px] font-medium text-[#858C94]">{supporting}</p>}</div>;
}

function Kpi({
  label,
  value,
  detail,
  accent = 'blue',
  delay,
  square = false,
}: {
  label: string;
  value: string;
  detail: string;
  accent?: 'blue' | 'amber' | 'red' | 'green';
  delay: number;
  square?: boolean;
}) {
  const color = {
    blue: 'text-[#2976E6]',
    amber: 'text-[#C98200]',
    red: 'text-[#E35D4F]',
    green: 'text-[#2D9B55]',
  }[accent];

  return (
    <Panel
      delay={delay}
      className={`min-w-0 px-5 py-5 ${square ? 'aspect-square flex flex-col' : 'min-h-[144px]'}`}
    >
      <div className="text-[15px] font-semibold leading-snug text-[#707780]">{label}</div>
      <div className="mt-2 text-[48px] font-medium leading-none tracking-normal text-[#363C42]">{value}</div>
      <div className={`mt-auto pt-3 text-[13px] font-semibold leading-snug ${color}`}>{detail}</div>
    </Panel>
  );
}

function MiniStat({ value, label, tone = 'blue' }: { value: string | number; label: string; tone?: 'blue' | 'amber' | 'red' | 'green' }) {
  const color = { blue: 'text-[#2976E6]', amber: 'text-[#C98200]', red: 'text-[#E35D4F]', green: 'text-[#2D9B55]' }[tone];
  return <div className="rounded-[14px] bg-white px-3 py-3"><div className={`text-[22px] font-semibold leading-none ${color}`}>{value}</div><div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[#858C94]">{label}</div></div>;
}

export default function AtAGlance(_props: AtAGlanceProps) {
  const support = useSupportCases();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [dashboardLayout, setDashboardLayout] = useState<'compact' | 'inline' | 'wide'>('compact');

  // The dashboard shares its row with Gemini, so viewport breakpoints are not
  // reliable. Read the actual available dashboard width and retain its normal
  // two-column composition whenever the Daily Brief and 2x2 KPI grid fit.
  useEffect(() => {
    const element = dashboardRef.current;
    if (!element) return;
    const update = () => {
      const width = element.clientWidth;
      setDashboardLayout(width >= 1040 ? 'wide' : width >= 720 ? 'inline' : 'compact');
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const dashboard = useMemo(() => {
    const allCases = support.cases;
    const open = allCases.filter(isOpenCase);
    const closed = allCases.filter(caseRecord => caseRecord.case_status === 'Closed' && caseRecord.case_closed_at);
    const newest = [...allCases.map(caseRecord => caseRecord.case_updated_at), ...closed.map(caseRecord => caseRecord.case_closed_at)].filter(Boolean).sort().at(-1);
    const reference = newest ? new Date(newest) : new Date();
    const weekStart = startOfWeek(reference);
    const ages = open.map(caseRecord => daysBetween(caseRecord.case_created_at, reference));
    const updatedToday = open.filter(caseRecord => isSameDay(caseRecord.case_updated_at, reference)).length;
    const repliesToday = open.filter(caseRecord => hasCustomerReplyToday(caseRecord, reference)).length;
    const resolvedThisWeek = closed.filter(caseRecord => new Date(caseRecord.case_closed_at) >= weekStart && new Date(caseRecord.case_closed_at) <= reference).length;
    const highImpact = open.filter(caseRecord => isHighImpact(caseRecord, reference));
    const oldest = Math.max(0, ...ages);
    const aged = ages.filter(age => age > 5).length;

    const volume = new Map<string, { key: string; date: string; opened: number; resolved: number; backlog: number }>();
    const ensure = (key: string) => { if (!volume.has(key)) volume.set(key, { key, date: dateLabel(key), opened: 0, resolved: 0, backlog: 0 }); return volume.get(key)!; };
    allCases.forEach(caseRecord => { if (caseRecord.case_created_at) ensure(caseRecord.case_created_at.slice(0, 10)).opened += 1; });
    closed.forEach(caseRecord => { if (caseRecord.case_closed_at) ensure(caseRecord.case_closed_at.slice(0, 10)).resolved += 1; });
    let backlog = 0;
    const volumeByDate = [...volume.values()].sort((a, b) => a.key.localeCompare(b.key)).map(row => ({ ...row, backlog: backlog += row.opened - row.resolved }));
    const openedTotal = volumeByDate.reduce((sum, row) => sum + row.opened, 0);
    const resolvedTotal = volumeByDate.reduce((sum, row) => sum + row.resolved, 0);

    const ageBuckets = [{ label: '<24h', count: 0 }, { label: '1-2d', count: 0 }, { label: '3-5d', count: 0 }, { label: '5d+', count: 0 }];
    ages.forEach(age => { if (age < 1) ageBuckets[0].count += 1; else if (age <= 2) ageBuckets[1].count += 1; else if (age <= 5) ageBuckets[2].count += 1; else ageBuckets[3].count += 1; });

    const topicMap = new Map<string, CaseRecord[]>();
    open.forEach(caseRecord => { const topic = topicForCase(caseRecord); topicMap.set(topic, [...(topicMap.get(topic) ?? []), caseRecord]); });
    const topics = [...topicMap.entries()].map(([topic, items], index) => ({ topic, count: items.length, accounts: new Set(items.map(item => item.account_name)).size, oldest: Math.max(...items.map(item => daysBetween(item.case_created_at, reference))), color: TOPIC_COLORS[index % TOPIC_COLORS.length] })).sort((a, b) => b.count - a.count).slice(0, 4);

    const industryMap = new Map<string, CaseRecord[]>();
    open.forEach(caseRecord => { const industry = caseRecord.industry_rollup || caseRecord.macro_classification || 'Other'; industryMap.set(industry, [...(industryMap.get(industry) ?? []), caseRecord]); });
    const industries = [...industryMap.entries()].map(([industry, items]) => ({ industry, count: items.length, accounts: new Set(items.map(item => item.account_name)).size, highImpact: items.filter(item => isHighImpact(item, reference)).length })).sort((a, b) => b.count - a.count).slice(0, 4);

    const receiverMap = new Map<string, { cases: CaseRecord[]; domains: string[] }>();
    open.forEach(caseRecord => {
      const signals = receiverSignals(caseRecord);
      new Set(signals.map(receiverFamily)).forEach(receiver => {
        const entry = receiverMap.get(receiver) ?? { cases: [], domains: [] };
        entry.cases.push(caseRecord); entry.domains.push(...signals.filter(signal => receiverFamily(signal) === receiver)); receiverMap.set(receiver, entry);
      });
    });
    const receivers = [...receiverMap.entries()].map(([receiver, entry]) => ({ receiver, count: entry.cases.length, accounts: new Set(entry.cases.map(item => item.account_name)).size, oldest: Math.max(...entry.cases.map(item => daysBetween(item.case_created_at, reference))) })).sort((a, b) => b.count - a.count).slice(0, 4);

    const actionQueue = [...open].sort((a, b) => {
      const reply = Number(hasCustomerReplyToday(b, reference)) - Number(hasCustomerReplyToday(a, reference));
      if (reply) return reply;
      const impact = Number(isHighImpact(b, reference)) - Number(isHighImpact(a, reference));
      if (impact) return impact;
      return daysBetween(b.case_created_at, reference) - daysBetween(a.case_created_at, reference);
    }).slice(0, 5).map(caseRecord => {
      const age = daysBetween(caseRecord.case_created_at, reference);
      const replied = hasCustomerReplyToday(caseRecord, reference);
      const high = isHighImpact(caseRecord, reference);
      return { account: caseRecord.account_name, caseNumber: caseRecord.case_number, subject: caseRecord.case_subject, topic: topicForCase(caseRecord), owner: caseRecord.case_owner, priority: caseRecord.case_priority, age, why: replied ? 'Customer reply received' : high ? 'High-impact account' : age > 5 ? 'Ageing open case' : 'Recent activity' };
    });

    return { openCount: open.length, updatedToday, repliesToday, resolvedThisWeek, highImpactAccounts: new Set(highImpact.map(item => item.account_name)).size, oldest, medianAge: median(ages), aged, volumeByDate, openedTotal, resolvedTotal, ageBuckets, topics, industries, receivers, actionQueue };
  }, [support]);

  const netBacklog = dashboard.openedTotal - dashboard.resolvedTotal;

  return <div
    ref={dashboardRef}
    className={`atglance-root h-full min-h-0 overflow-auto bg-white px-[18px] py-[16px] xl:px-[22px] 2xl:px-[28px]${dashboardLayout !== 'compact' ? ' atglance-wide-layout' : ''}${dashboardLayout === 'inline' ? ' atglance-inline-layout' : ''}`}
  >
    <div className="atglance-shell">
      <main className="dashboard-kpi-main min-w-0 space-y-[18px]">
        <section
    className="dashboard-kpi-grid"
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      gap: '18px',
      width: '100%',
      alignItems: 'start',
    }}
  >
          <Kpi
            label="Open Queue"
            value={String(dashboard.openCount)}
            detail={`${dashboard.updatedToday} touched today`}
            delay={0.04}
            square
          />
          <Kpi
            label="Customer Activity"
            value={String(dashboard.repliesToday)}
            detail={dashboard.repliesToday ? 'Replies to review first' : `${dashboard.updatedToday} cases updated`}
            accent={dashboard.repliesToday ? 'amber' : 'blue'}
            delay={0.08}
            square
          />
          <Kpi
            label="Ageing Queue"
            value={`${dashboard.aged}`}
            detail={`${dashboard.oldest}d oldest · ${dashboard.medianAge.toFixed(1)}d median`}
            accent={dashboard.aged ? 'red' : 'green'}
            delay={0.12}
            square
          />
          <Kpi
            label="Resolution This Week"
            value={String(dashboard.resolvedThisWeek)}
            detail={`${dashboard.highImpactAccounts} high-impact accounts open`}
            accent={dashboard.resolvedThisWeek ? 'green' : 'amber'}
            delay={0.16}
            square
          />
        </section>

        <section className="atglance-split grid gap-[18px]">
          <Panel delay={0.2} className="min-h-[328px] px-6 py-6"><SectionTitle supporting={`${dashboard.volumeByDate.length}-day view · ${dashboard.openedTotal} opened · ${dashboard.resolvedTotal} resolved · ${netBacklog >= 0 ? '+' : ''}${netBacklog} net backlog`}>Queue Pulse</SectionTitle><div className="mt-4 h-[232px]"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={dashboard.volumeByDate} margin={{ top: 4, right: 8, left: -26, bottom: 0 }}><CartesianGrid stroke="#E2E7ED" vertical={false} /><XAxis dataKey="date" tick={{ fill: '#8A8F95', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: '#8A8F95', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: 'rgba(41,118,230,0.08)' }} /><Bar dataKey="opened" name="Opened" fill="#2976E6" radius={[7, 7, 0, 0]} /><Line dataKey="resolved" name="Resolved" type="monotone" stroke="#31A65D" strokeWidth={3} dot={{ r: 3 }} /><Line dataKey="backlog" name="Open backlog" type="monotone" stroke="#7E8791" strokeWidth={2.5} dot={false} /></ComposedChart></ResponsiveContainer></div></Panel>
          <Panel delay={0.24} className="min-h-[328px] px-6 py-6"><SectionTitle supporting={`Oldest ${dashboard.oldest}d · Median ${dashboard.medianAge.toFixed(1)}d`}>Open Queue Age</SectionTitle><div className="mt-6 space-y-5">{dashboard.ageBuckets.map((bucket, index) => <div key={bucket.label}><div className="mb-2 flex items-center justify-between text-[13px] font-semibold"><span className="text-[#5F666D]">{bucket.label}</span><span className="text-[#30363D]">{bucket.count} cases</span></div><div className="h-3 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full" style={{ width: `${dashboard.openCount ? Math.max(8, (bucket.count / dashboard.openCount) * 100) : 0}%`, background: ['#7BAAFF', '#6DA8E8', '#E6A21A', '#E56859'][index] }} /></div></div>)}</div><div className="mt-6 rounded-[13px] border border-[#F2D5D0] bg-[#FFF7F5] px-3 py-2.5 text-[12px] font-semibold text-[#A65043]">{dashboard.aged} cases have been open for more than five days.</div></Panel>
        </section>

        <Panel delay={0.28} className="px-6 py-6"><SectionTitle supporting="The issue types and customer segments concentrating the current queue.">Demand Concentration</SectionTitle><div className="atglance-demand-grid mt-5 grid gap-6"><div><div className="mb-3 text-[12px] font-bold uppercase tracking-wide text-[#858C94]">Common topics</div><div className="space-y-2.5">{dashboard.topics.map(item => <div key={item.topic} className="grid grid-cols-[12px_minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] bg-white px-3.5 py-3"><span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} /><div className="min-w-0"><div className="truncate text-[14px] font-semibold text-[#30363D]">{item.topic}</div><div className="mt-0.5 text-[12px] font-medium text-[#858C94]">{item.accounts} accounts · oldest {item.oldest}d</div></div><span className="text-[20px] font-semibold text-[#2976E6]">{item.count}</span></div>)}</div></div><div><div className="mb-3 text-[12px] font-bold uppercase tracking-wide text-[#858C94]">Industry impact</div><div className="space-y-2.5">{dashboard.industries.map(item => <div key={item.industry} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] bg-white px-3.5 py-3"><div className="min-w-0"><div className="truncate text-[14px] font-semibold text-[#30363D]">{item.industry}</div><div className="mt-0.5 text-[12px] font-medium text-[#858C94]">{item.accounts} accounts · {item.highImpact} high impact</div></div><span className="text-[20px] font-semibold text-[#2976E6]">{item.count}</span></div>)}</div></div></div></Panel>

        <section className="atglance-review-grid grid gap-[18px]">
          <Panel delay={0.32} className="min-h-[332px] px-6 py-6"><SectionTitle supporting="Receiver-side clusters derived from case evidence, not broad filters.">Receiver Watch</SectionTitle><div className="mt-5 space-y-3">{dashboard.receivers.map(item => <div key={item.receiver} className="flex items-center justify-between rounded-[14px] bg-white px-3.5 py-3"><div><div className="text-[14px] font-semibold text-[#30363D]">{item.receiver}</div><div className="mt-0.5 text-[12px] font-medium text-[#858C94]">{item.accounts} accounts · oldest {item.oldest}d</div></div><div className="text-right"><div className="text-[20px] font-semibold text-[#2976E6]">{item.count}</div><div className="text-[10px] font-bold uppercase tracking-wide text-[#858C94]">open</div></div></div>)}</div></Panel>
          <Panel delay={0.36} className="min-h-[332px] px-6 py-6"><SectionTitle supporting="Cases ordered by customer response, business impact, and time open.">Review Next</SectionTitle><div className="mt-4 divide-y divide-[#E6EBF0]">{dashboard.actionQueue.map(item => <div key={item.caseNumber} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-3.5 first:pt-0"><div className="min-w-0"><div className="truncate text-[15px] font-semibold text-[#2D3339]">{item.account} · {item.subject}</div><div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[12px] font-medium text-[#767E87]"><span>{item.why}</span><span>·</span><span>{item.topic}</span><span>·</span><span>{item.owner}</span></div></div><div className="text-right"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${item.priority === 'Critical' ? 'bg-[#FCE8E5] text-[#C34232]' : item.priority === 'High' ? 'bg-[#FFF1D4] text-[#A16600]' : item.priority === 'Medium' ? 'bg-[#E7F0FF] text-[#2976E6]' : 'bg-[#E7F5EC] text-[#2D8D52]'}`}>{item.priority}</span><div className="mt-1 text-[11px] font-semibold text-[#858C94]">{item.age}d open</div></div></div>)}</div></Panel>
        </section>
      </main>

      <motion.aside {...md3Enter} transition={{ duration: 0.38, delay: 0.14, ease: md3Ease }} className="atglance-daily-brief h-fit rounded-[26px] bg-[#F4F7FB] px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]"><div className="flex items-center justify-center gap-3"><img src={NEWS_ICON_URL} alt="Google News" className="h-[45px] w-[45px] object-contain" /><h1 className="text-[24px] font-semibold leading-none text-[#2976E6]">Daily Briefing</h1></div><div className="mt-5 h-px bg-[#CBD1D8]" /><div className="mt-4 flex justify-center"><HeaderUtilityChips /></div><div className="mt-7 space-y-6"><section><h2 className="text-[12px] font-bold uppercase tracking-wide text-[#858C94]">Queue Snapshot</h2><div className="mt-3 grid grid-cols-2 gap-3"><MiniStat value={dashboard.openCount} label="Open" /><MiniStat value={dashboard.repliesToday} label="Customer replies" tone={dashboard.repliesToday ? 'amber' : 'blue'} /><MiniStat value={`${dashboard.oldest}d`} label="Oldest open" tone={dashboard.oldest > 5 ? 'red' : 'green'} /><MiniStat value={dashboard.resolvedThisWeek} label="Resolved this week" tone="green" /></div></section><section><h2 className="text-[12px] font-bold uppercase tracking-wide text-[#858C94]">Focus Next</h2><div className="mt-3 space-y-2.5">{dashboard.actionQueue.slice(0, 3).map(item => <div key={item.caseNumber} className="rounded-[13px] bg-white px-3.5 py-3"><div className="text-[13px] font-semibold text-[#30363D]">{item.account}</div><div className="mt-1 text-[12px] font-medium text-[#767E87]">{item.why} · {item.age}d open</div></div>)}</div></section><section><h2 className="text-[12px] font-bold uppercase tracking-wide text-[#858C94]">Receiver Signals</h2><div className="mt-3 space-y-2">{dashboard.receivers.slice(0, 3).map(item => <div key={item.receiver} className="flex justify-between rounded-[12px] bg-white px-3 py-2.5 text-[13px] font-semibold"><span className="text-[#30363D]">{item.receiver}</span><span className="text-[#2976E6]">{item.count} open</span></div>)}</div></section><section><h2 className="text-[12px] font-bold uppercase tracking-wide text-[#858C94]">Latest News</h2><div className="mt-3 space-y-2">{[['Critical', 'Microsoft delivery issue update'], ['Warning', 'Gmail authentication reminder'], ['Info', 'Reporting delay notice']].map(([severity, headline]) => <div key={headline} className="rounded-[12px] bg-white px-3 py-2.5"><div className="text-[10px] font-bold uppercase tracking-wide text-[#2976E6]">{severity}</div><div className="mt-1 text-[12px] font-semibold leading-snug text-[#30363D]">{headline}</div></div>)}</div></section></div></motion.aside>
    </div>
  </div>;
}
