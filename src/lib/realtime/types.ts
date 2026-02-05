export type RealtimeTopic =
  | "alerts"
  | "incident-events"
  | "incident-trust"
  | "status";

export type RealtimeStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected";

export type AlertSeverity = "error" | "warning" | "info";

export interface RealtimeEvent<TPayload = unknown> {
  type: string;
  payload: TPayload;
  timestamp: string;
  topic?: RealtimeTopic;
}

export interface AlertPayload {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
  acknowledged?: boolean;
}

export interface IncidentEventPayload {
  id: string;
  timestamp: string;
  subsystem: string;
  action: string;
  severity: "critical" | "warning" | "info";
  policyRef?: string;
  receiptHash?: string;
  actor?: string;
}

export interface TrustScorePayload {
  trustScore: number;
}

export interface StatusPayload {
  key: string;
  value: number | string;
}
