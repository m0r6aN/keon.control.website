import { REALTIME_CONFIG } from "./config";
import { buildMockEvent } from "./mock";
import type { RealtimeEvent, RealtimeTopic } from "./types";

const DEFAULT_POLL_BASE = "/api/realtime";

const topicPath: Record<RealtimeTopic, string> = {
  alerts: "/alerts",
  "incident-events": "/incidents/events",
  "incident-trust": "/incidents/trust",
  status: "/status",
};

const fetchPollEvents = async (
  topic: RealtimeTopic,
  signal?: AbortSignal
): Promise<RealtimeEvent[]> => {
  const response = await fetch(`${DEFAULT_POLL_BASE}${topicPath[topic]}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as RealtimeEvent[] | RealtimeEvent;
  return Array.isArray(data) ? data : [data];
};

export const pollTopic = async (
  topic: RealtimeTopic,
  signal?: AbortSignal
): Promise<RealtimeEvent[]> => {
  if (REALTIME_CONFIG.DEV_REALTIME_MOCK) {
    return [buildMockEvent(topic)];
  }

  try {
    return await fetchPollEvents(topic, signal);
  } catch {
    return [];
  }
};
