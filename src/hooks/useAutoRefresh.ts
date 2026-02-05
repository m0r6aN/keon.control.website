"use client";

import * as React from "react";

interface AutoRefreshOptions {
  key?: string;
  fn: (signal?: AbortSignal) => void | Promise<void>;
  intervalMs: number;
  enabled?: boolean;
}

export const useAutoRefresh = ({
  key,
  fn,
  intervalMs,
  enabled = true,
}: AutoRefreshOptions) => {
  const fnRef = React.useRef(fn);

  React.useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  React.useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    let active = true;

    const run = () => {
      if (!active) return;
      void fnRef.current(controller.signal);
    };

    run();
    const interval = setInterval(run, intervalMs);

    return () => {
      active = false;
      controller.abort();
      clearInterval(interval);
    };
  }, [key, intervalMs, enabled]);
};
