"use client";

import { CollectiveStatusHeader } from "@/components/collective";
import { Badge } from "@/components/ui";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { DeliberationSession, ReformArtifact, ReformLegitimacyAssessment } from "@/lib/contracts/collective";

interface CollectiveOverviewState {
  readonly kind: "loading" | "unavailable" | "ready";
  readonly reason?: string;
  readonly deliberations?: readonly DeliberationSession[];
  readonly reforms?: readonly ReformArtifact[];
  readonly legitimacyAssessments?: readonly ReformLegitimacyAssessment[];
}

function statusBadgeVariant(status: string) {
  switch (status) {
    case "active":
      return "healthy" as const;
    case "concluded":
      return "neutral" as const;
    case "archived":
      return "offline" as const;
    default:
      return "neutral" as const;
  }
}

function reformStatusBadgeVariant(status: string) {
  switch (status) {
    case "hosted":
      return "healthy" as const;
    case "superseded":
      return "warning" as const;
    case "withdrawn":
      return "offline" as const;
    default:
      return "neutral" as const;
  }
}

export default function CollectiveOverviewPage() {
  const [state, setState] = useState<CollectiveOverviewState>({ kind: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const [deliberationsRes, reformsRes, legitimacyRes] = await Promise.all([
          fetch("/api/collective/deliberations", {
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch("/api/collective/reforms", {
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch("/api/collective/legitimacy", {
            cache: "no-store",
            signal: controller.signal,
          }),
        ]);

        if (!deliberationsRes.ok || !reformsRes.ok || !legitimacyRes.ok) {
          throw new Error("One or more collective endpoints returned non-success");
        }

        const [deliberationsData, reformsData, legitimacyData] = await Promise.all([
          deliberationsRes.json() as Promise<{ items: DeliberationSession[] }>,
          reformsRes.json() as Promise<{ items: ReformArtifact[] }>,
          legitimacyRes.json() as Promise<{ items: ReformLegitimacyAssessment[] }>,
        ]);

        setState({
          kind: "ready",
          deliberations: deliberationsData.items,
          reforms: reformsData.items,
          legitimacyAssessments: legitimacyData.items,
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        const reason = error instanceof Error ? error.message : String(error);
        setState({ kind: "unavailable", reason });
      }
    }

    load();
    return () => controller.abort();
  }, []);

  if (state.kind === "loading") {
    return (
      <div className="space-y-6">
        <header className="space-y-3">
          <h1 className="font-display text-3xl text-[--flash]">Collective Cognition</h1>
        </header>
        <div className="rounded border border-[#384656] bg-[#1F2833] p-6 text-center">
          <Badge variant="neutral">LOADING</Badge>
          <p className="mt-2 font-mono text-xs text-[--steel]">
            Polling collective observation surface...
          </p>
        </div>
      </div>
    );
  }

  if (state.kind === "unavailable") {
    return (
      <div className="space-y-6">
        <header className="space-y-3">
          <h1 className="font-display text-3xl text-[--flash]">Collective Cognition</h1>
        </header>
        <div className="rounded border border-[#384656] bg-[#1F2833] p-6">
          <Badge variant="critical">OFFLINE</Badge>
          <p className="mt-2 font-mono text-sm uppercase tracking-wide text-[--flash]">
            Collective surface unavailable
          </p>
          <p className="mt-1 break-words font-mono text-xs text-[--steel]">
            {state.reason}
          </p>
        </div>
      </div>
    );
  }

  const deliberations = state.deliberations ?? [];
  const reforms = state.reforms ?? [];
  const legitimacyAssessments = state.legitimacyAssessments ?? [];

  const activeDeliberations = deliberations.filter((d) => d.status === "active").length;
  const recentDeliberations = [...deliberations]
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, 5);
  const recentReforms = [...reforms]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-display text-3xl text-[--flash]">Collective Cognition</h1>
        <p className="text-sm text-[--steel]">
          Constitutional operator surface for live inert cognition submission plus observational views for deliberations, reform artifacts, and legitimacy assessments.
        </p>
      </header>

      <section className="rounded border border-[--reactor-blue] bg-[#081316] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <Badge variant="healthy">LIVE SUBMISSION</Badge>
            <h2 className="font-display text-2xl text-[--flash]">Submit To Collective</h2>
            <p className="max-w-3xl text-sm text-[--steel]">
              Launch a real Collective run, bind tenant and actor identity, and inspect canonical host artifacts without implying authorization or execution authority.
            </p>
          </div>
          <Link
            href="/collective/submit"
            className="inline-flex h-10 items-center justify-center border border-[--reactor-blue] bg-[--reactor-blue] px-4 font-mono text-xs uppercase tracking-widest text-[--void] transition-colors hover:bg-[--reactor-glow]"
          >
            Open Live Submit
          </Link>
          <Link
            href="/collective/runs"
            className="inline-flex h-10 items-center justify-center border border-[--tungsten] px-4 font-mono text-xs uppercase tracking-widest text-[--flash] transition-colors hover:border-[--reactor-blue]"
          >
            Review Recent Runs
          </Link>
        </div>
      </section>

      <CollectiveStatusHeader
        activeDeliberations={activeDeliberations}
        totalReformArtifacts={reforms.length}
        recentLegitimacyAssessments={legitimacyAssessments.length}
      />

      {/* Recent Deliberations */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-xs uppercase tracking-wider text-[--steel]">
            Recent Deliberations
          </h2>
          <Link
            href="/collective/deliberations"
            className="font-mono text-xs uppercase tracking-wider text-[--reactor-glow] hover:underline"
          >
            Inspect All
          </Link>
        </div>

        {recentDeliberations.length === 0 ? (
          <div className="rounded border border-[#384656] bg-[#0B0C10] p-4 text-center font-mono text-xs text-[--steel]">
            No deliberation sessions recorded.
          </div>
        ) : (
          <div className="space-y-2">
            {recentDeliberations.map((d) => (
              <Link
                key={d.id}
                href={`/collective/deliberations/${d.id}`}
                className="flex items-center justify-between rounded border border-[#384656] bg-[#0E1118] px-4 py-3 transition-colors hover:border-[--reactor-blue]"
              >
                <div className="space-y-1">
                  <div className="font-mono text-sm text-[--flash]">{d.topic}</div>
                  <div className="font-mono text-[10px] text-[--steel]">
                    EPOCH: {d.epochRef} | PARTICIPANTS: {d.participants.length} | STARTED:{" "}
                    {new Date(d.startedAt).toLocaleDateString()}
                  </div>
                </div>
                <Badge variant={statusBadgeVariant(d.status)}>
                  {d.status.toUpperCase()}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent Reforms */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-xs uppercase tracking-wider text-[--steel]">
            Recent Reform Artifacts
          </h2>
          <Link
            href="/collective/reforms"
            className="font-mono text-xs uppercase tracking-wider text-[--reactor-glow] hover:underline"
          >
            Inspect All
          </Link>
        </div>

        {recentReforms.length === 0 ? (
          <div className="rounded border border-[#384656] bg-[#0B0C10] p-4 text-center font-mono text-xs text-[--steel]">
            No reform artifacts recorded.
          </div>
        ) : (
          <div className="space-y-2">
            {recentReforms.map((r) => (
              <Link
                key={r.id}
                href={`/collective/reforms/${r.id}`}
                className="flex items-center justify-between rounded border border-[#384656] bg-[#0E1118] px-4 py-3 transition-colors hover:border-[--reactor-blue]"
              >
                <div className="space-y-1">
                  <div className="font-mono text-sm text-[--flash]">{r.title}</div>
                  <div className="font-mono text-[10px] text-[--steel]">
                    AUTHOR: {r.authorId} | EPOCH: {r.epochRef} | CREATED:{" "}
                    {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <Badge variant={reformStatusBadgeVariant(r.status)}>
                  {r.status.toUpperCase()}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer className="text-xs text-[--steel]">
        The live submit workflow is real and host-backed. The observer views below remain read-only, and some deeper Collective pages still surface projection-only or mock-backed data until their backend contracts are merged.
      </footer>
    </div>
  );
}
