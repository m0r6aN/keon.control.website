"use client";

import * as React from "react";
import { PageContainer, PageHeader, Card, CardContent } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, RefreshCw, Search } from "lucide-react";
import { formatTimestamp, formatHash } from "@/lib/format";
import { DataValue } from "@/components/ui/data-value";

const mockTraces = [
  {
    traceId: "trace_01923e6a46a977f29cba9c9f2f8a8f7c",
    executionId: "exec_01923e6a46a977f29cba9c9f2f8a8f7c",
    eventType: "execution.started",
    correlationId: "t:t-001|c:01923e6a-46a9-77f2-9cba-9c9f2f8a8f7c",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    severity: "info",
  },
  {
    traceId: "trace_01923e6a46a977f29cba9c9f2f8a8f7d",
    executionId: "exec_01923e6a46a977f29cba9c9f2f8a8f7c",
    eventType: "policy.evaluated",
    correlationId: "t:t-001|c:01923e6a-46a9-77f2-9cba-9c9f2f8a8f7c",
    timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    severity: "info",
  },
  {
    traceId: "trace_01923e5b2c8a77f29cba9c9f2f8a8f7e",
    executionId: "exec_01923e5b2c8a77f29cba9c9f2f8a8f7d",
    eventType: "execution.failed",
    correlationId: "t:t-001|c:01923e5b-2c8a-77f2-9cba-9c9f2f8a8f7d",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    severity: "error",
  },
  {
    traceId: "trace_01923e4d1b7a77f29cba9c9f2f8a8f7f",
    executionId: "exec_01923e4d1b7a77f29cba9c9f2f8a8f7e",
    eventType: "execution.completed",
    correlationId: "t:t-001|c:01923e4d-1b7a-77f2-9cba-9c9f2f8a8f7e",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    severity: "info",
  },
];

const severityConfig = {
  info: { variant: "default" as const, label: "Info" },
  warning: { variant: "warning" as const, label: "Warning" },
  error: { variant: "critical" as const, label: "Error" },
};

const eventTypeConfig = {
  "execution.started": { variant: "default" as const },
  "execution.completed": { variant: "healthy" as const },
  "execution.failed": { variant: "critical" as const },
  "policy.evaluated": { variant: "default" as const },
};

export default function TracesPage() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredTraces = mockTraces.filter(
    (t) =>
      t.traceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.executionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.correlationId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer>
      <PageHeader
        title="Traces"
        description="Observability traces for execution events and system activity"
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
              placeholder="Search by Trace ID, Execution ID, Correlation ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Traces Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#384656] bg-[#0B0C10]">
                <tr>
                  <th className="p-3 text-left font-mono text-xs uppercase tracking-wider text-[#C5C6C7] opacity-60">
                    Timestamp
                  </th>
                  <th className="p-3 text-left font-mono text-xs uppercase tracking-wider text-[#C5C6C7] opacity-60">
                    Event Type
                  </th>
                  <th className="p-3 text-left font-mono text-xs uppercase tracking-wider text-[#C5C6C7] opacity-60">
                    Severity
                  </th>
                  <th className="p-3 text-left font-mono text-xs uppercase tracking-wider text-[#C5C6C7] opacity-60">
                    Trace ID
                  </th>
                  <th className="p-3 text-left font-mono text-xs uppercase tracking-wider text-[#C5C6C7] opacity-60">
                    Execution ID
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#384656]">
                {filteredTraces.map((trace) => {
                  const severityConf = severityConfig[trace.severity as keyof typeof severityConfig];
                  const eventConf = eventTypeConfig[trace.eventType as keyof typeof eventTypeConfig];

                  return (
                    <tr
                      key={trace.traceId}
                      className="cursor-pointer transition-colors hover:bg-[#384656]/20"
                    >
                      <td className="p-3">
                        <span className="font-mono text-xs text-[#C5C6C7] opacity-70">
                          {formatTimestamp(new Date(trace.timestamp))}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge variant={eventConf.variant} className="uppercase">
                          {trace.eventType}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={severityConf.variant} className="uppercase">
                          {severityConf.label}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <DataValue value={formatHash(trace.traceId)} mono />
                      </td>
                      <td className="p-3">
                        <DataValue value={formatHash(trace.executionId)} mono />
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

