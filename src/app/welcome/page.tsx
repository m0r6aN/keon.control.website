"use client";

import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { WelcomeGate } from "@/components/onboarding/route-gates";
import { WelcomePage } from "@/components/onboarding/welcome-page";

export default function WelcomeRoutePage() {
  return (
    <WelcomeGate>
      <OnboardingLayout>
        <WelcomePage />
      </OnboardingLayout>
    </WelcomeGate>
  );
}
