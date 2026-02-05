"use client";

import * as React from "react";
import { useIncidentMode, type IncidentEvent } from "@/lib/incident-mode";
import { cn } from "@/lib/utils";
import { formatHash } from "@/lib/format";
import { ExternalLink } from "lucide-react";

/**
 * EVIDENCE TIMELINE
 * 
 * In Incident Mode, this is no longer a feed.
 * It's a court-admissible timeline.
 * 
 * Rules:
 * - Strict chronological order
 * - No collapsing
 * - No filtering
 * - No re-sorting
 */
export function EvidenceTimeline() {
  const { state } = useIncidentMode();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new events
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.events.length]);

  // Use mock events if none exist
  const events: IncidentEvent[] = state.events.length > 0 ? state.events : [
    {
      id: "evt_001",
      timestamp: "2026-01-04T14:05:00.000Z",
      subsystem: "agent-orchestrator",
      action: "execution.started",
      severity: "info",
      policyRef: "pol-budget-001",
      receiptHash: "rcpt_01923e6a46a977f29cba",
    },
    {
      id: "evt_002",
      timestamp: "2026-01-04T14:06:00.000Z",
      subsystem: "policy-engine",
      action: "policy.evaluated",
      severity: "info",
      policyRef: "pol-authority-002",
      receiptHash: "rcpt_01923e6a46a977f29cbb",
    },
    {
      id: "evt_003",
      timestamp: "2026-01-04T14:07:00.000Z",
      subsystem: "budget-controller",
      action: "threshold.exceeded",
      severity: "warning",
      policyRef: "pol-budget-001",
      receiptHash: "rcpt_01923e6a46a977f29cbc",
    },
    {
      id: "evt_004",
      timestamp: "2026-01-04T14:08:00.000Z",
      subsystem: "agent-orchestrator",
      action: "execution.blocked",
      severity: "critical",
      policyRef: "pol-authority-002",
      receiptHash: "rcpt_01923e6a46a977f29cbd",
      actor: "agent-gpt4",
    },
  ];

  return (
    <div className="keon-notch flex h-full flex-col overflow-hidden rounded border border-[#384656] bg-[#0B0C10]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#384656] px-4 py-3">
        <h3 className="font-mono text-xs uppercase tracking-wider text-[#C5C6C7]">
          Evidence Timeline
        </h3>
        <span className="font-mono text-[10px] text-[#C5C6C7] opacity-50">
          {events.length} events • chronological
        </span>
      </div>

      {/* Timeline */}
      <div ref={scrollRef} className="evidence-timeline flex-1 overflow-y-auto p-4">
        {events.map((event) => (
          <div key={event.id} className="evidence-timeline-entry">
            {/* Severity Notch */}
            <div className={cn(
              "severity-notch rounded-full",
              event.severity === "critical" && "severity-notch-critical",
              event.severity === "warning" && "severity-notch-warning",
              event.severity === "info" && "severity-notch-info"
            )} />

            {/* Event Content */}
            <div className="min-w-0 flex-1">
              {/* Timestamp + Subsystem */}
              <div className="mb-1 flex items-center gap-3">
                <span className="font-mono text-[10px] tabular-nums text-[#C5C6C7] opacity-50">
                  {new Date(event.timestamp).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })}
                </span>
                <span className="font-mono text-xs text-[#66FCF1]">
                  {event.subsystem}
                </span>
              </div>

              {/* Action */}
              <div className="mb-2 font-mono text-sm text-[#C5C6C7]">
                {event.action}
                {event.actor && (
                  <span className="ml-2 text-[#C5C6C7] opacity-50">
                    by {event.actor}
                  </span>
                )}
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4">
                {event.policyRef && (
                  <span className="font-mono text-[10px] text-[#C5C6C7] opacity-50">
                    policy: {event.policyRef}
                  </span>
                )}
                {event.receiptHash && (
                  <button className="flex items-center gap-1 font-mono text-[10px] text-[#45A29E] hover:text-[#66FCF1]">
                    <span>{formatHash(event.receiptHash)}</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
