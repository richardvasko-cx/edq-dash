import React, { useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { CHART_SERIES, CHART_BAR_RADIUS, CHART_LINE_WIDTH } from '../../brand';

interface ChartConfig {
  title?: string;
  xField: string;
  yField: string;
  seriesField?: string;
  chartType?: 'line' | 'bar' | 'pie';
  data: any[];
}

// Light-purple surface palette — matches brand but readable on light bg
const LIGHT_GRID   = '#D8CFF5';
const LIGHT_TICK   = { fill: '#6B46C1', fontSize: 10, fontWeight: 700 };
const LIGHT_TOOLTIP = {
  contentStyle: {
    background: '#2D0A6E',
    borderRadius: 10,
    border: '1px solid #7C3AED',
    boxShadow: '0 8px 32px rgba(109,40,217,0.25)',
    fontSize: 11,
    padding: '8px 10px',
  },
  labelStyle: { fontWeight: 800, color: '#EDE9FE', marginBottom: 2 },
  itemStyle:  { fontWeight: 700, color: '#C4B5FD', padding: 0 },
};
const LIGHT_CURSOR = { fill: '#7C3AED', opacity: 0.12 };

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
  const tickFmt = (v: string) => v.length > 8 ? v.slice(0, 7) + '…' : v;

  const sharedProps = {
    margin: { top: 8, right: 6, left: -28, bottom: 0 },
  };

  const sharedGrid  = <CartesianGrid stroke={LIGHT_GRID} strokeOpacity={0.6} vertical={false} />;
  const sharedXAxis = <XAxis dataKey={xField} tick={LIGHT_TICK} axisLine={false} tickLine={false} tickFormatter={tickFmt} interval="preserveStartEnd" />;
  const sharedYAxis = <YAxis tick={LIGHT_TICK} axisLine={false} tickLine={false} width={36} />;
  const sharedTip   = <Tooltip cursor={LIGHT_CURSOR} contentStyle={LIGHT_TOOLTIP.contentStyle} labelStyle={LIGHT_TOOLTIP.labelStyle} itemStyle={LIGHT_TOOLTIP.itemStyle} />;
  const sharedLeg   = <Legend wrapperStyle={{ fontSize: 10, paddingTop: 6, color: '#7C3AED', fontWeight: 700 }} iconSize={8} />;

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
            <Tooltip contentStyle={LIGHT_TOOLTIP.contentStyle} labelStyle={LIGHT_TOOLTIP.labelStyle} itemStyle={LIGHT_TOOLTIP.itemStyle} />
            <Legend wrapperStyle={{ fontSize: 10, color: '#7C3AED', fontWeight: 700 }} iconSize={8} />
          </PieChart>
        );
      }

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
      className="w-full rounded-xl my-3 flex flex-col gap-1.5 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #EDE9FE 0%, #F5F0FF 60%, #EAE4FF 100%)',
        border: '1px solid #C4B5FD',
        padding: '12px 14px 10px',
      }}
    >
      {title && (
        <p className="text-[12px] font-bold text-purple-800 select-none leading-tight mb-0.5">
          {title}
        </p>
      )}
      {/* Height scales with series count — more series = taller for legend */}
      <div style={{ height: chartType === 'pie' ? 180 : seriesKeys.length > 3 ? 200 : 175 }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
