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

export type SubsystemStatus = "operational" | "degraded" | "offline";

export interface Subsystem {
  id: string;
  name: string;
  status: SubsystemStatus;
}

interface StatusBarProps {
  subsystems: Subsystem[];
  className?: string;
}

function getStatusColor(status: SubsystemStatus): string {
  switch (status) {
    case "operational":
      return HUD_COLORS.status.reactor;
    case "degraded":
      return HUD_COLORS.status.warning;
    case "offline":
      return HUD_COLORS.status.critical;
  }
}

function getOverallStatus(subsystems: Subsystem[]): {
  status: "operational" | "degraded" | "critical";
  message: string;
} {
  const offline = subsystems.filter((s) => s.status === "offline").length;
  const degraded = subsystems.filter((s) => s.status === "degraded").length;

  if (offline > 0) {
    return {
      status: "critical",
      message: `CRITICAL: ${offline} system${offline > 1 ? "s" : ""} offline`,
    };
  }
  if (degraded > 0) {
    return {
      status: "degraded",
      message: `DEGRADED: ${degraded} system${degraded > 1 ? "s" : ""} impaired`,
    };
  }
  return {
    status: "operational",
    message: "ALL SYSTEMS OPERATIONAL",
  };
}

function StatusDot({
  subsystem,
  showTooltip = true,
}: {
  subsystem: Subsystem;
  showTooltip?: boolean;
}) {
  const color = getStatusColor(subsystem.status);
  const isHealthy = subsystem.status === "operational";
  const isPulsing = subsystem.status !== "operational";

  return (
    <div
      className="relative group"
      role="status"
      aria-label={`${subsystem.name}: ${subsystem.status}`}
    >
      {/* Glow effect for healthy systems */}
      {isHealthy && (
        <div
          className="absolute inset-0 rounded-full blur-sm opacity-60"
          style={{ backgroundColor: color }}
        />
      )}

      {/* Pulsing ring for unhealthy systems */}
      {isPulsing && (
        <div
          className="absolute inset-[-2px] rounded-full animate-ping opacity-40"
          style={{ backgroundColor: color }}
        />
      )}

      {/* Main dot */}
      <div
        className={cn(
          "relative w-2 h-2 rounded-full",
          isPulsing && "animate-pulse"
        )}
        style={{ backgroundColor: color }}
      />

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-mono uppercase tracking-wide whitespace-nowrap rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
          style={{
            backgroundColor: HUD_COLORS.background.void,
            border: `1px solid ${HUD_COLORS.border.tungsten}`,
            color: getStatusColor(subsystem.status),
          }}
        >
          {subsystem.name}
          <span style={{ color: HUD_COLORS.text.steel }}> / </span>
          {subsystem.status.toUpperCase()}
        </div>
      )}
    </div>
  );
}

export function StatusBar({ subsystems, className }: StatusBarProps) {
  const { status, message } = getOverallStatus(subsystems);
  const statusColor =
    status === "operational"
      ? HUD_COLORS.status.reactor
      : status === "degraded"
        ? HUD_COLORS.status.warning
        : HUD_COLORS.status.critical;

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-2 rounded-sm",
        className
      )}
      style={{
        backgroundColor: HUD_COLORS.background.gunmetal,
        border: `1px solid ${HUD_COLORS.border.tungsten}`,
        // Reactor blue glow when healthy
        boxShadow:
          status === "operational"
            ? `0 0 20px ${HUD_COLORS.status.reactor}20, inset 0 0 20px ${HUD_COLORS.status.reactor}10`
            : status === "critical"
              ? `0 0 20px ${HUD_COLORS.status.critical}30`
              : undefined,
      }}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      {/* Status indicator and message */}
      <div className="flex items-center gap-3">
        {/* Status LED */}
        <div className="relative">
          {status === "operational" && (
            <div
              className="absolute inset-[-2px] rounded-full blur-sm opacity-60"
              style={{ backgroundColor: statusColor }}
            />
          )}
          <div
            className={cn(
              "relative w-3 h-3 rounded-full",
              status !== "operational" && "animate-pulse"
            )}
            style={{ backgroundColor: statusColor }}
          />
        </div>

        {/* Status text */}
        <span
          className="text-xs font-mono font-semibold uppercase tracking-wider"
          style={{ color: statusColor }}
        >
          {message}
        </span>
      </div>

      {/* Subsystem status dots */}
      <div className="flex items-center gap-3">
        <span
          className="text-[10px] font-mono uppercase tracking-wide mr-2"
          style={{ color: HUD_COLORS.text.steel }}
        >
          Subsystems
        </span>
        <div className="flex items-center gap-2">
          {subsystems.map((subsystem) => (
            <StatusDot key={subsystem.id} subsystem={subsystem} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Compact version for tight spaces
export function StatusBarCompact({
  subsystems,
  className,
}: StatusBarProps) {
  const { status, message } = getOverallStatus(subsystems);
  const statusColor =
    status === "operational"
      ? HUD_COLORS.status.reactor
      : status === "degraded"
        ? HUD_COLORS.status.warning
        : HUD_COLORS.status.critical;

  return (
    <div
      className={cn("flex items-center gap-2 px-3 py-1", className)}
      style={{
        backgroundColor: HUD_COLORS.background.void,
        borderBottom: `1px solid ${HUD_COLORS.border.tungsten}`,
      }}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          status !== "operational" && "animate-pulse"
        )}
        style={{ backgroundColor: statusColor }}
      />
      <span
        className="text-[10px] font-mono uppercase tracking-wide"
        style={{ color: statusColor }}
      >
        {status === "operational" ? "OK" : status.toUpperCase()}
      </span>
      <div className="flex items-center gap-1 ml-2">
        {subsystems.map((subsystem) => (
          <StatusDot key={subsystem.id} subsystem={subsystem} showTooltip={false} />
        ))}
      </div>
    </div>
  );
}
