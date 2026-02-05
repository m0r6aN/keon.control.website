"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type LiveIndicatorState = "live" | "degraded" | "offline";

const stateStyles: Record<LiveIndicatorState, string> = {
  live: "border-[#45A29E] text-[#45A29E]",
  degraded: "border-[#FFB000] text-[#FFB000]",
  offline: "border-[#FF2E2E] text-[#FF2E2E]",
};

const labelMap: Record<LiveIndicatorState, string> = {
  live: "Live",
  degraded: "Degraded",
  offline: "Offline",
};

export function LiveIndicator({
  state = "degraded",
  className,
}: {
  state?: LiveIndicatorState;
  className?: string;
}) {
  return (
    <Badge
      variant="neutral"
      className={cn("px-3 py-1 text-xs uppercase", stateStyles[state], className)}
    >
      {labelMap[state]}
    </Badge>
  );
}
