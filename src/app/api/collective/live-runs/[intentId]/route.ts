import { NextResponse } from "next/server";
import { lookupCollectiveLiveRun, mapCollectiveLiveError } from "@/lib/server/collective-live";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ intentId: string }> },
) {
  try {
    const { intentId } = await params;
    const url = new URL(request.url);
    const correlationId = url.searchParams.get("correlationId") ?? undefined;
    const result = await lookupCollectiveLiveRun(decodeURIComponent(intentId), correlationId);

    return NextResponse.json(result, {
      status: result.status === "NOT_YET_AVAILABLE" ? 202 : 200,
    });
  } catch (error) {
    const mapped = mapCollectiveLiveError(error);
    return NextResponse.json(
      {
        status: mapped.code,
        detail: mapped.detail,
        endpoint: "/api/collective/live-runs/[intentId]",
      },
      { status: mapped.status },
    );
  }
}
