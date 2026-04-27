import type { ReformLegitimacyAssessment } from "@/lib/contracts/collective";
import {
    collectiveMockGovernance,
    collectiveUnavailablePayload,
    isCollectiveMockModeEnabled,
} from "@/lib/server/collective-client";
import {
    mockReformLegitimacyAssessments,
    type GovernanceEnvelope,
} from "@/lib/server/governance-api";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    if (!isCollectiveMockModeEnabled()) {
      return NextResponse.json(
        collectiveUnavailablePayload(
          "/api/collective/legitimacy",
          "Live Collective legitimacy assessment listing is not exposed by the Collective Host yet.",
        ),
        { status: 503 },
      );
    }

    const { searchParams } = new URL(request.url);
    const artifactRef = searchParams.get("artifactRef");

    let items = mockReformLegitimacyAssessments();

    if (artifactRef) {
      items = items.filter((a) => a.reformArtifactRef === artifactRef);
    }

    const envelope: GovernanceEnvelope<{
      items: ReformLegitimacyAssessment[];
    }> = {
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
        endpoint: "/api/collective/legitimacy",
        error: "Collective legitimacy data unavailable",
      },
      { status: 503 },
    );
  }
}
