"use client";

import * as React from "react";
import { useIncidentMode, type IncidentEvent } from "@/lib/incident-mode";
import { formatHash } from "@/lib/format";
import { 
  Pause, 
  Shield, 
  UserCheck, 
  Camera, 
  Clock,
  User,
  AlertTriangle
} from "lucide-react";

/**
 * TACTICAL COMMAND RAIL
 * 
 * This rail is sacred ground during incident response.
 * Always visible. Always ready.
 * 
 * Contents:
 * 1. Immediate Actions (Pause, Clamp, Escalate, Snapshot)
 * 2. Last Irreversible Action
 * 3. Human-in-the-Loop Status
 */
export function TacticalRail() {
  const { state, acknowledgeHuman, addEvent } = useIncidentMode();
  const [slaCountdown, setSlaCountdown] = React.useState("--:--");

  // SLA countdown ticker
  React.useEffect(() => {
    const deadline = new Date(state.humanInLoop.slaDeadline).getTime();
    
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((deadline - now) / 1000));
      
      const mins = Math.floor(diff / 60).toString().padStart(2, "0");
      const secs = (diff % 60).toString().padStart(2, "0");
      
      setSlaCountdown(`${mins}:${secs}`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [state.humanInLoop.slaDeadline]);

  // Derive the most recent human-attributed event from the evidence stream.
  const lastHumanEvent = React.useMemo<IncidentEvent | null>(() => {
    for (let i = state.events.length - 1; i >= 0; i -= 1) {
      const event = state.events[i];
      if (event.actor) {
        return event;
      }
    }
    return null;
  }, [state.events]);

  return (
    <aside className="tactical-rail keon-notch flex w-72 flex-col overflow-hidden">
      {/* Section 1: Immediate Actions */}
      <div className="border-b border-[#2a3342] p-4">
        <h3 className="mb-3 font-mono text-[10px] uppercase tracking-wider text-[#C5C6C7] opacity-50">
          Immediate Actions
        </h3>
        <div className="space-y-2">
          <TacticalButton 
            icon={Pause} 
            label="Pause Execution" 
            onClick={() => {
              addEvent({
                subsystem: "execution-runtime",
                action: "execution.paused.manual",
                severity: "warning",
                actor: "operator",
                policyRef: "emergency-stop-v1"
              });
            }} 
          />
          <TacticalButton 
            icon={Shield} 
            label="Force Policy Clamp" 
            onClick={() => {
              addEvent({
                subsystem: "policy-engine",
                action: "policy.clamp.enforced",
                severity: "critical",
                actor: "operator",
                policyRef: "clamp-override-v2"
              });
            }}
          />
          <TacticalButton 
            icon={UserCheck} 
            label="Escalate to Manual" 
            onClick={() => {
              addEvent({
                subsystem: "governance-layer",
                action: "escalation.manual_override",
                severity: "warning",
                actor: "operator"
              });
            }}
          />
          <TacticalButton 
            icon={Camera} 
            label="Snapshot State" 
            onClick={() => {
              addEvent({
                subsystem: "audit-logger",
                action: "system.snapshot.created",
                severity: "info",
                actor: "operator",
                receiptHash: `snap_${Date.now().toString(36)}`
              });
            }}
          />
        </div>
      </div>

      {/* Section 2: Last Irreversible Action */}
      <div className="border-b border-[#2a3342] p-4">
        <h3 className="mb-3 font-mono text-[10px] uppercase tracking-wider text-[#C5C6C7] opacity-50">
          Last Irreversible Action
        </h3>
        {state.lastIrreversibleAction ? (
          <div className="space-y-2 rounded border border-[#2a3342] bg-[#0B0C10] p-3">
            <div className="flex items-center gap-2 text-xs">
              <Clock className="h-3 w-3 text-[#C5C6C7] opacity-50" />
              <span className="font-mono text-[#C5C6C7]">
                {new Date(state.lastIrreversibleAction.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <User className="h-3 w-3 text-[#C5C6C7] opacity-50" />
              <span className="font-mono text-[#C5C6C7]">
                {state.lastIrreversibleAction.actor}
              </span>
            </div>
            <div className="font-mono text-xs text-[#66FCF1]">
              {formatHash(state.lastIrreversibleAction.receiptHashPrefix)}
            </div>
          </div>
        ) : (
          <div className="rounded border border-[#2a3342] bg-[#0B0C10] p-3 text-center font-mono text-xs text-[#C5C6C7] opacity-50">
            No irreversible actions recorded
          </div>
        )}
      </div>

      {/* Section 3: Human-in-the-Loop Status */}
      <div className="flex-1 p-4">
        <h3 className="mb-3 font-mono text-[10px] uppercase tracking-wider text-[#C5C6C7] opacity-50">
          Human-in-the-Loop
        </h3>
        
        {/* SLA Countdown */}
        <div className="mb-4 flex items-center justify-between rounded border border-[#FF2E2E]/30 bg-[#FF2E2E]/5 p-3">
          <span className="font-mono text-xs uppercase text-[#C5C6C7] opacity-70">SLA</span>
          <span className="hitl-sla-countdown text-lg font-bold">{slaCountdown}</span>
        </div>

        {/* Last Human Action */}
        <div className="mb-4 rounded border border-[#2a3342] bg-[#0B0C10] p-3">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#C5C6C7] opacity-60">
            Last Human Action
          </span>
          {lastHumanEvent ? (
            <div className="flex items-center justify-between gap-2 font-mono text-xs text-[#C5C6C7]">
              <span className="truncate">
                {lastHumanEvent.actor} 
                <span className="opacity-70">
                  — {lastHumanEvent.action === "operator.acknowledged.incident" ? "ACK" : lastHumanEvent.action}
                </span>
              </span>
              <span className="whitespace-nowrap opacity-70">
                {new Date(lastHumanEvent.timestamp).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })}
              </span>
            </div>
          ) : (
            <span className="font-mono text-xs text-[#C5C6C7] opacity-50">
              — none yet —
            </span>
          )}
        </div>

        {/* Acknowledged */}
        {state.humanInLoop.acknowledged.length > 0 && (
          <div className="mb-3">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-[#45A29E]">
              Acknowledged
            </span>
            <div className="space-y-1">
              {state.humanInLoop.acknowledged.map((id) => (
                <div key={id} className="flex items-center gap-2 rounded bg-[#45A29E]/10 px-2 py-1">
                  <User className="h-3 w-3 text-[#45A29E]" />
                  <span className="font-mono text-xs text-[#45A29E]">{id}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing */}
        {state.humanInLoop.missing.length > 0 && (
          <div>
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-[#FF6B00]">
              Awaiting Response
            </span>
            <div className="space-y-1">
              {state.humanInLoop.missing.map((id) => (
                <button
                  key={id}
                  onClick={() => acknowledgeHuman(id)}
                  className="flex w-full items-center justify-between gap-2 rounded border border-[#FF6B00]/30 bg-[#FF6B00]/5 px-2 py-1.5 transition-colors hover:border-[#FF6B00] hover:bg-[#FF6B00]/10"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3 text-[#FF6B00]" />
                    <span className="font-mono text-xs text-[#FF6B00]">{id}</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#C5C6C7] opacity-50">ACK</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function TacticalButton({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="tactical-action flex w-full items-center gap-3 px-3 py-2.5 text-xs hover:bg-[#384656]/50 transition-colors"
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

