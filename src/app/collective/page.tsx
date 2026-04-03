"use client";

import { CollectiveStatusHeader } from "@/components/collective";
import { Badge } from "@/components/ui";
import { DataSourceNotice } from "@/components/layout";
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
          fetch("/api/collective/deliberations", { cache: "no-store", signal: controller.signal }),
          fetch("/api/collective/reforms", { cache: "no-store", signal: controller.signal }),
          fetch("/api/collective/legitimacy", { cache: "no-store", signal: controller.signal }),
        ]);

        if (!deliberationsRes.ok || !reformsRes.ok || !legitimacyRes.ok) {
          throw new Error("One or more review endpoints returned a non-success response.");
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
          <h1 className="font-display text-3xl text-[--flash]">Collaborative review</h1>
          <p className="text-sm text-[--steel]">Loading review activity and recent decision threads.</p>
        </header>
        <div className="rounded border border-[#384656] bg-[#1F2833] p-6 text-center">
          <Badge variant="neutral">LOADING</Badge>
          <p className="mt-2 font-mono text-xs text-[--steel]">Checking recent review activity...</p>
        </div>
      </div>
    );
  }

  if (state.kind === "unavailable") {
    return (
      <div className="space-y-6">
        <header className="space-y-3">
          <h1 className="font-display text-3xl text-[--flash]">Collaborative review</h1>
        </header>
        <div className="rounded border border-[#384656] bg-[#1F2833] p-6">
          <Badge variant="critical">UNAVAILABLE</Badge>
          <p className="mt-2 font-mono text-sm uppercase tracking-wide text-[--flash]">Review workspace unavailable</p>
          <p className="mt-1 break-words font-mono text-xs text-[--steel]">{state.reason}</p>
        </div>
      </div>
    );
  }

  const deliberations = state.deliberations ?? [];
  const reforms = state.reforms ?? [];
  const legitimacyAssessments = state.legitimacyAssessments ?? [];
  const activeDeliberations = deliberations.filter((d) => d.status === "active").length;
  const recentDeliberations = [...deliberations].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()).slice(0, 5);
  const recentReforms = [...reforms].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-display text-3xl text-[--flash]">Collaborative review</h1>
        <p className="text-sm text-[--steel]">
          Use collaborative review for higher-risk decisions that need more than one person involved.
        </p>
      </header>

      <section className="rounded border border-[--reactor-blue] bg-[#081316] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <Badge variant="healthy">START A REVIEW</Badge>
            <h2 className="font-display text-2xl text-[--flash]">Open a live review session</h2>
            <p className="max-w-3xl text-sm text-[--steel]">
              Start a real collaborative review, bind the right workspace and reviewer identity, and inspect the resulting artifacts.
            </p>
          </div>
          <Link href="/collective/submit" className="inline-flex h-10 items-center justify-center border border-[--reactor-blue] bg-[--reactor-blue] px-4 font-mono text-xs uppercase tracking-widest text-[--void] transition-colors hover:bg-[--reactor-glow]">
            Open live review
          </Link>
          <Link href="/collective/runs" className="inline-flex h-10 items-center justify-center border border-[--tungsten] px-4 font-mono text-xs uppercase tracking-widest text-[--flash] transition-colors hover:border-[--reactor-blue]">
            Review recent runs
          </Link>
        </div>
      </section>

      <DataSourceNotice
        title="Sample data in this overview"
        description="The overview cards and lists below currently use sample or projection data for preview purposes. They do not represent activity from your connected systems."
      />

      <CollectiveStatusHeader
        activeDeliberations={activeDeliberations}
        totalReformArtifacts={reforms.length}
        recentLegitimacyAssessments={legitimacyAssessments.length}
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-xs uppercase tracking-wider text-[--steel]">Recent review threads</h2>
          <Link href="/collective/deliberations" className="font-mono text-xs uppercase tracking-wider text-[--reactor-glow] hover:underline">
            View all
          </Link>
        </div>

        {recentDeliberations.length === 0 ? (
          <div className="rounded border border-[#384656] bg-[#0B0C10] p-4 text-center font-mono text-xs text-[--steel]">
            No review threads are available yet. Start a live review when you need one.
          </div>
        ) : (
          <div className="space-y-2">
            {recentDeliberations.map((d) => (
              <Link key={d.id} href={`/collective/deliberations/${d.id}`} className="flex items-center justify-between rounded border border-[#384656] bg-[#0E1118] px-4 py-3 transition-colors hover:border-[--reactor-blue]">
                <div className="space-y-1">
                  <div className="font-mono text-sm text-[--flash]">{d.topic}</div>
                  <div className="font-mono text-[10px] text-[--steel]">
                    REVIEWERS: {d.participants.length} | STARTED: {new Date(d.startedAt).toLocaleDateString()}
                  </div>
                </div>
                <Badge variant={statusBadgeVariant(d.status)}>{d.status.toUpperCase()}</Badge>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-xs uppercase tracking-wider text-[--steel]">Recent change proposals</h2>
          <Link href="/collective/reforms" className="font-mono text-xs uppercase tracking-wider text-[--reactor-glow] hover:underline">
            View all
          </Link>
        </div>

        {recentReforms.length === 0 ? (
          <div className="rounded border border-[#384656] bg-[#0B0C10] p-4 text-center font-mono text-xs text-[--steel]">
            No change proposals are available yet.
          </div>
        ) : (
          <div className="space-y-2">
            {recentReforms.map((r) => (
              <Link key={r.id} href={`/collective/reforms/${r.id}`} className="flex items-center justify-between rounded border border-[#384656] bg-[#0E1118] px-4 py-3 transition-colors hover:border-[--reactor-blue]">
                <div className="space-y-1">
                  <div className="font-mono text-sm text-[--flash]">{r.title}</div>
                  <div className="font-mono text-[10px] text-[--steel]">
                    AUTHOR: {r.authorId} | CREATED: {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <Badge variant={reformStatusBadgeVariant(r.status)}>{r.status.toUpperCase()}</Badge>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
