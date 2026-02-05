"use client";

import * as React from "react";
import { PageContainer, PageHeader, Card, CardHeader, CardContent } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Settings, Eye, Plus } from "lucide-react";

const mockTenants = [
  {
    id: "tenant-acme",
    name: "Acme Corporation",
    status: "active",
    users: 47,
    receiptsThisMonth: 12489,
    plan: "enterprise",
  },
  {
    id: "tenant-globex",
    name: "Globex Industries",
    status: "active",
    users: 23,
    receiptsThisMonth: 5621,
    plan: "business",
  },
  {
    id: "tenant-initech",
    name: "Initech",
    status: "suspended",
    users: 8,
    receiptsThisMonth: 0,
    plan: "starter",
  },
];

export default function TenantsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Tenants"
        description="Manage organization tenants and their governance configuration"
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Tenant
          </Button>
        }
      />

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockTenants.map((tenant) => (
          <Card key={tenant.id} className="transition-colors hover:border-[#66FCF1]/30">
            <CardHeader
              title={tenant.name}
              description={
                <span className="font-mono text-xs text-[#C5C6C7] opacity-60">
                  {tenant.id}
                </span>
              }
              actions={
                <Badge
                  variant={tenant.status === "active" ? "healthy" : "critical"}
                  className="uppercase"
                >
                  {tenant.status}
                </Badge>
              }
            />
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#C5C6C7] opacity-60">Plan</span>
                  <Badge
                    variant={
                      tenant.plan === "enterprise"
                        ? "healthy"
                        : tenant.plan === "business"
                        ? "warning"
                        : "default"
                    }
                    className="uppercase"
                  >
                    {tenant.plan}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#C5C6C7] opacity-60">Users</span>
                  <span className="font-mono text-[#C5C6C7]">{tenant.users}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#C5C6C7] opacity-60">Receipts (This Month)</span>
                  <span className="font-mono text-[#C5C6C7]">
                    {tenant.receiptsThisMonth.toLocaleString()}
                  </span>
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

      {/* Info Card */}
      <Card className="mt-6">
        <CardHeader
          title="About Tenants"
          description="Multi-tenant isolation and governance boundaries"
        />
        <CardContent>
          <div className="space-y-3 text-sm text-[#C5C6C7] opacity-80">
            <p>
              <strong className="text-[#66FCF1]">Tenants</strong> represent isolated organizations
              within the governance platform. Each tenant has its own policies, users, and audit trail.
            </p>
            <p>
              All governance data (Receipts, Executions, Traces) is scoped to a tenant, ensuring
              complete data isolation and compliance boundaries.
            </p>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

