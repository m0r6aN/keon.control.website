"use client";

import * as React from "react";
import { TenantScopeGuard } from "@/components/control-plane";
import { Shell } from "@/components/layout";
import { Card, CardContent, CardHeader, PageContainer, PageHeader } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { getBillingSummary } from "@/lib/api/control-plane";
import { useTenantBinding } from "@/lib/control-plane/tenant-binding";
import { Bell, ShieldCheck, User } from "lucide-react";

export default function SettingsPage() {
  const { isConfirmed, confirmedTenant, confirmedEnvironment } = useTenantBinding();
  const [billingState, setBillingState] = React.useState<string>("loading");

  React.useEffect(() => {
    async function load() {
      if (!confirmedTenant) {
        setBillingState("workspace required");
        return;
      }

      const billing = await getBillingSummary(confirmedTenant.id);
      setBillingState(billing.billingState);
    }

    load().catch(() => setBillingState("unavailable"));
  }, [confirmedTenant]);

  return (
    <Shell>
      <PageContainer>
        <PageHeader
          title="Settings"
          description="Manage workspace details, notifications, and account hygiene without leaving the customer-facing path."
        />

        {!isConfirmed && <TenantScopeGuard description="Workspace settings only become specific after you confirm the workspace and environment." />}

        {isConfirmed && confirmedTenant && (
          <div className="space-y-6 max-w-4xl">
            <Card>
              <CardHeader
                title={
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[#66FCF1]" />
                    <span>Workspace details</span>
                  </div>
                }
                description="Settings reflect the workspace you already confirmed during setup."
              />
              <CardContent className="space-y-3 font-mono text-sm text-[#C5C6C7]">
                <div>Workspace: {confirmedTenant.name}</div>
                <div>Environment: {confirmedEnvironment}</div>
                <div>Billing state: {billingState}</div>
                <div className="pt-2">
                  <Button size="sm">Refresh workspace details</Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader
                  title={
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-[#66FCF1]" />
                      <span>Notifications</span>
                    </div>
                  }
                  description="Choose how your team hears about policy issues, escalations, and regular summaries."
                />
                <CardContent className="space-y-4 font-mono text-sm text-[#C5C6C7]">
                  <div>Policy issues: enabled</div>
                  <div>Escalation notices: enabled</div>
                  <div>Weekly digest: optional</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader
                  title={
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-[#66FCF1]" />
                      <span>Account hygiene</span>
                    </div>
                  }
                  description="Keep access clean and session state under control."
                />
                <CardContent className="space-y-4 font-mono text-sm text-[#C5C6C7]">
                  <div>Session posture: verified</div>
                  <div>Drift protection: active</div>
                  <Button variant="outline" size="sm">
                    Sign out all sessions
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </PageContainer>
    </Shell>
  );
}
