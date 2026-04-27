import { NextResponse } from "next/server";
import { z } from "zod";
import {
  CollectiveClientAuthContextError,
  CollectiveClientConfigurationError,
  CollectiveClientUpstreamError,
  buildCollectiveRequestContext,
  collectiveRequestJson,
} from "@/lib/server/collective-client";

export const dynamic = "force-dynamic";

const opportunitiesSchema = z.array(z.unknown());

function mapStatus(error: unknown) {
  if (error instanceof CollectiveClientAuthContextError) return 401;
  if (error instanceof CollectiveClientConfigurationError) return 500;
  if (error instanceof CollectiveClientUpstreamError) return error.status;
  if (error instanceof z.ZodError) return 502;
  return 503;
}

export async function GET(request: Request) {
  try {
    const context = await buildCollectiveRequestContext(request);
    const url = new URL(request.url);
    const params = new URLSearchParams({ tenantId: context.tenantId });
    const status = url.searchParams.get("status");
    const limit = url.searchParams.get("limit");

    if (status) params.set("status", status);
    if (limit) params.set("limit", limit);

    const items = await collectiveRequestJson(
      context,
      `/opportunities?${params.toString()}`,
      { method: "GET" },
      opportunitiesSchema,
    );

    return NextResponse.json(
      {
        mode: "LIVE",
        generatedAt: new Date().toISOString(),
        source: "collective-host",
        governance: {
          determinismStatus: "UNKNOWN",
          sealValidationResult: "UNKNOWN",
          incidentFlag: false,
        },
        data: [{ items }],
        operatorMessages: [
          "Opportunity records are cognition-plane suggestions only.",
          "This route does not accept offerings, dispatch Runtime, or call MCP Gateway.",
        ],
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "COLLECTIVE_UNAVAILABLE",
        mode: "LIVE",
        endpoint: "/api/collective/opportunities",
        detail: error instanceof Error ? error.message : "Collective opportunities are unavailable.",
        source: "collective-host",
      },
      { status: mapStatus(error) },
    );
  }
}