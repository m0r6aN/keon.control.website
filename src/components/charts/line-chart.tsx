'use client';

import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const chartColors = {
  primary: '#66FCF1',
  secondary: '#45A29E',
  warning: '#FF6B00',
  critical: '#FF2E2E',
  grid: '#384656',
  text: '#C5C6C7',
  flash: '#EAEAEA',
  void: '#0B0C10',
};

interface DataPoint {
  [key: string]: string | number;
}

interface LineConfig {
  dataKey: string;
  color?: string;
  name?: string;
  strokeWidth?: number;
  dot?: boolean;
  activeDot?: boolean | { r: number; fill?: string };
}

interface LineChartProps {
  data: DataPoint[];
  lines: LineConfig[];
  xAxisKey: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  glowEffect?: boolean;
}

interface TooltipEntry {
  color?: string;
  name?: string | number;
  value?: string | number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded border border-[#384656] bg-[#0B0C10]/95 px-3 py-2 shadow-xl backdrop-blur-sm"
        style={{
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        <p className="mb-1 text-xs text-[#C5C6C7]">{label}</p>
        {payload.map((entry, index: number) => (
          <p
            key={`item-${index}`}
            className="text-sm font-medium"
            style={{ color: entry.color }}
          >
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function LineChart({
  data,
  lines,
  xAxisKey,
  height = 300,
  showGrid = true,
  showLegend = false,
  xAxisLabel,
  yAxisLabel,
  glowEffect = false,
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
        data={data}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={chartColors.grid}
            strokeOpacity={0.3}
            horizontal={true}
            vertical={false}
          />
        )}
        <XAxis
          dataKey={xAxisKey}
          stroke={chartColors.text}
          tick={{ fill: chartColors.text, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
          axisLine={{ stroke: chartColors.grid }}
          tickLine={false}
          label={
            xAxisLabel
              ? {
                  value: xAxisLabel,
                  position: 'insideBottom',
                  offset: -5,
                  style: { fill: chartColors.text, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' },
                }
              : undefined
          }
        />
        <YAxis
          stroke={chartColors.text}
          tick={{ fill: chartColors.text, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
          axisLine={{ stroke: chartColors.grid }}
          tickLine={false}
          label={
            yAxisLabel
              ? {
                  value: yAxisLabel,
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: chartColors.text, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' },
                }
              : undefined
          }
        />
        <Tooltip content={<CustomTooltip />} />
        {showLegend && (
          <Legend
            wrapperStyle={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11px',
              color: chartColors.text,
            }}
          />
        )}
        {lines.map((line, index) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color || chartColors.primary}
            strokeWidth={line.strokeWidth || 2}
            name={line.name || line.dataKey}
            dot={line.dot !== undefined ? line.dot : false}
            activeDot={
              line.activeDot !== undefined
                ? line.activeDot
                : {
                    r: 4,
                    fill: line.color || chartColors.primary,
                    stroke: glowEffect ? line.color || chartColors.primary : 'none',
                    strokeWidth: glowEffect ? 8 : 0,
                    strokeOpacity: glowEffect ? 0.3 : 0,
                  }
            }
            isAnimationActive={true}
            animationDuration={800}
            style={{
              filter: glowEffect
                ? `drop-shadow(0 0 4px ${line.color || chartColors.primary})`
                : 'none',
            }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
