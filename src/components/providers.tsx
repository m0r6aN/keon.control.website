"use client";

import { getApiConfig } from "@/lib/api";
import { IncidentModeProvider } from "@/lib/incident-mode";
import { QueryProvider } from "@/lib/query/QueryProvider";
import { AppStateProvider } from "@/lib/state";
import * as React from "react";

/**
 * GLOBAL PROVIDERS
 *
 * Wraps the application with all necessary context providers.
 * Order matters - app state should be at the root, then incident mode.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const apiConfig = getApiConfig();

  return (
    <QueryProvider>
      <AppStateProvider initialState={{ liveMode: apiConfig.liveMode }}>
        <IncidentModeProvider>
          {children}
        </IncidentModeProvider>
      </AppStateProvider>
    </QueryProvider>
  );
}
