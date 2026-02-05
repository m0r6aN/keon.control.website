import { z } from "zod";

export const RiskLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

export const RunModeSchema = z.enum(["AUDIT_ONLY", "ENFORCE"]);
export type RunMode = z.infer<typeof RunModeSchema>;

export const RunStatusSchema = z.enum([
  "QUEUED",
  "RUNNING",
  "GATE_REQUIRED",
  "COMPLETED",
  "DENIED",
  "FAILED",
  "SEALED",
]);
export type RunStatus = z.infer<typeof RunStatusSchema>;

export const IsoDateTimeSchema = z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
  message: "Invalid ISO datetime",
});

export const Sha256Schema = z.string().regex(/^sha256:/, "Expected sha256: prefix");

