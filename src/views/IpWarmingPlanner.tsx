import React, { useState, useMemo, useRef, useEffect } from 'react';
import { InlineDatePicker, Md3Checkbox } from '../components/md3/Md3Components';
import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Target, BarChart2, Calendar, ChevronDown } from 'lucide-react';
import '@material/web/button/filled-button.js';
import '@material/web/icon/icon.js';

// ─── Constants ─────────────────────────────────────────────────────────────────

const LIST_SIZES = [
  { label: '10,000 (Startup)', value: 10000 },
  { label: '25,000 (Very Small)', value: 25000 },
  { label: '50,000 (Small)', value: 50000 },
  { label: '75,000 (Mid-Small)', value: 75000 },
  { label: '100,000 (Medium)', value: 100000 },
  { label: '150,000 (Mid-Large)', value: 150000 },
  { label: '250,000 (Growing)', value: 250000 },
  { label: '500,000 (Large)', value: 500000 },
  { label: '750,000 (Very Large)', value: 750000 },
  { label: '1,000,000 (Enterprise)', value: 1000000 },
  { label: '2,500,000 (Scale-up)', value: 2500000 },
  { label: '5,000,000 (Massive)', value: 5000000 },
];

const SCHEDULE_OPTIONS = [
  { label: 'Auto (Recommended)', value: 'auto' },
  { label: 'Manual: Moderate', value: 'moderate' },
  { label: 'Manual: Conservative', value: 'conservative' },
  { label: 'Manual: Aggressive', value: 'aggressive' },
];

const BASE_SCHEDULES: Record<string, number[]> = {
  conservative: [50, 50, 50, 100, 100, 100, 500, 500, 500, 1000, 1000, 1000, 2000, 2000, 2000, 4000, 4000, 4000, 8000, 8000, 8000],
  moderate:     [50, 100, 500, 1000, 2000, 4000, 8000, 16000, 25000, 35000, 50000, 75000, 100000, 150000, 200000, 275000, 375000, 500000, 650000, 825000, 1000000],
  aggressive:   [50, 100, 500, 1000, 2500, 5000, 9000, 16000, 29000, 52000, 98000, 160000, 225000, 315000, 450000, 615000, 875000, 1200000, 1750000, 2750000],
};

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(Math.round(n));

// ─── Sub-components ─────────────────────────────────────────────────────────────

function SelectNum({ label, value, onChange, options }: {
  label: string; value: number; onChange: (v: number) => void;
  options: { label: string; value: number }[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-on-surface-variant/70">{label}</label>
      <div className="relative">
        <select
          className="w-full bg-transparent border-b border-outline-variant/60 text-on-surface dark:text-inverse-on-surface text-sm font-semibold py-2.5 pr-8 appearance-none outline-none focus:border-primary transition-colors cursor-pointer"
          value={value} onChange={e => onChange(Number(e.target.value))}
        >
          {!options.find(o => o.value === value) && <option value={value}>{fmt(value)} (Custom)</option>}
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60 pointer-events-none" />
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-on-surface-variant/70">{label}</label>
      <div className="relative">
        <select
          className="w-full bg-transparent border-b border-outline-variant/60 text-on-surface dark:text-inverse-on-surface text-sm font-semibold py-2.5 pr-8 appearance-none outline-none focus:border-primary transition-colors cursor-pointer"
          value={value} onChange={e => onChange(e.target.value)}
        >
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60 pointer-events-none" />
      </div>
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [pickerOpen]);

  if (type === 'date') {
    const formattedVal = value ? new Date(value + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
    return (
      <div ref={containerRef} className="relative flex flex-col gap-1.5 select-none">
        <label className="text-[10px] font-bold text-on-surface-variant/70">{label}</label>
        <button
          type="button"
          onClick={() => setPickerOpen(v => !v)}
          className="w-full bg-transparent border-b border-outline-variant/60 text-on-surface dark:text-inverse-on-surface text-sm font-semibold py-2 outline-none focus:border-primary transition-colors text-left flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5"
        >
          <span>{formattedVal || placeholder || 'Select date'}</span>
          <span className="material-symbols-outlined text-[18px] opacity-60">calendar_today</span>
        </button>
        {pickerOpen && (
          <div className="absolute left-0 mt-1 z-30 w-[280px] rounded-2xl bg-white dark:bg-[#2A2930] border border-outline-variant/20 shadow-xl p-4 flex flex-col gap-3">
            <InlineDatePicker
              selectedDate={value ? new Date(value + 'T00:00:00') : null}
              onSelectDate={(date) => {
                const iso = date.toISOString().slice(0, 10);
                onChange(iso);
              }}
              onClose={() => setPickerOpen(false)}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-on-surface-variant/70">{label}</label>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-transparent border-b border-outline-variant/60 text-on-surface dark:text-inverse-on-surface text-sm font-semibold py-2.5 outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/40 placeholder:font-normal"
      />
    </div>
  );
}

function CheckboxGroup({ label, field, options, values, onChange }: {
  label: string; field: string; options: { label: string; value: string }[];
  values: string[]; onChange: (field: string, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-bold text-on-surface-variant/70">{label}</label>
      <div className="flex flex-col gap-1.5 pt-1">
        {options.map(opt => {
          const checked = values.includes(opt.value);
          return (
            <Md3Checkbox
              key={opt.value}
              checked={checked}
              onChange={() => onChange(field, opt.value)}
              className="py-0.5 text-xs font-semibold text-on-surface-variant dark:text-inverse-on-surface/80"
              style={{ '--cr-checkbox-font-size': '12px' } as React.CSSProperties}
            >
              {opt.label}
            </Md3Checkbox>
          );
        })}
      </div>
    </div>
  );
}

function KpiCard({ label, value, bg }: { label: string; value: string; bg: string }) {
  return (
    <div className={`${bg} p-5 rounded-2xl shadow-md flex flex-col justify-center text-white relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/15 rounded-full translate-x-1/2 -translate-y-1/2 blur-xl" />
      <span className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-2 relative z-10">{label}</span>
      <span className="text-3xl font-black relative z-10 leading-none">{value}</span>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a0138] p-3 rounded-xl shadow-2xl border border-[#801ED7]">
      <p className="font-black text-white text-sm mb-2 border-b border-[#801ED7]/40 pb-1.5">{label}</p>
      <p className="text-[#FFA524] text-xs flex justify-between gap-4">
        <span className="font-bold">Daily:</span><span>{fmt(payload[0]?.value ?? 0)}</span>
      </p>
      {payload[1] && (
        <p className="text-[#C084FC] text-xs flex justify-between gap-4 mt-1">
          <span className="font-bold">Cumulative:</span><span>{fmt(payload[1].value)}</span>
        </p>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

interface FormState {
  targetVolume: number;
  scheduleType: string;
  ipStatus: string;
  trafficType: string;
  totalAudience: string;
  sendFrequency: string;
  targetDate: string;
  espCutoffDate: string;
  engagedPortion: string;
  inactiveIncluded: string;
  campaignReadiness: string;
  sendPattern: string;
  volumeControl: string;
  pastIssues: string[];
  metricsTracked: string[];
  upcomingCampaigns: string;
}

const DEFAULT_FORM: FormState = {
  targetVolume: 100000,
  scheduleType: 'auto',
  ipStatus: 'new',
  trafficType: 'Marketing',
  totalAudience: '',
  sendFrequency: 'daily',
  targetDate: '',
  espCutoffDate: '',
  engagedPortion: 'moderate',
  inactiveIncluded: 'no',
  campaignReadiness: 'Yes',
  sendPattern: 'regular',
  volumeControl: 'Yes',
  pastIssues: ['none'],
  metricsTracked: ['opens', 'clicks'],
  upcomingCampaigns: 'No',
};

export default function IpWarmingPlanner() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [config, setConfig] = useState<FormState>(DEFAULT_FORM);
  const [updating, setUpdating] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const set = (field: keyof FormState, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const setMulti = (field: string, value: string) => {
    setForm(prev => {
      const current = (prev as any)[field] as string[];
      if (value === 'none') return { ...prev, [field]: ['none'] };
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current.filter(v => v !== 'none'), value];
      return { ...prev, [field]: updated.length ? updated : ['none'] };
    });
  };

  const handleUpdate = () => {
    setUpdating(true);
    setTimeout(() => { setConfig({ ...form }); setUpdating(false); }, 400);
  };

  // ── Strategy logic ───────────────────────────────────────────────────────────
  const recStrategy = useMemo(() => {
    const { ipStatus, engagedPortion, inactiveIncluded, pastIssues, upcomingCampaigns } = config;
    const hasBadIssues = pastIssues.some(i => ['blocklisting', 'throttling', 'complaints'].includes(i));
    if (inactiveIncluded === 'yes' || hasBadIssues || engagedPortion === 'low') return 'conservative';
    if (engagedPortion === 'majority' && !hasBadIssues && (ipStatus === 'existing_sending' || upcomingCampaigns.toLowerCase() === 'yes')) return 'aggressive';
    return 'moderate';
  }, [config]);

  const recStartVol = useMemo(() => {
    let v = config.ipStatus === 'new' ? 50 : config.ipStatus === 'existing_sending' ? 200 : 100;
    if (config.engagedPortion === 'majority') v = Math.floor(v * 1.5);
    else if (config.engagedPortion === 'low') v = Math.floor(v * 0.5);
    if (config.inactiveIncluded === 'yes') v = 50;
    if (config.pastIssues.some(i => ['blocklisting', 'throttling', 'complaints'].includes(i))) v = 50;
    return Math.max(50, Math.round(Math.min(v, 500) / 50) * 50);
  }, [config]);

  const strategy = config.scheduleType === 'auto' ? recStrategy : config.scheduleType;

  // ── Schedule computation ─────────────────────────────────────────────────────
  const scheduleData = useMemo(() => {
    const base = BASE_SCHEDULES[strategy];
    const scale = recStartVol / 50;
    const data: { day: number; dayLabel: string; volume: number; cumulative: number }[] = [];
    let cumulative = 0;

    for (let day = 1; day <= 150; day++) {
      let vol: number;
      if (day <= base.length) {
        vol = base[day - 1] * scale;
      } else {
        const lastVol = base[base.length - 1] * scale;
        const beyond = day - base.length;
        const doublesEvery = strategy === 'conservative' ? 3 : strategy === 'moderate' ? 2 : 1;
        vol = lastVol * Math.pow(2, Math.ceil(beyond / doublesEvery));
      }
      vol = Math.min(Math.round(vol), config.targetVolume);
      cumulative += vol;
      data.push({ day, dayLabel: `Day ${day}`, volume: vol, cumulative: Math.round(cumulative) });
      if (vol >= config.targetVolume) break;
    }
    return data;
  }, [config.targetVolume, recStartVol, strategy]);

  const totalDays = scheduleData.length;
  const totalEmails = scheduleData.at(-1)?.cumulative ?? 0;

  const yMax = useMemo(() => {
    const v = Math.max(totalEmails, 100);
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    const f = v / p;
    const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
    return nice * p;
  }, [totalEmails]);

  const exportCsv = () => {
    const lines = ['Day,Daily Volume,Cumulative Sent'];
    scheduleData.forEach(r => lines.push(`${r.dayLabel},${r.volume},${r.cumulative}`));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'ip_warming_schedule.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportChartPng = () => {
    const container = chartRef.current;
    if (!container) return;
    const svgEl = container.querySelector('svg');
    if (!svgEl) return;
    const { width, height } = svgEl.getBoundingClientRect();
    const w = width || 600; const h = height || 300;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    const ratio = 2; canvas.width = w * ratio; canvas.height = h * ratio;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.fillStyle = '#300266'; ctx.fillRect(0, 0, w, h);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { ctx.drawImage(img, 0, 0); URL.revokeObjectURL(url); const a = document.createElement('a'); a.download = 'ip_warming_chart.png'; a.href = canvas.toDataURL('image/png'); a.click(); };
    img.src = url;
  };

  const exportTablePng = () => {
    const rowH = 38; const headerH = 44; const titleH = 50;
    const cw = [90, 130, 140]; const padX = 20;
    const totalW = cw.reduce((s, w) => s + w, 0) + padX * 2;
    const totalH = titleH + headerH + scheduleData.length * rowH + 16;
    const lines = [
      `<svg width="${totalW}" height="${totalH}" xmlns="http://www.w3.org/2000/svg" font-family="Arial,sans-serif">`,
      `<rect width="${totalW}" height="${totalH}" fill="#1E1D22"/>`,
      `<rect width="${totalW}" height="${titleH}" fill="#28272C"/>`,
      `<text x="${padX}" y="${titleH / 2 + 6}" fill="#E8DEF8" font-size="14" font-weight="bold">Daily Schedule Table</text>`,
      `<rect y="${titleH}" width="${totalW}" height="${headerH}" fill="#300266"/>`,
    ];
    let hx = padX;
    ['DAY', 'DAILY VOLUME', 'CUMULATIVE'].forEach((col, i) => {
      const tx = i === 0 ? hx : hx + cw[i] - 8; const anchor = i === 0 ? 'start' : 'end';
      lines.push(`<text x="${tx}" y="${titleH + headerH / 2 + 5}" fill="${i === 1 ? '#FFA524' : '#C084FC'}" font-size="10" font-weight="bold" text-anchor="${anchor}">${col}</text>`);
      hx += cw[i];
    });
    scheduleData.forEach((row, idx) => {
      const ry = titleH + headerH + idx * rowH;
      lines.push(`<rect y="${ry}" width="${totalW}" height="${rowH}" fill="${idx % 2 === 0 ? '#1E1D22' : '#251E30'}"/>`);
      let rx = padX;
      [row.dayLabel, fmt(row.volume), fmt(row.cumulative)].forEach((val, i) => {
        const tx = i === 0 ? rx : rx + cw[i] - 8; const anchor = i === 0 ? 'start' : 'end';
        lines.push(`<text x="${tx}" y="${ry + rowH / 2 + 5}" fill="${i === 1 ? '#FFA524' : i === 2 ? '#C084FC' : '#E8DEF8'}" font-size="12" font-weight="${i === 0 ? '400' : '700'}" text-anchor="${anchor}">${val}</text>`);
        rx += cw[i];
      });
    });
    lines.push('</svg>');
    const ratio = 2; const canvas = document.createElement('canvas'); canvas.width = totalW * ratio; canvas.height = totalH * ratio;
    const ctx = canvas.getContext('2d'); if (!ctx) return; ctx.scale(ratio, ratio);
    const blob = new Blob([lines.join('\n')], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { ctx.drawImage(img, 0, 0); URL.revokeObjectURL(url); const a = document.createElement('a'); a.download = 'ip_warming_table.png'; a.href = canvas.toDataURL('image/png'); a.click(); };
    img.src = url;
  };

  return (
    <div className="ipw-planner space-y-6 p-1">

      {/* ── Section 1: Configuration ── */}
      <section
        data-gem-panel
        data-gem-panel-label="IP Warming Configuration"
        data-gem-panel-content={`IP Warming Configuration: Schedule Type: ${config.scheduleType} | Target Volume: ${config.targetVolume.toLocaleString()} | Recommended Start Volume: ${recStartVol} | Inactive subscribers included: ${config.inactiveIncluded} | Past issues: ${config.pastIssues?.join(', ') || 'none'}`}
        className="bg-[#FAF9FC] dark:bg-inverse-surface/5 rounded-2xl border border-outline-variant/30 dark:border-white/8 shadow-none overflow-hidden px-6 py-8 sm:px-8 sm:py-10"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
          <div>
            <h2 className="text-3xl font-black text-on-surface dark:text-inverse-on-surface tracking-tight">IP Warming Planner</h2>
            <p className="text-xs text-on-surface-variant dark:text-inverse-on-surface/65 mt-1">
              Calculate and project progressive schedules for warm-up and ramp campaigns.
            </p>
          </div>
          <div className="shrink-0">
            <md-filled-button
              onClick={handleUpdate}
              disabled={updating}
              style={{
                minWidth: '156px',
                height: '48px',
                '--md-filled-button-container-color': '#1A73E8',
                '--md-filled-button-label-text-color': '#FFFFFF',
                '--md-filled-button-label-text-size': '15px',
                '--md-filled-button-label-text-weight': '700',
              } as React.CSSProperties}
            >
              <md-icon slot="icon">{updating ? 'progress_activity' : 'refresh'}</md-icon>
              {updating ? 'Calculating...' : 'Update Plan'}
            </md-filled-button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="flex flex-col gap-6">
            <SelectNum label="Target List Size" value={form.targetVolume} onChange={v => set('targetVolume', v)} options={LIST_SIZES} />
            <Select label="Schedule Strategy" value={form.scheduleType} onChange={v => set('scheduleType', v)} options={SCHEDULE_OPTIONS} />
            <TextInput label="Total Audience Size" placeholder="e.g. 2,000,000" value={form.totalAudience} onChange={v => set('totalAudience', v)} />
            <TextInput label="Target Completion Date" type="date" value={form.targetDate} onChange={v => set('targetDate', v)} />
          </div>
          {/* Col 2 */}
          <div className="flex flex-col gap-6">
            <Select label="IP Status" value={form.ipStatus} onChange={v => set('ipStatus', v)} options={[
              { value: 'new', label: 'New / Cold IP' },
              { value: 'existing_not_sending', label: 'Existing (Not sending)' },
              { value: 'existing_sending', label: 'Existing (Sending)' },
            ]} />
            <Select label="Traffic Type" value={form.trafficType} onChange={v => set('trafficType', v)} options={[
              { value: 'Marketing', label: 'Marketing' },
              { value: 'Transactional', label: 'Transactional' },
              { value: 'Mixed', label: 'Mixed' },
            ]} />
            <Select label="Send Frequency" value={form.sendFrequency} onChange={v => set('sendFrequency', v)} options={[
              { value: 'daily', label: 'Daily' },
              { value: 'multiple_per_week', label: 'Multi per week' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'irregular', label: 'Irregular' },
            ]} />
            <Select label="Typical Send Pattern" value={form.sendPattern} onChange={v => set('sendPattern', v)} options={[
              { value: 'regular', label: 'Regular / Consistent' },
              { value: 'spikes', label: 'Spikes (e.g. big promos)' },
              { value: 'other', label: 'Other' },
            ]} />
          </div>
          {/* Col 3 */}
          <div className="flex flex-col gap-6">
            <Select label="Engaged Portion" value={form.engagedPortion} onChange={v => set('engagedPortion', v)} options={[
              { value: 'majority', label: 'Majority (>50%)' },
              { value: 'moderate', label: 'Moderate (25–50%)' },
              { value: 'low', label: 'Low (<25%)' },
            ]} />
            <Select label="Inactives Included?" value={form.inactiveIncluded} onChange={v => set('inactiveIncluded', v)} options={[
              { value: 'no', label: 'No' },
              { value: 'yes', label: 'Yes' },
            ]} />
            <Select label="Volume Control Ability" value={form.volumeControl} onChange={v => set('volumeControl', v)} options={[
              { value: 'Yes', label: 'Yes' },
              { value: 'No', label: 'No' },
            ]} />
            <Select label="Campaign Readiness" value={form.campaignReadiness} onChange={v => set('campaignReadiness', v)} options={[
              { value: 'Yes', label: 'Yes' },
              { value: 'No', label: 'No' },
            ]} />
          </div>
          {/* Col 4 */}
          <div className="flex flex-col gap-6">
            <TextInput label="ESP Cutoff Date" type="date" value={form.espCutoffDate} onChange={v => set('espCutoffDate', v)} />
            <TextInput label="Upcoming Campaigns?" placeholder="e.g. Yes, Black Friday" value={form.upcomingCampaigns} onChange={v => set('upcomingCampaigns', v)} />
            <CheckboxGroup label="Past Issues" field="pastIssues" values={form.pastIssues} onChange={setMulti} options={[
              { label: 'None', value: 'none' },
              { label: 'Throttled', value: 'throttling' },
              { label: 'Complaints', value: 'complaints' },
              { label: 'Blocklists', value: 'blocklisting' },
            ]} />
            <CheckboxGroup label="Metrics Tracked" field="metricsTracked" values={form.metricsTracked} onChange={setMulti} options={[
              { label: 'Opens', value: 'opens' },
              { label: 'Clicks', value: 'clicks' },
              { label: 'Bounces', value: 'bounces' },
              { label: 'Complaints', value: 'complaints' },
            ]} />
          </div>
        </div>
      </section>

      {/* ── Section 2: Key Plan Metrics ── */}
      <section data-gem-panel data-gem-panel-label="Key Plan Metrics" data-gem-panel-content={`IP Warming Key Metrics: Time to Target: ${totalDays} days | Recommended Start Volume: ${recStartVol} | Applied Strategy: ${strategy.charAt(0).toUpperCase() + strategy.slice(1)} | Final Daily Volume: ${config.targetVolume.toLocaleString()} | Total Emails: ${totalEmails.toLocaleString()}`} className={`bg-[#300266] rounded-2xl border border-[#542387] shadow-xl p-6 transition-opacity duration-300 ${updating ? 'opacity-40 pointer-events-none' : ''}`}>
        <h3 className="font-black text-white text-base flex items-center gap-2.5 mb-5">
          <Target className="w-4 h-4 text-[#FFA4FB]" /> Key Plan Metrics
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Time to Target" value={`${totalDays} Days`} bg="bg-[#FFA524]" />
          <KpiCard label="Rec. Start Volume" value={fmt(recStartVol)} bg="bg-[#1A73E8]" />
          <KpiCard label="Applied Strategy" value={strategy.charAt(0).toUpperCase() + strategy.slice(1)} bg="bg-[#E9371F]" />
          <KpiCard label="Final Daily Volume" value={fmt(config.targetVolume)} bg="bg-[#91186E]" />
        </div>
      </section>

      {/* ── Sections 3 & 4: Chart + Table ── */}
      <div className={`ipw-results-grid transition-opacity duration-300 ${updating ? 'opacity-40 pointer-events-none' : ''}`}>

        {/* Volume Projection */}
        <section data-gem-panel data-gem-panel-label="Volume Projection Chart" data-gem-panel-content={`Volume Projection (${strategy} strategy): ${scheduleData.slice(0, 5).map(r => `${r.dayLabel}: ${r.volume.toLocaleString()}`).join(', ')}... → Day ${totalDays}: ${config.targetVolume.toLocaleString()}/day (total ${totalEmails.toLocaleString()} emails)`} className="bg-[#300266] rounded-2xl border border-[#542387] shadow-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-black text-white text-base flex items-center gap-2.5">
              <BarChart2 className="w-4 h-4 text-[#FFA4FB]" /> Volume Projection
            </h3>
            <div className="flex items-center gap-1.5">
              <button onClick={exportChartPng} title="Export as PNG" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-[11px] font-semibold transition-colors">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12l3 3 5-5"/></svg>
                PNG
              </button>
              <button onClick={exportCsv} title="Export as CSV" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-[11px] font-semibold transition-colors">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                CSV
              </button>
            </div>
          </div>
          <div ref={chartRef} className="flex-1 min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={scheduleData} margin={{ top: 16, right: 8, bottom: 4, left: -12 }}>
                <CartesianGrid vertical={false} stroke="#542387" opacity={0.5} />
                <XAxis dataKey="dayLabel" tickLine={false} axisLine={false} tick={{ fill: '#C9C4FF', fontSize: 10, fontWeight: 700 }} dy={8} interval="preserveStartEnd" />
                <YAxis yAxisId="l" domain={[0, yMax]} tickCount={5} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} tickLine={false} axisLine={{ stroke: '#FFA524', strokeWidth: 1.5 }} tick={{ fill: '#FFA524', fontSize: 10, fontWeight: 700 }} dx={-4} />
                <YAxis yAxisId="r" orientation="right" domain={[0, yMax]} tickCount={5} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} tickLine={false} axisLine={{ stroke: '#801ED7', strokeWidth: 1.5 }} tick={{ fill: '#C084FC', fontSize: 10, fontWeight: 700 }} dx={4} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#542387', opacity: 0.25 }} />
                <Bar yAxisId="l" dataKey="volume" fill="#FFA524" radius={[3, 3, 0, 0]} maxBarSize={36} />
                <Bar yAxisId="r" dataKey="cumulative" fill="#801ED7" radius={[3, 3, 0, 0]} maxBarSize={36} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-5 mt-4 pt-4 border-t border-[#542387]/50 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-sm bg-[#FFA524]" />
              <span className="text-xs font-bold text-white">Daily Volume (L)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-sm bg-[#801ED7]" />
              <span className="text-xs font-bold text-white">Cumulative Sent (R)</span>
            </div>
          </div>
        </section>

        {/* Daily Schedule Table */}
        <section
          data-gem-panel
          data-gem-panel-label="Daily Schedule Table"
          data-gem-panel-content={`IP Warming Schedule — Applied Strategy: ${strategy.charAt(0).toUpperCase() + strategy.slice(1)} | Target Volume: ${config.targetVolume.toLocaleString()}/day | Start Volume: ${recStartVol} | Total Days: ${totalDays} | Total Emails: ${totalEmails.toLocaleString()}\n\n${scheduleData.map(r => `${r.dayLabel}: ${r.volume.toLocaleString()} emails (cumulative ${r.cumulative.toLocaleString()})`).join('\n')}`}
          className="bg-white dark:bg-[#1E1D22] rounded-2xl border border-outline-variant/50 dark:border-white/8 shadow-none flex flex-col overflow-hidden"
        >
          <div className="px-5 py-3.5 bg-surface-container-low dark:bg-[#28272C] border-b border-outline-variant/20 dark:border-white/8 shrink-0 flex items-center justify-between">
            <h3 className="font-bold text-[15px] text-on-surface dark:text-inverse-on-surface flex items-center gap-2.5">
              <Calendar className="w-[18px] h-[18px] text-[#6701be] dark:text-[#E8DEF8]" /> Daily Schedule Table
            </h3>
            <div className="flex items-center gap-1.5">
              <button onClick={exportTablePng} title="Export as PNG" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#6701be]/10 hover:bg-[#6701be]/20 text-[#6701be] dark:text-[#E8DEF8] text-[11px] font-semibold transition-colors">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12l3 3 5-5"/></svg>
                PNG
              </button>
              <button onClick={exportCsv} title="Export as CSV" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#6701be]/10 hover:bg-[#6701be]/20 text-[#6701be] dark:text-[#E8DEF8] text-[11px] font-semibold transition-colors">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                CSV
              </button>
            </div>
          </div>
          <div className="overflow-y-auto flex-1" style={{ maxHeight: 380 }}>
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white dark:bg-[#1E1D22] z-10">
                <tr>
                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-[#6701be] dark:text-[#E8DEF8] border-b border-outline-variant/20 dark:border-white/8">Day</th>
                  <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-widest text-[#FFA524] border-b border-outline-variant/20 dark:border-white/8">Daily Volume</th>
                  <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-widest text-[#6701be] dark:text-[#E8DEF8] border-b border-outline-variant/20 dark:border-white/8">Cumulative</th>
                </tr>
              </thead>
              <tbody>
                {scheduleData.map(row => (
                  <tr key={row.day} className="border-b border-outline-variant/10 dark:border-white/5 hover:bg-surface-container-low dark:hover:bg-white/4 transition-colors">
                    <td className="px-5 py-2.5 font-bold text-on-surface dark:text-inverse-on-surface">{row.dayLabel}</td>
                    <td className="px-5 py-2.5 font-black text-[#FFA524] text-right">{fmt(row.volume)}</td>
                    <td className="px-5 py-2.5 font-medium text-[#6701be] dark:text-[#E8DEF8] text-right">{fmt(row.cumulative)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
