import type { ReformArtifact } from "@/lib/contracts/collective";
import {
    collectiveMockGovernance,
    collectiveUnavailablePayload,
    isCollectiveMockModeEnabled,
} from "@/lib/server/collective-client";
import {
    mockReformArtifacts,
    type GovernanceEnvelope,
} from "@/lib/server/governance-api";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!isCollectiveMockModeEnabled()) {
      return NextResponse.json(
        collectiveUnavailablePayload(
          "/api/collective/reforms",
          "Live Collective reform listing is not exposed by the Collective Host yet.",
        ),
        { status: 503 },
      );
    }

    const items = mockReformArtifacts();
    const envelope: GovernanceEnvelope<{ items: ReformArtifact[] }> = {
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
        endpoint: "/api/collective/reforms",
        error: "Collective reform data unavailable",
      },
      { status: 503 },
    );
  }
}
