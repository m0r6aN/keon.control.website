/**
 * Executions API Client
 */

import { apiClient } from './client';
import type { ExecutionPage, ExecutionResult, ExecutionTraceEvent } from './types';

export interface ListExecutionsOptions {
  tenantId?: string;
  correlationId: string;
  pageToken?: string;
  limit?: number;
}

export interface GetExecutionOptions {
  executionId: string;
  correlationId: string;
}

/**
 * List executions with filtering
 */
export async function listExecutions(options: ListExecutionsOptions): Promise<ExecutionPage> {
  const { tenantId, correlationId, pageToken, limit } = options;

  return apiClient.get<ExecutionPage>('/runtime/executions', {
    params: {
      tenantId,
      correlationId,
      pageToken,
      limit,
    },
  });
}

/**
 * Get a single execution by ID
 */
export async function getExecution(options: GetExecutionOptions): Promise<ExecutionResult> {
  const { executionId, correlationId } = options;

  return apiClient.get<ExecutionResult>(`/runtime/executions/${executionId}`, {
    params: {
      correlationId,
    },
  });
}

/**
 * Get trace events for an execution
 */
export async function getExecutionTrace(options: GetExecutionOptions): Promise<ExecutionTraceEvent[]> {
  const { executionId, correlationId } = options;

  return apiClient.get<ExecutionTraceEvent[]>(`/runtime/executions/${executionId}/trace`, {
    params: {
      correlationId,
    },
  });
}
