"use client";

import * as React from "react";
import { IncidentShell } from "@/components/incident/incident-shell";
import { useIncidentMode } from "@/lib/incident-mode";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import type { IncidentEventPayload, TrustScorePayload } from "@/lib/realtime";

export default function IncidentModePage() {
  const { state, activateIncident, addEvent, updateTrustScore } = useIncidentMode();

  useRealtimeSubscription({
    topic: "incident-events",
    enabled: state.active,
    onEvent: (event) => {
      if (event.type !== "incident.event") return;
      const payload = event.payload as IncidentEventPayload;
      addEvent({
        subsystem: payload.subsystem,
        action: payload.action,
        severity: payload.severity,
        policyRef: payload.policyRef,
        receiptHash: payload.receiptHash,
        actor: payload.actor,
      });
    },
  });

  useRealtimeSubscription({
    topic: "incident-trust",
    enabled: state.active,
    onEvent: (event) => {
      if (event.type !== "incident.trust") return;
      const payload = event.payload as TrustScorePayload;
      if (typeof payload.trustScore === "number") {
        updateTrustScore(payload.trustScore);
      }
    },
  });

  // Auto-activate if accessed directly (for dev/demo purposes)
  // In a real scenario, this might be protected or triggered differently
  React.useEffect(() => {
    if (!state.active) {
       // Optional: Redirect or show a "Start Incident" prompt
       // For now, we'll just show the shell which handles the empty state or we can force activation
    }
  }, [state.active]);

  if (!state.active) {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-[#080909] text-[#C5C6C7]">
              <div className="text-center">
                  <h1 className="text-2xl font-bold mb-4">Incident Mode Inactive</h1>
                  <button 
                      onClick={() => activateIncident({
                          incidentId: `INC-${Date.now().toString(36).toUpperCase()}`,
                          severity: "critical",
                          rootSubsystem: "manual-override",
                          impactedComponents: ["all"]
                      })}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                      Activate Incident Mode
                  </button>
              </div>
          </div>
      )
  }

  return (
    <IncidentShell>
      {/* The Shell handles the layout of the components */}
      <div className="hidden">Incident Mode Active</div> 
    </IncidentShell>
  );
}
