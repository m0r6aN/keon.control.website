import { buildCollectiveRequestContext } from "@/lib/server/collective-client";
import { mapCollectiveLiveError, submitCollectiveLiveRun } from "@/lib/server/collective-live";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const context = await buildCollectiveRequestContext(request);
    const run = await submitCollectiveLiveRun(payload, context);
    return NextResponse.json(run, { status: 200 });
  } catch (error) {
    const mapped = mapCollectiveLiveError(error);
    return NextResponse.json(
      {
        status: mapped.code,
        detail: mapped.detail,
        endpoint: "/api/collective/live-runs",
      },
      { status: mapped.status },
    );
  }
}
