import React, { useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { CHART_SERIES, CHART_BAR_RADIUS, CHART_LINE_WIDTH } from '../../brand';

interface ChartConfig {
  title?: string;
  xField: string;
  yField: string;
  seriesField?: string;
  chartType?: 'line' | 'area' | 'bar' | 'pie';
  data: any[];
}

const GRID = 'rgba(255,255,255,0.14)';
const TICK = { fill: '#D8C7FF', fontSize: 10, fontWeight: 800 };
const TOOLTIP = {
  contentStyle: {
    background: '#1F0144',
    borderRadius: 12,
    border: '1px solid rgba(216,199,255,0.18)',
    boxShadow: '0 12px 36px rgba(31,1,68,0.34)',
    fontSize: 11,
    padding: '9px 11px',
  },
  labelStyle: { fontWeight: 900, color: '#F3E8FF', marginBottom: 3 },
  itemStyle:  { fontWeight: 800, color: '#E9D5FF', padding: 0 },
};
const CURSOR = { fill: '#A78BFA', opacity: 0.12 };
const compact = (value: number) => {
  if (!Number.isFinite(Number(value))) return String(value ?? '');
  const n = Number(value);
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(Math.round(n * 100) / 100);
};

export default function InteractiveChart({ config }: { config: ChartConfig }) {
  const { title, xField, yField, seriesField, chartType = 'line', data } = config;

  const { transformedData, seriesKeys } = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { transformedData: [], seriesKeys: [] };
    }
    const uniqueX = Array.from(new Set(data.map(item => String(item[xField] ?? ''))));
    const keys = seriesField
      ? Array.from(new Set(data.map(item => String(item[seriesField] ?? ''))))
      : [yField];

    const tData = uniqueX.map(xVal => {
      const row: any = { [xField]: xVal };
      if (seriesField) {
        keys.forEach(key => {
          const match = data.find(
            item => String(item[xField] ?? '') === xVal && String(item[seriesField] ?? '') === key
          );
          row[key] = match ? Number(match[yField] ?? 0) : 0;
        });
      } else {
        const match = data.find(item => String(item[xField] ?? '') === xVal);
        row[yField] = match ? Number(match[yField] ?? 0) : 0;
      }
      return row;
    });
    return { transformedData: tData, seriesKeys: keys };
  }, [data, xField, yField, seriesField]);

  if (transformedData.length === 0) {
    return (
      <div className="h-[140px] flex items-center justify-center text-xs text-purple-400/60 italic">
        No chart data available.
      </div>
    );
  }

  const color = (i: number) => CHART_SERIES[i % CHART_SERIES.length];

  // Compact tick formatter — truncate long labels
  const tickFmt = (v: string) => v.length > 10 ? v.slice(0, 9) + '…' : v;

  const sharedProps = {
    margin: { top: 8, right: 14, left: -18, bottom: 0 },
  };

  const sharedGrid  = <CartesianGrid stroke={GRID} vertical={false} />;
  const sharedXAxis = <XAxis dataKey={xField} tick={TICK} axisLine={false} tickLine={false} tickFormatter={tickFmt} interval="preserveStartEnd" />;
  const sharedYAxis = <YAxis tick={TICK} axisLine={false} tickLine={false} width={44} tickFormatter={(value: number) => compact(value)} />;
  const sharedTip   = <Tooltip cursor={CURSOR} contentStyle={TOOLTIP.contentStyle} labelStyle={TOOLTIP.labelStyle} itemStyle={TOOLTIP.itemStyle} />;
  const sharedLeg   = <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8, color: '#E9D5FF', fontWeight: 800 }} iconSize={8} />;

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={transformedData} {...sharedProps}>
            {sharedGrid}{sharedXAxis}{sharedYAxis}{sharedTip}{sharedLeg}
            {seriesKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={color(i)} radius={CHART_BAR_RADIUS} maxBarSize={32} />
            ))}
          </BarChart>
        );

      case 'pie': {
        const pieData = data.map((item, i) => ({
          name: String(item[xField] || item[seriesField] || `Item ${i}`),
          value: Number(item[yField] ?? 0),
        }));
        return (
          <PieChart>
            <Pie data={pieData} cx="50%" cy="48%" innerRadius={44} outerRadius={72} paddingAngle={3} dataKey="value" strokeWidth={0}>
              {pieData.map((_, i) => <Cell key={i} fill={color(i)} />)}
            </Pie>
            <Tooltip contentStyle={TOOLTIP.contentStyle} labelStyle={TOOLTIP.labelStyle} itemStyle={TOOLTIP.itemStyle} />
            <Legend wrapperStyle={{ fontSize: 10, color: '#E9D5FF', fontWeight: 800 }} iconSize={8} />
          </PieChart>
        );
      }

      case 'area':
        return (
          <AreaChart data={transformedData} {...sharedProps}>
            {sharedGrid}{sharedXAxis}{sharedYAxis}{sharedTip}{sharedLeg}
            {seriesKeys.map((key, i) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color(i)}
                strokeWidth={CHART_LINE_WIDTH}
                fill={color(i)}
                fillOpacity={0.22}
                dot={false}
                activeDot={{ r: 5, fill: color(i), stroke: '#fff', strokeWidth: 2 }}
              />
            ))}
          </AreaChart>
        );

      case 'line':
      default:
        return (
          <LineChart data={transformedData} {...sharedProps}>
            {sharedGrid}{sharedXAxis}{sharedYAxis}{sharedTip}{sharedLeg}
            {seriesKeys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color(i)}
                strokeWidth={CHART_LINE_WIDTH}
                dot={{ r: 2.5, fill: color(i), strokeWidth: 0 }}
                activeDot={{ r: 4.5, fill: color(i), stroke: '#fff', strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <div
      className="my-3 flex w-full flex-col gap-2 overflow-hidden rounded-2xl border border-purple-300/10 bg-[#300266] px-4 pb-3 pt-3 shadow-[0_12px_36px_rgba(48,2,102,0.14)]"
    >
      {title && (
        <p className="mb-0.5 select-none text-[12px] font-black leading-tight text-purple-100">
          {title}
        </p>
      )}
      {/* Height scales with series count — more series = taller for legend */}
      <div style={{ height: chartType === 'pie' ? 190 : seriesKeys.length > 3 ? 220 : 190 }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
