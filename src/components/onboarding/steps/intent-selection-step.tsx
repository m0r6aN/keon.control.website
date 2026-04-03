"use client";

import { StepShell } from "@/components/onboarding/step-shell";
import { Button } from "@/components/ui/button";
import { useOnboardingState } from "@/lib/onboarding/store";
import type { OnboardingGoal } from "@/lib/onboarding/state-machine";
import { cn } from "@/lib/utils";
import * as React from "react";

const goalOptions: { id: OnboardingGoal; title: string; description: string }[] = [
  {
    id: "govern-ai-actions",
    title: "Review important AI actions",
    description: "Require clear approvals and an evidence trail before sensitive actions can happen.",
  },
  {
    id: "memory-and-context",
    title: "Protect memory and context",
    description: "Keep the context your AI systems use inside the right workspace boundaries.",
  },
  {
    id: "oversight-and-collaboration",
    title: "Add collaborative review",
    description: "Bring the right reviewers into higher-risk decisions and escalations.",
  },
];

export function IntentSelectionStep() {
  const {
    state: { selectedGoals },
    saveGoals,
  } = useOnboardingState();
  const [selection, setSelection] = React.useState<OnboardingGoal[]>(selectedGoals);

  const toggleGoal = (goal: OnboardingGoal) => {
    setSelection((current) => (current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal]));
  };

  return (
    <StepShell
      eyebrow="Step 1"
      title="What do you want to use Keon for first?"
      description="Choose the outcomes that matter most right now. Keon uses this to keep the rest of setup focused on your actual first use case."
      footer={
        <Button size="lg" disabled={selection.length === 0} onClick={() => saveGoals(selection)}>
          Continue
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        {goalOptions.map((option) => {
          const active = selection.includes(option.id);

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggleGoal(option.id)}
              className={cn(
                "rounded-[24px] border p-6 text-left transition-all duration-200",
                active
                  ? "border-[#7EE8E0] bg-[linear-gradient(180deg,rgba(126,232,224,0.16),rgba(126,232,224,0.06))]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.05]"
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="font-display text-2xl font-semibold text-white">{option.title}</div>
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border font-mono text-xs uppercase",
                    active ? "border-[#7EE8E0] bg-[#7EE8E0] text-[#062125]" : "border-white/20 text-white/55"
                  )}
                >
                  {active ? "On" : "Off"}
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-white/72">{option.description}</p>
            </button>
          );
        })}
      </div>
    </StepShell>
  );
}
