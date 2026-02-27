"use client";

import { CommandSnippet } from "./command-snippet";

interface GoldenPathStepProps {
  step: number;
  title: string;
  command: string;
  lookFor: string;
  whyItMatters: string;
}

export function GoldenPathStep({ step, title, command, lookFor, whyItMatters }: GoldenPathStepProps) {
  return (
    <div className="space-y-4 rounded border border-[#384656] bg-[#0E1118] p-5 text-sm text-[--flash]">
      <div className="space-y-1">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-[--steel]">Step {step}</p>
        <h3 className="font-display text-lg text-[--flash]">{title}</h3>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-wider text-[--steel]">Command</p>
        <CommandSnippet command={command} />
      </div>

      <div className="space-y-1">
        <p className="text-[11px] uppercase tracking-wider text-[--steel]">Look for</p>
        <p className="text-sm leading-relaxed text-[--steel]">{lookFor}</p>
      </div>

      <div className="space-y-1">
        <p className="text-[11px] uppercase tracking-wider text-[--steel]">Why it matters</p>
        <p className="text-sm leading-relaxed">{whyItMatters}</p>
      </div>
    </div>
  );
}
