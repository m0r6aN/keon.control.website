"use client";

import * as React from "react";
import { PageContainer, PageHeader, Card, CardContent } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, RefreshCw, Search, Receipt as ReceiptIcon } from "lucide-react";
import { formatTimestamp, formatHash } from "@/lib/format";
import { DataValue } from "@/components/ui/data-value";

const mockReceipts = [
  {
    receiptId: "rcpt_01923e6a46a977f29cba9c9f2f8a8f7c",
    correlationId: "t:t-001|c:01923e6a-46a9-77f2-9cba-9c9f2f8a8f7c",
    outcome: "approved",
    actor: "agent-gpt4",
    action: "data.export",
    decidedAt: "2026-01-04T14:00:00.000Z", // Static timestamp
    executionCount: 3,
  },
  {
    receiptId: "rcpt_01923e5b2c8a77f29cba9c9f2f8a8f7d",
    correlationId: "t:t-001|c:01923e5b-2c8a-77f2-9cba-9c9f2f8a8f7d",
    outcome: "denied",
    actor: "agent-claude",
    action: "budget.approve",
    decidedAt: "2026-01-04T13:30:00.000Z", // Static timestamp
    executionCount: 0,
  },
  {
    receiptId: "rcpt_01923e4d1b7a77f29cba9c9f2f8a8f7e",
    correlationId: "t:t-001|c:01923e4d-1b7a-77f2-9cba-9c9f2f8a8f7e",
    outcome: "approved",
    actor: "agent-gemini",
    action: "policy.evaluate",
    decidedAt: "2026-01-04T12:00:00.000Z", // Static timestamp
    executionCount: 1,
  },
];

const outcomeConfig = {
  approved: { variant: "healthy" as const, label: "Approved" },
  denied: { variant: "critical" as const, label: "Denied" },
  flagged: { variant: "warning" as const, label: "Flagged" },
};

export default function ReceiptsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredReceipts = mockReceipts.filter(
    (r) =>
      r.receiptId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.correlationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.actor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer>
      <PageHeader
        title="Execution Receipts"
        description="Audit trail of all governance decisions across actors and actions"
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
              placeholder="Search by Receipt ID, Correlation ID, Actor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Receipts Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#384656] bg-[#0B0C10]">
                <tr>
                  <th className="p-3 text-left font-mono text-xs uppercase tracking-wider text-[#C5C6C7] opacity-60">
                    Receipt ID
                  </th>
                  <th className="p-3 text-left font-mono text-xs uppercase tracking-wider text-[#C5C6C7] opacity-60">
                    Outcome
                  </th>
                  <th className="p-3 text-left font-mono text-xs uppercase tracking-wider text-[#C5C6C7] opacity-60">
                    Actor
                  </th>
                  <th className="p-3 text-left font-mono text-xs uppercase tracking-wider text-[#C5C6C7] opacity-60">
                    Action
                  </th>
                  <th className="p-3 text-left font-mono text-xs uppercase tracking-wider text-[#C5C6C7] opacity-60">
                    Decided At
                  </th>
                  <th className="p-3 text-left font-mono text-xs uppercase tracking-wider text-[#C5C6C7] opacity-60">
                    Executions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#384656]">
                {filteredReceipts.map((receipt) => {
                  const config = outcomeConfig[receipt.outcome as keyof typeof outcomeConfig];

                  return (
                    <tr
                      key={receipt.receiptId}
                      className="cursor-pointer transition-colors hover:bg-[#384656]/20"
                    >
                      <td className="p-3">
                        <DataValue value={formatHash(receipt.receiptId)} mono />
                      </td>
                      <td className="p-3">
                        <Badge variant={config.variant} className="uppercase">
                          {config.label}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-sm text-[#C5C6C7]">{receipt.actor}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-sm text-[#66FCF1]">{receipt.action}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-xs text-[#C5C6C7] opacity-70">
                          {formatTimestamp(new Date(receipt.decidedAt))}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-sm text-[#C5C6C7]">
                          {receipt.executionCount}
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
