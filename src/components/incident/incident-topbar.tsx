"use client";

import * as React from "react";
import { useIncidentMode } from "@/lib/incident-mode";
import { cn } from "@/lib/utils";
import { AlertTriangle, Shield, Users, Download } from "lucide-react";

/**
 * INCIDENT TOPBAR (The Spine)
 * 
 * No nav. No distractions.
 * - INCIDENT ACTIVE — SEVERITY X
 * - Incident ID
 * - Elapsed Time (ticking)
 * - Trust Score (live)
 * - EXIT button (disabled until conditions met)
 */
export function IncidentTopBar() {
  const { state, deactivateIncident, checkExitConditions } = useIncidentMode();
  const [elapsed, setElapsed] = React.useState("00:00:00");

  // Elapsed time ticker
  React.useEffect(() => {
    if (!state.startedAt) return;

    const tick = () => {
      const start = new Date(state.startedAt!).getTime();
      const now = Date.now();
      const diff = Math.floor((now - start) / 1000);
      
      const hours = Math.floor(diff / 3600).toString().padStart(2, "0");
      const mins = Math.floor((diff % 3600) / 60).toString().padStart(2, "0");
      const secs = (diff % 60).toString().padStart(2, "0");
      
      setElapsed(`${hours}:${mins}:${secs}`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [state.startedAt]);

  // Check exit conditions periodically
  React.useEffect(() => {
    const interval = setInterval(checkExitConditions, 5000);
    return () => clearInterval(interval);
  }, [checkExitConditions]);

  const trustLabel = state.trustScore >= state.trustScoreThreshold
    ? "Controls holding"
    : "Controls at risk";

  const severityLabel = {
    critical: "CRITICAL",
    high: "HIGH",
    medium: "MEDIUM",
  };

  const severityColor = {
    critical: "bg-[#FF2E2E] text-[#0B0C10]",
    high: "bg-[#FF6B00] text-[#0B0C10]",
    medium: "bg-[#FFB000] text-[#0B0C10]",
  };

  return (
    <header className="incident-spine flex h-16 items-center justify-between px-6">
      {/* Left: Incident Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider",
            state.severity ? severityColor[state.severity] : "bg-[#FF2E2E] text-[#0B0C10]"
          )}>
            <AlertTriangle className="h-4 w-4" />
            INCIDENT ACTIVE — {state.severity ? severityLabel[state.severity] : "CRITICAL"}
          </div>
        </div>
        
        <div className="h-6 w-px bg-[#384656]" />
        
        <div className="font-mono text-xs text-[#C5C6C7]">
          <span className="opacity-50">ID:</span>{" "}
          <span className="text-[#66FCF1]">{state.incidentId ?? "INC-UNKNOWN"}</span>
        </div>
      </div>

      {/* Center: Metrics */}
      <div className="flex items-center gap-6">
        {/* Elapsed Time */}
        <div className="flex flex-col items-center">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#C5C6C7] opacity-50">
            Elapsed
          </span>
          <span className="incident-timer text-lg font-bold">{elapsed}</span>
        </div>

        <div className="h-8 w-px bg-[#384656]" />

        {/* Trust Score */}
        <div className="flex flex-col items-center">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#C5C6C7] opacity-50">
            Trust Score
          </span>
          <span className={cn(
            "font-mono text-lg font-bold",
            state.trustScore >= state.trustScoreThreshold ? "text-[#45A29E]" : "text-[#FF2E2E]"
          )}>
            {state.trustScore}%
          </span>
          <span className="mt-0.5 font-mono text-[10px] text-[#C5C6C7] opacity-60">
            {trustLabel}
          </span>
        </div>

        <div className="h-8 w-px bg-[#384656]" />

        {/* Quorum State */}
        <div className="flex flex-col items-center">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#C5C6C7] opacity-50">
            Quorum
          </span>
          <div className="flex items-center gap-1.5">
            <Shield className={cn(
              "h-4 w-4",
              state.quorumState === "met" ? "text-[#45A29E]" : 
              state.quorumState === "pending" ? "text-[#FFB000]" : "text-[#FF2E2E]"
            )} />
            <span className="font-mono text-sm uppercase text-[#C5C6C7]">
              {state.quorumState}
            </span>
          </div>
        </div>

        <div className="h-8 w-px bg-[#384656]" />

        {/* HITL Status */}
        <div className="flex flex-col items-center">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#C5C6C7] opacity-50">
            Operators
          </span>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-[#C5C6C7]" />
            <span className="hitl-acknowledged font-mono text-sm">
              {state.humanInLoop.acknowledged.length}
            </span>
            <span className="text-[#C5C6C7] opacity-30">/</span>
            <span className="hitl-missing font-mono text-sm">
              {state.humanInLoop.missing.length}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => {
            const data = JSON.stringify(state.events, null, 2);
            const blob = new Blob([data], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `incident-evidence-${state.incidentId || "draft"}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
          className="flex items-center gap-2 rounded border border-[#384656] bg-[#0B0C10] px-3 py-1.5 text-xs font-medium text-[#C5C6C7] hover:bg-[#384656]/50 hover:text-[#66FCF1]"
        >
          <Download className="h-4 w-4" />
          <span>Export Evidence</span>
        </button>

        <button
          onClick={deactivateIncident}
          disabled={!state.exitConditionsMet}
          data-can-exit={state.exitConditionsMet}
          className="incident-exit-btn px-4 py-2 font-mono text-xs uppercase tracking-wider"
        >
          Exit Incident Mode
        </button>
      </div>
    </header>
  );
}

