import type {
  AlertPayload,
  IncidentEventPayload,
  RealtimeEvent,
  RealtimeTopic,
  StatusPayload,
  TrustScorePayload,
} from "./types";

const alertTemplates = [
  {
    title: "Budget threshold exceeded",
    message: "Monthly token budget has reached 95% utilization",
    severity: "warning" as const,
  },
  {
    title: "High-risk execution blocked",
    message: "Unauthorized data export attempt blocked by policy",
    severity: "error" as const,
  },
  {
    title: "Policy version updated",
    message: "Authority policy v2.2.0 deployed",
    severity: "info" as const,
  },
  {
    title: "Execution latency spike",
    message: "Average execution time increased by 35% in last 10 minutes",
    severity: "warning" as const,
  },
];

const incidentTemplates = [
  {
    subsystem: "agent-orchestrator",
    action: "execution.started",
    severity: "info" as const,
  },
  {
    subsystem: "policy-engine",
    action: "policy.evaluated",
    severity: "info" as const,
  },
  {
    subsystem: "budget-controller",
    action: "threshold.exceeded",
    severity: "warning" as const,
  },
  {
    subsystem: "agent-orchestrator",
    action: "execution.blocked",
    severity: "critical" as const,
  },
];

const statusTemplates = [
  { key: "activeExecutions", value: Math.floor(10 + Math.random() * 10) },
  { key: "pendingDecisions", value: Math.floor(1 + Math.random() * 6) },
];

const pick = <T,>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];

const nowIso = () => new Date().toISOString();

const buildAlertEvent = (): RealtimeEvent<AlertPayload> => {
  const template = pick(alertTemplates);
  const timestamp = nowIso();
  return {
    type: "alert.created",
    timestamp,
    payload: {
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: template.title,
      message: template.message,
      severity: template.severity,
      timestamp,
      acknowledged: false,
    },
  };
};

const buildIncidentEvent = (): RealtimeEvent<IncidentEventPayload> => {
  const template = pick(incidentTemplates);
  const timestamp = nowIso();
  return {
    type: "incident.event",
    timestamp,
    payload: {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp,
      subsystem: template.subsystem,
      action: template.action,
      severity: template.severity,
      policyRef: `pol-${Math.floor(Math.random() * 999)
        .toString()
        .padStart(3, "0")}`,
      receiptHash: `rcpt_${Math.random().toString(36).slice(2, 12)}`,
      actor: template.action.includes("blocked") ? "agent-gpt4" : undefined,
    },
  };
};

const buildTrustEvent = (): RealtimeEvent<TrustScorePayload> => {
  const timestamp = nowIso();
  return {
    type: "incident.trust",
    timestamp,
    payload: {
      trustScore: Math.max(40, Math.floor(92 + Math.random() * 6)),
    },
  };
};

const buildStatusEvent = (): RealtimeEvent<StatusPayload> => {
  const timestamp = nowIso();
  return {
    type: "status.update",
    timestamp,
    payload: pick(statusTemplates),
  };
};

export const buildMockEvent = (topic: RealtimeTopic): RealtimeEvent => {
  switch (topic) {
    case "alerts":
      return buildAlertEvent();
    case "incident-events":
      return buildIncidentEvent();
    case "incident-trust":
      return buildTrustEvent();
    case "status":
      return buildStatusEvent();
  }
};
