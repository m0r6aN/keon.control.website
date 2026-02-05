/**
 * Alerts API Client
 * Note: Backend endpoint stub - will be implemented later
 */

import { apiClient } from './client';
import type { Alert } from './types';

export interface ListAlertsOptions {
  tenantId?: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  acknowledged?: boolean;
  limit?: number;
}

export interface AcknowledgeAlertOptions {
  alertId: string;
}

/**
 * List alerts with filtering
 * Note: This endpoint doesn't exist in backend yet - using stub
 */
export async function listAlerts(options: ListAlertsOptions = {}): Promise<Alert[]> {
  // Backend endpoint not implemented yet
  // When implemented, uncomment:
  // return apiClient.get<Alert[]>('/alerts', { params: options });

  throw new Error('Alerts API endpoint not yet implemented in backend');
}

/**
 * Acknowledge an alert
 * Note: This endpoint doesn't exist in backend yet - using stub
 */
export async function acknowledgeAlert(options: AcknowledgeAlertOptions): Promise<Alert> {
  const { alertId } = options;

  // Backend endpoint not implemented yet
  // When implemented, uncomment:
  // return apiClient.post<Alert>(`/alerts/${alertId}/acknowledge`);

  throw new Error('Alerts API endpoint not yet implemented in backend');
}

/**
 * Acknowledge all alerts
 * Note: This endpoint doesn't exist in backend yet - using stub
 */
export async function acknowledgeAllAlerts(): Promise<void> {
  // Backend endpoint not implemented yet
  // When implemented, uncomment:
  // return apiClient.post<void>('/alerts/acknowledge-all');

  throw new Error('Alerts API endpoint not yet implemented in backend');
}
