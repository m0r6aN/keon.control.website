/**
 * Tenants API Client
 * Note: Backend endpoint stub - will be implemented later
 */

import { apiClient } from './client';
import type { Tenant } from './types';

export interface ListTenantsOptions {
  status?: 'active' | 'inactive' | 'suspended';
  limit?: number;
}

export interface GetTenantOptions {
  tenantId: string;
}

/**
 * List tenants with filtering
 * Note: This endpoint doesn't exist in backend yet - using stub
 */
export async function listTenants(options: ListTenantsOptions = {}): Promise<Tenant[]> {
  // Backend endpoint not implemented yet
  // When implemented, uncomment:
  // return apiClient.get<Tenant[]>('/tenants', { params: options });

  throw new Error('Tenants API endpoint not yet implemented in backend');
}

/**
 * Get a single tenant by ID
 * Note: This endpoint doesn't exist in backend yet - using stub
 */
export async function getTenant(options: GetTenantOptions): Promise<Tenant> {
  const { tenantId } = options;

  // Backend endpoint not implemented yet
  // When implemented, uncomment:
  // return apiClient.get<Tenant>(`/tenants/${tenantId}`);

  throw new Error('Tenants API endpoint not yet implemented in backend');
}
