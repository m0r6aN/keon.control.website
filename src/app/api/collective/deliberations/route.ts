import type { DeliberationSession } from "@/lib/contracts/collective";
import {
    collectiveMockGovernance,
    collectiveUnavailablePayload,
    isCollectiveMockModeEnabled,
} from "@/lib/server/collective-client";
import {
    mockDeliberationSessions,
    type GovernanceEnvelope,
} from "@/lib/server/governance-api";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!isCollectiveMockModeEnabled()) {
      return NextResponse.json(
        collectiveUnavailablePayload(
          "/api/collective/deliberations",
          "Live Collective deliberation listing is not exposed by the Collective Host yet.",
        ),
        { status: 503 },
      );
    }

    const items = mockDeliberationSessions();
    const envelope: GovernanceEnvelope<{ items: DeliberationSession[] }> = {
      mode: "MOCK",
      generatedAt: new Date().toISOString(),
      governance: collectiveMockGovernance(),
      data: [{ items }],
      source: "local-mock-provider",
      mockLabel: "MOCK",
    };
    return NextResponse.json(envelope, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        status: "GOVERNANCE UNAVAILABLE",
        mode: "LIVE",
        endpoint: "/api/collective/deliberations",
        error: "Collective deliberation data unavailable",
      },
      { status: 503 },
    );
  }
}
