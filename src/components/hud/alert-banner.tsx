"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

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

export type AlertSeverity = "info" | "warning" | "critical";

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message?: string;
  timestamp?: Date;
  dismissible?: boolean;
}

interface AlertBannerProps {
  alerts: Alert[];
  onDismiss?: (id: string) => void;
  onDismissAll?: () => void;
  className?: string;
  autoScrollInterval?: number;
}

function getSeverityColor(severity: AlertSeverity): string {
  switch (severity) {
    case "info":
      return HUD_COLORS.status.reactor;
    case "warning":
      return HUD_COLORS.status.warning;
    case "critical":
      return HUD_COLORS.status.critical;
  }
}

function getSeverityBackground(severity: AlertSeverity): string {
  switch (severity) {
    case "info":
      return `${HUD_COLORS.status.reactor}15`;
    case "warning":
      return `${HUD_COLORS.status.warning}20`;
    case "critical":
      return `${HUD_COLORS.status.critical}25`;
  }
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function SingleAlertBanner({
  alert,
  onDismiss,
}: {
  alert: Alert;
  onDismiss?: (id: string) => void;
}) {
  const color = getSeverityColor(alert.severity);
  const bgColor = getSeverityBackground(alert.severity);
  const isCritical = alert.severity === "critical";

  return (
    <div
      className={cn(
        "relative flex items-center justify-between w-full px-4 py-2 overflow-hidden",
        isCritical && "animate-pulse"
      )}
      style={{
        backgroundColor: bgColor,
        borderBottom: `1px solid ${color}40`,
        // LED glow effect
        boxShadow: `inset 0 0 30px ${color}20, 0 2px 10px ${color}30`,
      }}
      role="alert"
      aria-live={alert.severity === "critical" ? "assertive" : "polite"}
    >
      {/* Severity indicator bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: color }}
      />

      {/* Content */}
      <div className="flex items-center gap-4 ml-2">
        {/* Severity badge */}
        <span
          className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm"
          style={{
            backgroundColor: `${color}30`,
            color: color,
            border: `1px solid ${color}50`,
          }}
        >
          {alert.severity}
        </span>

        {/* Timestamp */}
        {alert.timestamp && (
          <span
            className="text-[10px] font-mono tabular-nums"
            style={{ color: HUD_COLORS.text.steel }}
          >
            [{formatTimestamp(alert.timestamp)}]
          </span>
        )}

        {/* Title and message */}
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-mono font-semibold uppercase tracking-wide"
            style={{ color: color }}
          >
            {alert.title}
          </span>
          {alert.message && (
            <>
              <span style={{ color: HUD_COLORS.text.steel }}>/</span>
              <span
                className="text-sm font-mono"
                style={{ color: HUD_COLORS.text.flash }}
              >
                {alert.message}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Dismiss button */}
      {alert.dismissible !== false && onDismiss && (
        <button
          onClick={() => onDismiss(alert.id)}
          className="flex items-center justify-center w-6 h-6 rounded-sm transition-colors hover:bg-white/10 focus:outline-none focus:ring-1"
          style={{
            color: HUD_COLORS.text.steel,
            // @ts-expect-error CSS custom property
            "--tw-ring-color": color,
          }}
          aria-label={`Dismiss alert: ${alert.title}`}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function AlertBanner({
  alerts,
  onDismiss,
  onDismissAll,
  className,
  autoScrollInterval = 5000,
}: AlertBannerProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  // Auto-scroll through alerts
  React.useEffect(() => {
    if (alerts.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % alerts.length);
    }, autoScrollInterval);

    return () => clearInterval(timer);
  }, [alerts.length, autoScrollInterval, isPaused]);

  // Reset index if alerts change
  React.useEffect(() => {
    if (currentIndex >= alerts.length) {
      setCurrentIndex(Math.max(0, alerts.length - 1));
    }
  }, [alerts.length, currentIndex]);

  if (alerts.length === 0) return null;

  const currentAlert = alerts[currentIndex];
  const highestSeverity = alerts.reduce((highest, alert) => {
    const severityOrder = { critical: 3, warning: 2, info: 1 };
    return severityOrder[alert.severity] > severityOrder[highest]
      ? alert.severity
      : highest;
  }, alerts[0].severity);

  const borderColor = getSeverityColor(highestSeverity);

  return (
    <div
      className={cn("relative w-full", className)}
      style={{
        backgroundColor: HUD_COLORS.background.void,
        border: `1px solid ${borderColor}40`,
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Current alert */}
      <SingleAlertBanner alert={currentAlert} onDismiss={onDismiss} />

      {/* Multi-alert indicator */}
      {alerts.length > 1 && (
        <div
          className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-2"
          role="tablist"
          aria-label="Alert navigation"
        >
          {/* Alert count */}
          <span
            className="text-[10px] font-mono tabular-nums"
            style={{ color: HUD_COLORS.text.steel }}
          >
            {currentIndex + 1}/{alerts.length}
          </span>

          {/* Navigation dots */}
          <div className="flex items-center gap-1">
            {alerts.map((alert, index) => (
              <button
                key={alert.id}
                onClick={() => setCurrentIndex(index)}
                className="w-1.5 h-1.5 rounded-full transition-all focus:outline-none"
                style={{
                  backgroundColor:
                    index === currentIndex
                      ? getSeverityColor(alert.severity)
                      : HUD_COLORS.border.tungsten,
                  transform: index === currentIndex ? "scale(1.3)" : "scale(1)",
                }}
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={`Alert ${index + 1}: ${alert.title}`}
              />
            ))}
          </div>

          {/* Dismiss all */}
          {onDismissAll && (
            <button
              onClick={onDismissAll}
              className="text-[10px] font-mono uppercase tracking-wide px-2 py-0.5 rounded-sm transition-colors hover:bg-white/10"
              style={{
                color: HUD_COLORS.text.steel,
                border: `1px solid ${HUD_COLORS.border.tungsten}`,
              }}
            >
              Clear All
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Stacked version showing all alerts
export function AlertStack({
  alerts,
  onDismiss,
  maxVisible = 3,
  className,
}: AlertBannerProps & { maxVisible?: number }) {
  const visibleAlerts = alerts.slice(0, maxVisible);
  const hiddenCount = Math.max(0, alerts.length - maxVisible);

  if (alerts.length === 0) return null;

  return (
    <div
      className={cn("flex flex-col", className)}
      role="region"
      aria-label={`${alerts.length} active alerts`}
    >
      {visibleAlerts.map((alert) => (
        <SingleAlertBanner key={alert.id} alert={alert} onDismiss={onDismiss} />
      ))}

      {hiddenCount > 0 && (
        <div
          className="px-4 py-1 text-center"
          style={{
            backgroundColor: HUD_COLORS.background.gunmetal,
            borderBottom: `1px solid ${HUD_COLORS.border.tungsten}`,
          }}
        >
          <span
            className="text-[10px] font-mono uppercase tracking-wide"
            style={{ color: HUD_COLORS.text.steel }}
          >
            +{hiddenCount} more alert{hiddenCount > 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}
