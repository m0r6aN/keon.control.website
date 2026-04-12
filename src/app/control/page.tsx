"use client";

import Link from "next/link";
import { Shell } from "@/components/layout";
import { Card, CardContent, CardHeader, PageContainer, PageHeader } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { useTenantContext } from "@/lib/control-plane/tenant-context";
import { useTenantBinding } from "@/lib/control-plane/tenant-binding";
import { useOnboardingState } from "@/lib/onboarding/store";

const goalLabels: Record<string, string> = {
  "govern-ai-actions": "Governance Runtime",
  "memory-and-context": "Cortex",
  "oversight-and-collaboration": "Collective",
};

const guardrailLabels: Record<string, string> = {
  strict: "Strict",
  balanced: "Balanced",
  flexible: "Flexible",
};

export default function ControlPage() {
  const { me } = useTenantContext();
  const { confirmedTenant, confirmedEnvironment, isConfirmed } = useTenantBinding();
  const {
    state: { selectedGoals, guardrailPreset },
  } = useOnboardingState();

  return (
    <Shell>
      <PageContainer>
          <PageHeader
            title="Workspace overview"
            description="This is the starting point for your team after setup. Confirm what is configured, what Keon is watching, and what to do next."
          />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px]">
            <div className="space-y-6">
              <Card>
                <CardHeader
                  title="Workspace ready"
                  description="Your required setup is complete. Keon now has the minimum context it needs to support first use."
                />
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <div className="rounded border border-[#384656] bg-[#0B0C10] p-4">
                    <div className="font-mono text-xs uppercase tracking-[0.18em] text-[#66FCF1]">Workspace</div>
                    <div className="mt-3 font-['Rajdhani'] text-2xl font-semibold text-[#F3F5F7]">
                      {confirmedTenant?.name ?? "Confirmed"}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#C5C6C7] opacity-80">
                      Starting environment: {confirmedEnvironment ?? "sandbox"}.
                    </p>
                  </div>
                  <div className="rounded border border-[#384656] bg-[#0B0C10] p-4">
                    <div className="font-mono text-xs uppercase tracking-[0.18em] text-[#66FCF1]">Guardrails</div>
                    <div className="mt-3 font-['Rajdhani'] text-2xl font-semibold text-[#F3F5F7]">
                      {guardrailPreset ? guardrailLabels[guardrailPreset] : "Selected"}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#C5C6C7] opacity-80">
                      Keon will use this starter posture until your team refines it in Guardrails.
                    </p>
                  </div>
                  <div className="rounded border border-[#384656] bg-[#0B0C10] p-4">
                    <div className="font-mono text-xs uppercase tracking-[0.18em] text-[#66FCF1]">Enabled for</div>
                    <div className="mt-3 space-y-2 font-mono text-sm text-[#C5C6C7]">
                      {selectedGoals.map((goal) => (
                        <div key={goal}>{goalLabels[goal] ?? goal}</div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader
                  title="What you can do now"
                  description="These are the next destinations most teams use after completing setup."
                />
                <CardContent className="grid gap-4 md:grid-cols-3">
                  {[
                    {
                      title: "Integrations",
                      body: "Connect your first runtime or service to start governing real AI actions.",
                      href: "/integrations",
                      label: "Open integrations",
                    },
                    {
                      title: "Guardrails",
                      body: "Refine approvals, reviews, and policy rules as your workspace matures.",
                      href: "/policies",
                      label: "Open guardrails",
                    },
                    {
                      title: "Receipts",
                      body: "Review the evidence trail once your first integration starts sending actions.",
                      href: "/receipts",
                      label: "Open receipts",
                    },
                  ].map((item) => (
                    <div key={item.title} className="rounded border border-[#384656] bg-[#0B0C10] p-4">
                      <div className="font-['Rajdhani'] text-xl font-semibold text-[#F3F5F7]">{item.title}</div>
                      <p className="mt-2 text-sm leading-6 text-[#C5C6C7] opacity-80">{item.body}</p>
                      <Button asChild variant="secondary" size="sm" className="mt-4">
                        <Link href={item.href}>{item.label}</Link>
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader title="Current status" description="A concise summary of the active workspace context." />
                <CardContent className="space-y-3 font-mono text-sm text-[#C5C6C7]">
                  <div>Workspace confirmed: {isConfirmed ? "yes" : "no"}</div>
                  <div>Environment: {confirmedEnvironment ?? "none"}</div>
                  <div>Advanced mode: {me?.operatorModeEnabled ? "enabled" : "not enabled"}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader title="Optional next" description="These can wait until after your team starts using the workspace." />
                <CardContent className="space-y-3 text-sm leading-6 text-[#C5C6C7] opacity-80">
                  <p>Connect production integrations after you validate the sandbox workflow.</p>
                  <p>Add collaborative review paths for higher-risk changes.</p>
                  <p>Open Diagnostics only when someone needs deep system inspection.</p>
                </CardContent>
              </Card>
            </div>
          </div>
      </PageContainer>
    </Shell>
  );
}
