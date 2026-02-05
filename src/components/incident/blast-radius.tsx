"use client";

import * as React from "react";
import { useIncidentMode } from "@/lib/incident-mode";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowRight, FileText, Shield, Server } from "lucide-react";

/**
 * BLAST RADIUS VIEW
 * 
 * The primary failure focus (60-70% width).
 * Shows:
 * - Root failing subsystem
 * - Downstream impacted components
 * - Active policies involved
 * - Quorum state
 * 
 * No zooming. No panning.
 * If it doesn't fit, it doesn't belong here.
 */
export function BlastRadiusView() {
  const { state } = useIncidentMode();

  // Identify the most relevant triggering event for the root subsystem.
  const rootTriggerEvent = React.useMemo(() => {
    if (!state.rootSubsystem || state.events.length === 0) return null;

    const matching = state.events.filter((event) => event.subsystem === state.rootSubsystem);
    if (matching.length > 0) {
      return matching[matching.length - 1];
    }

    // Fallback: use the most recent event if nothing is explicitly tagged
    return state.events[state.events.length - 1];
  }, [state.events, state.rootSubsystem]);

  // Derive a directional impact status for each downstream component
  // from the existing incident events (no new sources of truth).
  const getComponentImpactStatus = React.useCallback(
    (component: string) => {
      const related = state.events.filter((event) => event.subsystem === component);

      if (related.some((event) => event.severity === "critical")) {
        return "blocked" as const;
      }

      if (related.some((event) => event.severity === "warning")) {
        return "degraded" as const;
      }

      if (related.length > 0) {
        return "observing" as const;
      }

      // Component is marked as impacted but we have no specific events yet.
      return "impacted" as const;
    },
    [state.events]
  );

  return (
    <div className="blast-radius-panel keon-notch flex-1 overflow-hidden rounded">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#FF2E2E]/30 bg-[#FF2E2E]/5 px-4 py-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-[#FF2E2E]" />
          <h2 className="font-['Rajdhani'] text-lg font-bold uppercase tracking-wide text-[#FF2E2E]">
            Blast Radius
          </h2>
        </div>
        <div className="font-mono text-xs text-[#C5C6C7] opacity-50">
          {state.impactedComponents.length + 1} subsystems affected
        </div>
      </div>

      <div className="p-6">
        {/* Root Subsystem */}
        <div className="mb-6">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-[#C5C6C7] opacity-50">
            Root Failure
          </span>
          <div className="flex items-center gap-4 rounded border-2 border-[#FF2E2E] bg-[#FF2E2E]/10 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded bg-[#FF2E2E]">
              <Server className="h-6 w-6 text-[#0B0C10]" />
            </div>
            <div>
              <span className="font-['Rajdhani'] text-xl font-bold text-[#C5C6C7]">
                {state.rootSubsystem ?? "Unknown Subsystem"}
              </span>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded bg-[#FF2E2E] px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-[#0B0C10]">
                  Critical
                </span>
                <span className="font-mono text-xs text-[#C5C6C7] opacity-50">
                  Primary failure point
                </span>
                {rootTriggerEvent && (
                  <div className="font-mono text-[10px] text-[#C5C6C7] opacity-70">
                    Trigger: {rootTriggerEvent.action}{" "}
                    <span className="opacity-60">
                      (detected at
                      {" "}
                      {new Date(rootTriggerEvent.timestamp).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false,
                      })}
                      )
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Downstream Impact */}
        {state.impactedComponents.length > 0 && (
          <div className="mb-6">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-[#C5C6C7] opacity-50">
              Downstream Impact
            </span>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {state.impactedComponents.map((component) => {
                const impactStatus = getComponentImpactStatus(component);

                const containerClasses = cn(
                  "flex items-center gap-3 rounded p-3",
                  impactStatus === "blocked" && "border-2 border-[#FF2E2E] bg-[#FF2E2E]/10",
                  impactStatus === "degraded" && "border border-[#FF6B00]/70 bg-[#FF6B00]/10",
                  impactStatus === "observing" && "border border-[#C5C6C7]/40 bg-[#C5C6C7]/5",
                  impactStatus === "impacted" && "border border-[#FF6B00]/50 bg-[#FF6B00]/5"
                );

                const statusLabel =
                  impactStatus === "blocked"
                    ? "blocked"
                    : impactStatus === "degraded"
                    ? "degraded"
                    : impactStatus === "observing"
                    ? "observing"
                    : "impacted";

                const statusBadgeClasses = cn(
                  "inline-flex w-fit rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide",
                  impactStatus === "blocked" && "bg-[#FF2E2E] text-[#0B0C10]",
                  impactStatus === "degraded" && "bg-[#FF6B00] text-[#0B0C10]",
                  impactStatus === "observing" && "bg-[#C5C6C7] text-[#0B0C10]",
                  impactStatus === "impacted" && "bg-[#FF6B00] text-[#0B0C10] opacity-80"
                );

                return (
                  <div key={component} className={containerClasses}>
                    <ArrowRight className="h-4 w-4 text-[#FF6B00]" />
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-sm text-[#C5C6C7]">{component}</span>
                      <span className={statusBadgeClasses}>{statusLabel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Policies */}
        <div className="mb-6">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-[#C5C6C7] opacity-50">
            Active Policies
          </span>
          <div className="flex flex-wrap gap-2">
            {(state.activePolicies.length > 0 ? state.activePolicies : ["budget-approval", "authority-check", "rate-limit"]).map((policy) => (
              <div
                key={policy}
                className="flex items-center gap-2 rounded border border-[#384656] bg-[#0B0C10] px-3 py-2"
              >
                <FileText className="h-3.5 w-3.5 text-[#66FCF1]" />
                <span className="font-mono text-xs text-[#C5C6C7]">{policy}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quorum State */}
        <div>
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-[#C5C6C7] opacity-50">
            Quorum Status
          </span>
          <div className={cn(
            "flex items-center gap-4 rounded border p-4",
            state.quorumState === "met" 
              ? "border-[#45A29E] bg-[#45A29E]/5" 
              : state.quorumState === "pending"
              ? "border-[#FFB000] bg-[#FFB000]/5"
              : "border-[#FF2E2E] bg-[#FF2E2E]/5"
          )}>
            <Shield className={cn(
              "h-8 w-8",
              state.quorumState === "met" 
                ? "text-[#45A29E]" 
                : state.quorumState === "pending"
                ? "text-[#FFB000]"
                : "text-[#FF2E2E]"
            )} />
            <div>
              <span className={cn(
                "font-['Rajdhani'] text-lg font-bold uppercase",
                state.quorumState === "met" 
                  ? "text-[#45A29E]" 
                  : state.quorumState === "pending"
                  ? "text-[#FFB000]"
                  : "text-[#FF2E2E]"
              )}>
                Quorum {state.quorumState}
              </span>
              <p className="font-mono text-xs text-[#C5C6C7] opacity-60">
                {state.quorumState === "met" 
                  ? "All required approvals received"
                  : state.quorumState === "pending"
                  ? "Awaiting additional approvals"
                  : "Quorum requirements not satisfied"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

