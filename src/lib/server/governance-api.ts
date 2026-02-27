import { mockAlerts, mockExecutions } from "@/lib/mock-data";

export type GovernanceCollectionKind = "tenants" | "policies" | "runs" | "alerts";
export type GovernanceMode = "MOCK" | "LIVE";

export interface GovernanceIndicators {
  determinismStatus: "SEALED" | "DEGRADED" | "UNKNOWN";
  sealValidationResult: "VALID" | "INVALID" | "UNKNOWN";
  incidentFlag: boolean;
}

export interface GovernanceEnvelope<T> {
  mode: GovernanceMode;
  generatedAt: string;
  governance: GovernanceIndicators;
  data: T[];
  source: string;
  mockLabel?: "MOCK";
}

export class GovernanceUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GovernanceUnavailableError";
  }
}

type RecordLike = Record<string, unknown>;

function envMode(): "mock" | "live" {
  return process.env.KEON_CONTROL_GOVERNANCE_MODE === "live" ? "live" : "mock";
}

function envBaseUrl(): string {
  return process.env.KEON_CONTROL_GOVERNANCE_BASE_URL || "http://localhost:5000";
}

function envTimeoutMs(): number {
  const value = Number.parseInt(process.env.KEON_CONTROL_GOVERNANCE_TIMEOUT_MS || "5000", 10);
  return Number.isFinite(value) && value > 0 ? value : 5000;
}

function mockTenants(): RecordLike[] {
  return [
    { id: "tenant-keon", name: "Keon Systems", status: "active", createdAt: "2026-01-01T00:00:00Z" },
    { id: "tenant-omega", name: "Omega Labs", status: "active", createdAt: "2026-01-15T00:00:00Z" },
    { id: "tenant-audit", name: "Audit Sandbox", status: "inactive", createdAt: "2025-12-01T00:00:00Z" },
  ];
}

function mockPolicies(): RecordLike[] {
  return [
    {
      id: "policy-governance-seal",
      name: "Determinism Seal Enforcement",
      version: "1.0.0",
      enabled: true,
      createdAt: "2026-02-20T12:00:00Z",
      updatedAt: "2026-02-24T08:30:00Z",
    },
    {
      id: "policy-spine-correlation",
      name: "Spine Correlation Continuity",
      version: "0.9.0",
      enabled: true,
      createdAt: "2026-02-21T10:00:00Z",
      updatedAt: "2026-02-24T07:45:00Z",
    },
  ];
}

function mockRuns(): RecordLike[] {
  return mockExecutions.map((execution) => ({
    runId: execution.id,
    agent: execution.agent,
    operation: execution.operation,
    status: execution.status,
    startedAt: execution.startedAt,
    determinismStatus: execution.status === "failed" ? "DEGRADED" : "SEALED",
    sealValidationResult: execution.status === "failed" ? "INVALID" : "VALID",
  }));
}

function mockAlertsData(): RecordLike[] {
  return mockAlerts.map((alert) => ({
    id: alert.id,
    severity: alert.severity === "critical" ? "critical" : alert.severity,
    title: alert.subsystem,
    message: alert.message,
    timestamp: alert.timestamp,
    acknowledged: false,
    source: alert.subsystem,
  }));
}

function mockData(kind: GovernanceCollectionKind): RecordLike[] {
  switch (kind) {
    case "tenants":
      return mockTenants();
    case "policies":
      return mockPolicies();
    case "runs":
      return mockRuns();
    case "alerts":
      return mockAlertsData();
  }
}

function computeMockIndicators(): GovernanceIndicators {
  const hasCriticalAlert = mockAlerts.some((alert) => alert.severity === "critical");
  const hasFailedRun = mockExecutions.some((execution) => execution.status === "failed");

  return {
    determinismStatus: hasFailedRun ? "DEGRADED" : "SEALED",
    sealValidationResult: hasFailedRun ? "INVALID" : "VALID",
    incidentFlag: hasCriticalAlert || hasFailedRun,
  };
}

function normalizeLiveIndicators(kind: GovernanceCollectionKind, data: RecordLike[]): GovernanceIndicators {
  if (kind === "alerts") {
    const incidentFlag = data.some((item) => String(item.severity ?? "").toLowerCase() === "critical");
    return {
      determinismStatus: "UNKNOWN",
      sealValidationResult: "UNKNOWN",
      incidentFlag,
    };
  }

  if (kind === "runs") {
    const statuses = data.map((item) => String(item.status ?? "").toLowerCase());
    const hasFailed = statuses.some((status) => status === "failed");
    return {
      determinismStatus: hasFailed ? "DEGRADED" : "SEALED",
      sealValidationResult: hasFailed ? "INVALID" : "VALID",
      incidentFlag: hasFailed,
    };
  }

  return {
    determinismStatus: "UNKNOWN",
    sealValidationResult: "UNKNOWN",
    incidentFlag: false,
  };
}

async function fetchLiveCollection(kind: GovernanceCollectionKind): Promise<RecordLike[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), envTimeoutMs());

  try {
    const base = envBaseUrl().replace(/\/+$/, "");
    const response = await fetch(`${base}/${kind}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new GovernanceUnavailableError(`Upstream ${kind} returned HTTP ${response.status}`);
    }

    const payload = await response.json();
    if (!Array.isArray(payload)) {
      throw new GovernanceUnavailableError(`Upstream ${kind} payload is not an array`);
    }

    return payload as RecordLike[];
  } catch (error) {
    if (error instanceof GovernanceUnavailableError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : String(error);
    throw new GovernanceUnavailableError(`Upstream ${kind} unreachable: ${message}`);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getGovernanceCollection(
  kind: GovernanceCollectionKind,
): Promise<GovernanceEnvelope<RecordLike>> {
  const generatedAt = new Date().toISOString();

  if (envMode() === "mock") {
    return {
      mode: "MOCK",
      generatedAt,
      governance: computeMockIndicators(),
      data: mockData(kind),
      source: "local-mock-provider",
      mockLabel: "MOCK",
    };
  }

  const liveData = await fetchLiveCollection(kind);

  return {
    mode: "LIVE",
    generatedAt,
    governance: normalizeLiveIndicators(kind, liveData),
    data: liveData,
    source: envBaseUrl(),
  };
}
