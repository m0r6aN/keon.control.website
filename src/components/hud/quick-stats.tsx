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

export type StatStatus = "nominal" | "warning" | "critical" | "neutral";

export interface QuickStat {
  id: string;
  label: string;
  value: string | number;
  status?: StatStatus;
}

interface QuickStatsProps {
  stats: QuickStat[];
  separator?: string;
  className?: string;
  variant?: "inline" | "spaced" | "bordered";
}

function getStatusColor(status: StatStatus | undefined): string {
  switch (status) {
    case "nominal":
      return HUD_COLORS.status.reactor;
    case "warning":
      return HUD_COLORS.status.warning;
    case "critical":
      return HUD_COLORS.status.critical;
    case "neutral":
    default:
      return HUD_COLORS.text.flash;
  }
}

function StatItem({
  stat,
  showSeparator,
  separator,
}: {
  stat: QuickStat;
  showSeparator: boolean;
  separator: string;
}) {
  const valueColor = getStatusColor(stat.status);

  return (
    <span className="inline-flex items-center">
      <span
        className="text-xs font-mono uppercase tracking-wide"
        style={{ color: HUD_COLORS.text.steel }}
      >
        {stat.label}:
      </span>
      <span
        className="text-xs font-mono font-semibold tabular-nums ml-1"
        style={{ color: valueColor }}
      >
        {typeof stat.value === "number"
          ? stat.value.toLocaleString()
          : stat.value}
      </span>
      {showSeparator && (
        <span
          className="mx-2 font-mono"
          style={{ color: HUD_COLORS.border.tungsten }}
        >
          {separator}
        </span>
      )}
    </span>
  );
}

export function QuickStats({
  stats,
  separator = "|",
  className,
  variant = "inline",
}: QuickStatsProps) {
  const variantStyles = {
    inline: {
      container: "px-3 py-1.5",
      gap: "",
    },
    spaced: {
      container: "px-4 py-2 justify-between",
      gap: "flex-1",
    },
    bordered: {
      container: "px-0 py-0 divide-x",
      gap: "",
    },
  };

  if (variant === "bordered") {
    return (
      <div
        className={cn(
          "flex items-center rounded-sm overflow-hidden",
          className
        )}
        style={{
          backgroundColor: HUD_COLORS.background.gunmetal,
          border: `1px solid ${HUD_COLORS.border.tungsten}`,
        }}
        role="region"
        aria-label="Quick statistics"
      >
        {stats.map((stat) => {
          const valueColor = getStatusColor(stat.status);
          return (
            <div
              key={stat.id}
              className="flex flex-col items-center px-4 py-2"
              style={{ borderColor: HUD_COLORS.border.tungsten }}
            >
              <span
                className="text-[10px] font-mono uppercase tracking-wider"
                style={{ color: HUD_COLORS.text.steel }}
              >
                {stat.label}
              </span>
              <span
                className="text-sm font-mono font-bold tabular-nums"
                style={{ color: valueColor }}
              >
                {typeof stat.value === "number"
                  ? stat.value.toLocaleString()
                  : stat.value}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center flex-wrap rounded-sm",
        variantStyles[variant].container,
        className
      )}
      style={{
        backgroundColor: HUD_COLORS.background.gunmetal,
        border: `1px solid ${HUD_COLORS.border.tungsten}`,
      }}
      role="region"
      aria-label="Quick statistics"
    >
      {stats.map((stat, index) => (
        <React.Fragment key={stat.id}>
          <StatItem
            stat={stat}
            showSeparator={variant === "inline" && index < stats.length - 1}
            separator={separator}
          />
          {variant === "spaced" && index < stats.length - 1 && (
            <div className={variantStyles[variant].gap} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Minimal version without container
export function QuickStatsInline({
  stats,
  separator = "|",
  className,
}: Omit<QuickStatsProps, "variant">) {
  return (
    <div
      className={cn("inline-flex items-center flex-wrap", className)}
      role="region"
      aria-label="Quick statistics"
    >
      {stats.map((stat, index) => (
        <StatItem
          key={stat.id}
          stat={stat}
          showSeparator={index < stats.length - 1}
          separator={separator}
        />
      ))}
    </div>
  );
}

// Preset for common execution stats
export function ExecutionStats({
  executions,
  receipts,
  alerts,
  className,
}: {
  executions: number;
  receipts: number;
  alerts: number;
  className?: string;
}) {
  const stats: QuickStat[] = [
    {
      id: "executions",
      label: "Executions",
      value: executions,
      status: "nominal",
    },
    {
      id: "receipts",
      label: "Receipts",
      value: receipts,
      status: "nominal",
    },
    {
      id: "alerts",
      label: "Alerts",
      value: alerts,
      status: alerts === 0 ? "nominal" : alerts < 5 ? "warning" : "critical",
    },
  ];

  return <QuickStats stats={stats} className={className} />;
}
