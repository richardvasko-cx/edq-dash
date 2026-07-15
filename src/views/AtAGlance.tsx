import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bar, CartesianGrid, Cell, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion, type HTMLMotionProps } from 'motion/react';
import { useSupportCases } from '../hooks/useSupportCases';
import { isOpenCase, type CaseRecord } from '../services/caseDataset';
import { md3Ease, md3Enter } from '../lib/md3Motion';
import HeaderUtilityChips from '../components/HeaderUtilityChips';
import DateRangeControl, { type DateRange } from '../components/charts/DateRangeControl';

interface AtAGlanceProps {
  onNavigate?: (view: 'glance' | 'charts' | 'investigation' | 'tools' | 'user_guide') => void;
  setGlobalSearch?: (value: string) => void;
  onOpenTicket?: (caseNumber: string) => void;
}

function dateLabel(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  if (value >= 1_000_000) return `USD ${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 1_000) return `USD ${Math.round(value / 1_000)}k`;
  return `USD ${Math.round(value)}`;
}

function formatCompactUsd(value: number) {
  if (value >= 1_000_000) return `USD ${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 1_000) return `USD ${Math.round(value / 1_000)}k`;
  return `USD ${Math.round(value)}`;
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
    || caseRecord.current_carr_usd >= 320_000
    || (!Number.isNaN(contractEnd.getTime()) && contractEnd >= reference && contractEnd.getTime() - reference.getTime() <= 90 * 86_400_000);
}

function severity(caseRecord: CaseRecord, reference: Date) {
  const age = daysBetween(caseRecord.case_created_at, reference);
  return (caseRecord.case_priority === 'Critical' ? 100 : caseRecord.case_priority === 'High' ? 70 : 35)
    + (isHighImpact(caseRecord, reference) ? 25 : 0)
    + Math.min(age, 20);
}

function topicFor(caseRecord: CaseRecord) {
  const source = `${caseRecord.issue_type} ${caseRecord.support_category} ${caseRecord.root_cause_summary}`.toLowerCase();
  if (/(spf|dkim|dmarc|dns|authentic)/.test(source)) return 'Authentication';
  if (/(microsoft|google|yahoo|receiver|reputation|block|throttl|placement)/.test(source)) return 'Receiver delivery';
  if (/(bounce|invalid|suppression|list hygiene)/.test(source)) return 'Bounce and list quality';
  if (/(complaint|engagement|audience|spam)/.test(source)) return 'Audience engagement';
  if (/(warm|volume|ramp|send rate)/.test(source)) return 'Volume and warming';
  return caseRecord.issue_type || 'Investigation';
}

function renewalDays(caseRecord: CaseRecord, reference: Date) {
  const renewal = new Date(caseRecord.contract_end_date);
  return Number.isNaN(renewal.getTime()) ? null : Math.max(0, daysBetween(reference.toISOString(), renewal));
}

function Panel({
  children,
  className = '',
  delay = 0,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
} & Omit<HTMLMotionProps<'section'>, 'children' | 'className' | 'style'>) {
  return (
    <motion.section
      {...md3Enter}
      transition={{ duration: 0.32, delay, ease: md3Ease }}
      className={`relative rounded-md border border-[#C9CDD4] bg-white shadow-none ${className}`}
      {...props}
    >
      {children}
    </motion.section>
  );
}

function PanelTitle({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="border-b border-dotted border-[#DDE1E7] px-5 py-4">
      <h2 className="text-[17px] font-bold text-[#202124]">{title}</h2>
      {detail && <p className="mt-1 text-[12px] leading-snug text-[#727981]">{detail}</p>}
    </div>
  );
}

function OwnerFilter({
  owners,
  value,
  onChange,
}: {
  owners: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number; maxHeight: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = () => {
    if (open) {
      setOpen(false);
      return;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMenuPosition({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
      maxHeight: Math.max(160, window.innerHeight - rect.bottom - 12),
    });
    setOpen(true);
  };

  return (
    <div className="dashboard-panel-filter shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-12 w-full items-center gap-2 rounded-full border border-outline-variant/40 bg-white px-4 text-[13px] font-semibold text-on-surface shadow-[0_6px_18px_rgba(32,33,36,0.08)] transition-colors hover:bg-[#F1F3F4]"
      >
        <span className="material-symbols-outlined shrink-0 text-[18px] text-on-surface-variant">person</span>
        <span className="min-w-0 flex-1 truncate text-left">{value}</span>
        <span className={`material-symbols-outlined shrink-0 text-[18px] text-on-surface-variant transition-transform ${open ? 'rotate-180' : ''}`}>expand_more</span>
      </button>
      {open && menuPosition && (
        <>
          <button type="button" aria-label="Close owner menu" onClick={() => setOpen(false)} className="fixed inset-0 z-[140] cursor-default" />
          <div
            role="listbox"
            aria-label="Filter dashboard by owner"
            className="fixed z-[141] w-64 overflow-y-auto rounded-xl border border-[#E0E4EC] bg-white py-1.5 shadow-xl"
            style={{ top: menuPosition.top, right: menuPosition.right, maxHeight: menuPosition.maxHeight }}
          >
            <p className="sticky top-0 z-10 border-b border-[#F1F3F4] bg-white px-3 pb-1 pt-2 text-[9px] font-black uppercase tracking-widest text-[#747775]">Filter by owner</p>
            {['All owners', ...owners].map(owner => {
              const selected = owner === value;
              return (
                <button
                  key={owner}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => { onChange(owner); setOpen(false); }}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-[12px] font-medium transition-colors ${selected ? 'bg-[#F1F3F4] text-[#202124]' : 'text-[#3C4043] hover:bg-[#F1F3F4]'}`}
                >
                  <span className="truncate">{owner}</span>
                  {selected && <span className="material-symbols-outlined shrink-0 text-[17px] text-[#5F6368]">check</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function AtAGlance({ onOpenTicket }: AtAGlanceProps) {
  const support = useSupportCases();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [dashboardLayout, setDashboardLayout] = useState<'compact' | 'mid' | 'full'>('compact');
  const [attentionView, setAttentionView] = useState<'All' | 'Priority' | 'Ageing' | 'Exposure'>('All');
  const [exposureMetric, setExposureMetric] = useState<'carr' | 'open' | 'age' | 'history'>('carr');
  const [queueDateRange, setQueueDateRange] = useState<DateRange | null>(null);
  const [selectedOwner, setSelectedOwner] = useState('All owners');

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
    window.addEventListener('resize', update);
    const scope = element.closest('.app-responsive-scope');
    const classObserver = scope ? new MutationObserver(update) : null;
    classObserver?.observe(scope, { attributes: true, attributeFilter: ['class'] });
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', update);
      classObserver?.disconnect();
    };
  }, []);

  const dashboard = useMemo(() => {
    const sourceCases = support.cases;
    const sourceClosed = sourceCases.filter(item => item.case_status === 'Closed' && item.case_closed_at);
    const latest = [...sourceCases.map(item => item.case_updated_at), ...sourceClosed.map(item => item.case_closed_at)].filter(Boolean).sort().at(-1);
    const reference = latest ? new Date(latest) : new Date();
    const allCases = selectedOwner === 'All owners' ? sourceCases : sourceCases.filter(item => item.case_owner === selectedOwner);
    const open = allCases.filter(isOpenCase);
    const closed = allCases.filter(item => item.case_status === 'Closed' && item.case_closed_at);
    const ages = open.map(item => daysBetween(item.case_created_at, reference));
    const critical = open.filter(item => item.case_priority === 'Critical' || item.case_priority === 'High');
    const ageing = open.filter(item => daysBetween(item.case_created_at, reference) > 5);
    const highImpact = open.filter(item => isHighImpact(item, reference));
    const weekStart = startOfWeek(reference);
    const resolvedThisWeekCases = closed.filter(item => new Date(item.case_closed_at) >= weekStart && new Date(item.case_closed_at) <= reference);
    const resolvedThisWeek = resolvedThisWeekCases.length;
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
    const newToday = allCases.filter(item => item.case_created_at.slice(0, 10) === reference.toISOString().slice(0, 10)).length;
    const priorWeekStart = new Date(weekStart);
    priorWeekStart.setDate(priorWeekStart.getDate() - 7);
    const resolvedLastWeek = closed.filter(item => {
      const closedAt = new Date(item.case_closed_at);
      return closedAt >= priorWeekStart && closedAt < weekStart;
    }).length;
    const resolutionDurations = resolvedThisWeekCases.map(item => daysBetween(item.case_created_at, new Date(item.case_closed_at)));
    const escalationRiskCount = ages.filter(age => age > 10).length;
    const escalationRiskRate = open.length ? Math.round((escalationRiskCount / open.length) * 100) : 0;
    const resolutionRate = newThisWeek ? Math.round((resolvedThisWeek / newThisWeek) * 100) : 0;

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
    // Always render a continuous 30-day series, including quiet days, so range changes
    // compare the actual queue movement instead of only days where a case changed.
    for (let offset = 29; offset >= 0; offset -= 1) {
      const date = new Date(reference);
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - offset);
      ensureDate(toIsoDate(date));
    }
    const movement = [...queueDates.values()]
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-30)
      .map(item => {
        const point = new Date(`${item.key}T23:59:59`);
        return {
          ...item,
          backlog: allCases.filter(caseRecord => {
            const created = new Date(caseRecord.case_created_at);
            const closedAt = caseRecord.case_closed_at ? new Date(caseRecord.case_closed_at) : null;
            return created <= point && (!closedAt || closedAt > point);
          }).length,
        };
      });

    const ageBands = [
      { label: 'New', detail: '< 24h', count: ages.filter(age => age < 1).length, color: '#5B8DEF' },
      { label: 'In progress', detail: '1-5d', count: ages.filter(age => age >= 1 && age <= 5).length, color: '#7C67D9' },
      { label: 'Ageing', detail: '6-10d', count: ages.filter(age => age > 5 && age <= 10).length, color: '#E6A21A' },
      { label: 'Escalation risk', detail: '> 10d', count: ages.filter(age => age > 10).length, color: '#D8564A' },
    ];

    const accountMap = new Map<string, CaseRecord[]>();
    const accountHistoryMap = new Map<string, CaseRecord[]>();
    open.forEach(item => accountMap.set(item.account_name, [...(accountMap.get(item.account_name) || []), item]));
    allCases.forEach(item => accountHistoryMap.set(item.account_name, [...(accountHistoryMap.get(item.account_name) || []), item]));
    const accounts = [...accountMap.entries()].map(([account, cases]) => {
      const sorted = [...cases].sort((a, b) => severity(b, reference) - severity(a, reference));
      const lead = sorted[0];
      const history = accountHistoryMap.get(account) || cases;
      const renewal = renewalDays(lead, reference);
      const paidServiceLikelihood = Math.min(95, 18
        + (lead.case_priority === 'Critical' ? 28 : lead.case_priority === 'High' ? 18 : 8)
        + (cases.some(item => isHighImpact(item, reference)) ? 20 : 0)
        + (renewal !== null && renewal <= 90 ? 18 : 0)
        + Math.min(history.length * 3, 15));
      const carr = Math.max(...cases.map(item => item.current_carr_usd || 0));
      const oldestAge = Math.max(...cases.map(item => daysBetween(item.case_created_at, reference)));
      const paidServiceReason = renewal !== null && renewal <= 90
        ? `${lead.case_priority} delivery risk on ${formatCompactUsd(carr)} CARR has only ${renewal}d to renewal; resolve “${lead.case_subject}” before the commercial window closes.`
        : oldestAge >= 300
          ? `This ${lead.case_priority.toLowerCase()} case has remained open ${oldestAge}d on ${formatCompactUsd(carr)} CARR; prolonged exposure makes “${lead.case_subject}” an account-stability risk.`
          : history.length >= 2
            ? `${history.length} account cases and ${cases.length} open issue${cases.length === 1 ? '' : 's'} show a recurring pattern; ${formatCompactUsd(carr)} CARR raises the cost of leaving “${lead.case_subject}” unresolved.`
            : carr >= 1_500_000
              ? `${formatCompactUsd(carr)} CARR is attached to a ${lead.case_priority.toLowerCase()} issue; “${lead.case_subject}” warrants early containment even though renewal is ${renewal ?? 'not yet scheduled'}d away.`
              : `${lead.case_priority} priority, ${oldestAge}d open age and ${formatCompactUsd(carr)} CARR make “${lead.case_subject}” a material operational risk to contain.`;
      return {
        account,
        caseNumber: lead.case_number,
        count: cases.length,
        historyCount: history.length,
        industry: lead.industry_rollup || 'Other',
        priority: lead.case_priority,
        age: Math.max(...cases.map(item => daysBetween(item.case_created_at, reference))),
        highImpact: cases.some(item => isHighImpact(item, reference)),
        issue: lead.case_subject,
        carr: Math.max(...cases.map(item => item.current_carr_usd || 0)),
        renewalDays: renewal,
        paidServiceLikelihood,
        paidServiceReason,
        score: severity(lead, reference),
      };
    }).sort((a, b) => b.score - a.score).slice(0, 6);

    const attention = [...open].sort((a, b) => severity(b, reference) - severity(a, reference)).slice(0, 6).map(item => ({
      account: item.account_name,
      caseNumber: item.case_number,
      subject: item.case_subject,
      priority: item.case_priority,
      age: daysBetween(item.case_created_at, reference),
      carr: item.current_carr_usd,
      reason: item.case_priority === 'Critical'
        ? 'Critical priority'
        : isHighImpact(item, reference)
          ? 'Business exposure'
          : daysBetween(item.case_created_at, reference) > 5
            ? 'Ageing case'
            : 'Priority case',
    }));

    const priorityCounts = ['Critical', 'High', 'Medium', 'Low'].map(priority => ({
      priority,
      count: open.filter(item => item.case_priority === priority).length,
    }));
    const carrRepresented = new Map<string, CaseRecord>();
    highImpact.forEach(item => carrRepresented.set(item.account_id, item));
    const exposedCarr = [...carrRepresented.values()].reduce((sum, item) => sum + item.current_carr_usd, 0);
    const topics = [...allCases.reduce((groups, item) => {
      const topic = topicFor(item);
      groups.set(topic, [...(groups.get(topic) || []), item]);
      return groups;
    }, new Map<string, CaseRecord[]>()).entries()]
      .map(([topic, cases]) => {
        const accountOccurrences = new Map<string, number>();
        const providers = new Map<string, number>();
        cases.forEach(item => {
          accountOccurrences.set(item.account_id, (accountOccurrences.get(item.account_id) || 0) + 1);
          item.mailbox_providers.forEach(provider => providers.set(provider, (providers.get(provider) || 0) + 1));
        });
        const repeatIssues = [...accountOccurrences.values()].filter(count => count > 1).reduce((sum, count) => sum + count, 0);
        const resolved = cases.filter(item => item.case_status === 'Closed').length;
        const topProvider = [...providers.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'No provider signal';
        return {
          topic,
          count: cases.length,
          open: cases.filter(isOpenCase).length,
          repeatIssues,
          repeatRate: cases.length ? Math.round((repeatIssues / cases.length) * 100) : 0,
          resolutionRate: cases.length ? Math.round((resolved / cases.length) * 100) : 0,
          accounts: new Set(cases.map(item => item.account_id)).size,
          topProvider,
          oldest: Math.max(...cases.filter(isOpenCase).map(item => daysBetween(item.case_created_at, reference)), 0),
        };
      })
      .sort((a, b) => b.repeatIssues - a.repeatIssues || b.count - a.count);
    const receiverPatterns = [...open.reduce((groups, item) => {
      item.mailbox_providers.forEach(provider => groups.set(provider, [...(groups.get(provider) || []), item]));
      return groups;
    }, new Map<string, CaseRecord[]>()).entries()]
      .map(([provider, cases]) => ({ provider, count: cases.length, accounts: new Set(cases.map(item => item.account_id)).size, oldest: Math.max(...cases.map(item => daysBetween(item.case_created_at, reference))) }))
      .sort((a, b) => b.count - a.count || b.oldest - a.oldest);
    const industries = [...open.reduce((groups, item) => {
      const industry = item.industry_rollup || 'Other';
      groups.set(industry, [...(groups.get(industry) || []), item]);
      return groups;
    }, new Map<string, CaseRecord[]>()).entries()]
      .map(([industry, cases]) => ({ industry, count: cases.length, accounts: new Set(cases.map(item => item.account_id)).size }))
      .sort((a, b) => b.count - a.count);
    const owners = [...open.reduce((groups, item) => {
      groups.set(item.case_owner, [...(groups.get(item.case_owner) || []), item]);
      return groups;
    }, new Map<string, CaseRecord[]>()).entries()]
      .map(([owner, cases]) => ({ owner, count: cases.length, critical: cases.filter(item => item.case_priority === 'Critical' || item.case_priority === 'High').length, oldest: Math.max(...cases.map(item => daysBetween(item.case_created_at, reference))) }))
      .sort((a, b) => b.count - a.count || b.critical - a.critical);
    const ownerRoster = [...sourceCases.filter(isOpenCase).reduce((groups, item) => {
      groups.set(item.case_owner, [...(groups.get(item.case_owner) || []), item]);
      return groups;
    }, new Map<string, CaseRecord[]>()).entries()]
      .map(([owner, cases]) => ({ owner, count: cases.length, critical: cases.filter(item => item.case_priority === 'Critical' || item.case_priority === 'High').length, oldest: Math.max(...cases.map(item => daysBetween(item.case_created_at, reference))) }))
      .sort((a, b) => b.count - a.count || b.critical - a.critical);
    const oldestOpen = [...open].sort((a, b) => a.case_created_at.localeCompare(b.case_created_at))[0];
    const oldestTicket = oldestOpen ? {
      caseNumber: oldestOpen.case_number,
      account: oldestOpen.account_name,
      subject: oldestOpen.case_subject,
      priority: oldestOpen.case_priority,
      age: daysBetween(oldestOpen.case_created_at, reference),
      owner: oldestOpen.case_owner,
    } : null;

    return {
      openCount: open.length,
      accountCount: new Set(open.map(item => item.account_name)).size,
      criticalCount: critical.length,
      ageingCount: ageing.length,
      highImpactCount: highImpact.length,
      oldest: Math.max(0, ...ages),
      medianAge: median(ages),
      resolvedThisWeek,
      resolvedLastWeek,
      medianResolution: median(resolutionDurations),
      newThisWeek,
      newToday,
      backlogDelta: open.length - openAtWeekAgo.length,
      priorityDelta: critical.length - priorPriority,
      escalationRiskCount,
      escalationRiskRate,
      resolutionRate,
      exposedCarr,
      exposedAccountCount: carrRepresented.size,
      movement,
      ageBands,
      accounts,
      attention,
      priorityCounts,
      carrRepresented: exposedCarr,
      renewalsSoon: highImpact.filter(item => {
        const days = renewalDays(item, reference);
        return days !== null && days <= 90;
      }).length,
      topics,
      receiverPatterns,
      industries,
      owners,
      ownerRoster,
      oldestTicket,
    };
  }, [selectedOwner, support]);

  const openTicket = (caseNumber: string) => onOpenTicket?.(caseNumber);
  const queueDates = dashboard.movement.map(item => item.key);
  const queueDateRangeValue = queueDateRange
    && queueDates.includes(queueDateRange.from)
    && queueDates.includes(queueDateRange.to)
    ? queueDateRange
    : { from: queueDates[Math.max(0, queueDates.length - 14)] || '', to: queueDates.at(-1) || '' };
  const queueMovement = dashboard.movement.filter(item => item.key >= queueDateRangeValue.from && item.key <= queueDateRangeValue.to);
  const attentionAccounts = dashboard.accounts.filter(account => {
    if (attentionView === 'Priority') return account.priority === 'Critical' || account.priority === 'High';
    if (attentionView === 'Ageing') return account.age > 5;
    if (attentionView === 'Exposure') return account.highImpact;
    return true;
  });
  const exposureMetricOptions = [
    { key: 'carr' as const, label: 'Open CARR', unit: 'USD', description: 'Current recurring revenue attached to each account with an open ticket.' },
    { key: 'open' as const, label: 'Open tickets', unit: 'tickets', description: 'Number of active support tickets on the account.' },
    { key: 'age' as const, label: 'Oldest age', unit: 'days', description: 'Age of the account’s oldest currently open ticket.' },
    { key: 'history' as const, label: 'Case history', unit: 'cases', description: 'All historical and active support cases for the account.' },
  ];
  const selectedExposureMetric = exposureMetricOptions.find(option => option.key === exposureMetric) ?? exposureMetricOptions[0];
  const exposureValue = (account: (typeof attentionAccounts)[number]) => exposureMetric === 'carr'
    ? Math.round(account.carr / 1_000)
    : exposureMetric === 'open'
      ? account.count
      : exposureMetric === 'age'
        ? account.age
        : account.historyCount;
  const attentionChartData = attentionAccounts
    .map(account => ({ account: account.account, value: exposureValue(account) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const repeatPatternData = dashboard.topics.filter(topic => topic.count > 1).slice(0, 5);
  const criticalAccountCount = dashboard.accounts.filter(account => account.priority === 'Critical' || account.priority === 'High').length;
  const renewalRiskAccounts = dashboard.accounts.filter(account => account.renewalDays !== null && account.renewalDays <= 90);
  const renewalRiskCarr = renewalRiskAccounts.reduce((sum, account) => sum + account.carr, 0);

  return (
    <div className="relative h-full min-h-0 overflow-hidden">
    <div ref={dashboardRef} className={`atglance-root atglance-${dashboardLayout}-layout h-full min-h-0 overflow-auto bg-[#F3F4F7] px-5 py-5`}>
      <div className="atglance-shell w-full">
        <main className="atglance-control-surface min-w-0">
          <section className="dashboard-kpi-grid grid gap-5">
            <Panel
              delay={0.04}
              className="dashboard-summary-panel flex h-[320px] flex-col !border-[#300266] !bg-[#300266] p-5 text-white"
              data-gem-panel="Ticket intake"
              data-gem-panel-label="Ticket intake"
              data-gem-panel-content={`Ticket intake: ${dashboard.newThisWeek} cases opened this week, including ${dashboard.newToday} today. The active queue contains ${dashboard.openCount} tickets.`}
            >
              <div className="h-7 shrink-0 text-[13px] font-bold leading-6 text-white/75">Ticket intake</div>
              <div className="h-[88px] shrink-0 pt-2"><div className="text-[44px] font-black leading-none tracking-[-0.04em] text-[#FCA6FF]">{dashboard.newThisWeek}</div><div className="mt-1.5 text-[12px] font-semibold text-white">opened this week</div></div>
              <div className="min-h-0 flex-1 overflow-hidden border-y border-white/20 py-3"><div className="flex items-center justify-between text-[11px]"><span className="font-bold text-white">Weekly flow</span><span className="text-white/65">{dashboard.resolvedThisWeek} resolved</span></div><div className="mt-2 h-2 bg-white/15"><div className="h-2 bg-[#FCA6FF]" style={{ width: `${Math.min(100, Math.round((dashboard.resolvedThisWeek / Math.max(dashboard.newThisWeek, 1)) * 100))}%` }} /></div><p className="mt-2 line-clamp-2 text-[11px] leading-4 text-white/65">Queue {dashboard.backlogDelta > 0 ? `up ${dashboard.backlogDelta}` : dashboard.backlogDelta < 0 ? `down ${Math.abs(dashboard.backlogDelta)}` : 'flat'} versus last week · {dashboard.resolutionRate}% new-case resolution.</p></div>
              <div className="grid h-[68px] shrink-0 grid-cols-2 items-start pt-3 text-[11px]">
                <div><div className="text-[19px] font-black text-[#FFA524]">{dashboard.newToday}</div><div className="mt-0.5 text-white/65">today</div></div>
                <div className="border-l border-white/25 pl-4"><div className="text-[19px] font-black text-white">{dashboard.openCount}</div><div className="mt-0.5 text-white/65">open now</div></div>
              </div>
            </Panel>
            <Panel
              delay={0.08}
              className="dashboard-summary-panel flex h-[320px] flex-col !border-[#1557D0] !bg-white p-5 text-[#202124]"
              data-gem-panel="Critical accounts"
              data-gem-panel-label="Critical accounts"
              data-gem-panel-content={`Critical accounts: ${criticalAccountCount} accounts currently have critical or high-priority support risk, representing ${dashboard.criticalCount} priority tickets and ${dashboard.highImpactCount} high-impact tickets.`}
            >
              <div className="flex h-7 shrink-0 items-start justify-between gap-3"><div className="text-[13px] font-bold leading-6 text-[#4F5965]">Critical accounts</div><span className="rounded-full bg-[#FDE8E6] px-2.5 py-1 text-[10px] font-bold text-[#B3261E]">Business critical</span></div>
              <div className="h-[88px] shrink-0 pt-2"><div className="text-[44px] font-black leading-none tracking-[-0.04em] text-[#1557D0]">{criticalAccountCount}</div><div className="mt-1.5 text-[12px] font-semibold text-[#4F5965]">accounts at risk</div></div>
              <div className="min-h-0 flex-1 overflow-hidden border-y border-[#D8DCE3] py-3"><div className="mb-1.5 text-[10px] font-bold text-[#68717D]">Highest-risk accounts</div><div className="space-y-1">{dashboard.accounts.filter(account => account.priority === 'Critical' || account.priority === 'High').slice(0, 2).map(account => <div key={account.caseNumber} className="flex items-center justify-between gap-3 text-[10px] leading-4"><span className="min-w-0 truncate font-bold text-[#30363D]">{account.account}</span><span className="shrink-0 text-[#68717D]">{account.priority} · {formatCarr(account.carr)}</span></div>)}</div></div>
              <div className="grid h-[68px] shrink-0 grid-cols-2 items-start pt-3 text-[11px]">
                <div><div className="text-[19px] font-black text-[#B3261E]">{dashboard.criticalCount}</div><div className="mt-0.5 text-[#68717D]">priority tickets</div></div>
                <div className="border-l border-[#D8DCE3] pl-4"><div className="text-[19px] font-black text-[#202124]">{dashboard.highImpactCount}</div><div className="mt-0.5 text-[#68717D]">high-impact cases</div></div>
              </div>
            </Panel>
            <Panel
              delay={0.12}
              className="dashboard-summary-panel flex h-[320px] flex-col !border-[#86155F] !bg-[#86155F] p-5 text-white"
              data-gem-panel="Oldest open ticket"
              data-gem-panel-label="Oldest open ticket"
              data-gem-panel-content={dashboard.oldestTicket ? `Oldest open ticket: ${dashboard.oldestTicket.caseNumber} for ${dashboard.oldestTicket.account}, open ${dashboard.oldestTicket.age} days and owned by ${dashboard.oldestTicket.owner}.` : 'There are no open tickets.'}
            >
              <div className="h-7 shrink-0 text-[13px] font-bold leading-6 text-white/75">Oldest open ticket</div>
              <div className="h-[88px] shrink-0 pt-2"><div className="text-[44px] font-black leading-none tracking-[-0.04em] text-[#FCA6FF]">{dashboard.oldestTicket?.age ?? 0}d</div><div className="mt-1.5 text-[12px] font-semibold text-white">open without resolution</div></div>
              <div className="min-h-0 flex-1 overflow-hidden border-y border-white/20 py-3"><div className="flex items-center justify-between gap-3"><div className="text-[10px] font-bold text-white/55">Current issue</div><div className="max-w-[55%] truncate text-[10px] font-bold text-white">{dashboard.oldestTicket?.account ?? 'No open tickets'} · {dashboard.oldestTicket?.caseNumber ?? '—'}</div></div><p className="mt-1.5 line-clamp-1 text-[11px] font-semibold leading-4 text-white">{dashboard.oldestTicket?.subject ?? 'No active issue'}</p><div className="mt-2 flex items-center justify-between text-[10px] text-white/65"><span>Owner</span><span className="max-w-[65%] truncate font-bold text-white">{dashboard.oldestTicket?.owner ?? 'Unassigned'}</span></div></div>
              <div className="flex h-[68px] shrink-0 items-start pt-3"><button type="button" disabled={!dashboard.oldestTicket} onClick={() => dashboard.oldestTicket && openTicket(dashboard.oldestTicket.caseNumber)} className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#1557D0] px-3 text-[12px] font-bold text-white transition-colors hover:bg-[#0B49B7] disabled:cursor-default disabled:opacity-50">
                <span className="text-[19px] font-normal">→</span><span>View ticket</span>
              </button></div>
            </Panel>
            <Panel
              delay={0.16}
              className="dashboard-summary-panel flex h-[320px] flex-col !border-[#801ED7] !bg-[#801ED7] p-5 text-white"
              data-gem-panel="Renewal exposure"
              data-gem-panel-label="Renewal exposure"
              data-gem-panel-content={`Renewal exposure: ${renewalRiskAccounts.length} accounts with open support tickets renew within 90 days, representing ${formatCarr(renewalRiskCarr)} in current recurring revenue.`}
            >
              <div className="h-7 shrink-0 text-[13px] font-bold leading-6 text-white/75">Renewal exposure</div>
              <div className="h-[88px] shrink-0 pt-2"><div className="text-[44px] font-black leading-none tracking-[-0.04em] text-[#FCA6FF]">{renewalRiskAccounts.length}</div><div className="mt-1.5 text-[12px] font-semibold text-white">accounts renewing in 90 days</div></div>
              <div className="min-h-0 flex-1 overflow-hidden border-y border-white/20 py-3"><div className="mb-1.5 text-[10px] font-bold text-white/55">Upcoming renewals with open risk</div><div className="space-y-1">{renewalRiskAccounts.slice(0, 2).map(account => <div key={account.caseNumber} className="flex items-center justify-between gap-3 text-[10px] leading-4"><span className="min-w-0 truncate font-bold text-white">{account.account}</span><span className="shrink-0 text-white/65">{account.renewalDays}d · {formatCarr(account.carr)}</span></div>)}{!renewalRiskAccounts.length && <div className="text-[10px] leading-4 text-white/65">No open-ticket accounts renew in the next 90 days.</div>}</div></div>
              <div className="grid h-[68px] shrink-0 grid-cols-2 items-start pt-3 text-[11px]">
                <div className="min-w-0"><div className="truncate text-[16px] font-black text-white">{formatCarr(renewalRiskCarr)}</div><div className="mt-0.5 text-white/65">current CARR</div></div>
                <div className="border-l border-white/25 pl-4"><div className="text-[19px] font-black text-[#FFA524]">{renewalRiskAccounts.filter(account => account.priority === 'Critical' || account.priority === 'High').length}</div><div className="mt-0.5 text-white/65">priority accounts</div></div>
              </div>
            </Panel>
          </section>

          <section className="atglance-split mt-5 grid gap-5">
            <Panel
              delay={0.24}
              className="min-h-[348px] !border-[#300266] !bg-[#300266] p-5 text-white"
              data-gem-panel="Queue movement"
              data-gem-panel-label="Queue movement"
              data-gem-panel-content={`Queue movement from ${queueDateRangeValue.from} to ${queueDateRangeValue.to}. Opened this week: ${dashboard.newThisWeek}. Resolved this week: ${dashboard.resolvedThisWeek}. Queue change: ${dashboard.backlogDelta}.`}
            >
              <div className="h-full px-1 py-1">
                <div className="flex min-h-16 items-start justify-between gap-4">
                  <h2 className="text-[20px] font-black text-white">Queue movement</h2>
                  <DateRangeControl className="dashboard-panel-filter" dates={queueDates} value={queueDateRangeValue} onChange={setQueueDateRange} />
                </div>
                <div className="mt-2 h-[190px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={queueMovement} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(252,166,255,0.24)" vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: '#FCA6FF', fontSize: 11, fontWeight: 700 }} axisLine={{ stroke: '#FCA6FF' }} tickLine={false} />
                      <YAxis tick={{ fill: '#FCA6FF', fontSize: 11, fontWeight: 700 }} axisLine={{ stroke: '#FCA6FF' }} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        cursor={{ fill: 'rgba(252,166,255,0.08)' }}
                        contentStyle={{ background: '#210046', border: '1px solid #FCA6FF', borderRadius: 6, boxShadow: 'none', fontSize: 12, color: '#FFFFFF' }}
                        labelStyle={{ color: '#FCA6FF', fontWeight: 700 }}
                      />
                      <Bar dataKey="opened" name="Opened" fill="#FFA524" radius={[4, 4, 0, 0]} barSize={10} />
                      <Bar dataKey="resolved" name="Resolved" fill="#D56CE7" radius={[4, 4, 0, 0]} barSize={10} />
                      <Line type="monotone" dataKey="backlog" name="Open queue" stroke="#C0BAFF" strokeWidth={3} dot={false} activeDot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#C0BAFF' }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-3 border-t border-white/25 pt-3 text-center">
                  <div><div className="text-[24px] font-black text-[#FFA524]">{dashboard.newThisWeek}</div><div className="mt-0.5 text-[10px] font-semibold text-white/65">Opened this week</div></div>
                  <div className="border-x border-white/20"><div className="text-[24px] font-black text-[#FCA6FF]">{dashboard.resolvedThisWeek}</div><div className="mt-0.5 text-[10px] font-semibold text-white/65">Resolved this week</div></div>
                  <div><div className="text-[24px] font-black text-white">{dashboard.backlogDelta > 0 ? '+' : ''}{dashboard.backlogDelta}</div><div className="mt-0.5 text-[10px] font-semibold text-white/65">Queue change</div></div>
                </div>
              </div>
            </Panel>
            <Panel
              delay={0.28}
              className="min-h-[348px] !border-[#FFA524] !bg-white p-5 text-[#202124]"
              data-gem-panel="Owner workload"
              data-gem-panel-label="Owner workload"
              data-gem-panel-content={`Owner workload filtered to ${selectedOwner}. ${dashboard.ownerRoster.length} active owners overall. ${dashboard.ownerRoster.slice(0, 3).map(owner => `${owner.owner}: ${owner.count} open tickets, ${owner.critical} priority, oldest ${owner.oldest} days`).join(' ')}`}
            >
              <div className="flex min-h-16 items-start justify-between gap-4"><div><h2 className="text-[20px] font-black text-[#202124]">Owner workload</h2><p className="mt-1 text-[11px] text-[#68717D]">Select an owner to filter every Dashboard panel.</p></div><OwnerFilter owners={dashboard.ownerRoster.map(owner => owner.owner)} value={selectedOwner} onChange={setSelectedOwner} /></div>
              <div className="mt-4 grid grid-cols-3 border-y border-[#D8DCE3] py-3 text-center"><div><div className="text-[22px] font-black text-[#202124]">{dashboard.openCount}</div><div className="text-[10px] font-bold text-[#68717D]">Assigned tickets</div></div><div className="border-x border-[#D8DCE3]"><div className="text-[22px] font-black text-[#B3261E]">{dashboard.owners.reduce((sum, owner) => sum + owner.critical, 0)}</div><div className="text-[10px] font-bold text-[#68717D]">Priority tickets</div></div><div><div className="text-[22px] font-black text-[#1557D0]">{selectedOwner === 'All owners' ? dashboard.ownerRoster.length : 1}</div><div className="text-[10px] font-bold text-[#68717D]">Owners in view</div></div></div>
              <div className="mt-4"><div className="grid grid-cols-[minmax(110px,1fr)_44px_54px_54px] gap-2 border-b border-dotted border-[#D8DCE3] pb-2 text-[9px] font-bold text-[#68717D]"><span>Owner</span><span>Open</span><span>Priority</span><span>Oldest</span></div><div className="divide-y divide-dotted divide-[#D8DCE3]">{dashboard.ownerRoster.slice(0, 5).map(owner => <button type="button" onClick={() => setSelectedOwner(current => current === owner.owner ? 'All owners' : owner.owner)} key={owner.owner} className={`grid w-full grid-cols-[minmax(110px,1fr)_44px_54px_54px] items-center gap-2 px-1 py-2 text-left text-[11px] transition-colors ${selectedOwner === owner.owner ? 'bg-[#EEF4FF]' : 'hover:bg-[#F7F8FA]'}`}><div className="min-w-0"><div className={`truncate font-bold ${selectedOwner === owner.owner ? 'text-[#1557D0]' : 'text-[#30363D]'}`}>{owner.owner}</div><div className="mt-1 h-1.5 bg-[#E5E8ED]"><div className="h-1.5 bg-[#FFA524]" style={{ width: `${Math.max(8, (owner.count / Math.max(dashboard.ownerRoster[0]?.count ?? 1, 1)) * 100)}%` }} /></div></div><span className="font-bold text-[#1557D0]">{owner.count}</span><span className={owner.critical ? 'font-bold text-[#B3261E]' : 'text-[#68717D]'}>{owner.critical}</span><span className={owner.oldest > 10 ? 'font-bold text-[#B3261E]' : 'text-[#68717D]'}>{owner.oldest}d</span></button>)}</div></div>
            </Panel>
          </section>

        </main>

        <div className="atglance-wide-panels min-w-0">
          <section className="pb-5">
            <Panel
              delay={0.32}
              className="!border-[#1557D0] !bg-white p-5"
              data-gem-panel="Priority and business exposure"
              data-gem-panel-label="Priority and business exposure"
              data-gem-panel-content={`Priority and business exposure across top accounts. ${attentionAccounts.slice(0, 3).map(account => `${account.account}: ${formatCompactUsd(account.carr)} exposed, ${account.priority} priority, ${account.paidServiceLikelihood}% paid-services likelihood because ${account.paidServiceReason.toLowerCase()}`).join(' ')}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h2 className="text-[20px] font-black text-[#202124]">Priority and business exposure</h2><p className="mt-1 text-[12px] text-[#68717D]">Commercial value and operational risk attached to accounts with open support tickets.</p></div>
                <div className="flex flex-wrap gap-1 rounded-md border border-[#DDE1E7] bg-[#F1F3F4] p-1" aria-label="Filter accounts">
                  {(['All', 'Priority', 'Ageing', 'Exposure'] as const).map(view => <button type="button" key={view} onClick={() => setAttentionView(view)} className={`rounded-sm px-3 py-1.5 text-[11px] font-semibold transition-colors ${attentionView === view ? 'bg-[#1A73E8] text-white' : 'text-[#5F6368] hover:bg-white'}`}>{view}</button>)}
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 border border-[#D8DCE3] bg-[#F7F8FA] sm:grid-cols-5">
                <div className="p-3 sm:col-span-1"><div className="text-[10px] font-bold text-[#68717D]">Open-account CARR</div><div className="mt-1 text-[22px] font-black text-[#300266]">{formatCarr(attentionAccounts.reduce((sum, account) => sum + account.carr, 0))}</div></div>
                <div className="border-l border-[#D8DCE3] p-3"><div className="text-[10px] font-bold text-[#68717D]">Affected accounts</div><div className="mt-1 text-[22px] font-black text-[#202124]">{attentionAccounts.length}</div></div>
                <div className="border-l border-[#D8DCE3] p-3"><div className="text-[10px] font-bold text-[#68717D]">Priority cases</div><div className="mt-1 text-[22px] font-black text-[#B3261E]">{attentionAccounts.filter(account => account.priority === 'Critical' || account.priority === 'High').length}</div></div>
                <div className="border-l border-[#D8DCE3] p-3"><div className="text-[10px] font-bold text-[#68717D]">Ageing accounts</div><div className="mt-1 text-[22px] font-black text-[#8A5200]">{attentionAccounts.filter(account => account.age > 5).length}</div></div>
                <div className="border-l border-[#D8DCE3] p-3"><div className="text-[10px] font-bold text-[#68717D]">Renewing in 90d</div><div className="mt-1 text-[22px] font-black text-[#1557D0]">{attentionAccounts.filter(account => account.renewalDays !== null && account.renewalDays <= 90).length}</div></div>
              </div>
              <div className="mt-5 space-y-6">
                <div className="min-w-0 border-b border-[#D8DCE3] pb-5">
                  <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-[14px] font-black text-[#202124]">Account ranking</h3><p className="mt-1 text-[11px] text-[#68717D]">{selectedExposureMetric.description}</p></div><div className="flex flex-wrap gap-1" aria-label="Rank accounts by metric">{exposureMetricOptions.map(option => <button key={option.key} type="button" onClick={() => setExposureMetric(option.key)} className={`rounded-full border px-3 py-1.5 text-[10px] font-bold ${exposureMetric === option.key ? 'border-[#1557D0] bg-[#1557D0] text-white' : 'border-[#D8DCE3] bg-white text-[#53677D]'}`}>{option.label}</button>)}</div></div>
                  <div className="mt-3 h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart layout="vertical" data={attentionChartData} margin={{ top: 4, right: 18, left: 6, bottom: 2 }}>
                        <CartesianGrid stroke="#F0D7F7" strokeDasharray="2 4" horizontal={false} />
                        <XAxis type="number" tickFormatter={value => exposureMetric === 'carr' ? `USD ${value}k` : `${value}`} tick={{ fill: '#53677D', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="account" width={105} tick={{ fill: '#30363D', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(value: number) => [exposureMetric === 'carr' ? `USD ${value.toLocaleString()}k` : `${value} ${selectedExposureMetric.unit}`, selectedExposureMetric.label]} contentStyle={{ background: '#FFFFFF', border: '1px solid #E6C9F0', borderRadius: 6, boxShadow: 'none', fontSize: 12 }} />
                        <Bar dataKey="value" radius={[0, 5, 5, 0]} barSize={18}>{attentionChartData.map((entry, index) => <Cell key={entry.account} fill={['#1557D0', '#801ED7', '#D56CE7', '#91186E', '#FFA524'][index % 5]} />)}</Bar>
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="min-w-0 overflow-x-auto">
                  <div className="mb-3 flex items-center justify-between"><h3 className="text-[14px] font-black text-[#202124]">Top exposed accounts</h3><span className="text-[11px] font-semibold text-[#68717D]">Select an account to view its ticket</span></div>
                  <div className="min-w-[920px]">
                    <div className="grid grid-cols-[minmax(150px,1.2fr)_82px_78px_76px_62px_70px_94px_minmax(190px,1fr)] gap-3 border-b border-dotted border-[#DDE1E7] pb-2 text-[10px] font-semibold tracking-wide text-[#53677D]">
                      <span>Account</span><span>Priority</span><span>Value</span><span>Renewal</span><span>Open</span><span>History</span><span>Paid services</span><span>Why this account</span>
                    </div>
                    <div className="divide-y divide-dotted divide-[#DDE1E7]">
                      {attentionAccounts.slice(0, 5).map(account => (
                        <button type="button" key={account.caseNumber} onClick={() => openTicket(account.caseNumber)} className="grid w-full grid-cols-[minmax(150px,1.2fr)_82px_78px_76px_62px_70px_94px_minmax(190px,1fr)] items-center gap-3 px-2 py-3 text-left transition-colors hover:bg-[#F7F0FF]">
                          <div className="min-w-0"><div className="truncate text-[13px] font-semibold text-[#30363D]">{account.account}</div><div className="mt-0.5 truncate text-[11px] text-[#627387]">{account.industry}</div></div>
                          <span className="text-[12px] font-semibold text-[#B5382D]">{account.priority}</span>
                          <span className="text-[12px] font-semibold text-[#300266]">{formatCarr(account.carr)}</span>
                          <span className="text-[12px] text-[#53677D]">{account.renewalDays === null ? 'Unknown' : `${account.renewalDays}d`}</span>
                          <span className="text-[12px] text-[#53677D]">{account.count}</span>
                          <span className="text-[12px] text-[#53677D]">{account.historyCount}</span>
                          <span className="rounded-full bg-[#1557D0] px-2 py-1 text-center text-[11px] font-bold text-white">{account.paidServiceLikelihood}% likely</span>
                          <span className="text-[11px] leading-4 text-[#53677D]">{account.paidServiceReason}</span>
                        </button>
                      ))}
                      {!attentionAccounts.length && <div className="py-8 text-center text-[12px] text-[#53677D]">No accounts match this view.</div>}
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          </section>

          <section className="pb-8">
            <Panel
              delay={0.4}
              className="!border-[#801ED7] !bg-white p-5"
              data-gem-panel="Receiver and repeat patterns"
              data-gem-panel-label="Receiver and repeat patterns"
              data-gem-panel-content={`Receiver and repeat patterns. Top repeated issue patterns: ${repeatPatternData.slice(0, 3).map(pattern => `${pattern.topic}: ${pattern.repeatRate}% repeat rate, ${pattern.resolutionRate}% resolved, top provider ${pattern.topProvider}`).join(' ')}`}
            >
              <div className="flex flex-wrap items-end justify-between gap-3"><h2 className="text-[20px] font-black text-[#202124]">Receiver and repeat patterns</h2><span className="rounded-full bg-[#801ED7] px-3 py-1 text-[11px] font-bold text-white">{repeatPatternData.length} repeated issues</span></div>
              <div className="mt-4 grid grid-cols-3 border-y border-[#D8DCE3] py-3 text-center">
                <div><div className="text-[23px] font-black text-[#801ED7]">{repeatPatternData.reduce((sum, item) => sum + item.repeatIssues, 0)}</div><div className="text-[10px] font-bold text-[#68717D]">Repeat cases</div></div>
                <div className="border-x border-[#D8DCE3]"><div className="text-[23px] font-black text-[#1557D0]">{repeatPatternData.reduce((sum, item) => sum + item.open, 0)}</div><div className="text-[10px] font-bold text-[#68717D]">Currently open</div></div>
                <div><div className="text-[23px] font-black text-[#B46200]">{repeatPatternData.length ? Math.round(repeatPatternData.reduce((sum, item) => sum + item.resolutionRate, 0) / repeatPatternData.length) : 0}%</div><div className="text-[10px] font-bold text-[#68717D]">Average resolved</div></div>
              </div>
              <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(300px,0.7fr)_minmax(0,1.3fr)]">
                <div className="min-w-0 xl:border-r xl:border-[#D8DCE3] xl:pr-5">
                  <h3 className="mb-3 text-[14px] font-black text-[#202124]">Pattern comparison</h3>
                  <div className="flex items-center gap-4 text-[11px] font-semibold"><span className="inline-flex items-center gap-1.5 text-[#801ED7]"><i className="h-2 w-2 rounded-full bg-[#801ED7]" />Repeat rate</span><span className="inline-flex items-center gap-1.5 text-[#B46200]"><i className="h-2 w-2 rounded-full bg-[#FFA524]" />Resolved</span></div>
                  <div className="mt-2 h-[210px] w-full"><ResponsiveContainer width="100%" height="100%"><ComposedChart layout="vertical" data={repeatPatternData} margin={{ top: 4, right: 18, left: 6, bottom: 2 }}><CartesianGrid stroke="#F0D7F7" strokeDasharray="2 4" horizontal={false} /><XAxis type="number" domain={[0, 100]} tickFormatter={value => `${value}%`} tick={{ fill: '#801ED7', fontSize: 10, fontWeight: 600 }} axisLine={{ stroke: '#801ED7' }} tickLine={false} /><YAxis type="category" dataKey="topic" width={132} tick={{ fill: '#30363D', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} /><Tooltip formatter={(value: number, name: string) => [`${value}%`, name]} contentStyle={{ background: '#FFFFFF', border: '1px solid #E6C9F0', borderRadius: 6, boxShadow: 'none', fontSize: 12 }} /><Bar dataKey="repeatRate" name="Repeat rate" fill="#801ED7" radius={[0, 5, 5, 0]} barSize={9} /><Bar dataKey="resolutionRate" name="Resolved" fill="#FFA524" radius={[0, 5, 5, 0]} barSize={9} /></ComposedChart></ResponsiveContainer></div>
                </div>
                <div className="min-w-0 overflow-x-auto"><h3 className="mb-3 text-[14px] font-black text-[#202124]">Issue detail</h3><div className="min-w-[850px]"><div className="grid grid-cols-[minmax(150px,1.2fr)_64px_72px_82px_88px_82px_96px] gap-3 border-b border-dotted border-[#DDE1E7] pb-2 text-[10px] font-semibold tracking-wide text-[#53677D]"><span>Issue pattern</span><span>Open</span><span>History</span><span>Accounts</span><span>Repeat share</span><span>Oldest</span><span>Top provider</span></div><div className="divide-y divide-dotted divide-[#DDE1E7]">{repeatPatternData.map(pattern => <div key={pattern.topic} className="grid grid-cols-[minmax(150px,1.2fr)_64px_72px_82px_88px_82px_96px] items-center gap-3 px-2 py-3 text-[11px] transition-colors hover:bg-[#F7F0FF]"><div className="min-w-0"><div className="truncate text-[12px] font-bold text-[#30363D]">{pattern.topic}</div><div className="mt-0.5 text-[10px] text-[#68717D]">{pattern.resolutionRate}% resolved</div></div><span className="font-bold text-[#1557D0]">{pattern.open}</span><span className="text-[#53677D]">{pattern.count} cases</span><span className="text-[#53677D]">{pattern.accounts}</span><span className="font-bold text-[#801ED7]">{pattern.repeatIssues} · {pattern.repeatRate}%</span><span className={pattern.oldest > 10 ? 'font-bold text-[#B3261E]' : 'text-[#53677D]'}>{pattern.oldest}d</span><span className="truncate text-[#53677D]">{pattern.topProvider}</span></div>)}{!repeatPatternData.length && <div className="py-8 text-center text-[12px] text-[#53677D]">No repeated issue pattern in the available case history.</div>}</div></div></div>
              </div>
            </Panel>
          </section>
        </div>

        <motion.aside
          {...md3Enter}
          transition={{ duration: 0.32, delay: 0.18, ease: md3Ease }}
          className="atglance-daily-brief flex h-full self-stretch flex-col rounded-md border border-[#D2D7DE] bg-[#FBFCFD] p-5"
          data-gem-panel="Daily Briefing"
          data-gem-panel-label="Daily Briefing"
          data-gem-panel-content="Daily Briefing panel with current date, local weather, and placeholder briefing item slots."
        >
          <div className="flex items-center justify-center gap-3">
            <img src="/dashboard/google-news-icon.svg" alt="" className="h-11 w-11 object-contain" />
            <h2 className="text-[21px] font-bold text-[#202124]">Daily Briefing</h2>
          </div>
          <div className="mt-4 border-t border-dotted border-[#DDE1E7]" />
          <div className="mt-5 flex justify-center"><HeaderUtilityChips /></div>
          <div className="mt-5 grid flex-1 grid-rows-3 gap-3 border-t border-dotted border-[#DDE1E7] pb-1 pt-4" aria-label="Upcoming briefing article placeholders">
            {Array.from({ length: 3 }).map((_, index) => <article key={index} aria-hidden="true" className="grid min-h-0 grid-cols-[minmax(72px,0.34fr)_minmax(0,0.66fr)] gap-3 rounded-sm border border-dashed border-[#D7DCE3] bg-white/70 p-3"><div className="flex min-h-[72px] items-center justify-center rounded-sm border border-dashed border-[#C9D0D9] text-[#B6BEC8]"><span className="material-symbols-outlined text-[24px]">image</span></div><div className="flex min-w-0 flex-col justify-center"><div className="h-3.5 w-[88%] rounded-sm border border-[#D7DCE3]" /><div className="mt-2 h-3.5 w-[64%] rounded-sm border border-[#D7DCE3]" /><div className="mt-3 h-2 w-full rounded-sm border border-[#E1E5EA]" /><div className="mt-2 h-2 w-[92%] rounded-sm border border-[#E1E5EA]" /><div className="mt-2 h-2 w-[68%] rounded-sm border border-[#E1E5EA]" /></div></article>)}
          </div>
        </motion.aside>
      </div>

    </div>

    </div>
  );
}
