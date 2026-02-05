'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

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

interface GaugeProps {
  value: number;
  max?: number;
  label?: string;
  unit?: string;
  size?: number;
  thresholds?: {
    critical?: number;
    warning?: number;
  };
  showPercentage?: boolean;
  className?: string;
}

const getStatusColor = (
  value: number,
  max: number,
  thresholds?: { critical?: number; warning?: number }
): string => {
  const percentage = (value / max) * 100;

  if (thresholds?.critical !== undefined && percentage >= thresholds.critical) {
    return chartColors.critical;
  }
  if (thresholds?.warning !== undefined && percentage >= thresholds.warning) {
    return chartColors.warning;
  }
  return chartColors.primary;
};

export function Gauge({
  value,
  max = 100,
  label,
  unit,
  size = 180,
  thresholds,
  showPercentage = true,
  className = '',
}: GaugeProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const color = getStatusColor(value, max, thresholds);

  // Data for the gauge arc
  const data = [
    { name: 'filled', value: percentage },
    { name: 'empty', value: 100 - percentage },
  ];

  const displayValue = showPercentage ? `${percentage.toFixed(1)}%` : value.toFixed(1);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius="70%"
            outerRadius="85%"
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell
              key="filled"
              fill={color}
              style={{
                filter: `drop-shadow(0 0 6px ${color})`,
              }}
            />
            <Cell key="empty" fill={chartColors.grid} fillOpacity={0.2} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className="text-3xl font-bold tabular-nums"
          style={{
            color: chartColors.flash,
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {displayValue}
        </div>
        {unit && (
          <div
            className="mt-1 text-xs"
            style={{
              color: chartColors.text,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {unit}
          </div>
        )}
        {label && (
          <div
            className="mt-2 text-xs uppercase tracking-wider"
            style={{
              color: chartColors.text,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {label}
          </div>
        )}
      </div>

      {/* Background arc for visual depth */}
      <div
        className="absolute inset-0 rounded-full opacity-10"
        style={{
          background: `radial-gradient(circle, transparent 65%, ${color} 70%, transparent 71%)`,
        }}
      />
    </div>
  );
}
