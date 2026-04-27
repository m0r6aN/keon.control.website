import { classifyCollectivePlane } from "@/lib/collective/live-run";
import type {
    CollectiveLiveBranch,
    CollectiveLiveRun,
    CollectiveLiveRunLookupUnavailable,
    SubmitCollectiveRunInput,
} from "@/lib/contracts/collective-live";
import { submitCollectiveRunInputSchema } from "@/lib/contracts/collective-live";
import {
    CollectiveClientAuthContextError,
    CollectiveClientConfigurationError,
    CollectiveClientUpstreamError,
    type CollectiveFetch,
    type CollectiveRequestContext,
    assertTrustedCollectiveContext,
    collectiveBaseUrl,
    collectiveRequestJson,
    isCollectiveLiveMode,
    unknownCollectiveResponseSchema,
} from "@/lib/server/collective-client";
import { z } from "zod";

class CollectiveLiveAnchorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CollectiveLiveAnchorError";
  }
}

const DELIBERATION_STATUS = {
  0: "completed",
  1: "blocked",
} as const;

const REVIEW_STATUS = {
  0: "Not Started",
  1: "In Progress",
  2: "Completed Without Findings",
  3: "Completed With Findings",
  4: "Failed",
  5: "Blocked",
} as const;

const HEAT_THRESHOLD = {
  0: "Cool",
  1: "Warm",
  2: "Hot",
  3: "Critical",
} as const;

const COLLAPSE_DISPOSITION = {
  0: "Indeterminate",
  1: "Contested",
  2: "Resolved",
} as const;

const BRANCH_STATE = {
  0: "Proposed",
  1: "Materialized",
  2: "Simulating",
  3: "Evaluated",
  4: "Collapsed Winner",
  5: "Collapsed Loser",
  6: "Archived",
  7: "Pruned",
  8: "Aborted",
} as const;

function asObject(value: unknown, label: string) {
  if (!value || typeof value !== "object") {
    throw new CollectiveLiveAnchorError(`${label} is missing or malformed.`);
  }

  return value as Record<string, unknown>;
}

function readId(value: unknown, label: string) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  const candidate = value && typeof value === "object" ? (value as { value?: unknown }).value : undefined;
  if (typeof candidate === "string" && candidate.trim()) {
    return candidate.trim();
  }

  throw new CollectiveLiveAnchorError(`${label} is missing.`);
}

function readOptionalId(value: unknown) {
  if (value == null) {
    return undefined;
  }

  try {
    return readId(value, "Optional identifier");
  } catch {
    return undefined;
  }
}

function readString(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new CollectiveLiveAnchorError(`${label} is missing.`);
  }

  return value;
}

function readOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function readNumber(value: unknown, label: string) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new CollectiveLiveAnchorError(`${label} is missing.`);
  }

  return value;
}

function readStringList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object" && "value" in item && typeof item.value === "string") {
        return item.value.trim();
      }
      return "";
    })
    .filter(Boolean);
}

function enumLabel(value: unknown, mapping: Record<number, string>, fallbackLabel: string) {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (typeof value === "number" && value in mapping) {
    return mapping[value] ?? fallbackLabel;
  }

  return fallbackLabel;
}

function normalizeBranch(value: unknown): CollectiveLiveBranch {
  const branch = asObject(value, "Branch");

  return {
    branchId: readId(branch.branchId, "Branch id"),
    parentBranchId: readOptionalId(branch.parentBranchId) ?? null,
    state: enumLabel(branch.state, BRANCH_STATE, "Unknown"),
    hypothesis: readString(branch.hypothesis, "Branch hypothesis"),
    utilityScore: readNumber(branch.utilityScore, "Branch utility score"),
    riskScore: readNumber(branch.riskScore, "Branch risk score"),
    lineageDepth: readNumber(branch.lineageDepth, "Branch lineage depth"),
    participants: readStringList(branch.participants),
    spawnedUtc: readString(branch.spawnedUtc, "Branch spawned time"),
    lastUpdatedUtc: readOptionalString(branch.lastUpdatedUtc) ?? null,
    collapseRationale: readOptionalString(branch.collapseRationale) ?? null,
  };
}

function validateCompletedRun(result: CollectiveLiveRun) {
  const collapseRecord = result.cognition.collapseRecord;
  const review = result.cognition.review;
  const heatProfile = result.cognition.heatProfile;
  const witnessTruth = result.cognition.witnessTruth;
  const winningBranch = result.cognition.winningBranch;

  if (!collapseRecord || !review || !heatProfile || !witnessTruth || !winningBranch) {
    throw new CollectiveLiveAnchorError(
      "Completed cognition run is missing collapse, review, heat, witness, or winning-branch anchors.",
    );
  }

  if (!collapseRecord.candidateBranchIds.includes(result.run.selectedBranchId)) {
    throw new CollectiveLiveAnchorError("Selected branch is absent from collapse lineage.");
  }

  if (collapseRecord.selectedBranchId !== result.run.selectedBranchId) {
    throw new CollectiveLiveAnchorError("Collapse selection does not match the returned winning branch.");
  }

  if (winningBranch.branchId !== result.run.selectedBranchId) {
    throw new CollectiveLiveAnchorError("Winning branch does not match the selected branch anchor.");
  }

  if (witnessTruth.collapseId !== collapseRecord.collapseId) {
    throw new CollectiveLiveAnchorError("Witness truth does not match the collapse anchor.");
  }

  if (witnessTruth.reviewId !== review.reviewId) {
    throw new CollectiveLiveAnchorError("Witness truth does not match the adversarial review anchor.");
  }

  if (witnessTruth.heatProfileId !== heatProfile.heatProfileId) {
    throw new CollectiveLiveAnchorError("Witness truth does not match the heat profile anchor.");
  }
}

function parseHostResponse(payload: unknown, submission: SubmitCollectiveRunInput): CollectiveLiveRun {
  const data = asObject(payload, "Collective host response");
  const statusLabel = enumLabel(data.status, DELIBERATION_STATUS, "blocked");
  const status = statusLabel === "completed" ? "completed" : "blocked";

  const runtimeTrace = Array.isArray(data.runtimeTrace)
    ? data.runtimeTrace.map((entry) => {
        const item = asObject(entry, "Runtime trace step");
        return {
          step: readString(item.step, "Runtime trace step name"),
          detail: readString(item.detail, "Runtime trace detail"),
          plane: classifyCollectivePlane(readString(item.step, "Runtime trace step name")),
          timestampUtc: readString(item.timestampUtc, "Runtime trace timestamp"),
          metadata:
            item.metadata && typeof item.metadata === "object"
              ? Object.fromEntries(
                  Object.entries(item.metadata as Record<string, unknown>).map(([key, value]) => [
                    key,
                    typeof value === "string" ? value : JSON.stringify(value),
                  ]),
                )
              : {},
        };
      })
    : [];

  const materializedBranches = Array.isArray(data.materializedBranches)
    ? data.materializedBranches.map(normalizeBranch)
    : [];
  const evaluatedBranches = Array.isArray(data.evaluatedBranches)
    ? data.evaluatedBranches.map(normalizeBranch)
    : [];
  const losingBranches = Array.isArray(data.losingBranches)
    ? data.losingBranches.map(normalizeBranch)
    : [];
  const winningBranch = data.winningBranch ? normalizeBranch(data.winningBranch) : undefined;

  const review = data.review
    ? (() => {
        const value = asObject(data.review, "Adversarial review");
        return {
          reviewId: readId(value.reviewId, "Review id"),
          branchId: readId(value.branchId, "Review branch id"),
          status: enumLabel(value.status, REVIEW_STATUS, "Unknown"),
          challengeDepth: readNumber(value.challengeDepth, "Review challenge depth"),
          inducedHeat: readNumber(value.inducedHeat, "Review induced heat"),
          summary: readString(value.summary, "Review summary"),
          timestampUtc: readString(value.timestampUtc, "Review timestamp"),
          findings: Array.isArray(value.findings)
            ? value.findings.map((finding) => {
                const item = asObject(finding, "Adversarial finding");
                return {
                  code: readString(item.findingCode, "Finding code"),
                  category: readString(item.category, "Finding category"),
                  narrative: readString(item.narrative, "Finding narrative"),
                  severity: readNumber(item.severity, "Finding severity"),
                  resolved: Boolean(item.resolved),
                };
              })
            : [],
        };
      })()
    : undefined;

  const heatProfile = data.heatProfile
    ? (() => {
        const value = asObject(data.heatProfile, "Heat profile");
        return {
          heatProfileId: readId(value.heatProfileId, "Heat profile id"),
          entityHeat: readNumber(value.entityHeat, "Entity heat"),
          branchHeat: readNumber(value.branchHeat, "Branch heat"),
          interactionHeat: readNumber(value.interactionHeat, "Interaction heat"),
          challengeHeat: readNumber(value.challengeHeat, "Challenge heat"),
          boundaryHeat: readNumber(value.boundaryHeat, "Boundary heat"),
          swarmHeat: readNumber(value.swarmHeat, "Swarm heat"),
          compositeHeat: readNumber(value.compositeHeat, "Composite heat"),
          thresholdState: enumLabel(value.thresholdState, HEAT_THRESHOLD, "Unknown"),
          calculationVersion: readString(value.calculationVersion, "Heat calculation version"),
          timestampUtc: readString(value.timestampUtc, "Heat profile timestamp"),
          contributors: Array.isArray(value.contributors)
            ? value.contributors.map((contributor) => {
                const item = asObject(contributor, "Heat contributor");
                return {
                  source: readString(item.source, "Heat contributor source"),
                  weight: readNumber(item.weight, "Heat contributor weight"),
                  description: readString(item.description, "Heat contributor description"),
                };
              })
            : [],
        };
      })()
    : undefined;

  const collapseRecord = data.collapseRecord
    ? (() => {
        const value = asObject(data.collapseRecord, "Collapse record");
        const candidateBranchIds = readStringList(value.candidateBranchIds);
        const loserBranchIds = readStringList(value.loserBranchIds);
        if (candidateBranchIds.length === 0) {
          throw new CollectiveLiveAnchorError("Collapse lineage is missing candidate branches.");
        }

        return {
          collapseId: readId(value.collapseId, "Collapse id"),
          selectedBranchId: readId(value.selectedBranchId, "Collapse selected branch id"),
          disposition: enumLabel(value.disposition, COLLAPSE_DISPOSITION, "Unknown"),
          selectionRationale: readString(value.selectionRationale, "Collapse rationale"),
          comparativeHeatSummary: readString(value.comparativeHeatSummary, "Collapse heat summary"),
          comparativeUtilitySummary: readString(value.comparativeUtilitySummary, "Collapse utility summary"),
          challengeSummary: readString(value.challengeSummary, "Collapse challenge summary"),
          candidateBranchIds,
          loserBranchIds,
          witnessDigestId: readOptionalId(value.witnessDigestId) ?? null,
          timestampUtc: readString(value.timestampUtc, "Collapse timestamp"),
        };
      })()
    : undefined;

  const witnessTruth = data.witnessTruth
    ? (() => {
        const value = asObject(data.witnessTruth, "Witness truth package");
        return {
          collapseId: readId(value.collapseId, "Witness collapse id"),
          reviewId: readId(value.reviewId, "Witness review id"),
          heatProfileId: readId(value.heatProfileId, "Witness heat profile id"),
          winningBranchId: readId(value.winningBranchId, "Witness winning branch id"),
          losingBranchIds: readStringList(value.losingBranchIds),
          collapseDisposition: enumLabel(value.collapseDisposition, COLLAPSE_DISPOSITION, "Unknown"),
          compositeHeat: readNumber(value.compositeHeat, "Witness composite heat"),
          heatThresholdState: enumLabel(value.heatThresholdState, HEAT_THRESHOLD, "Unknown"),
          truthRefs: readStringList(value.truthRefs),
          witnessNarrative: readString(value.witnessNarrative, "Witness narrative"),
          truthNarrative: readString(value.truthNarrative, "Truth narrative"),
          timestampUtc: readString(value.timestampUtc, "Witness timestamp"),
        };
      })()
    : undefined;

  const claimGraph = data.claimGraph && typeof data.claimGraph === "object"
    ? (() => {
        const value = data.claimGraph as { nodes?: unknown; edges?: unknown };
        const nodes = value.nodes && typeof value.nodes === "object"
          ? Object.values(value.nodes as Record<string, unknown>)
          : [];
        const edges = Array.isArray(value.edges) ? value.edges : [];
        const effectBearingClaimCount = nodes.filter((node) => {
          if (!node || typeof node !== "object") return false;
          return Boolean((node as { isEffectBearing?: unknown }).isEffectBearing);
        }).length;

        return {
          nodeCount: nodes.length,
          edgeCount: edges.length,
          effectBearingClaimCount,
        };
      })()
    : undefined;

  const result: CollectiveLiveRun = {
    dataMode: "LIVE",
    retrievalMode: "session-cache",
    hostSource: collectiveBaseUrl(),
    run: {
      intentId: readId(data.intentId, "Intent id"),
      selectedBranchId: readId(data.selectedBranchId, "Selected branch id"),
      correlationId: submission.correlationId,
      status,
      statusLabel: status === "completed" ? "Completed" : "Blocked",
      summary: readString(data.summary, "Run summary"),
      submittedAtUtc: new Date().toISOString(),
      completedAtUtc: readString(data.timestampUtc, "Completion timestamp"),
    },
    submission: {
      objective: submission.objective,
      context: submission.context,
      constraints: submission.constraints,
      oversightMode: submission.oversightMode,
      governanceAuthority: submission.governanceAuthority,
      governanceBindingRef: submission.governanceBindingRef,
      challengePreset: submission.challengePreset,
      tenantId: submission.tenantId,
      tenantPartition: submission.tenantPartition,
      actorId: submission.actorId,
      actorType: submission.actorType,
      delegatedBy: submission.delegatedBy,
      correlationId: submission.correlationId,
      parentCorrelationId: submission.parentCorrelationId,
      interactionId: submission.interactionId,
      causationId: submission.causationId,
    },
    cognition: {
      runtimeTrace,
      materializedBranches,
      evaluatedBranches,
      winningBranch,
      losingBranches,
      review,
      heatProfile,
      collapseRecord,
      witnessTruth,
      claimGraph,
    },
    governance: {
      status: "unavailable",
      label: "Governed Authorization Unavailable",
      detail:
        "This host seam returns inert cognition only. No governed approval or denial receipt has been returned on this path.",
    },
    execution: {
      status: "unavailable",
      label: "Reality Execution Unavailable",
      detail:
        "No reality-plane execution or outcome receipt has been returned on this path. Consequential action still requires the governed boundary.",
    },
    anchors: {
      collapseId: collapseRecord?.collapseId,
      reviewId: review?.reviewId,
      heatProfileId: heatProfile?.heatProfileId,
      truthRefs: witnessTruth?.truthRefs ?? [],
    },
    operatorMessages: [
      "Cognition artifacts below are real host outputs and remain non-effecting.",
      "Governed authorization and execution receipts are unavailable on the current backend seam.",
      "Receipts outrank stories; trust anchors and truth refs are shown separately from narratives.",
    ],
  };

  if (result.run.status === "completed") {
    validateCompletedRun(result);
  }

  return result;
}

function buildRetrievedSubmission(intentId: string, correlationId?: string): SubmitCollectiveRunInput {
  return {
    objective: "Objective unavailable from retrieval endpoint.",
    tenantId: "unknown-tenant",
    actorId: "unknown-actor",
    actorType: "unknown-actor-type",
    correlationId: correlationId ?? `corr:lookup:${intentId}`,
  };
}

function buildIntentPayload(submission: SubmitCollectiveRunInput) {
  return JSON.stringify({
    objective: submission.objective,
    context: submission.context ?? null,
    constraints: submission.constraints ?? null,
    oversightMode: submission.oversightMode ?? null,
    challengePreset: submission.challengePreset ?? null,
    governance: {
      authority: submission.governanceAuthority ?? null,
      bindingRef: submission.governanceBindingRef ?? null,
    },
    operatorSurface: "keon.control.website",
  });
}

function isFetch(value: unknown): value is CollectiveFetch {
  return typeof value === "function";
}

function contextFromSubmissionForNonLive(submission: SubmitCollectiveRunInput): CollectiveRequestContext {
  return {
    tenantId: submission.tenantId,
    tenantPartition: submission.tenantPartition,
    actorId: submission.actorId,
    actorType: submission.actorType,
    delegatedBy: submission.delegatedBy,
    correlationId: submission.correlationId,
    parentCorrelationId: submission.parentCorrelationId,
    interactionId: submission.interactionId,
    causationId: submission.causationId,
  };
}

function bindTrustedSubmission(
  submission: SubmitCollectiveRunInput,
  context?: CollectiveRequestContext,
): SubmitCollectiveRunInput {
  if (isCollectiveLiveMode() && !context) {
    throw new CollectiveClientAuthContextError(
      "Trusted Collective request context is required in live mode; tenant and actor cannot come from browser payloads.",
    );
  }

  const trusted = context ?? contextFromSubmissionForNonLive(submission);
  assertTrustedCollectiveContext(trusted);

  return {
    ...submission,
    tenantId: trusted.tenantId,
    tenantPartition: trusted.tenantPartition ?? submission.tenantPartition,
    actorId: trusted.actorId,
    actorType: trusted.actorType,
    delegatedBy: trusted.delegatedBy ?? submission.delegatedBy,
    correlationId: trusted.correlationId,
    parentCorrelationId: trusted.parentCorrelationId ?? submission.parentCorrelationId,
    interactionId: trusted.interactionId ?? submission.interactionId,
    causationId: trusted.causationId ?? submission.causationId,
  };
}

export async function submitCollectiveLiveRun(
  input: unknown,
  contextOrFetch?: CollectiveRequestContext | CollectiveFetch,
  fetchImpl: CollectiveFetch = fetch,
): Promise<CollectiveLiveRun> {
  const parsedSubmission = submitCollectiveRunInputSchema.parse(input);
  const requestContext = isFetch(contextOrFetch) ? undefined : contextOrFetch;
  const effectiveFetch = isFetch(contextOrFetch) ? contextOrFetch : fetchImpl;
  const submission = bindTrustedSubmission(parsedSubmission, requestContext);
  const context = requestContext ?? contextFromSubmissionForNonLive(submission);
  const startedAtUtc = new Date().toISOString();

  try {
    const payload = await collectiveRequestJson(
      context,
      "/intents",
      {
        method: "POST",
        fetchImpl: effectiveFetch,
        body: {
        intentId: { value: submission.intentId ?? `intent:${submission.tenantId}:${submission.correlationId}` },
        goal: submission.objective,
        intentPayloadJson: buildIntentPayload(submission),
        tenantContext: {
          tenantId: { value: submission.tenantId },
          tenantPartition: submission.tenantPartition ?? null,
        },
        actorContext: {
          actorId: { value: submission.actorId },
          actorType: submission.actorType,
          delegatedBy: submission.delegatedBy ?? null,
        },
        correlationContext: {
          correlationId: { value: submission.correlationId },
          parentCorrelationId: submission.parentCorrelationId ?? null,
          interactionId: submission.interactionId ?? null,
          causationId: submission.causationId ?? null,
        },
        timestampUtc: startedAtUtc,
        },
      },
      unknownCollectiveResponseSchema,
    );
    const run = parseHostResponse(payload, submission);

    return {
      ...run,
      run: {
        ...run.run,
        submittedAtUtc: startedAtUtc,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw error;
    }

    if (error instanceof CollectiveClientConfigurationError ||
        error instanceof CollectiveClientAuthContextError ||
        error instanceof CollectiveClientUpstreamError ||
        error instanceof CollectiveLiveAnchorError) {
      throw error;
    }

    throw new CollectiveClientUpstreamError(
      `Collective host could not be reached: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function lookupCollectiveLiveRun(
  intentId: string,
  correlationId?: string,
  fetchImpl: CollectiveFetch = fetch,
  requestContext?: CollectiveRequestContext,
): Promise<CollectiveLiveRun | CollectiveLiveRunLookupUnavailable> {
  const path = `/intents/${encodeURIComponent(intentId)}`;
  const attemptedEndpoint = `${collectiveBaseUrl()}${path}`;
  const lookupSubmission = buildRetrievedSubmission(intentId, correlationId);
  const context = requestContext ?? contextFromSubmissionForNonLive(lookupSubmission);

  try {
    const payload = await collectiveRequestJson(
      context,
      path,
      {
        method: "GET",
        fetchImpl,
      },
      unknownCollectiveResponseSchema,
    );
    const run = parseHostResponse(payload, lookupSubmission);

    return {
      ...run,
      run: {
        ...run.run,
        intentId,
        correlationId: correlationId ?? run.run.correlationId,
      },
    };
  } catch (error) {
    if (error instanceof CollectiveClientConfigurationError ||
        error instanceof CollectiveClientAuthContextError ||
        error instanceof z.ZodError) {
      throw error;
    }

    const upstreamStatus = error instanceof CollectiveClientUpstreamError ? error.status : undefined;
    return {
      status: "NOT_YET_AVAILABLE",
      intentId,
      correlationId,
      detail:
        upstreamStatus === 404 || upstreamStatus === 405 || upstreamStatus === 501
          ? "The Collective host does not yet expose durable run retrieval for this intent."
          : upstreamStatus
            ? `Collective host lookup returned HTTP ${upstreamStatus}.`
            : "The Collective host lookup seam is not yet available.",
      hostSource: collectiveBaseUrl(),
      attemptedEndpoint,
    };
  }
}

export function mapCollectiveLiveError(error: unknown) {
  if (error instanceof z.ZodError) {
    return {
      status: 400,
      code: "VALIDATION_FAILED",
      detail: error.issues.map((issue) => issue.message).join(" "),
    };
  }

  if (error instanceof CollectiveClientConfigurationError) {
    return {
      status: 500,
      code: "CONFIGURATION_ERROR",
      detail: error.message,
    };
  }

  if (error instanceof CollectiveClientAuthContextError) {
    return {
      status: 401,
      code: "AUTH_CONTEXT_UNAVAILABLE",
      detail: error.message,
    };
  }

  if (error instanceof CollectiveLiveAnchorError) {
    return {
      status: 502,
      code: "ANCHOR_VALIDATION_FAILED",
      detail: error.message,
    };
  }

  if (error instanceof CollectiveClientUpstreamError) {
    return {
      status: error.status,
      code: "UPSTREAM_UNAVAILABLE",
      detail: error.message,
    };
  }

  return {
    status: 500,
    code: "UNKNOWN_ERROR",
    detail: error instanceof Error ? error.message : "Unknown error",
  };
}
