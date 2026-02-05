"use client";

import * as React from "react";
import { PageContainer, PageHeader, Card, CardHeader, CardContent } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Eye, Settings } from "lucide-react";

const mockPolicies = [
  {
    id: "pol-001",
    name: "Budget Approval Threshold",
    type: "budget",
    status: "active",
    version: "1.2.0",
    evaluations: 1247,
  },
  {
    id: "pol-002",
    name: "High-Risk Action Review",
    type: "authority",
    status: "active",
    version: "2.0.1",
    evaluations: 892,
  },
  {
    id: "pol-003",
    name: "Data Export Compliance",
    type: "compliance",
    status: "active",
    version: "1.0.0",
    evaluations: 156,
  },
  {
    id: "pol-004",
    name: "Agent Autonomy Limits",
    type: "custom",
    status: "draft",
    version: "0.1.0",
    evaluations: 0,
  },
];

const typeConfig = {
  budget: { variant: "healthy" as const, label: "Budget" },
  authority: { variant: "warning" as const, label: "Authority" },
  compliance: { variant: "degraded" as const, label: "Compliance" },
  custom: { variant: "default" as const, label: "Custom" },
};

export default function PoliciesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Policies"
        description="Governance policies that control decision-making and execution"
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Policy
          </Button>
        }
      />

      {/* Policy Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockPolicies.map((policy) => {
          const config = typeConfig[policy.type as keyof typeof typeConfig];

          return (
            <Card key={policy.id} className="transition-colors hover:border-[#66FCF1]/30">
              <CardHeader
                title={policy.name}
                description={
                  <span className="font-mono text-xs text-[#C5C6C7] opacity-60">
                    {policy.id}
                  </span>
                }
                actions={
                  <Badge
                    variant={policy.status === "active" ? "healthy" : "default"}
                    className="uppercase"
                  >
                    {policy.status}
                  </Badge>
                }
              />
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#C5C6C7] opacity-60">Type</span>
                    <Badge variant={config.variant} className="uppercase">
                      {config.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#C5C6C7] opacity-60">Version</span>
                    <span className="font-mono text-[#C5C6C7]">{policy.version}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#C5C6C7] opacity-60">Evaluations</span>
                    <span className="font-mono text-[#C5C6C7]">
                      {policy.evaluations.toLocaleString()}
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
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="mt-6">
        <CardHeader
          title="About Policies"
          description="Policy evaluation and governance flow"
        />
        <CardContent>
          <div className="space-y-3 text-sm text-[#C5C6C7] opacity-80">
            <p>
              <strong className="text-[#66FCF1]">Policies</strong> define the rules that govern
              decision-making. They are evaluated during the Decision phase and their results are
              recorded in the Receipt.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded border border-[#384656] bg-[#0B0C10] p-3">
              <FileText className="h-4 w-4 text-[#66FCF1]" />
              <span className="font-mono text-xs">
                Policy Evaluation → Decision → <strong className="text-[#66FCF1]">Receipt</strong>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

