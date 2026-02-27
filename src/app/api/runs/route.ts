import { NextResponse } from "next/server";
import { GovernanceUnavailableError, getGovernanceCollection } from "@/lib/server/governance-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await getGovernanceCollection("runs");
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    const message = error instanceof GovernanceUnavailableError ? error.message : "Governance run data unavailable";
    return NextResponse.json(
      {
        status: "GOVERNANCE UNAVAILABLE",
        mode: "LIVE",
        endpoint: "/api/runs",
        error: message,
      },
      { status: 503 },
    );
  }
}
