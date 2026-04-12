"use client";

import { getStoredActivationSession, subscribeToActivationSession } from "@/lib/activation/session";
import { INTERNAL_TEST_ME } from "@/lib/activation/test-mode";
import { getMe } from "@/lib/api";
import type { MeResponse } from "@/lib/api";
import type { ActivationMode } from "@/lib/activation/types";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";

interface TenantContextValue {
  me: MeResponse | null;
  isLoading: boolean;
  isError: boolean;
  activationMode: ActivationMode;
  isTestMode: boolean;
}

const TenantContext = React.createContext<TenantContextValue>({
  me: null,
  isLoading: true,
  isError: false,
  activationMode: "invite",
  isTestMode: false,
});

export function TenantContextProvider({ children }: { children: React.ReactNode }) {
  const query = useQuery({
    queryKey: ["control-plane", "me"],
    queryFn: getMe,
    retry: false,
    staleTime: 60_000,
  });
  const [activationMode, setActivationMode] = React.useState<ActivationMode>("invite");

  React.useEffect(() => {
    const sync = () => {
      setActivationMode(getStoredActivationSession()?.mode ?? "invite");
    };

    sync();
    return subscribeToActivationSession(sync);
  }, []);

  const isTestMode = activationMode === "test";
  const me = isTestMode ? INTERNAL_TEST_ME : query.data ?? null;
  const isLoading = isTestMode ? false : query.isLoading;
  const isError = isTestMode ? false : query.isError;

  return (
    <TenantContext.Provider
      value={{
        me,
        isLoading,
        isError,
        activationMode,
        isTestMode,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenantContext() {
  return React.useContext(TenantContext);
}
