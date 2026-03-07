"use client";

import * as React from "react";
import { Shell } from "@/components/layout";
import { PageContainer, PageHeader, Card, CardHeader, CardContent } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listControlTenants } from "@/lib/api/control-plane";
import type { Tenant } from "@/lib/api/types";
import { Eye, Plus, Settings } from "lucide-react";

export default function TenantsPage() {
  const [tenants, setTenants] = React.useState<Tenant[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    listControlTenants().then(setTenants).catch((err: Error) => setError(err.message));
  }, []);

  return (
    <Shell>
      <PageContainer>
        <PageHeader
          title="Tenants"
          description="Active control-plane organizations and their monetization state"
          actions={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Provision Tenant
            </Button>
          }
        />

        {error && (
          <Card className="mb-6 border-[#FF6B6B]/30">
            <CardContent className="text-sm text-[#FF6B6B]">Control plane unavailable: {error}</CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant) => (
            <Card key={tenant.id} className="transition-colors hover:border-[#66FCF1]/30">
              <CardHeader
                title={tenant.name}
                description={<span className="font-mono text-xs text-[#C5C6C7] opacity-60">{tenant.id}</span>}
                actions={
                  <Badge variant={tenant.status === "active" ? "healthy" : "critical"} className="uppercase">
                    {tenant.status}
                  </Badge>
                }
              />
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#C5C6C7] opacity-60">Plan</span>
                    <Badge variant="warning" className="uppercase">{tenant.currentPlanCode ?? "builder"}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#C5C6C7] opacity-60">Slug</span>
                    <span className="font-mono text-[#C5C6C7]">{tenant.slug ?? "n/a"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#C5C6C7] opacity-60">Email Verified</span>
                    <span className="font-mono text-[#C5C6C7]">{tenant.emailVerified ? "YES" : "NO"}</span>
                  </div>
                  <div className="flex gap-2 border-t border-[#384656] pt-3">
                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                      <Settings className="h-3.5 w-3.5" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageContainer>
    </Shell>
  );
}
