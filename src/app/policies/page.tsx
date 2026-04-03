"use client";

import * as React from "react";
import { TenantScopeGuard } from "@/components/control-plane";
import { Shell } from "@/components/layout";
import { Card, CardContent, CardHeader, PageContainer, PageHeader } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTenantBinding } from "@/lib/control-plane/tenant-binding";

const presets = [
  {
    id: "balanced",
    name: "Balanced guardrails",
    summary: "Default enterprise posture with moderate deny thresholds and review on higher-risk changes.",
    denyThreshold: "Block when confidence drops below 0.72 or when evidence is incomplete.",
    escalation: "Escalate high-risk writes to workspace admins and collaborative review.",
    signerRequirements: "One approver for reversible actions; two approvers for irreversible changes.",
    boundaryPosture: "Production stays protected until sandbox validation finishes.",
    hashSeed: "balanced-72-admin2-prod",
  },
  {
    id: "strict",
    name: "Strict guardrails",
    summary: "High-assurance posture for regulated teams with stronger approval requirements.",
    denyThreshold: "Block when confidence drops below 0.86 or when any proof artifact is stale.",
    escalation: "Escalate privileged writes, exports, and policy overrides immediately.",
    signerRequirements: "Two workspace approvers plus one oversight approver for irreversible effects.",
    boundaryPosture: "Production remains sealed until validation and approval quorum are both complete.",
    hashSeed: "strict-86-oversight3-sealed",
  },
  {
    id: "flexible",
    name: "Flexible guardrails",
    summary: "Faster path for experienced teams, with visible evidence rather than heavier approvals.",
    denyThreshold: "Block when confidence drops below 0.78 or when policy drift is detected.",
    escalation: "Escalate high-risk writes, external effects, or repeated denials in the same scope.",
    signerRequirements: "One approver for most actions, second approver only for policy edits and external effects.",
    boundaryPosture: "Production can open after baseline publication and sandbox validation.",
    hashSeed: "flexible-78-signer2-live",
  },
] as const;

function policyHash(input: string, scope: string) {
  const source = `${input}:${scope}`;
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) >>> 0;
  }
  return `pol_${hash.toString(16).padStart(8, "0")}`;
}

export default function PoliciesPage() {
  const { isConfirmed, confirmedTenant, confirmedEnvironment } = useTenantBinding();
  const [selectedPresetId, setSelectedPresetId] = React.useState<(typeof presets)[number]["id"]>("balanced");
  const selectedPreset = presets.find((preset) => preset.id === selectedPresetId) ?? presets[0];
  const scope = `${confirmedTenant?.id ?? "unbound"}:${confirmedEnvironment ?? "none"}`;
  const hash = policyHash(selectedPreset.hashSeed, scope);

  return (
    <Shell>
      <PageContainer>
        <PageHeader
          title="Guardrails"
          description="Choose the starter review and approval posture for this workspace. Keon will use it as the default for future actions and receipts."
          actions={<Badge variant="warning">Workspace setup</Badge>}
        />

        {!isConfirmed && <TenantScopeGuard description="Choose guardrails after you confirm the workspace and environment Keon should prepare." />}

        {isConfirmed && confirmedTenant && (
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
              <Card>
                <CardHeader title="Choose a starter preset" description="Pick the level of friction and review your team wants at launch. You can refine the details later." />
                <CardContent className="space-y-4">
                  {presets.map((preset) => {
                    const active = preset.id === selectedPresetId;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedPresetId(preset.id)}
                        className={`rounded border p-4 text-left transition-colors ${
                          active ? "border-[#66FCF1] bg-[#66FCF1]/8" : "border-[#384656] bg-[#0B0C10] hover:border-[#66FCF1]/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-['Rajdhani'] text-lg font-semibold text-[#C5C6C7]">{preset.name}</div>
                            <p className="mt-2 font-mono text-sm leading-6 text-[#C5C6C7] opacity-80">{preset.summary}</p>
                          </div>
                          {active && <Badge variant="healthy">Selected</Badge>}
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Applies to" description="The starter guardrail reference Keon will bind to this workspace." />
                <CardContent className="space-y-3 font-mono text-sm text-[#C5C6C7]">
                  <div>Workspace: {confirmedTenant.name}</div>
                  <div>Environment: {confirmedEnvironment}</div>
                  <div>Preset: {selectedPreset.name}</div>
                  <div>Reference ID: {hash}</div>
                  <Button>Apply starter guardrails</Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "When Keon blocks", body: selectedPreset.denyThreshold },
                { label: "Who gets pulled in", body: selectedPreset.escalation },
                { label: "Approvals needed", body: selectedPreset.signerRequirements },
                { label: "Environment posture", body: selectedPreset.boundaryPosture },
              ].map((item) => (
                <Card key={item.label}>
                  <CardHeader title={item.label} />
                  <CardContent className="font-mono text-sm leading-6 text-[#C5C6C7] opacity-80">{item.body}</CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </PageContainer>
    </Shell>
  );
}
