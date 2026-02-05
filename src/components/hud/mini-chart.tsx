"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// HUD Design Tokens
const HUD_COLORS = {
  background: {
    void: "#0B0C10",
    gunmetal: "#1F2833",
  },
  border: {
    tungsten: "#384656",
  },
  text: {
    flash: "#EAEAEA",
    steel: "#C5C6C7",
  },
  status: {
    reactor: "#66FCF1",
    warning: "#FF6B00",
    critical: "#FF2E2E",
  },
} as const;

export type TrendDirection = "up" | "down" | "flat";

interface MiniChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showTrend?: boolean;
  className?: string;
  strokeWidth?: number;
  showArea?: boolean;
}

function calculateTrend(data: number[]): TrendDirection {
  if (data.length < 2) return "flat";

  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const diff = secondAvg - firstAvg;
  const threshold = Math.abs(firstAvg) * 0.05; // 5% change threshold

  if (diff > threshold) return "up";
  if (diff < -threshold) return "down";
  return "flat";
}

function getTrendColor(trend: TrendDirection): string {
  switch (trend) {
    case "up":
      return HUD_COLORS.status.reactor;
    case "down":
      return HUD_COLORS.status.warning;
    case "flat":
      return HUD_COLORS.text.steel;
  }
}

function generatePath(
  data: number[],
  width: number,
  height: number,
  padding: number = 2
): string {
  if (data.length === 0) return "";

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const effectiveWidth = width - padding * 2;
  const effectiveHeight = height - padding * 2;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * effectiveWidth;
    const y = padding + effectiveHeight - ((value - min) / range) * effectiveHeight;
    return { x, y };
  });

  // Generate smooth curve using quadratic bezier
  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;

    path += ` Q ${prev.x} ${prev.y} ${midX} ${(prev.y + curr.y) / 2}`;
  }

  // Connect to last point
  if (points.length > 1) {
    const last = points[points.length - 1];
    path += ` L ${last.x} ${last.y}`;
  }

  return path;
}

function generateAreaPath(
  data: number[],
  width: number,
  height: number,
  padding: number = 2
): string {
  if (data.length === 0) return "";

  const linePath = generatePath(data, width, height, padding);
  const effectiveWidth = width - padding * 2;

  // Close the path to create an area
  return `${linePath} L ${padding + effectiveWidth} ${height} L ${padding} ${height} Z`;
}

export function MiniChart({
  data,
  width = 50,
  height = 20,
  color,
  showTrend = true,
  className,
  strokeWidth = 1.5,
  showArea = false,
}: MiniChartProps) {
  const trend = React.useMemo(() => calculateTrend(data), [data]);
  const effectiveColor = color || getTrendColor(trend);
  const linePath = React.useMemo(
    () => generatePath(data, width, height),
    [data, width, height]
  );
  const areaPath = React.useMemo(
    () => (showArea ? generateAreaPath(data, width, height) : ""),
    [data, width, height, showArea]
  );

  if (data.length === 0) {
    return (
      <div
        className={cn("flex items-center justify-center", className)}
        style={{ width, height }}
      >
        <span
          className="text-[8px] font-mono uppercase"
          style={{ color: HUD_COLORS.text.steel }}
        >
          NO DATA
        </span>
      </div>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label={`Sparkline chart showing ${data.length} data points with ${trend} trend`}
    >
      {/* Area fill */}
      {showArea && (
        <path
          d={areaPath}
          fill={`${effectiveColor}20`}
          stroke="none"
        />
      )}

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={effectiveColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* End point indicator */}
      {showTrend && data.length > 1 && (
        <circle
          cx={width - 2}
          cy={
            2 +
            (height - 4) -
            ((data[data.length - 1] - Math.min(...data)) /
              (Math.max(...data) - Math.min(...data) || 1)) *
              (height - 4)
          }
          r={2}
          fill={effectiveColor}
        />
      )}
    </svg>
  );
}

// Variant with container styling
export function MiniChartCard({
  data,
  label,
  value,
  unit,
  width = 80,
  height = 24,
  className,
}: MiniChartProps & {
  label?: string;
  value?: string | number;
  unit?: string;
}) {
  const trend = calculateTrend(data);
  const color = getTrendColor(trend);

  return (
    <div
      className={cn("flex items-center gap-3 px-3 py-2 rounded-sm", className)}
      style={{
        backgroundColor: HUD_COLORS.background.gunmetal,
        border: `1px solid ${HUD_COLORS.border.tungsten}`,
      }}
    >
      {/* Labels and value */}
      <div className="flex flex-col">
        {label && (
          <span
            className="text-[10px] font-mono uppercase tracking-wider"
            style={{ color: HUD_COLORS.text.steel }}
          >
            {label}
          </span>
        )}
        {value !== undefined && (
          <div className="flex items-baseline gap-1">
            <span
              className="text-sm font-mono font-bold tabular-nums"
              style={{ color }}
            >
              {value}
            </span>
            {unit && (
              <span
                className="text-[10px] font-mono uppercase"
                style={{ color: HUD_COLORS.text.steel }}
              >
                {unit}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Chart */}
      <MiniChart
        data={data}
        width={width}
        height={height}
        color={color}
        showArea={true}
      />
    </div>
  );
}

// Bar variant for discrete data
export function MiniBarChart({
  data,
  width = 50,
  height = 20,
  color,
  className,
  barGap = 1,
}: MiniChartProps & { barGap?: number }) {
  const trend = calculateTrend(data);
  const effectiveColor = color || getTrendColor(trend);

  if (data.length === 0) {
    return (
      <div
        className={cn("flex items-center justify-center", className)}
        style={{ width, height }}
      >
        <span
          className="text-[8px] font-mono uppercase"
          style={{ color: HUD_COLORS.text.steel }}
        >
          NO DATA
        </span>
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const barWidth = (width - (data.length - 1) * barGap) / data.length;

  return (
    <svg
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label={`Bar chart showing ${data.length} data points`}
    >
      {data.map((value, index) => {
        const barHeight = ((value - min) / range) * (height - 2) + 2;
        const x = index * (barWidth + barGap);
        const y = height - barHeight;

        return (
          <rect
            key={index}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            fill={effectiveColor}
            opacity={0.6 + (index / data.length) * 0.4}
          />
        );
      })}
    </svg>
  );
}

// Horizontal progress bar variant
export function MiniProgressBar({
  value,
  max = 100,
  width = 60,
  height = 6,
  color,
  showThreshold = false,
  threshold = 80,
  className,
}: {
  value: number;
  max?: number;
  width?: number;
  height?: number;
  color?: string;
  showThreshold?: boolean;
  threshold?: number;
  className?: string;
}) {
  const percentage = Math.min(100, (value / max) * 100);
  const isOverThreshold = percentage >= threshold;

  const effectiveColor =
    color ||
    (isOverThreshold ? HUD_COLORS.status.warning : HUD_COLORS.status.reactor);

  return (
    <svg
      width={width}
      height={height}
      className={className}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      {/* Background track */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={HUD_COLORS.border.tungsten}
        rx={1}
      />

      {/* Progress fill */}
      <rect
        x={0}
        y={0}
        width={(percentage / 100) * width}
        height={height}
        fill={effectiveColor}
        rx={1}
      />

      {/* Threshold marker */}
      {showThreshold && (
        <line
          x1={(threshold / 100) * width}
          y1={0}
          x2={(threshold / 100) * width}
          y2={height}
          stroke={HUD_COLORS.text.flash}
          strokeWidth={1}
          opacity={0.5}
        />
      )}
    </svg>
  );
}
