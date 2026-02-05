"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { governanceClient } from "@/lib/api/governanceClient";
import { RiskBadge } from "@/ui-kit/components/RiskBadge";

const TENANT_ID = "tenant_123"; // replace later with real auth context

export function DecisionsClient() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["decisions", "pending", TENANT_ID],
    queryFn: () => governanceClient.listDecisionsPending(TENANT_ID),
  });

  if (isLoading) return <p className="p-6 text-gray-600">Loading decisions…</p>;
  if (error) return <p className="p-6 text-red-500">Failed to load decisions</p>;

  return (
    <div className="p-6 space-y-4">
      {data.items.map((d) => (
        <Link
          key={d.caseId}
          href={`/governance/decisions/${d.caseId}`}
          className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                {d.workflowId} · {d.workflowVersion}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Run: {d.runId}
              </p>
            </div>
            <RiskBadge level={d.riskLevel} />
          </div>
        </Link>
      ))}
    </div>
  );
}

