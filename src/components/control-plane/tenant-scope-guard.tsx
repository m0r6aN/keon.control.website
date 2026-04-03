"use client";

import { TenantBindingCard } from "@/components/control-plane/tenant-binding-card";
import { Card, CardContent, CardHeader } from "@/components/layout/page-container";
import { useTenantBinding } from "@/lib/control-plane/tenant-binding";

export function TenantScopeGuard({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  const { isConfirmed, confirmedTenant, confirmedEnvironment } = useTenantBinding();

  if (isConfirmed && confirmedTenant && confirmedEnvironment) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card className="border-[#66FCF1]/20 bg-[#66FCF1]/5">
        <CardHeader
          title={title ?? "Confirm workspace access first"}
          description={
            description ??
            "This page stays generic until you confirm which workspace and environment Keon should use."
          }
        />
        <CardContent className="font-mono text-sm leading-6 text-[#C5C6C7]">
          Keon does not guess which workspace you mean. Confirm the intended workspace and environment first.
        </CardContent>
      </Card>
      <TenantBindingCard compact />
    </div>
  );
}
