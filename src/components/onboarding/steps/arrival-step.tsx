"use client";

import { StepShell } from "@/components/onboarding/step-shell";

export function ArrivalStep() {
  return (
    <StepShell
      eyebrow="Welcome"
      title="Keon Control keeps AI-driven work authorized, traceable, and reviewable."
      description="Use setup to confirm the right workspace, apply starter guardrails, and leave with a clear signal that your team is ready to use Keon."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {[
          "Define what you want Keon to manage first so setup stays relevant.",
          "Confirm the workspace and environment this setup should prepare.",
          "Apply a starter guardrail preset before anyone starts using the workspace.",
        ].map((item, index) => (
          <div key={item} className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
            <div className="font-mono text-xs uppercase tracking-[0.22em] text-[#B6F09C]">0{index + 1}</div>
            <p className="mt-4 text-sm leading-6 text-white/74">{item}</p>
          </div>
        ))}
      </div>
    </StepShell>
  );
}
