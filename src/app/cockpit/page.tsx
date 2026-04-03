"use client";

import Link from "next/link";
import { TenantScopeGuard } from "@/components/control-plane";
import { CockpitShell } from "@/components/cockpit/cockpit-shell";
import { Shell } from "@/components/layout";
import { Card, CardContent, CardHeader, PageContainer, PageHeader } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { CockpitProviders } from "@/lib/cockpit/cockpit-providers";
import { useTenantContext } from "@/lib/control-plane/tenant-context";
import { useTenantBinding } from "@/lib/control-plane/tenant-binding";

export default function CockpitPage() {
  const { me } = useTenantContext();
  const { isConfirmed, confirmedTenant } = useTenantBinding();
  const canOpenCockpit = isConfirmed && confirmedTenant?.status === "active" && me?.operatorModeEnabled;

  if (!canOpenCockpit) {
    return (
      <Shell>
        <PageContainer>
          <PageHeader
            title="Diagnostics"
            description="Diagnostics is an advanced inspection surface. Most customers should only need it after setup is complete and someone on the team is operating in advanced mode."
            actions={
              <Button asChild>
                <Link href="/control">Back to workspace overview</Link>
              </Button>
            }
          />

          {!isConfirmed && <TenantScopeGuard description="Advanced diagnostics only opens after a workspace and environment are confirmed." />}

          <div className="space-y-6">
            <Card>
              <CardHeader title="Before Diagnostics becomes useful" description="This page is intentionally held back until the workspace is fully prepared." />
              <CardContent className="space-y-3 font-mono text-sm text-[#C5C6C7]">
                <div>Workspace confirmed: {isConfirmed ? "yes" : "no"}</div>
                <div>Workspace active: {confirmedTenant?.status === "active" ? "yes" : "no"}</div>
                <div>Advanced mode enabled: {me?.operatorModeEnabled ? "yes" : "no"}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="What this page is for" description="Use Diagnostics when someone needs a deeper technical view of the running system." />
              <CardContent className="space-y-3 text-sm leading-6 text-[#C5C6C7] opacity-80">
                <p>Inspect internal system state after the customer-facing workspace is already understood.</p>
                <p>Debug escalations, advanced incidents, or unusual runtime behavior.</p>
                <p>Keep normal first-run users on the overview, guardrails, integrations, and receipts path instead.</p>
              </CardContent>
            </Card>
          </div>
        </PageContainer>
      </Shell>
    );
  }

  return (
    <CockpitProviders>
      <CockpitShell />
    </CockpitProviders>
  );
}
