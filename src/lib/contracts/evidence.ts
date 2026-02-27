import { z } from "zod";
import { Sha256Schema } from "./common";

export type EvidenceByRunResponse = z.infer<typeof EvidenceByRunResponseSchema>;

export const EvidenceByRunResponseSchema = z.object({
  runId: z.string(),
  packId: z.string(),
  seal: z.object({
    sealHash: Sha256Schema,
    manifestHash: Sha256Schema,
    verified: z.boolean(),
  }),
  artifacts: z.array(
    z.object({
      name: z.string(),
      sha256: Sha256Schema,
      sizeBytes: z.number().int().nonnegative(),
    })
  ),
  links: z.object({
    manifest: z.string(),
    export: z.string(),
  }),
});
