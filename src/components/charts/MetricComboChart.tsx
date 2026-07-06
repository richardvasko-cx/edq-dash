// Combo chart for the selected sending-infrastructure metrics over time. Counts/size render as bars
// and latency/rates as lines (rates on a right % axis). Incident date is marked with a
// dashed reference line and the 3-day current-window is shaded. Braze palette + MD3 card.

import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ReferenceArea, ResponsiveContainer,
} from 'recharts';
import { CHART_SERIES, CHART_BAR_RADIUS, CHART_LINE_WIDTH } from '../../brand';
import { type MetricDef, formatMetric, isRate } from '../../services/metricCatalog';

// Light MD3-surface chart styling (the brand CHART_* constants are tuned for the dark
// purple chart card; these read correctly on a white/MD3 card). Braze series palette kept.
const GRID = '#E8EAED';
const AXIS_TICK = { fill: '#5F6368', fontSize: 11, fontWeight: 600 } as const;
const TOOLTIP = {
  contentStyle: { background: '#FFFFFF', border: '1px solid #E8EAED', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.10)', fontSize: 12 },
  labelStyle: { fontWeight: 800, color: '#202124', marginBottom: 4 },
  itemStyle: { fontWeight: 700, color: '#5F6368', padding: 0 },
} as const;

export interface ComboPoint { date: string; _incident?: boolean; _current?: boolean; [metricKey: string]: number | string | boolean | undefined; }

const shortDate = (iso: string) => { const d = new Date(iso + 'T00:00:00'); return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); };

export default function MetricComboChart({ data, metrics, height = 320 }: { data: ComboPoint[]; metrics: MetricDef[]; height?: number }) {
  const bars = metrics.filter(m => m.kind === 'count' || m.kind === 'size');
  const lines = metrics.filter(m => m.kind === 'rate' || m.kind === 'latency');
  const hasRightAxis = metrics.some(isRate);
  const color = (i: number) => CHART_SERIES[i % CHART_SERIES.length];
  const incident = data.find(d => d._incident)?.date;
  const current = data.filter(d => d._current).map(d => d.date);

  if (!metrics.length) {
    return <div className="h-[200px] flex items-center justify-center text-[13px] text-on-surface-variant/60">Select metrics to plot.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 12, right: hasRightAxis ? 4 : 8, bottom: 4, left: -8 }}>
        <CartesianGrid stroke={GRID} strokeOpacity={0.5} vertical={false} />
        {current.length > 0 && (
          <ReferenceArea {...({ yAxisId: 'left', x1: current[0], x2: current[current.length - 1], fill: '#801ED7', fillOpacity: 0.1 } as any)} />
        )}
        {incident && <ReferenceLine yAxisId="left" x={incident} stroke="#E9371F" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: 'Incident', position: 'top', fill: '#E9371F', fontSize: 10, fontWeight: 800 }} />}
        <XAxis dataKey="date" tickFormatter={shortDate} tick={AXIS_TICK} axisLine={false} tickLine={false} minTickGap={32} />
        <YAxis yAxisId="left" width={40} tick={AXIS_TICK} axisLine={false} tickLine={false}
          tickFormatter={(v: number) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)} />
        {hasRightAxis && (
          <YAxis yAxisId="right" orientation="right" tick={AXIS_TICK} axisLine={false} tickLine={false}
            tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
        )}
        <Tooltip
          {...TOOLTIP}
          labelFormatter={(l: string) => shortDate(l)}
          formatter={(value: number, _n: string, entry: any) => {
            const def = metrics.find(m => m.key === entry?.dataKey);
            return def ? [formatMetric(def, value), def.label] : [value, _n];
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} formatter={(v: string) => metrics.find(m => m.key === v)?.label ?? v} />
        {bars.map((m, i) => (
          <Bar key={m.key} yAxisId="left" dataKey={m.key} fill={color(i)} radius={CHART_BAR_RADIUS} maxBarSize={26} />
        ))}
        {lines.map((m, i) => (
          <Line key={m.key} yAxisId={m.kind === 'rate' ? 'right' : 'left'} type="monotone" dataKey={m.key}
            stroke={color(bars.length + i)} strokeWidth={CHART_LINE_WIDTH} dot={false} activeDot={{ r: 4 }} />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
