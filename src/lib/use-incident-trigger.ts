"use client";

import * as React from "react";
import { useIncidentMode } from "./incident-mode";

/**
 * INCIDENT MODE TRIGGER HOOK
 * 
 * Handles:
 * - Keyboard shortcut: Shift+Enter to manually trigger
 * - Automatic triggers from red events
 * - Exit condition monitoring
 */
export function useIncidentTrigger() {
  const { state, activateIncident, addEvent, updateTrustScore } = useIncidentMode();

  // Keyboard shortcut: Shift+Enter
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if in input fields
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      // Shift+Enter to trigger incident mode
      if (e.shiftKey && e.key === "Enter") {
        e.preventDefault();
        
        if (!state.active) {
          activateIncident({
            incidentId: `INC-${Date.now().toString(36).toUpperCase()}`,
            severity: "critical",
            rootSubsystem: "agent-orchestrator",
            impactedComponents: [
              "policy-engine",
              "budget-controller",
              "execution-runtime",
            ],
          });

          // Add initial event
          addEvent({
            subsystem: "operator-console",
            action: "incident.triggered.manual",
            severity: "critical",
            actor: "operator",
          });
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [state.active, activateIncident, addEvent]);

  // Function to trigger incident from external event (e.g., red alert)
  const triggerFromEvent = React.useCallback(
    (params: {
      rootSubsystem: string;
      impactedComponents?: string[];
      severity?: "critical" | "high" | "medium";
    }) => {
      if (state.active) return;

      activateIncident({
        incidentId: `INC-${Date.now().toString(36).toUpperCase()}`,
        severity: params.severity ?? "critical",
        rootSubsystem: params.rootSubsystem,
        impactedComponents: params.impactedComponents ?? [],
      });

      addEvent({
        subsystem: params.rootSubsystem,
        action: "incident.triggered.automatic",
        severity: "critical",
      });
    },
    [state.active, activateIncident, addEvent]
  );

  // Function to trigger from trust score violation
  const triggerFromTrustViolation = React.useCallback(
    (currentScore: number) => {
      updateTrustScore(currentScore);

      if (currentScore < state.trustScoreThreshold && !state.active) {
        activateIncident({
          incidentId: `INC-${Date.now().toString(36).toUpperCase()}`,
          severity: "high",
          rootSubsystem: "trust-monitor",
          impactedComponents: ["governance-layer", "policy-engine"],
        });

        addEvent({
          subsystem: "trust-monitor",
          action: "trust.threshold.violated",
          severity: "critical",
        });
      }
    },
    [state.active, state.trustScoreThreshold, activateIncident, addEvent, updateTrustScore]
  );

  return {
    isActive: state.active,
    triggerFromEvent,
    triggerFromTrustViolation,
  };
}

