import { z } from "zod";

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(params: { status: number; code: string; message: string; details?: unknown }) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.code = params.code;
    this.details = params.details;
  }
}

const KernelErrorSchema = z
  .object({
    error: z
      .object({
        code: z.string().default("UNKNOWN_ERROR"),
        message: z.string().default("Request failed"),
        details: z.unknown().optional(),
      })
      .optional(),
  })
  .passthrough();

type FetchJsonOptions = {
  baseUrl: string;
  path: string;
  method?: "GET" | "POST";
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export async function fetchJson<TSchema extends z.ZodTypeAny>(
  opts: FetchJsonOptions,
  schema: TSchema
): Promise<z.infer<TSchema>> {
  const url = joinUrl(opts.baseUrl, opts.path);

  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    signal: opts.signal,
    cache: "no-store",
  });

  const text = await res.text();
  const json = text ? safeJsonParse(text) : undefined;

  if (!res.ok) {
    const parsed = KernelErrorSchema.safeParse(json);
    const code = parsed.success ? parsed.data.error?.code ?? "HTTP_ERROR" : "HTTP_ERROR";
    const message = parsed.success ? parsed.data.error?.message ?? res.statusText : res.statusText;
    const details = parsed.success ? parsed.data.error?.details : json;

    throw new ApiError({ status: res.status, code, message, details });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new ApiError({
      status: 500,
      code: "SCHEMA_MISMATCH",
      message: "Response did not match expected schema",
      details: parsed.error.flatten(),
    });
  }

  return parsed.data;
}

function joinUrl(baseUrl: string, path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const rawBase = baseUrl.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;

  // FC root routes (e.g. /api/fc/*) must be resolved from federation root.
  if (p.startsWith("/api/")) {
    const federationRoot = rawBase.replace(/\/api\/v1$/i, "");
    return `${federationRoot}${p}`;
  }

  return `${rawBase}${p}`;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}
