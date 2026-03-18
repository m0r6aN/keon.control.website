import type { PresentationTone } from "./dto";

export type ExecutionEligibilityStatus = "eligible" | "not_eligible";

export type ExecutionEligibilityReasonCode =
  | "activation_not_active"
  | "activation_missing"
  | "permission_invalid"
  | "permission_expired"
  | "delegation_invalid"
  | "delegation_revoked"
  | "scope_mismatch"
  | "prepared_effect_not_ready"
  | "upstream_revoked";

export interface ExecutionEligibilityReason {
  readonly code: ExecutionEligibilityReasonCode;
  readonly message: string;
}

export interface ExecutionEligibilityView {
  readonly preparedEffectId: string;
  readonly status: ExecutionEligibilityStatus;
  readonly reasons: readonly ExecutionEligibilityReason[];
  readonly evaluatedAtUtc: string;
  readonly statusPresentation: {
    readonly label: string;
    readonly tone: PresentationTone;
  };
}
