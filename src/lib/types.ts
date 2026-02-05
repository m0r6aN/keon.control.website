/**
 * Shared type definitions for Keon Command Center.
 * These types represent the core domain model for high-assurance system operations.
 */

/**
 * System health status enumeration.
 */
export type SystemStatus = 'healthy' | 'degraded' | 'critical' | 'offline'

/**
 * Decision outcome types for authorization receipts.
 */
export type DecisionOutcome = 'approved' | 'denied' | 'pending' | 'needs-review'

/**
 * Execution lifecycle states.
 */
export type ExecutionState = 'started' | 'running' | 'completed' | 'failed' | 'aborted'

/**
 * Severity levels for events, alerts, and diagnostics.
 */
export type SeverityLevel = 'info' | 'warning' | 'error' | 'critical'

/**
 * Trend direction for metric visualization.
 */
export type TrendDirection = 'up' | 'down' | 'stable'

/**
 * Metric value with metadata for dashboard display.
 */
export interface MetricValue {
  /**
   * Human-readable label for the metric.
   */
  label: string

  /**
   * Current value of the metric.
   */
  value: number | string

  /**
   * Optional unit of measurement (e.g., "ms", "req/s", "%").
   */
  unit?: string

  /**
   * Optional trend indicator.
   */
  trend?: TrendDirection

  /**
   * Optional status classification.
   */
  status?: SystemStatus
}

/**
 * Authorization receipt record.
 * Represents a cryptographically-signed decision made by the system.
 */
export interface Receipt {
  /**
   * Unique identifier for this receipt.
   */
  id: string

  /**
   * Cryptographic hash of the receipt content.
   */
  hash: string

  /**
   * Timestamp when the decision was made.
   */
  timestamp: Date

  /**
   * The authorization decision outcome.
   */
  decision: DecisionOutcome

  /**
   * The authority that made the decision (e.g., key ID, service name).
   */
  authority: string

  /**
   * The scope or resource the decision applies to.
   */
  scope: string

  /**
   * Optional additional metadata.
   */
  metadata?: Record<string, unknown>
}

/**
 * Execution trace record.
 * Represents a single execution of an operation or command.
 */
export interface Execution {
  /**
   * Unique identifier for this execution.
   */
  id: string

  /**
   * Reference to the authorizing receipt.
   */
  receiptId: string

  /**
   * Correlation ID for tracing across systems.
   */
  correlationId: string

  /**
   * Current execution state.
   */
  status: ExecutionState

  /**
   * When the execution started.
   */
  startedAt: Date

  /**
   * When the execution completed (if applicable).
   */
  completedAt?: Date

  /**
   * The agent or service that performed the execution.
   */
  agent: string

  /**
   * Optional error message if execution failed.
   */
  error?: string

  /**
   * Optional additional execution metadata.
   */
  metadata?: Record<string, unknown>
}

/**
 * Time series data point for charts.
 */
export interface TimeSeriesPoint {
  /**
   * Timestamp of the data point.
   */
  timestamp: Date

  /**
   * Metric value at this point in time.
   */
  value: number

  /**
   * Optional label for the data point.
   */
  label?: string
}

/**
 * Alert or notification record.
 */
export interface Alert {
  /**
   * Unique identifier for the alert.
   */
  id: string

  /**
   * Alert severity level.
   */
  severity: SeverityLevel

  /**
   * Alert title or summary.
   */
  title: string

  /**
   * Detailed alert message.
   */
  message: string

  /**
   * When the alert was created.
   */
  timestamp: Date

  /**
   * Whether the alert has been acknowledged.
   */
  acknowledged: boolean

  /**
   * Optional source component or service.
   */
  source?: string

  /**
   * Optional correlation ID for related events.
   */
  correlationId?: string
}

/**
 * Audit log entry.
 */
export interface AuditLogEntry {
  /**
   * Unique identifier for the log entry.
   */
  id: string

  /**
   * When the event occurred.
   */
  timestamp: Date

  /**
   * Type of event (e.g., "receipt.created", "execution.started").
   */
  eventType: string

  /**
   * Actor or service that triggered the event.
   */
  actor: string

  /**
   * Resource or entity affected by the event.
   */
  resource: string

  /**
   * Event outcome or result.
   */
  outcome: 'success' | 'failure' | 'partial'

  /**
   * Optional event details.
   */
  details?: Record<string, unknown>
}

/**
 * Type guard to check if a value is a valid SystemStatus.
 */
export function isSystemStatus(value: unknown): value is SystemStatus {
  return (
    typeof value === 'string' &&
    ['healthy', 'degraded', 'critical', 'offline'].includes(value)
  )
}

/**
 * Type guard to check if a value is a valid DecisionOutcome.
 */
export function isDecisionOutcome(value: unknown): value is DecisionOutcome {
  return (
    typeof value === 'string' &&
    ['approved', 'denied', 'pending', 'needs-review'].includes(value)
  )
}

/**
 * Type guard to check if a value is a valid ExecutionState.
 */
export function isExecutionState(value: unknown): value is ExecutionState {
  return (
    typeof value === 'string' &&
    ['started', 'running', 'completed', 'failed', 'aborted'].includes(value)
  )
}

/**
 * Type guard to check if a value is a valid SeverityLevel.
 */
export function isSeverityLevel(value: unknown): value is SeverityLevel {
  return (
    typeof value === 'string' &&
    ['info', 'warning', 'error', 'critical'].includes(value)
  )
}
