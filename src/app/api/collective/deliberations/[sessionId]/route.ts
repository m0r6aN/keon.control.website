import type {
    DeliberationRecord,
    DeliberationSummary,
    GetDeliberationDetailResponse,
} from "@/lib/contracts/collective";
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params;
    if (!isCollectiveMockModeEnabled()) {
      return NextResponse.json(
        collectiveUnavailablePayload(
          `/api/collective/deliberations/${sessionId}`,
          "Live Collective deliberation detail is not exposed by the Collective Host yet.",
        ),
        { status: 503 },
      );
    }

    const sessions = mockDeliberationSessions();
    const session = sessions.find((s) => s.id === sessionId);

    if (!session) {
      return NextResponse.json(
        {
          status: "NOT_FOUND",
          endpoint: `/api/collective/deliberations/${sessionId}`,
          error: `Deliberation session '${sessionId}' not found`,
        },
        { status: 404 },
      );
    }

    const records: DeliberationRecord[] = session.participants.map(
      (contributorId, idx) => ({
        sessionId: session.id,
        contributorId,
        position: `Position ${idx + 1} on "${session.topic}"`,
        reasoning: `Reasoned analysis from ${contributorId} regarding the deliberation topic.`,
        evidenceRefs:
          idx === 0
            ? [`rhid:evidence:mock-${session.id}-${contributorId}`]
            : [],
        timestamp: session.startedAt,
      }),
    );

    const summary: DeliberationSummary | undefined =
      session.status === "concluded" || session.status === "archived"
        ? {
            sessionId: session.id,
            outcomeDisposition: "consensus-reached",
            participantCount: session.participants.length,
            durationMs:
              session.concludedAt && session.startedAt
                ? new Date(session.concludedAt).getTime() -
                  new Date(session.startedAt).getTime()
                : 0,
          }
        : undefined;

    const detail: GetDeliberationDetailResponse = {
      session,
      records,
      ...(summary ? { summary } : {}),
    };

    const envelope: GovernanceEnvelope<GetDeliberationDetailResponse> = {
      mode: "MOCK",
      generatedAt: new Date().toISOString(),
      governance: collectiveMockGovernance(),
      data: [detail],
      source: "local-mock-provider",
      mockLabel: "MOCK",
    };

    return NextResponse.json(envelope, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        status: "GOVERNANCE UNAVAILABLE",
        mode: "LIVE",
        endpoint: "/api/collective/deliberations/[sessionId]",
        error: "Collective deliberation detail unavailable",
      },
      { status: 503 },
    );
  }
}
