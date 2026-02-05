import type { RealtimeEvent, RealtimeTopic } from "./types";

const EVENT_TOPIC_MAP: Record<string, RealtimeTopic[]> = {
  "alert.created": ["alerts"],
  "alert.acknowledged": ["alerts"],
  "incident.event": ["incident-events"],
  "incident.trust": ["incident-trust"],
  "status.update": ["status"],
};

export const routeEventTopics = (event: RealtimeEvent): RealtimeTopic[] => {
  if (event.topic) return [event.topic];
  return EVENT_TOPIC_MAP[event.type] ?? [];
};
