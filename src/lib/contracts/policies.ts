import { z } from "zod";
import { IsoDateTimeSchema, Sha256Schema } from "./common";

export const PolicyListItemSchema = z.object({
  policyId: z.string(),
  title: z.string(),
  latestVersion: z.string(),
  latestHash: Sha256Schema,
  updatedAt: IsoDateTimeSchema,
});

export const ListPoliciesResponseSchema = z.object({
  items: z.array(PolicyListItemSchema),
});

export const GetPolicyVersionResponseSchema = z.object({
  policyId: z.string(),
  version: z.string(),
  hash: Sha256Schema,
  lineage: z
    .object({
      prevVersion: z.string().nullable().optional(),
      supersededBy: z.string().nullable().optional(),
    })
    .optional(),
  contentRef: z
    .object({
      type: z.string(),
      path: z.string(),
    })
    .optional(),
});

