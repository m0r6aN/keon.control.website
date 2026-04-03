import { NextResponse } from "next/server";
import { mapCollectiveLiveError, submitCollectiveLiveRun } from "@/lib/server/collective-live";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const run = await submitCollectiveLiveRun(payload);
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
