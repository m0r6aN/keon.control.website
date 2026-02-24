/**
 * API Types
 * TypeScript types for KEON Control API contracts
 */

/**
 * Pagination
 */
export interface PagedResponse<T> {
  items: T[];
  nextPageToken?: string | null;
}

/**
 * Receipts
 */
export interface ReceiptEnvelope {
  receiptId: string;
  kind: 'decision' | 'execution' | 'memory';
  tenantId: string;
  correlationId: string;
  timestampUtc: string;
  payload: unknown;
}

export type ReceiptPage = PagedResponse<ReceiptEnvelope>;

/**
 * Executions
 */
export interface ExecutionLink {
  tenantId: string;
  correlationId: string;
}

export interface ExecutionTiming {
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
}

export interface ExecutionResult {
  executionId: string;
  link: ExecutionLink;
  timing: ExecutionTiming;
  status: 'started' | 'running' | 'completed' | 'failed' | 'aborted';
  error?: string;
  metadata?: Record<string, unknown>;
}

export type ExecutionPage = PagedResponse<ExecutionResult>;

/**
 * Traces
 */
export interface ExecutionTraceEvent {
  executionId: string;
  sequence: number;
  stage: string;
  timestamp: string;
  details?: Record<string, unknown>;
  spine?: SpineEvent;
}

/**
 * Correlation Summaries
 */
export interface CorrelationSummary {
  correlationId: string;
  tenantId: string;
  firstSeen: string;
  lastSeen: string;
  receiptCount: number;
  executionCount: number;
}

export type CorrelationPage = PagedResponse<CorrelationSummary>;

/**
 * Receipt Graph / Spine
 */
export interface ReceiptNode {
  nodeId: string;
  nodeType: 'decision' | 'execution' | 'memory' | 'trace' | 'unknown';
  payload: unknown;
}

export interface ReceiptSpine {
  correlationId: string;
  nodes: ReceiptNode[];
}

/**
 * Alerts
 */
export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  source?: string;
  correlationId?: string;
}

/**
 * Policies (stub for now)
 */
export interface Policy {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Tenants (stub for now)
 */
export interface Tenant {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
}

/**
 * System Metrics
 */
export interface SystemMetrics {
  systemStatus: 'healthy' | 'degraded' | 'critical' | 'offline';
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

/**
 * Evidence Packs
 */
export interface EvidencePackRequest {
  tenantId: string;
  correlationId: string;
  name?: string;
  description?: string;
}

export interface EvidencePackMetadata {
  packId: string;
  tenantId: string;
  correlationId: string;
  name: string;
  createdAtUtc: string;
  artifactCount: number;
}

/**
 * Legal Holds
 */
export interface LegalHoldCreateRequest {
  tenantId: string;
  correlationId: string;
  reason: string;
  expiresAtUtc?: string;
}

export interface LegalHold {
  id: string;
  tenantId: string;
  correlationId: string;
  reason: string;
  createdAtUtc: string;
  expiresAtUtc?: string;
  revokedAtUtc?: string;
  revokedReason?: string;
  isActive: boolean;
}

/**
 * Retention Runs
 */
export interface RetentionRun {
  runId: string;
  startedAt: string;
  completedAt?: string;
  status: 'running' | 'completed' | 'failed';
  itemsProcessed: number;
  itemsDeleted: number;
  errors?: string[];
}
