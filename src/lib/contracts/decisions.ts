import { z } from "zod";
import { IsoDateTimeSchema, RiskLevelSchema, Sha256Schema } from "./common";
import { PolicyRefSchema } from "./workflows";

export const DecisionQueueItemSchema = z.object({
  caseId: z.string(),
  runId: z.string(),
  workflowId: z.string(),
  workflowVersion: z.string(),
  riskLevel: RiskLevelSchema,
  requiredAuthorities: z.array(z.string()).default([]),
  createdAt: IsoDateTimeSchema,
});

export const ListDecisionsResponseSchema = z.object({
  items: z.array(DecisionQueueItemSchema),
});

export const DecisionFindingSchema = z.object({
  findingId: z.string(),
  severity: z.string(),
  category: z.string(),
  location: z.object({
    path: z.string(),
    lineStart: z.number().int().optional(),
    lineEnd: z.number().int().optional(),
  }),
  message: z.string(),
  proposedAction: z
    .object({
      type: z.string(),
      description: z.string().optional(),
      patchRef: z.string().optional(),
    })
    .passthrough()
    .optional(),
});

export const PatchSchema = z.object({
  patchRef: z.string(),
  format: z.string(),
  content: z.string(),
});

export const GetDecisionCaseResponseSchema = z.object({
  caseId: z.string(),
  runId: z.string(),
  tenantId: z.string(),
  status: z.string(),
  policyContext: z
    .object({
      policyLineage: z.array(PolicyRefSchema).default([]),
    })
    .optional(),
  summary: z
    .object({
      findingCount: z.number().int().nonnegative(),
      proposedActionCount: z.number().int().nonnegative(),
      highSeverityCount: z.number().int().nonnegative(),
    })
    .optional(),
  findings: z.array(DecisionFindingSchema).default([]),
  patches: z.array(PatchSchema).default([]),
});

export const SubmitDecisionRequestSchema = z.object({
  action: z.enum(["ACCEPT", "MODIFY", "REJECT"]),
  rationale: z.string().min(1),
  actor: z.object({
    actorId: z.string(),
    displayName: z.string(),
  }),
  modifications: z
    .array(
      z.object({
        findingId: z.string(),
        patchRef: z.string(),
        replacementPatch: z.object({
          format: z.string(),
          content: z.string(),
        }),
      })
    )
    .optional(),
});

export const SubmitDecisionResponseSchema = z.object({
  caseId: z.string(),
  runId: z.string(),
  status: z.string(),
  decision: z.object({
    action: z.enum(["ACCEPT", "MODIFY", "REJECT"]),
    rationale: z.string(),
    decidedAt: IsoDateTimeSchema,
    actor: z.object({
      actorId: z.string(),
      displayName: z.string(),
    }),
  }),
  receipt: z.object({
    receiptId: z.string(),
    hash: Sha256Schema,
  }),
  evidencePack: z.object({
    packId: z.string(),
    sealHash: Sha256Schema,
    links: z
      .object({
        viewer: z.string(),
        export: z.string(),
      })
      .passthrough(),
  }),
});

