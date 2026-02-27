import { z } from "zod";
import {
  IsoDateTimeSchema,
  RunModeSchema,
  RunStatusSchema,
  Sha256Schema,
} from "./common";
import { PolicyRefSchema } from "./workflows";

export const RepoRefSchema = z.object({
  repoId: z.string(), // e.g. "github:m0r6aN/omega-docs"
  pinnedSha: z.string().min(7),
});

export const RequestedBySchema = z.object({
  actorId: z.string(),
  displayName: z.string(),
});

export const CreateRunRequestSchema = z.object({
  workflowId: z.string(),
  workflowVersion: z.string(),
  tenantId: z.string(),
  mode: RunModeSchema,
  repo: RepoRefSchema.optional(),
  inputs: z.record(z.string(), z.unknown()).default({}),
  requestedBy: RequestedBySchema,
});

export const CreateRunResponseSchema = z.object({
  runId: z.string(),
  status: RunStatusSchema,
  createdAt: IsoDateTimeSchema,
  workflow: z.object({
    workflowId: z.string(),
    version: z.string(),
    contentHash: Sha256Schema.optional(),
  }),
  policyLineage: z.array(PolicyRefSchema).default([]),
  links: z.object({
    run: z.string(),
  }),
});

export const PhaseTimelineItemSchema = z.object({
  phase: z.string(),
  startedAt: IsoDateTimeSchema.optional(),
  endedAt: IsoDateTimeSchema.optional(),
});

export const GetRunResponseSchema = z.object({
  runId: z.string(),
  status: RunStatusSchema,
  mode: RunModeSchema.optional(),
  tenantId: z.string().optional(),
  phase: z.string().optional(),
  phaseTimeline: z.array(PhaseTimelineItemSchema).default([]),
  workflow: z.object({
    workflowId: z.string(),
    version: z.string(),
  }),
  repo: RepoRefSchema.optional(),
  receiptIds: z.array(z.string()).default([]),
  gate: z
    .object({
      caseId: z.string(),
      reason: z.string(),
      requiredAuthorities: z.array(z.string()).default([]),
      summary: z
        .object({
          findingCount: z.number().int().nonnegative(),
          highSeverityCount: z.number().int().nonnegative(),
          proposedActionCount: z.number().int().nonnegative(),
        })
        .optional(),
    })
    .optional(),
  links: z
    .object({
      findings: z.string().optional(),
      keonDecisionUrl: z.string().url().optional(),
    })
    .optional(),
});

export const FindingLocationSchema = z.object({
  path: z.string(),
  lineStart: z.number().int().optional(),
  lineEnd: z.number().int().optional(),
});

export const ProposedActionSchema = z.object({
  type: z.string(), // EDIT/MOVE/etc (kernel-owned)
  description: z.string().optional(),
  patch: z
    .object({
      format: z.string(),
      content: z.string(),
    })
    .optional(),
});

export const RunFindingSchema = z.object({
  findingId: z.string(),
  severity: z.string(), // keep kernel-owned here
  category: z.string(),
  location: FindingLocationSchema,
  message: z.string(),
  evidence: z.object({ snippet: z.string().optional() }).optional(),
  proposedAction: ProposedActionSchema.optional(),
});

export const GetRunFindingsResponseSchema = z.object({
  runId: z.string(),
  items: z.array(RunFindingSchema),
});
