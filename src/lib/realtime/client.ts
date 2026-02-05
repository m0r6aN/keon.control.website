import { REALTIME_CONFIG } from "./config";
import { routeEventTopics } from "./routing";
import type { RealtimeEvent, RealtimeStatus, RealtimeTopic } from "./types";

type EventHandler = (event: RealtimeEvent) => void;
type StatusHandler = (status: RealtimeStatus) => void;

const HEARTBEAT_INTERVAL_MS = 25000;

class RealtimeClient {
  private socket: WebSocket | null = null;
  private status: RealtimeStatus = "idle";
  private handlers = new Map<RealtimeTopic, Set<EventHandler>>();
  private statusHandlers = new Set<StatusHandler>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private retryCount = 0;
  private hasLoggedFailure = false;

  connect() {
    if (!REALTIME_CONFIG.REALTIME_ENABLED) {
      this.setStatus("disconnected");
      return;
    }
    if (typeof window === "undefined") return;
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;
    if (this.socket && this.socket.readyState === WebSocket.CONNECTING) return;

    this.setStatus("connecting");
    this.clearTimers();

    try {
      this.socket = new WebSocket(REALTIME_CONFIG.REALTIME_WS_URL);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.socket.addEventListener("open", () => {
      this.retryCount = 0;
      this.hasLoggedFailure = false;
      this.setStatus("connected");
      this.startHeartbeat();
    });

    this.socket.addEventListener("message", (event) => {
      const parsed = this.parseMessage(event.data);
      if (!parsed) return;
      if (parsed.type === "pong") return;
      this.routeEvent(parsed);
    });

    this.socket.addEventListener("close", () => {
      this.setStatus("disconnected");
      this.scheduleReconnect();
    });

    this.socket.addEventListener("error", () => {
      this.setStatus("disconnected");
      this.scheduleReconnect();
    });
  }

  disconnect() {
    this.clearTimers();
    this.socket?.close();
    this.socket = null;
    this.setStatus("disconnected");
  }

  subscribe(topic: RealtimeTopic, handler: EventHandler) {
    const set = this.handlers.get(topic) ?? new Set<EventHandler>();
    set.add(handler);
    this.handlers.set(topic, set);
    return () => {
      set.delete(handler);
    };
  }

  subscribeStatus(handler: StatusHandler) {
    this.statusHandlers.add(handler);
    handler(this.status);
    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  getStatus() {
    return this.status;
  }

  private setStatus(status: RealtimeStatus) {
    if (this.status === status) return;
    this.status = status;
    this.statusHandlers.forEach((handler) => handler(status));
  }

  private parseMessage(data: unknown): RealtimeEvent | null {
    if (typeof data !== "string") return null;
    try {
      const parsed = JSON.parse(data) as RealtimeEvent;
      if (!parsed.type || !parsed.payload) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  private routeEvent(event: RealtimeEvent) {
    const topics = routeEventTopics(event);
    topics.forEach((topic) => {
      this.handlers.get(topic)?.forEach((handler) => handler(event));
    });
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
      this.socket.send(
        JSON.stringify({ type: "ping", timestamp: new Date().toISOString() })
      );
    }, HEARTBEAT_INTERVAL_MS);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect() {
    this.stopHeartbeat();
    if (this.reconnectTimer) return;
    if (!REALTIME_CONFIG.REALTIME_ENABLED) return;

    const delay = this.nextBackoffDelay();
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);

    if (!this.hasLoggedFailure && process.env.NODE_ENV !== "production") {
      this.hasLoggedFailure = true;
      console.warn("Realtime connection lost, retrying in background.");
    }
  }

  private nextBackoffDelay() {
    const base = Math.min(1000 * Math.pow(1.7, this.retryCount), 30000);
    const jitter = Math.random() * 300;
    this.retryCount += 1;
    return base + jitter;
  }

  private clearTimers() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();
  }
}

let sharedClient: RealtimeClient | null = null;

export const getRealtimeClient = () => {
  if (!sharedClient) {
    sharedClient = new RealtimeClient();
  }
  return sharedClient;
};
