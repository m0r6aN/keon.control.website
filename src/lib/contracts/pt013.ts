import { z } from "zod";
import { IsoDateTimeSchema, RhidSchema, Sha256Schema } from "./common";

/**
 * PT-013 Manifest Entry (snake_case as stored)
 */
export const ManifestEntrySchema = z.object({
  rhid: RhidSchema,
  sha256: Sha256Schema,
  content_type: z.string(),
  size_bytes: z.number().int().nonnegative(),
  storage_uri: z.string(),
  created_by_actor_id: z.string(),
  created_at: IsoDateTimeSchema,
});

export type ManifestEntry = z.infer<typeof ManifestEntrySchema>;

/**
 * PT-013 Manifest (snake_case as stored)
 */
export const ManifestSchema = z.object({
  entries: z.array(ManifestEntrySchema),
});

export type Manifest = z.infer<typeof ManifestSchema>;

/**
 * PT-013 Collaboration Ledger Entry (snake_case as stored)
 */
export const CollaborationLedgerEntrySchema = z.object({
  seq: z.number().int().nonnegative(),
  step_id: z.string(),
  actor_id: z.string(),
  actor_type: z.string(),
  action_type: z.string(),
  policy_decision: z.enum(["allow", "flag", "deny"]).optional(),
  timestamp: IsoDateTimeSchema,
  duration_ms: z.number().int().nonnegative(),
  status: z.string(),
  inputs: z.array(RhidSchema).default([]),
  outputs: z.array(RhidSchema).default([]),
  receipt_rhid: RhidSchema.optional(),
  prev_action_hash: Sha256Schema.optional(),
});

export type CollaborationLedgerEntry = z.infer<typeof CollaborationLedgerEntrySchema>;

/**
 * PT-013 Thin Receipt (snake_case as stored)
 */
export const ThinReceiptSchema = z.object({
  receipt_id: z.string(),
  run_id: z.string(),
  action_type: z.string(),
  timestamp: IsoDateTimeSchema,
  policy_rhid: RhidSchema.optional(),
  evidence_rhids: z.array(RhidSchema).default([]),
  prev_receipt_hash: Sha256Schema.optional(),
  hash: Sha256Schema,
  signature: z.string().optional(),
});

export type ThinReceipt = z.infer<typeof ThinReceiptSchema>;
