/**
 * Global State Context
 * Lightweight state management for shared app data
 */

'use client';

import * as React from 'react';
import type { SystemMetrics } from '@/lib/api';

export interface AppState {
  /**
   * Current tenant ID (for multi-tenancy)
   */
  tenantId: string | null;

  /**
   * System-wide metrics
   */
  systemMetrics: SystemMetrics | null;

  /**
   * Whether the app is in "live mode" (real API) vs "mock mode"
   */
  liveMode: boolean;

  /**
   * Global loading state
   */
  isLoading: boolean;

  /**
   * Global error state
   */
  error: Error | null;
}

export interface AppActions {
  setTenantId: (tenantId: string | null) => void;
  setSystemMetrics: (metrics: SystemMetrics | null) => void;
  setLiveMode: (enabled: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  clearError: () => void;
}

export type AppContext = AppState & AppActions;

const AppStateContext = React.createContext<AppContext | null>(null);

/**
 * Default state values
 */
const defaultState: AppState = {
  tenantId: null,
  systemMetrics: null,
  liveMode: false,
  isLoading: false,
  error: null,
};

export interface AppStateProviderProps {
  children: React.ReactNode;
  initialState?: Partial<AppState>;
}

/**
 * App State Provider
 */
export function AppStateProvider({ children, initialState }: AppStateProviderProps) {
  const [state, setState] = React.useState<AppState>({
    ...defaultState,
    ...initialState,
  });

  const actions: AppActions = React.useMemo(
    () => ({
      setTenantId: (tenantId) => setState((s) => ({ ...s, tenantId })),
      setSystemMetrics: (systemMetrics) => setState((s) => ({ ...s, systemMetrics })),
      setLiveMode: (liveMode) => setState((s) => ({ ...s, liveMode })),
      setLoading: (isLoading) => setState((s) => ({ ...s, isLoading })),
      setError: (error) => setState((s) => ({ ...s, error })),
      clearError: () => setState((s) => ({ ...s, error: null })),
    }),
    []
  );

  const contextValue: AppContext = React.useMemo(
    () => ({
      ...state,
      ...actions,
    }),
    [state, actions]
  );

  return <AppStateContext.Provider value={contextValue}>{children}</AppStateContext.Provider>;
}

/**
 * Hook to access app state and actions
 */
export function useAppState(): AppContext {
  const context = React.useContext(AppStateContext);

  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }

  return context;
}
