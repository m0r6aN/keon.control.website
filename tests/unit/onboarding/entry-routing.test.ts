import { describe, expect, it } from "vitest";
import { getEntryRoute } from "@/lib/onboarding/experience";
import { defaultOnboardingState } from "@/lib/onboarding/state-machine";

// Fully-complete onboarding state fixture
const completedState = {
  ...defaultOnboardingState,
  currentStep: "READY" as const,
  selectedGoals: ["govern-ai-actions"] as const,
  workspaceId: "tenant_abc",
  guardrailPreset: "balanced" as const,
  completed: true,
};

// Mid-setup state fixture (goals done, access pending)
const midSetupState = {
  ...defaultOnboardingState,
  currentStep: "CONFIRM_ACCESS" as const,
  selectedGoals: ["govern-ai-actions"] as const,
};

describe("getEntryRoute — canonical first-run routing", () => {
  describe("fully completed onboarding", () => {
    it("routes to /control regardless of activation flag", () => {
      expect(getEntryRoute(completedState, { activationCompleted: true })).toBe("/control");
      expect(getEntryRoute(completedState, { activationCompleted: false })).toBe("/control");
      expect(getEntryRoute(completedState)).toBe("/control");
    });
  });

  describe("activation not yet completed", () => {
    it("routes to /activate when activationCompleted is false", () => {
      expect(getEntryRoute(defaultOnboardingState, { activationCompleted: false })).toBe("/activate");
    });

    it("routes to /activate even when onboarding state is mid-setup", () => {
      // Defensive: if somehow state gets ahead of activation, activation gates first
      expect(getEntryRoute(midSetupState, { activationCompleted: false })).toBe("/activate");
    });
  });

  describe("activation complete, onboarding incomplete", () => {
    it("routes to /welcome when at WELCOME step", () => {
      expect(getEntryRoute(defaultOnboardingState, { activationCompleted: true })).toBe("/welcome");
    });

    it("routes to /setup with step when mid-onboarding", () => {
      const route = getEntryRoute(midSetupState, { activationCompleted: true });
      expect(route).toMatch(/^\/setup\?step=/);
    });
  });

  describe("backwards compatibility — no options provided", () => {
    it("defaults to treating activation as complete (does not break existing call sites)", () => {
      // Without options, fresh state → /welcome (not /activate)
      expect(getEntryRoute(defaultOnboardingState)).toBe("/welcome");
    });

    it("still routes completed state to /control", () => {
      expect(getEntryRoute(completedState)).toBe("/control");
    });
  });
});
