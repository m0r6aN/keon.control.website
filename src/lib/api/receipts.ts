/**
 * Receipts API Client
 */

import { apiClient } from './client';
import type { ReceiptEnvelope, ReceiptPage } from './types';

export interface ListReceiptsOptions {
  tenantId?: string;
  correlationId: string;
  kind?: 'decision' | 'execution' | 'memory';
  pageToken?: string;
  limit?: number;
}

export interface GetReceiptOptions {
  receiptId: string;
  correlationId: string;
}

/**
 * List receipts with filtering
 */
export async function listReceipts(options: ListReceiptsOptions): Promise<ReceiptPage> {
  const { tenantId, correlationId, kind, pageToken, limit } = options;

  return apiClient.get<ReceiptPage>('/governance/receipts', {
    params: {
      tenantId,
      correlationId,
      kind,
      pageToken,
      limit,
    },
  });
}

/**
 * Get a single receipt by ID
 */
export async function getReceipt(options: GetReceiptOptions): Promise<ReceiptEnvelope> {
  const { receiptId, correlationId } = options;

  return apiClient.get<ReceiptEnvelope>(`/governance/receipts/${receiptId}`, {
    params: {
      correlationId,
    },
  });
}
