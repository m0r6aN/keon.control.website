"use client";

import * as React from "react";
import { REALTIME_CONFIG, getRealtimeClient, pollTopic } from "@/lib/realtime";
import type { RealtimeEvent, RealtimeStatus, RealtimeTopic } from "@/lib/realtime";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

interface RealtimeSubscriptionOptions {
  topic: RealtimeTopic;
  onEvent: (event: RealtimeEvent) => void;
  enabled?: boolean;
}

interface RealtimeSubscriptionState {
  status: RealtimeStatus;
  usingPolling: boolean;
}

export const useRealtimeSubscription = ({
  topic,
  onEvent,
  enabled = true,
}: RealtimeSubscriptionOptions): RealtimeSubscriptionState => {
  const client = React.useMemo(() => getRealtimeClient(), []);
  const [status, setStatus] = React.useState<RealtimeStatus>(client.getStatus());
  const onEventRef = React.useRef(onEvent);

  React.useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  React.useEffect(() => {
    if (!enabled) return;
    const unsubscribeStatus = client.subscribeStatus(setStatus);
    client.connect();
    return unsubscribeStatus;
  }, [client, enabled]);

  React.useEffect(() => {
    if (!enabled || !REALTIME_CONFIG.REALTIME_ENABLED) return;
    const unsubscribe = client.subscribe(topic, (event) => {
      onEventRef.current(event);
    });
    return unsubscribe;
  }, [client, topic, enabled]);

  const usingPolling =
    enabled && (!REALTIME_CONFIG.REALTIME_ENABLED || status !== "connected");

  useAutoRefresh({
    key: `${topic}:${status}`,
    intervalMs: REALTIME_CONFIG.POLL_INTERVAL_MS,
    enabled: usingPolling,
    fn: async (signal) => {
      const events = await pollTopic(topic, signal);
      events.forEach((event) => onEventRef.current(event));
    },
  });

  return { status, usingPolling };
};
