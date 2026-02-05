/**
 * Traces (Observability) API Client
 */

import { apiClient } from './client';
import type { ReceiptSpine, CorrelationPage, CorrelationSummary } from './types';

export interface GetSpineOptions {
  correlationId: string;
}

export interface ListCorrelationsOptions {
  tenantId: string;
  from?: string;
  to?: string;
  pageToken?: string;
}

/**
 * Get receipt spine (graph) for a correlation ID
 */
export async function getSpine(options: GetSpineOptions): Promise<ReceiptSpine> {
  const { correlationId } = options;

  return apiClient.get<ReceiptSpine>(`/observability/spines/${correlationId}`);
}

/**
 * List correlations for a tenant
 */
export async function listCorrelations(options: ListCorrelationsOptions): Promise<CorrelationPage> {
  const { tenantId, from, to, pageToken } = options;

  return apiClient.get<CorrelationPage>('/observability/correlations', {
    params: {
      tenantId,
      from,
      to,
      pageToken,
    },
  });
}
