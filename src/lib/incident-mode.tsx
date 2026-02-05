"use client";

import * as React from "react";

/**
 * INCIDENT MODE — State of Being
 * 
 * This is not a theme. This is not a toggle.
 * When Incident Mode activates, the UI seizes control.
 */

export type IncidentSeverity = "critical" | "high" | "medium";

export interface IncidentEvent {
  id: string;
  timestamp: string;
  subsystem: string;
  action: string;
  severity: "critical" | "warning" | "info";
  policyRef?: string;
  receiptHash?: string;
  actor?: string;
  schemaVersion?: "v1";
}

export interface LastIrreversibleAction {
  timestamp: string;
  actor: string;
  receiptHashPrefix: string;
  action: string;
}

export interface HumanInLoopStatus {
  acknowledged: string[];
  missing: string[];
  slaDeadline: string;
}

export interface IncidentState {
  active: boolean;
  incidentId: string | null;
  severity: IncidentSeverity | null;
  startedAt: string | null;
  trustScore: number;
  trustScoreThreshold: number;
  rootSubsystem: string | null;
  impactedComponents: string[];
  activePolicies: string[];
  quorumState: "met" | "pending" | "failed";
  events: IncidentEvent[];
  lastIrreversibleAction: LastIrreversibleAction | null;
  humanInLoop: HumanInLoopStatus;
  exitConditionsMet: boolean;
}

interface IncidentContextValue {
  state: IncidentState;
  activateIncident: (params: {
    incidentId: string;
    severity: IncidentSeverity;
    rootSubsystem: string;
    impactedComponents?: string[];
  }) => void;
  deactivateIncident: () => void;
  addEvent: (event: Omit<IncidentEvent, "id" | "timestamp">) => void;
  updateTrustScore: (score: number) => void;
  acknowledgeHuman: (humanId: string) => void;
  checkExitConditions: () => boolean;
}

const defaultState: IncidentState = {
  active: false,
  incidentId: null,
  severity: null,
  startedAt: null,
  trustScore: 100,
  trustScoreThreshold: 70,
  rootSubsystem: null,
  impactedComponents: [],
  activePolicies: [],
  quorumState: "met",
  events: [],
  lastIrreversibleAction: null,
  humanInLoop: {
    acknowledged: [],
    missing: ["operator-1", "operator-2"],
    slaDeadline: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  },
  exitConditionsMet: false,
};

const IncidentContext = React.createContext<IncidentContextValue | null>(null);

export function IncidentModeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<IncidentState>(defaultState);

  const activateIncident = React.useCallback(
    (params: {
      incidentId: string;
      severity: IncidentSeverity;
      rootSubsystem: string;
      impactedComponents?: string[];
    }) => {
      setState((prev) => ({
        ...prev,
        active: true,
        incidentId: params.incidentId,
        severity: params.severity,
        startedAt: new Date().toISOString(),
        rootSubsystem: params.rootSubsystem,
        impactedComponents: params.impactedComponents ?? [],
        exitConditionsMet: false,
      }));
    },
    []
  );

  const deactivateIncident = React.useCallback(() => {
    setState((prev) => {
      if (!prev.exitConditionsMet) return prev;
      return { ...defaultState };
    });
  }, []);

  const addEvent = React.useCallback(
    (event: Omit<IncidentEvent, "id" | "timestamp">) => {
      const newEvent: IncidentEvent = {
        ...event,
        id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
        schemaVersion: "v1",
      };
      setState((prev) => ({
        ...prev,
        events: [...prev.events, newEvent],
      }));
    },
    []
  );

  const updateTrustScore = React.useCallback((score: number) => {
    setState((prev) => ({ ...prev, trustScore: score }));
  }, []);

  const acknowledgeHuman = React.useCallback(
    (humanId: string) => {
      // Update HITL lists
      setState((prev) => ({
        ...prev,
        humanInLoop: {
          ...prev.humanInLoop,
          acknowledged: prev.humanInLoop.acknowledged.includes(humanId)
            ? prev.humanInLoop.acknowledged
            : [...prev.humanInLoop.acknowledged, humanId],
          missing: prev.humanInLoop.missing.filter((h) => h !== humanId),
        },
      }));

      // Record a court-grade event for the acknowledgment so it shows up
      // in the Evidence Timeline and derived views (e.g. "Last Human Action").
      addEvent({
        subsystem: "human-operator",
        action: "operator.acknowledged.incident",
        severity: "info",
        actor: humanId,
      });
    },
    [addEvent]
  );

  const checkExitConditions = React.useCallback(() => {
    const noRedEvents = !state.events.some((e) => e.severity === "critical");
    const trustStable = state.trustScore >= state.trustScoreThreshold;
    const met = noRedEvents && trustStable;
    if (met !== state.exitConditionsMet) {
      setState((prev) => ({ ...prev, exitConditionsMet: met }));
    }
    return met;
  }, [state.events, state.trustScore, state.trustScoreThreshold, state.exitConditionsMet]);

  return (
    <IncidentContext.Provider
      value={{
        state,
        activateIncident,
        deactivateIncident,
        addEvent,
        updateTrustScore,
        acknowledgeHuman,
        checkExitConditions,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
}

export function useIncidentMode() {
  const ctx = React.useContext(IncidentContext);
  if (!ctx) throw new Error("useIncidentMode must be used within IncidentModeProvider");
  return ctx;
}

