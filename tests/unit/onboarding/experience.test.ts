import { describe, expect, it } from "vitest";
import { getChecklistItems, getCurrentBlocker, getReadinessLabel } from "@/lib/onboarding/experience";
import { defaultOnboardingState } from "@/lib/onboarding/state-machine";

describe("onboarding experience helpers", () => {
  it("reports in-progress readiness clearly", () => {
    expect(getReadinessLabel(defaultOnboardingState)).toBe("0/3 required steps complete");
    expect(getCurrentBlocker(defaultOnboardingState)).toMatch(/choose what you want keon to manage first/i);
  });

  it("marks required steps complete before ready state", () => {
    const state = {
      ...defaultOnboardingState,
      currentStep: "READY" as const,
      selectedGoals: ["govern-ai-actions"] as const,
      workspaceId: "tenant_123",
      guardrailPreset: "balanced" as const,
    };

    const checklist = getChecklistItems(state);
    expect(checklist.required.every((item) => item.status === "complete")).toBe(true);
    expect(getReadinessLabel({ ...state, completed: true })).toBe("Ready to use");
  });
});
