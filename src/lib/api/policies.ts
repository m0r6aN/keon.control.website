/**
 * Policies API Client
 * Note: Backend endpoint stub - will be implemented later
 */

import { apiClient } from './client';
import type { Policy } from './types';

export interface ListPoliciesOptions {
  tenantId?: string;
  enabled?: boolean;
  limit?: number;
}

export interface GetPolicyOptions {
  policyId: string;
}

/**
 * List policies with filtering
 * Note: This endpoint doesn't exist in backend yet - using stub
 */
export async function listPolicies(options: ListPoliciesOptions = {}): Promise<Policy[]> {
  // Backend endpoint not implemented yet
  // When implemented, uncomment:
  // return apiClient.get<Policy[]>('/policies', { params: options });

  throw new Error('Policies API endpoint not yet implemented in backend');
}

/**
 * Get a single policy by ID
 * Note: This endpoint doesn't exist in backend yet - using stub
 */
export async function getPolicy(options: GetPolicyOptions): Promise<Policy> {
  const { policyId } = options;

  // Backend endpoint not implemented yet
  // When implemented, uncomment:
  // return apiClient.get<Policy>(`/policies/${policyId}`);

  throw new Error('Policies API endpoint not yet implemented in backend');
}
