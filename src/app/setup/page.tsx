"use client";

import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { SetupGate } from "@/components/onboarding/route-gates";

export default function SetupPage() {
  return (
    <SetupGate>
      <OnboardingLayout>
        <OnboardingFlow />
      </OnboardingLayout>
    </SetupGate>
  );
}
