import { z } from "zod";
import { IsoDateTimeSchema, RiskLevelSchema, Sha256Schema } from "./common";

export const PolicyRefSchema = z.object({
  policyId: z.string(),
  version: z.string(),
  hash: Sha256Schema,
});

export const WorkflowListItemSchema = z.object({
  workflowId: z.string(),
  latestVersion: z.string(),
  title: z.string(),
  description: z.string(),
  riskLevel: RiskLevelSchema,
  requiredAuthorities: z.array(z.string()),
  tags: z.array(z.string()).default([]),
  updatedAt: IsoDateTimeSchema,
});

export const ListWorkflowsResponseSchema = z.object({
  items: z.array(WorkflowListItemSchema),
});

export const WorkflowVersionItemSchema = z.object({
  version: z.string(),
  status: z.string(), // "STABLE" etc (kernel-owned)
  createdAt: IsoDateTimeSchema,
  contentHash: Sha256Schema,
  policyRefs: z.array(PolicyRefSchema).default([]),
  requiredAuthorities: z.array(z.string()).default([]),
});

export const GetWorkflowVersionsResponseSchema = z.object({
  workflowId: z.string(),
  versions: z.array(WorkflowVersionItemSchema),
});

export const JsonSchemaSchema = z.object({
  type: z.string(),
  required: z.array(z.string()).optional(),
  properties: z.record(z.any()).optional(),
}).passthrough();

export const GetWorkflowVersionResponseSchema = z.object({
  workflowId: z.string(),
  version: z.string(),
  title: z.string(),
  description: z.string(),
  riskLevel: RiskLevelSchema,
  inputsSchema: JsonSchemaSchema,
  contentHash: Sha256Schema,
  policyRefs: z.array(PolicyRefSchema).default([]),
  requiredAuthorities: z.array(z.string()).default([]),
});

