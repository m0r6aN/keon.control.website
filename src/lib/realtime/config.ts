const parseBoolean = (value: string | undefined, defaultValue: boolean) => {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === "true";
};

const parseNumber = (value: string | undefined, defaultValue: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
};

const isDev = process.env.NODE_ENV !== "production";

export const REALTIME_CONFIG = {
  REALTIME_ENABLED: parseBoolean(process.env.NEXT_PUBLIC_REALTIME_ENABLED, isDev),
  REALTIME_WS_URL:
    process.env.NEXT_PUBLIC_REALTIME_WS_URL ?? "ws://localhost:8787/ws",
  POLL_INTERVAL_MS: parseNumber(
    process.env.NEXT_PUBLIC_POLL_INTERVAL_MS,
    15000
  ),
  DEV_REALTIME_MOCK: parseBoolean(
    process.env.NEXT_PUBLIC_DEV_REALTIME_MOCK,
    isDev
  ),
};
