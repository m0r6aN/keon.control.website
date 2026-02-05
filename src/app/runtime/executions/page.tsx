"use client";

import * as React from "react";
import { PageContainer, PageHeader, Card, CardContent } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, RefreshCw, Search } from "lucide-react";
import { formatTimestamp, formatHash, formatDuration } from "@/lib/format";
import { DataValue } from "@/components/ui/data-value";

const mockExecutions = [
  {
    executionId: "exec_01923e6a46a977f29cba9c9f2f8a8f7c",
    receiptId: "rcpt_01923e6a46a977f29cba9c9f2f8a8f7c",
    status: "completed",
    actor: "agent-gpt4",
    action: "data.export",
    startedAt: "2026-01-04T14:00:00.000Z", // Static timestamp
    duration: 2340,
    traceCount: 12,
  },
  {
    executionId: "exec_01923e5b2c8a77f29cba9c9f2f8a8f7d",
    receiptId: "rcpt_01923e5b2c8a77f29cba9c9f2f8a8f7d",
    status: "failed",
    actor: "agent-claude",
    action: "budget.approve",
    startedAt: "2026-01-04T13:30:00.000Z", // Static timestamp
    duration: 890,
    traceCount: 5,
  },
  {
    executionId: "exec_01923e4d1b7a77f29cba9c9f2f8a8f7e",
    receiptId: "rcpt_01923e4d1b7a77f29cba9c9f2f8a8f7e",
    status: "completed",
    actor: "agent-gemini",
    action: "policy.evaluate",
    startedAt: "2026-01-04T12:00:00.000Z", // Static timestamp
    duration: 1560,
    traceCount: 8,
  },
];

const statusConfig = {
  completed: { variant: "healthy" as const, label: "Completed" },
  failed: { variant: "critical" as const, label: "Failed" },
  running: { variant: "warning" as const, label: "Running" },
};

export default function ExecutionsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredExecutions = mockExecutions.filter(
    (e) =>
      e.executionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.receiptId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.actor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer>
      <PageHeader
        title="Executions"
        description="Runtime execution results linked to governance decisions"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Search Bar */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C5C6C7] opacity-50" />
            <Input
              placeholder="Search by Execution ID, Receipt ID, Actor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Executions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#384656] bg-[#0B0C10]">
                <tr>
                  <th className="p-3 text-left font-mono text-xs uppercase tracking-wider text-[#C5C6C7] opacity-60">
                    Execution ID
                  </th>
                  <th className="p-3 text-left font-mono text-xs uppercase tracking-wider text-[#C5C6C7] opacity-60">
                    Status
                  </th>
                  <th className="p-3 text-left font-mono text-xs uppercase tracking-wider text-[#C5C6C7] opacity-60">
                    Actor
                  </th>
                  <th className="p-3 text-left font-mono text-xs uppercase tracking-wider text-[#C5C6C7] opacity-60">
                    Action
                  </th>
                  <th className="p-3 text-left font-mono text-xs uppercase tracking-wider text-[#C5C6C7] opacity-60">
                    Duration
                  </th>
                  <th className="p-3 text-left font-mono text-xs uppercase tracking-wider text-[#C5C6C7] opacity-60">
                    Traces
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#384656]">
                {filteredExecutions.map((execution) => {
                  const config = statusConfig[execution.status as keyof typeof statusConfig];

                  return (
                    <tr
                      key={execution.executionId}
                      className="cursor-pointer transition-colors hover:bg-[#384656]/20"
                    >
                      <td className="p-3">
                        <DataValue value={formatHash(execution.executionId)} mono />
                      </td>
                      <td className="p-3">
                        <Badge variant={config.variant} className="uppercase">
                          {config.label}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-sm text-[#C5C6C7]">{execution.actor}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-sm text-[#66FCF1]">{execution.action}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-xs text-[#C5C6C7] opacity-70">
                          {formatDuration(execution.duration)}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-sm text-[#C5C6C7]">
                          {execution.traceCount}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
