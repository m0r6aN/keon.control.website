import { z } from "zod";
import { IsoDateTimeSchema, Sha256Schema } from "./common";

export const ReceiptsSummaryByRunResponseSchema = z.object({
  runId: z.string(),
  count: z.number().int().nonnegative(),
  firstReceiptAt: IsoDateTimeSchema.optional(),
  lastReceiptAt: IsoDateTimeSchema.optional(),
  receiptIds: z.array(z.string()).default([]),
});

export const ReceiptResponseSchema = z.object({
  receiptId: z.string(),
  runId: z.string(),
  type: z.string(),
  timestamp: IsoDateTimeSchema,
  policyHash: Sha256Schema.optional(),
  payloadHash: Sha256Schema.optional(),
  prevReceiptHash: Sha256Schema.optional(),
  hash: Sha256Schema,
  payload: z.record(z.any()).optional(),
}).passthrough();

