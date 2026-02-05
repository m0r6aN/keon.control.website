'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

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

type TrendDirection = 'up' | 'down' | 'neutral';
type StatusGlow = 'healthy' | 'warning' | 'critical' | 'none';

interface SparklineData {
  value: number;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: {
    direction: TrendDirection;
    value?: string;
  };
  sparklineData?: SparklineData[];
  status?: StatusGlow;
  className?: string;
}

const getTrendIcon = (direction: TrendDirection) => {
  switch (direction) {
    case 'up':
      return <TrendingUp className="h-4 w-4" />;
    case 'down':
      return <TrendingDown className="h-4 w-4" />;
    case 'neutral':
      return <Minus className="h-4 w-4" />;
  }
};

const getTrendColor = (direction: TrendDirection) => {
  switch (direction) {
    case 'up':
      return chartColors.primary;
    case 'down':
      return chartColors.critical;
    case 'neutral':
      return chartColors.text;
  }
};

const getGlowColor = (status: StatusGlow) => {
  switch (status) {
    case 'healthy':
      return chartColors.primary;
    case 'warning':
      return chartColors.warning;
    case 'critical':
      return chartColors.critical;
    case 'none':
      return 'transparent';
  }
};

export function MetricCard({
  label,
  value,
  unit,
  trend,
  sparklineData,
  status = 'none',
  className = '',
}: MetricCardProps) {
  const glowColor = getGlowColor(status);
  const hasGlow = status !== 'none';

  return (
    <div
      className={`relative rounded-lg border bg-[#0B0C10]/50 p-4 backdrop-blur-sm transition-all ${className}`}
      style={{
        borderColor: chartColors.grid,
        boxShadow: hasGlow ? `0 0 20px ${glowColor}15, inset 0 0 20px ${glowColor}05` : 'none',
      }}
    >
      {/* Label */}
      <div
        className="mb-2 text-xs uppercase tracking-wider"
        style={{
          color: chartColors.text,
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        {label}
      </div>

      {/* Value Display */}
      <div className="mb-2 flex items-baseline gap-2">
        <span
          className="text-3xl font-bold tabular-nums"
          style={{
            color: chartColors.flash,
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="text-sm font-medium"
            style={{
              color: chartColors.text,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {unit}
          </span>
        )}
      </div>

      {/* Trend Indicator */}
      {trend && (
        <div
          className="flex items-center gap-1 text-xs"
          style={{
            color: getTrendColor(trend.direction),
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {getTrendIcon(trend.direction)}
          {trend.value && <span>{trend.value}</span>}
        </div>
      )}

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-3 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={glowColor !== 'transparent' ? glowColor : chartColors.primary}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
                style={{
                  filter: hasGlow ? `drop-shadow(0 0 3px ${glowColor})` : 'none',
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Status Indicator LED */}
      {hasGlow && (
        <div className="absolute right-3 top-3">
          <div
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: glowColor,
              boxShadow: `0 0 8px ${glowColor}, 0 0 4px ${glowColor}`,
            }}
          />
        </div>
      )}
    </div>
  );
}
