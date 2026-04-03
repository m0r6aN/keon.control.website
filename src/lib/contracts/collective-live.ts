import { z } from "zod";

export const collectiveChallengePresetSchema = z.enum([
  "mars-colony-plan",
  "market-entry-strategy",
  "enterprise-migration-plan",
  "controversial-proposal-stress-test",
]);

export const submitCollectiveRunInputSchema = z.object({
  objective: z.string().trim().min(1, "Objective is required."),
  context: z.string().trim().optional(),
  constraints: z.string().trim().optional(),
  oversightMode: z.string().trim().optional(),
  governanceAuthority: z.string().trim().optional(),
  governanceBindingRef: z.string().trim().optional(),
  challengePreset: collectiveChallengePresetSchema.optional(),
  tenantId: z.string().trim().min(1, "Tenant id is required."),
  tenantPartition: z.string().trim().optional(),
  actorId: z.string().trim().min(1, "Actor id is required."),
  actorType: z.string().trim().min(1, "Actor type is required."),
  delegatedBy: z.string().trim().optional(),
  correlationId: z.string().trim().min(1, "Correlation id is required."),
  parentCorrelationId: z.string().trim().optional(),
  interactionId: z.string().trim().optional(),
  causationId: z.string().trim().optional(),
  intentId: z.string().trim().optional(),
});

export type SubmitCollectiveRunInput = z.infer<typeof submitCollectiveRunInputSchema>;

export interface CollectiveLiveTraceStep {
  readonly step: string;
  readonly detail: string;
  readonly plane: "cognition" | "governance" | "execution";
  readonly timestampUtc: string;
  readonly metadata: Record<string, string>;
}

export interface CollectiveLiveBranch {
  readonly branchId: string;
  readonly parentBranchId?: string | null;
  readonly state: string;
  readonly hypothesis: string;
  readonly utilityScore: number;
  readonly riskScore: number;
  readonly lineageDepth: number;
  readonly participants: readonly string[];
  readonly spawnedUtc: string;
  readonly lastUpdatedUtc?: string | null;
  readonly collapseRationale?: string | null;
}

export interface CollectiveLiveReviewFinding {
  readonly code: string;
  readonly category: string;
  readonly narrative: string;
  readonly severity: number;
  readonly resolved: boolean;
}

export interface CollectiveLiveReview {
  readonly reviewId: string;
  readonly branchId: string;
  readonly status: string;
  readonly challengeDepth: number;
  readonly inducedHeat: number;
  readonly summary: string;
  readonly timestampUtc: string;
  readonly findings: readonly CollectiveLiveReviewFinding[];
}

export interface CollectiveLiveHeatContributor {
  readonly source: string;
  readonly weight: number;
  readonly description: string;
}

export interface CollectiveLiveHeatProfile {
  readonly heatProfileId: string;
  readonly entityHeat: number;
  readonly branchHeat: number;
  readonly interactionHeat: number;
  readonly challengeHeat: number;
  readonly boundaryHeat: number;
  readonly swarmHeat: number;
  readonly compositeHeat: number;
  readonly thresholdState: string;
  readonly calculationVersion: string;
  readonly timestampUtc: string;
  readonly contributors: readonly CollectiveLiveHeatContributor[];
}

export interface CollectiveLiveCollapseRecord {
  readonly collapseId: string;
  readonly selectedBranchId: string;
  readonly disposition: string;
  readonly selectionRationale: string;
  readonly comparativeHeatSummary: string;
  readonly comparativeUtilitySummary: string;
  readonly challengeSummary: string;
  readonly candidateBranchIds: readonly string[];
  readonly loserBranchIds: readonly string[];
  readonly witnessDigestId?: string | null;
  readonly timestampUtc: string;
}

export interface CollectiveLiveWitnessTruth {
  readonly collapseId: string;
  readonly reviewId: string;
  readonly heatProfileId: string;
  readonly winningBranchId: string;
  readonly losingBranchIds: readonly string[];
  readonly collapseDisposition: string;
  readonly compositeHeat: number;
  readonly heatThresholdState: string;
  readonly truthRefs: readonly string[];
  readonly witnessNarrative: string;
  readonly truthNarrative: string;
  readonly timestampUtc: string;
}

export interface CollectiveLiveClaimGraphSummary {
  readonly nodeCount: number;
  readonly edgeCount: number;
  readonly effectBearingClaimCount: number;
}

export interface CollectiveLiveRun {
  readonly dataMode: "LIVE";
  readonly retrievalMode: "session-cache";
  readonly hostSource: string;
  readonly run: {
    readonly intentId: string;
    readonly selectedBranchId: string;
    readonly correlationId: string;
    readonly status: "completed" | "blocked";
    readonly statusLabel: string;
    readonly summary: string;
    readonly submittedAtUtc: string;
    readonly completedAtUtc: string;
  };
  readonly submission: {
    readonly objective: string;
    readonly context?: string;
    readonly constraints?: string;
    readonly oversightMode?: string;
    readonly governanceAuthority?: string;
    readonly governanceBindingRef?: string;
    readonly challengePreset?: z.infer<typeof collectiveChallengePresetSchema>;
    readonly tenantId: string;
    readonly tenantPartition?: string;
    readonly actorId: string;
    readonly actorType: string;
    readonly delegatedBy?: string;
    readonly correlationId: string;
    readonly parentCorrelationId?: string;
    readonly interactionId?: string;
    readonly causationId?: string;
  };
  readonly cognition: {
    readonly runtimeTrace: readonly CollectiveLiveTraceStep[];
    readonly materializedBranches: readonly CollectiveLiveBranch[];
    readonly evaluatedBranches: readonly CollectiveLiveBranch[];
    readonly winningBranch?: CollectiveLiveBranch;
    readonly losingBranches: readonly CollectiveLiveBranch[];
    readonly review?: CollectiveLiveReview;
    readonly heatProfile?: CollectiveLiveHeatProfile;
    readonly collapseRecord?: CollectiveLiveCollapseRecord;
    readonly witnessTruth?: CollectiveLiveWitnessTruth;
    readonly claimGraph?: CollectiveLiveClaimGraphSummary;
  };
  readonly governance: {
    readonly status: "unavailable";
    readonly label: string;
    readonly detail: string;
  };
  readonly execution: {
    readonly status: "unavailable";
    readonly label: string;
    readonly detail: string;
  };
  readonly anchors: {
    readonly collapseId?: string;
    readonly reviewId?: string;
    readonly heatProfileId?: string;
    readonly truthRefs: readonly string[];
  };
  readonly operatorMessages: readonly string[];
}

export interface CollectiveLiveRunIndexEntry {
  readonly intentId: string;
  readonly correlationId: string;
  readonly objective: string;
  readonly submittedAtUtc: string;
  readonly completedAtUtc?: string;
  readonly statusLabel: string;
  readonly tenantId: string;
  readonly actorId: string;
  readonly hostSource: string;
}

export interface CollectiveLiveRunLookupUnavailable {
  readonly status: "NOT_YET_AVAILABLE";
  readonly intentId: string;
  readonly correlationId?: string;
  readonly detail: string;
  readonly hostSource: string;
  readonly attemptedEndpoint?: string;
}
