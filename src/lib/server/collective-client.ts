import "server-only";

import { getMe } from "@/lib/server/control-plane";
import { z } from "zod";

export type CollectiveFetch = typeof fetch;

export interface CollectiveRequestContext {
  readonly authorization?: string;
  readonly tenantId: string;
  readonly tenantPartition?: string;
  readonly actorId: string;
  readonly actorType: string;
  readonly delegatedBy?: string;
  readonly correlationId: string;
  readonly parentCorrelationId?: string;
  readonly interactionId?: string;
  readonly causationId?: string;
}

export class CollectiveClientConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CollectiveClientConfigurationError";
  }
}

export class CollectiveClientAuthContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CollectiveClientAuthContextError";
  }
}

export class CollectiveClientUpstreamError extends Error {
  constructor(message: string, readonly status = 503) {
    super(message);
    this.name = "CollectiveClientUpstreamError";
  }
}

export const unknownCollectiveResponseSchema = z.unknown();

export function isCollectiveLiveMode() {
  return process.env.NEXT_PUBLIC_API_LIVE_MODE === "true";
}

export function isCollectiveMockModeEnabled() {
  return !isCollectiveLiveMode() && process.env.NEXT_PUBLIC_API_USE_MOCK_FALLBACK === "true";
}

export function collectiveBaseUrl() {
  const baseUrl = process.env.KEON_COLLECTIVE_HOST_BASE_URL?.trim();
  if (!baseUrl) {
    throw new CollectiveClientConfigurationError(
      "KEON_COLLECTIVE_HOST_BASE_URL is required for live Collective integration.",
    );
  }

  return baseUrl.replace(/\/+$/, "");
}

export function collectiveTimeoutMs() {
  const parsed = Number.parseInt(process.env.KEON_COLLECTIVE_HOST_TIMEOUT_MS ?? "15000", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 15000;
}

export function collectiveMockGovernance() {
  return {
    determinismStatus: "MOCK_UNVERIFIED" as const,
    sealValidationResult: "NOT_APPLICABLE" as const,
    incidentFlag: false,
  };
}

export function collectiveUnavailablePayload(endpoint: string, detail: string) {
  return {
    status: "COLLECTIVE_UNAVAILABLE",
    mode: "LIVE" as const,
    endpoint,
    detail,
    source: "collective-host",
    governance: {
      determinismStatus: "DEGRADED" as const,
      sealValidationResult: "UNKNOWN" as const,
      incidentFlag: false,
    },
    data: [],
  };
}

function generateCorrelationId() {
  return globalThis.crypto?.randomUUID?.() ?? `corr:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
}

function authorizationFrom(request?: Request) {
  const configured = process.env.KEON_COLLECTIVE_HOST_AUTHORIZATION?.trim();
  if (configured) return configured;

  const bearer = process.env.KEON_COLLECTIVE_HOST_BEARER_TOKEN?.trim();
  if (bearer) return `Bearer ${bearer}`;

  return request?.headers.get("authorization")?.trim() || undefined;
}

function readMeData(me: unknown) {
  if (!me || typeof me !== "object" || !("data" in me)) return undefined;
  const data = (me as { data?: unknown }).data;
  return data && typeof data === "object" ? data as Record<string, unknown> : undefined;
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export async function buildCollectiveRequestContext(
  request: Request,
  overrides: Partial<CollectiveRequestContext> = {},
): Promise<CollectiveRequestContext> {
  const me = readMeData(await getMe().catch(() => null));
  const tenantId = overrides.tenantId ?? readString(me?.tenantId);
  const actorId = overrides.actorId ?? readString(me?.userId);
  const authorization = overrides.authorization ?? authorizationFrom(request);
  const correlationId = overrides.correlationId ?? request.headers.get("x-correlation-id")?.trim() ?? generateCorrelationId();

  const context: CollectiveRequestContext = {
    ...(authorization ? { authorization } : {}),
    tenantId: tenantId ?? "",
    tenantPartition: overrides.tenantPartition ?? "default",
    actorId: actorId ?? "",
    actorType: overrides.actorType ?? "human-operator",
    delegatedBy: overrides.delegatedBy,
    correlationId,
    parentCorrelationId: overrides.parentCorrelationId ?? request.headers.get("x-parent-correlation-id")?.trim() ?? undefined,
    interactionId: overrides.interactionId,
    causationId: overrides.causationId,
  };

  assertTrustedCollectiveContext(context);
  return context;
}

export function assertTrustedCollectiveContext(context: CollectiveRequestContext) {
  if (!context.tenantId || !context.actorId || !context.actorType || !context.correlationId) {
    throw new CollectiveClientAuthContextError(
      "Trusted tenant, actor, and correlation context are required for Collective host calls.",
    );
  }

  if (isCollectiveLiveMode() && !context.authorization) {
    throw new CollectiveClientAuthContextError(
      "Authorization is required for live Collective host calls.",
    );
  }
}

function contextHeaders(context: CollectiveRequestContext, body: unknown, headers?: Record<string, string>) {
  return {
    Accept: "application/json",
    ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    ...(context.authorization ? { Authorization: context.authorization } : {}),
    "X-Keon-Tenant-Id": context.tenantId,
    "X-Keon-Actor-Id": context.actorId,
    "X-Correlation-Id": context.correlationId,
    ...(headers ?? {}),
  };
}

export async function collectiveRequestJson<TSchema extends z.ZodTypeAny>(
  context: CollectiveRequestContext,
  path: string,
  options: {
    readonly method?: "GET" | "POST";
    readonly body?: unknown;
    readonly headers?: Record<string, string>;
    readonly fetchImpl?: CollectiveFetch;
  },
  schema: TSchema,
): Promise<z.infer<TSchema>> {
  assertTrustedCollectiveContext(context);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), collectiveTimeoutMs());
  const url = `${collectiveBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    const response = await (options.fetchImpl ?? fetch)(url, {
      method: options.method ?? "GET",
      headers: contextHeaders(context, options.body, options.headers),
      cache: "no-store",
      signal: controller.signal,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });

    const text = await response.text();
    if (!response.ok) {
      throw new CollectiveClientUpstreamError(
        `Collective host returned HTTP ${response.status}${text ? `: ${text}` : ""}`,
        response.status,
      );
    }

    const payload = text ? JSON.parse(text) : undefined;
    return schema.parse(payload);
  } catch (error) {
    if (error instanceof CollectiveClientConfigurationError ||
        error instanceof CollectiveClientAuthContextError ||
        error instanceof CollectiveClientUpstreamError ||
        error instanceof z.ZodError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new CollectiveClientUpstreamError(`Collective host timed out after ${collectiveTimeoutMs()}ms.`, 504);
    }

    throw new CollectiveClientUpstreamError(
      `Collective host could not be reached: ${error instanceof Error ? error.message : String(error)}`,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}