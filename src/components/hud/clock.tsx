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

export type ClockMode = "realtime" | "countdown" | "elapsed";

interface ClockProps {
  mode?: ClockMode;
  showUtc?: boolean;
  showLocal?: boolean;
  showDate?: boolean;
  showSeconds?: boolean;
  targetTime?: Date;
  startTime?: Date;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  onCountdownComplete?: () => void;
}

function formatTime(date: Date, showSeconds: boolean): string {
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: showSeconds ? "2-digit" : undefined,
  });
}

function formatUtcTime(date: Date, showSeconds: boolean): string {
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: showSeconds ? "2-digit" : undefined,
    timeZone: "UTC",
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).toUpperCase();
}

function formatDuration(ms: number): { hours: string; minutes: string; seconds: string; isNegative: boolean } {
  const isNegative = ms < 0;
  const absMs = Math.abs(ms);

  const totalSeconds = Math.floor(absMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    isNegative,
  };
}

const sizeStyles = {
  sm: {
    time: "text-lg",
    label: "text-[10px]",
    secondary: "text-[10px]",
  },
  md: {
    time: "text-2xl",
    label: "text-xs",
    secondary: "text-xs",
  },
  lg: {
    time: "text-4xl",
    label: "text-sm",
    secondary: "text-sm",
  },
};

export function Clock({
  mode = "realtime",
  showUtc = true,
  showLocal = true,
  showDate = true,
  showSeconds = true,
  targetTime,
  startTime,
  label,
  size = "md",
  className,
  onCountdownComplete,
}: ClockProps) {
  const [now, setNow] = React.useState(new Date());
  const [countdownComplete, setCountdownComplete] = React.useState(false);

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Check countdown completion
  React.useEffect(() => {
    if (mode === "countdown" && targetTime && now >= targetTime && !countdownComplete) {
      setCountdownComplete(true);
      onCountdownComplete?.();
    }
  }, [now, targetTime, mode, countdownComplete, onCountdownComplete]);

  const styles = sizeStyles[size];

  // Countdown mode
  if (mode === "countdown" && targetTime) {
    const diff = targetTime.getTime() - now.getTime();
    const duration = formatDuration(diff);
    const isComplete = diff <= 0;

    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-3 rounded-sm",
          className
        )}
        style={{
          backgroundColor: HUD_COLORS.background.gunmetal,
          border: `1px solid ${HUD_COLORS.border.tungsten}`,
        }}
        role="timer"
        aria-label={`Countdown: ${duration.hours}:${duration.minutes}:${duration.seconds}`}
      >
        {label && (
          <span
            className={cn("font-mono uppercase tracking-wider mb-1", styles.label)}
            style={{ color: HUD_COLORS.text.steel }}
          >
            {label}
          </span>
        )}

        <div className="flex items-baseline gap-1">
          {duration.isNegative && (
            <span
              className={cn("font-mono font-bold", styles.time)}
              style={{ color: HUD_COLORS.status.warning }}
            >
              +
            </span>
          )}
          <span
            className={cn("font-mono font-bold tabular-nums tracking-tight", styles.time)}
            style={{
              color: isComplete
                ? HUD_COLORS.status.critical
                : duration.isNegative
                  ? HUD_COLORS.status.warning
                  : HUD_COLORS.status.reactor,
            }}
          >
            {duration.hours}:{duration.minutes}:{duration.seconds}
          </span>
        </div>

        {isComplete && (
          <span
            className={cn(
              "font-mono uppercase tracking-wider mt-1 animate-pulse",
              styles.secondary
            )}
            style={{ color: HUD_COLORS.status.critical }}
          >
            ELAPSED
          </span>
        )}
      </div>
    );
  }

  // Elapsed mode
  if (mode === "elapsed" && startTime) {
    const diff = now.getTime() - startTime.getTime();
    const duration = formatDuration(diff);

    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-3 rounded-sm",
          className
        )}
        style={{
          backgroundColor: HUD_COLORS.background.gunmetal,
          border: `1px solid ${HUD_COLORS.border.tungsten}`,
        }}
        role="timer"
        aria-label={`Elapsed time: ${duration.hours}:${duration.minutes}:${duration.seconds}`}
      >
        {label && (
          <span
            className={cn("font-mono uppercase tracking-wider mb-1", styles.label)}
            style={{ color: HUD_COLORS.text.steel }}
          >
            {label}
          </span>
        )}

        <div className="flex items-baseline gap-1">
          <span
            className={cn("font-mono font-bold tabular-nums tracking-tight", styles.time)}
            style={{ color: HUD_COLORS.text.flash }}
          >
            {duration.hours}:{duration.minutes}:{duration.seconds}
          </span>
        </div>

        <span
          className={cn("font-mono uppercase tracking-wider mt-1", styles.secondary)}
          style={{ color: HUD_COLORS.text.steel }}
        >
          ELAPSED
        </span>
      </div>
    );
  }

  // Realtime mode (default)
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-3 rounded-sm",
        className
      )}
      style={{
        backgroundColor: HUD_COLORS.background.gunmetal,
        border: `1px solid ${HUD_COLORS.border.tungsten}`,
      }}
      role="timer"
      aria-label={`Current time: ${formatTime(now, showSeconds)}`}
    >
      {label && (
        <span
          className={cn("font-mono uppercase tracking-wider mb-1", styles.label)}
          style={{ color: HUD_COLORS.text.steel }}
        >
          {label}
        </span>
      )}

      {/* Main time display */}
      {showLocal && (
        <div className="flex items-baseline gap-2">
          <span
            className={cn("font-mono font-bold tabular-nums tracking-tight", styles.time)}
            style={{ color: HUD_COLORS.status.reactor }}
          >
            {formatTime(now, showSeconds)}
          </span>
          <span
            className={cn("font-mono uppercase", styles.secondary)}
            style={{ color: HUD_COLORS.text.steel }}
          >
            LOCAL
          </span>
        </div>
      )}

      {/* UTC time */}
      {showUtc && (
        <div className="flex items-baseline gap-2 mt-1">
          <span
            className={cn("font-mono tabular-nums", styles.secondary)}
            style={{ color: HUD_COLORS.text.flash }}
          >
            {formatUtcTime(now, showSeconds)}
          </span>
          <span
            className={cn("font-mono uppercase", styles.secondary)}
            style={{ color: HUD_COLORS.text.steel }}
          >
            UTC
          </span>
        </div>
      )}

      {/* Date */}
      {showDate && (
        <span
          className={cn("font-mono mt-2", styles.secondary)}
          style={{ color: HUD_COLORS.text.steel }}
        >
          {formatDate(now)}
        </span>
      )}
    </div>
  );
}

// Compact inline clock
export function ClockInline({
  showUtc = false,
  showSeconds = true,
  className,
}: Pick<ClockProps, "showUtc" | "showSeconds" | "className">) {
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <span
      className={cn("inline-flex items-center gap-2 font-mono tabular-nums", className)}
      role="timer"
    >
      <span style={{ color: HUD_COLORS.status.reactor }}>
        {formatTime(now, showSeconds)}
      </span>
      {showUtc && (
        <>
          <span style={{ color: HUD_COLORS.border.tungsten }}>/</span>
          <span style={{ color: HUD_COLORS.text.steel }}>
            {formatUtcTime(now, showSeconds)} UTC
          </span>
        </>
      )}
    </span>
  );
}

// Mission clock with both countdown and elapsed
export function MissionClock({
  missionStart,
  missionEnd,
  missionName,
  className,
}: {
  missionStart?: Date;
  missionEnd?: Date;
  missionName?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-stretch gap-px rounded-sm overflow-hidden", className)}
      style={{
        backgroundColor: HUD_COLORS.border.tungsten,
        border: `1px solid ${HUD_COLORS.border.tungsten}`,
      }}
    >
      {/* Current time */}
      <Clock
        mode="realtime"
        showUtc={true}
        showLocal={true}
        showDate={true}
        size="md"
        label={missionName || "MISSION CLOCK"}
        className="rounded-none border-none flex-1"
      />

      {/* Mission elapsed */}
      {missionStart && (
        <Clock
          mode="elapsed"
          startTime={missionStart}
          size="md"
          label="T+"
          className="rounded-none border-none"
        />
      )}

      {/* Mission countdown */}
      {missionEnd && (
        <Clock
          mode="countdown"
          targetTime={missionEnd}
          size="md"
          label="T-"
          className="rounded-none border-none"
        />
      )}
    </div>
  );
}
