export type SystemStatus = "healthy" | "degraded" | "critical";
export type AlertSeverity = "info" | "warning" | "critical";
export type ExecutionStatus = "running" | "pending" | "completed" | "failed";

export interface SystemMetrics {
  systemStatus: SystemStatus;
  activeExecutions: number;
  pendingDecisions: number;
  complianceScore: number;
  recentReceipts24h: number;
  alerts: {
    critical: number;
    warning: number;
    info: number;
  };
}

export interface Receipt {
  id: string;
  timestamp: string;
  action: string;
  agent: string;
  status: SystemStatus;
  decisionsRequired: number;
}

export interface Execution {
  id: string;
  agent: string;
  operation: string;
  status: ExecutionStatus;
  startedAt: string;
  progress: number;
  receiptsGenerated: number;
}

export interface Alert {
  id: string;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  subsystem: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  type: "execution" | "decision" | "alert" | "receipt";
  description: string;
  status: SystemStatus;
  signer?: string;
  policyRef?: string;
  hashPrefix?: string;
}

export interface Subsystem {
  id: string;
  name: string;
  status: SystemStatus;
  uptime: string;
  lastCheck: string;
  load?: number; // 0-100, shows pressure/stress level
}

export interface Decision {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  requiresApproval: boolean;
  autoApproved: boolean;
}

export interface ComplianceEvidence {
  id: string;
  packName: string;
  status: "complete" | "partial" | "missing";
  lastUpdated: string;
  itemCount: number;
}

export interface AccessLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  result: "allowed" | "denied";
}

// Mock System Metrics
export const mockSystemMetrics: SystemMetrics = {
  systemStatus: "healthy",
  activeExecutions: 12,
  pendingDecisions: 3,
  complianceScore: 98.7,
  recentReceipts24h: 247,
  alerts: {
    critical: 0,
    warning: 2,
    info: 5,
  },
};

// Mock Recent Receipts
export const mockReceipts: Receipt[] = [
  {
    id: "RCP-2026-001",
    timestamp: "2026-01-04T14:32:18Z",
    action: "FileSystemAccess",
    agent: "DataProcessor-Alpha",
    status: "healthy",
    decisionsRequired: 0,
  },
  {
    id: "RCP-2026-002",
    timestamp: "2026-01-04T14:31:45Z",
    action: "NetworkRequest",
    agent: "ApiGateway-01",
    status: "healthy",
    decisionsRequired: 1,
  },
  {
    id: "RCP-2026-003",
    timestamp: "2026-01-04T14:30:22Z",
    action: "DatabaseWrite",
    agent: "StorageHandler-Beta",
    status: "degraded",
    decisionsRequired: 2,
  },
  {
    id: "RCP-2026-004",
    timestamp: "2026-01-04T14:29:10Z",
    action: "CredentialAccess",
    agent: "AuthService-02",
    status: "healthy",
    decisionsRequired: 0,
  },
  {
    id: "RCP-2026-005",
    timestamp: "2026-01-04T14:28:33Z",
    action: "ProcessExecution",
    agent: "WorkflowEngine-Gamma",
    status: "healthy",
    decisionsRequired: 1,
  },
];

// Mock Active Executions
export const mockExecutions: Execution[] = [
  {
    id: "EXE-2026-A12",
    agent: "DataProcessor-Alpha",
    operation: "BulkDataTransform",
    status: "running",
    startedAt: "2026-01-04T14:15:00Z",
    progress: 67,
    receiptsGenerated: 45,
  },
  {
    id: "EXE-2026-B08",
    agent: "ApiGateway-01",
    operation: "RequestBatchProcessing",
    status: "running",
    startedAt: "2026-01-04T14:20:00Z",
    progress: 42,
    receiptsGenerated: 23,
  },
  {
    id: "EXE-2026-C15",
    agent: "WorkflowEngine-Gamma",
    operation: "MultiStepWorkflow",
    status: "running",
    startedAt: "2026-01-04T13:45:00Z",
    progress: 89,
    receiptsGenerated: 78,
  },
  {
    id: "EXE-2026-D03",
    agent: "StorageHandler-Beta",
    operation: "DatabaseMigration",
    status: "pending",
    startedAt: "2026-01-04T14:30:00Z",
    progress: 0,
    receiptsGenerated: 0,
  },
];

// Mock Alerts
export const mockAlerts: Alert[] = [
  {
    id: "ALT-WARN-001",
    severity: "warning",
    message: "High decision queue latency detected (avg 2.3s)",
    timestamp: "2026-01-04T14:25:00Z",
    subsystem: "DecisionEngine",
  },
  {
    id: "ALT-WARN-002",
    severity: "warning",
    message: "Storage capacity at 78% - consider scaling",
    timestamp: "2026-01-04T13:15:00Z",
    subsystem: "StorageHandler",
  },
  {
    id: "ALT-INFO-001",
    severity: "info",
    message: "Compliance evidence pack 2026-01 completed",
    timestamp: "2026-01-04T12:00:00Z",
    subsystem: "ComplianceEngine",
  },
  {
    id: "ALT-INFO-002",
    severity: "info",
    message: "Automatic policy update deployed successfully",
    timestamp: "2026-01-04T11:30:00Z",
    subsystem: "PolicyManager",
  },
  {
    id: "ALT-INFO-003",
    severity: "info",
    message: "Daily audit report generated",
    timestamp: "2026-01-04T10:00:00Z",
    subsystem: "AuditTrail",
  },
];

// Mock Activity Events
export const mockActivityEvents: ActivityEvent[] = [
  {
    id: "ACT-001",
    timestamp: "2026-01-04T14:32:18Z",
    type: "receipt",
    description: "FileSystemAccess receipt generated by DataProcessor-Alpha",
    status: "healthy",
    signer: "DataProcessor-Alpha",
    policyRef: "keon-core/fs-access-v2",
    hashPrefix: "0x7a3f9e2b",
  },
  {
    id: "ACT-002",
    timestamp: "2026-01-04T14:31:45Z",
    type: "decision",
    description: "Network request decision pending for ApiGateway-01",
    status: "healthy",
    signer: "ApiGateway-01",
    policyRef: "keon-core/network-req-v1",
    hashPrefix: "0x4c8d1a5f",
  },
  {
    id: "ACT-003",
    timestamp: "2026-01-04T14:30:22Z",
    type: "alert",
    description: "Decision queue latency warning triggered",
    status: "degraded",
    signer: "SystemMonitor",
    policyRef: "keon-core/latency-threshold-v3",
    hashPrefix: "0x9b2e6c1d",
  },
  {
    id: "ACT-004",
    timestamp: "2026-01-04T14:29:10Z",
    type: "execution",
    description: "MultiStepWorkflow reached 89% completion",
    status: "healthy",
  },
  {
    id: "ACT-005",
    timestamp: "2026-01-04T14:28:33Z",
    type: "receipt",
    description: "ProcessExecution receipt from WorkflowEngine-Gamma",
    status: "healthy",
  },
  {
    id: "ACT-006",
    timestamp: "2026-01-04T14:27:15Z",
    type: "decision",
    description: "Auto-approved low-risk database write operation",
    status: "healthy",
  },
  {
    id: "ACT-007",
    timestamp: "2026-01-04T14:26:40Z",
    type: "execution",
    description: "BulkDataTransform execution started",
    status: "healthy",
  },
  {
    id: "ACT-008",
    timestamp: "2026-01-04T14:25:00Z",
    type: "alert",
    description: "Storage capacity warning at 78%",
    status: "degraded",
  },
];

// Mock Subsystems
export const mockSubsystems: Subsystem[] = [
  {
    id: "sys-decision-engine",
    name: "DecisionEngine",
    status: "healthy",
    uptime: "99.97%",
    lastCheck: "2026-01-04T14:32:00Z",
    load: 34, // Light load
  },
  {
    id: "sys-receipt-store",
    name: "ReceiptStore",
    status: "healthy",
    uptime: "99.99%",
    lastCheck: "2026-01-04T14:32:00Z",
    load: 12, // Very light
  },
  {
    id: "sys-policy-manager",
    name: "PolicyManager",
    status: "healthy",
    uptime: "99.95%",
    lastCheck: "2026-01-04T14:32:00Z",
    load: 56, // Moderate
  },
  {
    id: "sys-compliance-engine",
    name: "ComplianceEngine",
    status: "healthy",
    uptime: "99.98%",
    lastCheck: "2026-01-04T14:32:00Z",
    load: 23, // Light
  },
  {
    id: "sys-storage-handler",
    name: "StorageHandler",
    status: "degraded",
    uptime: "98.20%",
    lastCheck: "2026-01-04T14:32:00Z",
    load: 87, // High pressure - explains degraded status
  },
  {
    id: "sys-audit-trail",
    name: "AuditTrail",
    status: "healthy",
    uptime: "99.99%",
    lastCheck: "2026-01-04T14:32:00Z",
    load: 18, // Very light
  },
  {
    id: "sys-agent-runtime",
    name: "AgentRuntime",
    status: "healthy",
    uptime: "99.92%",
    lastCheck: "2026-01-04T14:32:00Z",
    load: 67, // Moderate-high but stable
  },
  {
    id: "sys-api-gateway",
    name: "ApiGateway",
    status: "healthy",
    uptime: "99.96%",
    lastCheck: "2026-01-04T14:32:00Z",
    load: 41, // Moderate
  },
];

// Mock Decisions
export const mockDecisions: Decision[] = [
  {
    id: "DEC-2026-047",
    timestamp: "2026-01-04T14:31:45Z",
    agent: "ApiGateway-01",
    action: "NetworkRequest to external API",
    riskLevel: "medium",
    requiresApproval: true,
    autoApproved: false,
  },
  {
    id: "DEC-2026-048",
    timestamp: "2026-01-04T14:30:22Z",
    agent: "StorageHandler-Beta",
    action: "Database schema modification",
    riskLevel: "high",
    requiresApproval: true,
    autoApproved: false,
  },
  {
    id: "DEC-2026-049",
    timestamp: "2026-01-04T14:28:33Z",
    agent: "WorkflowEngine-Gamma",
    action: "Process execution in sandbox",
    riskLevel: "low",
    requiresApproval: false,
    autoApproved: true,
  },
];

// Mock Compliance Evidence
export const mockComplianceEvidence: ComplianceEvidence[] = [
  {
    id: "EVID-2026-01",
    packName: "January 2026 Audit Pack",
    status: "complete",
    lastUpdated: "2026-01-04T12:00:00Z",
    itemCount: 247,
  },
  {
    id: "EVID-2025-12",
    packName: "December 2025 Audit Pack",
    status: "complete",
    lastUpdated: "2026-01-01T00:00:00Z",
    itemCount: 1823,
  },
  {
    id: "EVID-2025-11",
    packName: "November 2025 Audit Pack",
    status: "complete",
    lastUpdated: "2025-12-01T00:00:00Z",
    itemCount: 1654,
  },
];

// Mock Access Logs
export const mockAccessLogs: AccessLog[] = [
  {
    id: "LOG-001",
    timestamp: "2026-01-04T14:32:00Z",
    user: "operator.smith",
    action: "VIEW_DASHBOARD",
    resource: "/dashboard",
    result: "allowed",
  },
  {
    id: "LOG-002",
    timestamp: "2026-01-04T14:30:15Z",
    user: "admin.jones",
    action: "APPROVE_DECISION",
    resource: "/governance/decision/DEC-2026-046",
    result: "allowed",
  },
  {
    id: "LOG-003",
    timestamp: "2026-01-04T14:28:30Z",
    user: "auditor.chen",
    action: "EXPORT_EVIDENCE_PACK",
    resource: "/compliance/evidence/EVID-2026-01",
    result: "allowed",
  },
  {
    id: "LOG-004",
    timestamp: "2026-01-04T14:25:00Z",
    user: "analyst.kumar",
    action: "VIEW_EXECUTION_LOGS",
    resource: "/runtime/execution/EXE-2026-A12",
    result: "allowed",
  },
  {
    id: "LOG-005",
    timestamp: "2026-01-04T14:20:00Z",
    user: "external.user",
    action: "MODIFY_POLICY",
    resource: "/governance/policy/POL-001",
    result: "denied",
  },
];

// Mock Break-Glass Status
export const mockBreakGlassStatus = {
  active: false,
  lastActivation: "2025-12-15T03:22:00Z",
  activationCount: 2,
  currentApprovers: ["admin.jones", "admin.smith"],
  autoExpiry: "disabled",
};
