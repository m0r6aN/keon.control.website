import { describe, expect, it } from "vitest";
import { defaultOnboardingState, transitionOnboardingState } from "./state-machine";

describe("transitionOnboardingState", () => {
  it("moves through the happy path in order", () => {
    const started = transitionOnboardingState(defaultOnboardingState, { type: "START_SETUP" });
    const withGoals = transitionOnboardingState(started, {
      type: "SAVE_GOALS",
      payload: { selectedGoals: ["govern-ai-actions"] },
    });
    const withAccess = transitionOnboardingState(withGoals, {
      type: "CONFIRM_ACCESS",
      payload: { workspaceId: "tenant_123" },
    });
    const readyToFinish = transitionOnboardingState(withAccess, {
      type: "APPLY_GUARDRAILS",
      payload: { guardrailPreset: "balanced" },
    });
    const completed = transitionOnboardingState(readyToFinish, { type: "FINISH_ONBOARDING" });

    expect(completed).toMatchObject({
      currentStep: "READY",
      selectedGoals: ["govern-ai-actions"],
      workspaceId: "tenant_123",
      guardrailPreset: "balanced",
      completed: true,
    });
  });

  it("does not skip ahead without required data", () => {
    const skipped = transitionOnboardingState(defaultOnboardingState, {
      type: "APPLY_GUARDRAILS",
      payload: { guardrailPreset: "strict" },
    });

    expect(skipped).toEqual(defaultOnboardingState);
  });

  it("requires at least one selected goal", () => {
    const started = transitionOnboardingState(defaultOnboardingState, { type: "START_SETUP" });
    const unchanged = transitionOnboardingState(started, {
      type: "SAVE_GOALS",
      payload: { selectedGoals: [] },
    });

    expect(unchanged.currentStep).toBe("DEFINE_GOALS");
  });

  it("normalizes completed hydrated state to the final step", () => {
    const hydrated = transitionOnboardingState(defaultOnboardingState, {
      type: "HYDRATE",
      payload: {
        currentStep: "SET_GUARDRAILS",
        selectedGoals: ["memory-and-context"],
        workspaceId: "tenant_456",
        guardrailPreset: "flexible",
        completed: true,
      },
    });

    expect(hydrated.currentStep).toBe("READY");
    expect(hydrated.completed).toBe(true);
  });
}
