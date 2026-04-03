"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Panel, PanelContent, PanelDescription, PanelHeader, PanelTitle } from "@/components/ui";
import { persistCollectiveLiveRun } from "@/lib/collective/live-run";
import type { SubmitCollectiveRunInput } from "@/lib/contracts/collective-live";

const CHALLENGE_PRESETS = [
  {
    id: "mars-colony-plan",
    category: "Extreme Planning",
    title: "Create a plan to colonize Mars",
    context: "Produce a phased strategy with prerequisites, governance risks, and competing branch options.",
    tests: "Tests long-horizon planning, multi-phase coordination, and frontier risk modeling.",
  },
  {
    id: "market-entry-strategy",
    category: "Strategy",
    title: "Design a market entry strategy for a new AI infrastructure platform",
    context: "Include geographic sequencing, positioning, operating model, and principal risks.",
    tests: "Tests competitive framing, sequencing, and branch comparison under uncertainty.",
  },
  {
    id: "enterprise-migration-plan",
    category: "Governance",
    title: "Create an enterprise migration plan from legacy systems to a governed AI platform",
    context: "Surface dependencies, branch alternatives, risk heat, and review concerns.",
    tests: "Tests migration sequencing, control-plane constraints, and policy-sensitive planning.",
  },
  {
    id: "controversial-proposal-stress-test",
    category: "Risk",
    title: "Stress-test a controversial operational proposal before any effect is considered",
    context: "Force adversarial review depth and show where the proposal should be denied or constrained.",
    tests: "Tests adversarial review depth, denial pathways, and constrained-authority reasoning.",
  },
] as const;

type ChallengePresetId = (typeof CHALLENGE_PRESETS)[number]["id"];

const DEFAULT_FORM: SubmitCollectiveRunInput = {
  objective: "",
  context: "",
  constraints: "",
  oversightMode: "observer-supervised",
  governanceAuthority: "collective.operator.supervision",
  governanceBindingRef: "",
  tenantId: "tenant-keon",
  tenantPartition: "",
  actorId: "operator:control",
  actorType: "human-operator",
  delegatedBy: "",
  correlationId: "",
  parentCorrelationId: "",
  interactionId: "",
  causationId: "",
};

function buildCorrelationId() {
  return `corr:${crypto.randomUUID()}`;
}

export function CollectiveLiveSubmitClient() {
  const router = useRouter();
  const [form, setForm] = useState<SubmitCollectiveRunInput>({
    ...DEFAULT_FORM,
    correlationId: buildCorrelationId(),
  });
  const [selectedPreset, setSelectedPreset] = useState<ChallengePresetId | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<Key extends keyof SubmitCollectiveRunInput>(
    key: Key,
    value: SubmitCollectiveRunInput[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function applyPreset(presetId: ChallengePresetId) {
    const preset = CHALLENGE_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;

    setSelectedPreset(presetId);
    setForm((current) => ({
      ...current,
      objective: preset.title,
      context: preset.context,
      challengePreset: presetId,
      correlationId: buildCorrelationId(),
    }));
  }

  async function submit() {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/collective/live-runs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.detail ?? "Live Collective submission failed.");
      }

      const intentId = payload?.run?.intentId;
      if (typeof intentId !== "string" || !intentId) {
        throw new Error("The live run response did not include an intent identifier.");
      }

      persistCollectiveLiveRun(payload);
      localStorage.setItem("keon-control.collective-live-last-run", intentId);

      startTransition(() => {
        router.push(`/collective/live/${encodeURIComponent(intentId)}`);
      });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : String(submissionError));
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <Panel notch glow>
          <PanelHeader>
            <div className="space-y-1">
              <PanelTitle>Submit To Collective</PanelTitle>
              <PanelDescription>
                Launch a real Collective cognition run from Keon Control. This surface never authorizes execution by itself.
              </PanelDescription>
            </div>
            <Badge variant="healthy">LIVE HOST</Badge>
          </PanelHeader>
          <PanelContent className="space-y-4">
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase tracking-widest text-[--steel]" htmlFor="objective">
                Task / Objective
              </label>
              <textarea
                id="objective"
                value={form.objective}
                onChange={(event) => updateField("objective", event.target.value)}
                rows={5}
                className="w-full border border-[--tungsten] bg-[--void] px-3 py-3 font-mono text-sm text-[--flash] outline-none transition-colors focus:border-[--reactor-blue]"
                placeholder="Describe the objective for Collective cognition."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="font-mono text-xs uppercase tracking-widest text-[--steel]" htmlFor="context">
                  Structured Context
                </label>
                <textarea
                  id="context"
                  value={form.context ?? ""}
                  onChange={(event) => updateField("context", event.target.value)}
                  rows={6}
                  className="w-full border border-[--tungsten] bg-[--void] px-3 py-3 font-mono text-sm text-[--flash] outline-none transition-colors focus:border-[--reactor-blue]"
                  placeholder="Optional domain context, operating facts, or source assumptions."
                />
              </div>
              <div className="space-y-2">
                <label className="font-mono text-xs uppercase tracking-widest text-[--steel]" htmlFor="constraints">
                  Constraints / Guardrails
                </label>
                <textarea
                  id="constraints"
                  value={form.constraints ?? ""}
                  onChange={(event) => updateField("constraints", event.target.value)}
                  rows={6}
                  className="w-full border border-[--tungsten] bg-[--void] px-3 py-3 font-mono text-sm text-[--flash] outline-none transition-colors focus:border-[--reactor-blue]"
                  placeholder="Optional constraints, exclusions, or success conditions."
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { id: "tenantId", label: "Tenant Id", value: form.tenantId },
                { id: "actorId", label: "Actor Id", value: form.actorId },
                { id: "actorType", label: "Actor Type", value: form.actorType },
                { id: "correlationId", label: "Correlation Id", value: form.correlationId },
              ].map((field) => (
                <div key={field.id} className="space-y-2">
                  <label className="font-mono text-xs uppercase tracking-widest text-[--steel]" htmlFor={field.id}>
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    value={field.value}
                    onChange={(event) =>
                      updateField(field.id as keyof SubmitCollectiveRunInput, event.target.value)
                    }
                    className="h-10 w-full border border-[--tungsten] bg-[--void] px-3 font-mono text-sm text-[--flash] outline-none transition-colors focus:border-[--reactor-blue]"
                  />
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="font-mono text-xs uppercase tracking-widest text-[--steel]" htmlFor="oversightMode">
                  Oversight Mode
                </label>
                <input
                  id="oversightMode"
                  value={form.oversightMode ?? ""}
                  onChange={(event) => updateField("oversightMode", event.target.value)}
                  className="h-10 w-full border border-[--tungsten] bg-[--void] px-3 font-mono text-sm text-[--flash] outline-none transition-colors focus:border-[--reactor-blue]"
                />
              </div>
              <div className="space-y-2">
                <label className="font-mono text-xs uppercase tracking-widest text-[--steel]" htmlFor="governanceAuthority">
                  Governance Context
                </label>
                <input
                  id="governanceAuthority"
                  value={form.governanceAuthority ?? ""}
                  onChange={(event) => updateField("governanceAuthority", event.target.value)}
                  className="h-10 w-full border border-[--tungsten] bg-[--void] px-3 font-mono text-sm text-[--flash] outline-none transition-colors focus:border-[--reactor-blue]"
                />
              </div>
              <div className="space-y-2">
                <label className="font-mono text-xs uppercase tracking-widest text-[--steel]" htmlFor="governanceBindingRef">
                  Governance Binding Ref
                </label>
                <input
                  id="governanceBindingRef"
                  value={form.governanceBindingRef ?? ""}
                  onChange={(event) => updateField("governanceBindingRef", event.target.value)}
                  className="h-10 w-full border border-[--tungsten] bg-[--void] px-3 font-mono text-sm text-[--flash] outline-none transition-colors focus:border-[--reactor-blue]"
                  placeholder="Optional reference surfaced to operators."
                />
              </div>
            </div>

            <div className="rounded border border-[--safety-orange] bg-[#21160B] p-4">
              <div className="font-mono text-xs uppercase tracking-widest text-[--safety-orange]">Constitutional Boundary</div>
              <p className="mt-2 text-sm text-[--steel]">
                This action submits an inert cognition request only. Deliberation, witness narrative, and branch selection do not authorize effect. Any consequential outcome still requires governed authorization and a separate lawful reality-plane execution path.
              </p>
              <p className="mt-2 text-sm text-[--steel]">
                Incremental live polling is not yet exposed by the current host seam. After submission, Keon Control renders the canonical persisted host result once the run returns.
              </p>
            </div>

            {error ? (
              <div className="rounded border border-[--ballistic-red] bg-[#220B0B] p-3 text-sm text-[--flash]">
                {error}
              </div>
            ) : null}

            {submitting ? (
              <div className="rounded border border-[--reactor-blue] bg-[#081316] p-3 text-sm text-[--steel]">
                Dispatching intent to the live Collective host and waiting for the canonical inert result. No mock fallback will be used.
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button onClick={submit} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Live Run"}
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  setForm({
                    ...DEFAULT_FORM,
                    correlationId: buildCorrelationId(),
                  })
                }
                disabled={submitting}
              >
                Reset
              </Button>
            </div>
          </PanelContent>
        </Panel>

        <Panel>
          <PanelHeader>
            <div className="space-y-1">
              <PanelTitle>Challenge Scenarios</PanelTitle>
              <PanelDescription>
                Prefill the objective with curated operator prompts. Every preset still runs through the real host path.
              </PanelDescription>
            </div>
          </PanelHeader>
          <PanelContent className="space-y-3">
            {CHALLENGE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className="w-full rounded border border-[--tungsten] bg-[--void] p-3 text-left transition-colors hover:border-[--reactor-blue]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs uppercase tracking-widest text-[--flash]">{preset.id}</span>
                    <Badge variant="neutral">{preset.category}</Badge>
                  </div>
                  {selectedPreset === preset.id ? <Badge variant="healthy">loaded</Badge> : null}
                </div>
                <p className="mt-2 text-sm text-[--flash]">{preset.title}</p>
                <p className="mt-1 text-sm text-[--steel]">{preset.context}</p>
                <p className="mt-2 text-xs text-[--steel]">{preset.tests}</p>
              </button>
            ))}
          </PanelContent>
        </Panel>
      </section>
    </div>
  );
}
