"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { MiniChart } from "./mini-chart";

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

export type MetricStatus = "nominal" | "warning" | "critical";
export type TrendDirection = "up" | "down" | "flat";

export interface MetricData {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  status: MetricStatus;
  trend?: TrendDirection;
  trendValue?: string;
  sparklineData?: number[];
}

interface MetricsPanelProps {
  metrics: MetricData[];
  columns?: 2 | 3 | 4 | 6;
  className?: string;
  showSparklines?: boolean;
}

function getStatusColor(status: MetricStatus): string {
  switch (status) {
    case "nominal":
      return HUD_COLORS.status.reactor;
    case "warning":
      return HUD_COLORS.status.warning;
    case "critical":
      return HUD_COLORS.status.critical;
  }
}

function getTrendIcon(trend: TrendDirection): string {
  switch (trend) {
    case "up":
      return "\u25B2"; // Up triangle
    case "down":
      return "\u25BC"; // Down triangle
    case "flat":
      return "\u25C6"; // Diamond
  }
}

function getTrendColor(trend: TrendDirection, status: MetricStatus): string {
  if (status === "critical") return HUD_COLORS.status.critical;
  if (status === "warning") return HUD_COLORS.status.warning;

  switch (trend) {
    case "up":
      return HUD_COLORS.status.reactor;
    case "down":
      return HUD_COLORS.status.warning;
    case "flat":
      return HUD_COLORS.text.steel;
  }
}

function MetricCard({
  metric,
  showSparkline,
}: {
  metric: MetricData;
  showSparkline: boolean;
}) {
  const statusColor = getStatusColor(metric.status);
  const trendColor = metric.trend
    ? getTrendColor(metric.trend, metric.status)
    : undefined;

  return (
    <div
      className="flex flex-col justify-between p-3 min-h-[80px]"
      style={{ backgroundColor: HUD_COLORS.background.void }}
      role="article"
      aria-label={`${metric.label}: ${metric.value}${metric.unit || ""}`}
    >
      {/* Label */}
      <div
        className="text-[10px] font-medium uppercase tracking-wider truncate"
        style={{ color: HUD_COLORS.text.steel }}
      >
        {metric.label}
      </div>

      {/* Value Row */}
      <div className="flex items-end justify-between gap-2">
        <div className="flex items-baseline gap-1">
          {/* Main Value */}
          <span
            className="text-2xl font-mono font-bold leading-none tabular-nums"
            style={{ color: statusColor }}
          >
            {metric.value}
          </span>
          {/* Unit */}
          {metric.unit && (
            <span
              className="text-xs font-mono uppercase"
              style={{ color: HUD_COLORS.text.steel }}
            >
              {metric.unit}
            </span>
          )}
        </div>

        {/* Trend Indicator */}
        {metric.trend && (
          <div
            className="flex items-center gap-1 text-xs font-mono"
            style={{ color: trendColor }}
            aria-label={`Trend: ${metric.trend}${metric.trendValue ? ` ${metric.trendValue}` : ""}`}
          >
            <span className="text-[10px]">{getTrendIcon(metric.trend)}</span>
            {metric.trendValue && <span>{metric.trendValue}</span>}
          </div>
        )}
      </div>

      {/* Sparkline */}
      {showSparkline && metric.sparklineData && (
        <div className="mt-2">
          <MiniChart
            data={metric.sparklineData}
            color={statusColor}
            width={80}
            height={16}
          />
        </div>
      )}
    </div>
  );
}

export function MetricsPanel({
  metrics,
  columns = 4,
  className,
  showSparklines = false,
}: MetricsPanelProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    6: "grid-cols-6",
  };

  return (
    <div
      className={cn("rounded-sm", className)}
      style={{
        backgroundColor: HUD_COLORS.background.gunmetal,
        border: `1px solid ${HUD_COLORS.border.tungsten}`,
      }}
      role="region"
      aria-label="Metrics Panel"
    >
      <div
        className={cn(
          "grid",
          gridCols[columns],
          // Tungsten borders between cells
          "[&>*]:border-r [&>*]:border-b",
          "[&>*:nth-child(" + columns + "n)]:border-r-0",
          // Remove bottom border on last row
          "last-row-no-border"
        )}
        style={{
          // Use CSS custom property for border color
          ["--tw-border-opacity" as string]: 1,
        }}
      >
        {metrics.map((metric, index) => (
          <div
            key={metric.id}
            style={{
              borderColor: HUD_COLORS.border.tungsten,
              // Remove bottom border for last row items
              borderBottomWidth:
                index >= metrics.length - (metrics.length % columns || columns)
                  ? 0
                  : 1,
              // Remove right border for items in last column
              borderRightWidth: (index + 1) % columns === 0 ? 0 : 1,
            }}
          >
            <MetricCard metric={metric} showSparkline={showSparklines} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Preset configurations for common use cases
export function SystemMetricsPanel({
  className,
}: {
  className?: string;
}) {
  // Example system metrics - in production these would be props
  const systemMetrics: MetricData[] = [
    {
      id: "cpu",
      label: "CPU Load",
      value: "23",
      unit: "%",
      status: "nominal",
      trend: "flat",
      trendValue: "0.2%",
    },
    {
      id: "memory",
      label: "Memory",
      value: "4.2",
      unit: "GB",
      status: "nominal",
      trend: "up",
      trendValue: "+120MB",
    },
    {
      id: "latency",
      label: "Latency",
      value: "12",
      unit: "ms",
      status: "nominal",
      trend: "down",
      trendValue: "-3ms",
    },
    {
      id: "throughput",
      label: "Throughput",
      value: "1.2K",
      unit: "req/s",
      status: "nominal",
      trend: "up",
      trendValue: "+15%",
    },
  ];

  return <MetricsPanel metrics={systemMetrics} columns={4} className={className} />;
}
