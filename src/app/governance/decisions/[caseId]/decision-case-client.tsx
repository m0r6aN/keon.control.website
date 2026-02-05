"use client";

import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { governanceClient } from "@/lib/api/governanceClient";
import { SealStatus } from "@/ui-kit/components/SealStatus";

export function DecisionCaseClient({ caseId }: { caseId: string }) {
  const [rationale, setRationale] = React.useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["decision-case", caseId],
    queryFn: () => governanceClient.getDecisionCase(caseId),
  });

  const mutation = useMutation({
    mutationFn: (action: "ACCEPT" | "REJECT") =>
      governanceClient.submitDecision(caseId, {
        action,
        rationale,
        actor: {
          actorId: "user_clint",
          displayName: "Clint",
        },
      }),
  });

  if (isLoading) return <p className="p-6 text-gray-600">Loading decision…</p>;
  if (error) return <p className="p-6 text-red-500">Failed to load decision</p>;

  if (mutation.isSuccess) {
    return (
      <div className="p-6 space-y-4">
        <p className="font-semibold text-gray-900">Decision recorded (immutable)</p>
        <SealStatus status="SEALED" />
        <p className="text-sm text-gray-600">
          Receipt ID:{" "}
          <code className="bg-gray-100 px-2 py-1 rounded">{mutation.data.receipt.receiptId}</code>
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Findings</h3>
        <ul className="list-disc pl-6 text-sm space-y-2">
          {data.findings.map((f) => (
            <li key={f.findingId} className="text-gray-700">
              <strong>{f.category}</strong>: {f.message}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Rationale (required)
        </label>
        <textarea
          className="w-full rounded border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
          placeholder="Explain your decision..."
        />
      </div>

      <div className="flex gap-3">
        <button
          className="rounded bg-green-600 px-4 py-2 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!rationale || mutation.isPending}
          onClick={() => mutation.mutate("ACCEPT")}
        >
          {mutation.isPending ? "Submitting..." : "ACCEPT"}
        </button>

        <button
          className="rounded bg-red-600 px-4 py-2 text-white font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!rationale || mutation.isPending}
          onClick={() => mutation.mutate("REJECT")}
        >
          {mutation.isPending ? "Submitting..." : "REJECT"}
        </button>
      </div>
    </div>
  );
}

