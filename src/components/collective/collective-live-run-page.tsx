"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { persistCollectiveLiveRun, readCollectiveLiveRun, readCollectiveLiveRunIndex } from "@/lib/collective/live-run";
import type { CollectiveLiveRun, CollectiveLiveRunLookupUnavailable } from "@/lib/contracts/collective-live";
import { Badge, Button, Panel, PanelContent, PanelDescription, PanelHeader, PanelTitle } from "@/components/ui";
import { CollectiveLiveRunView } from "./collective-live-run-view";

interface CollectiveLiveRunPageProps {
  readonly intentId: string;
}

export function CollectiveLiveRunPage({ intentId }: CollectiveLiveRunPageProps) {
  const [run, setRun] = useState<CollectiveLiveRun | null>(null);
  const [lookupUnavailable, setLookupUnavailable] = useState<CollectiveLiveRunLookupUnavailable | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const cachedRun = readCollectiveLiveRun(intentId);
    if (cachedRun) {
      setRun(cachedRun);
    }

    const indexEntry = readCollectiveLiveRunIndex().find((entry) => entry.intentId === intentId);
    const correlationId = cachedRun?.run.correlationId ?? indexEntry?.correlationId;

    void fetch(
      `/api/collective/live-runs/${encodeURIComponent(intentId)}${correlationId ? `?correlationId=${encodeURIComponent(correlationId)}` : ""}`,
      { cache: "no-store" },
    )
      .then(async (response) => {
        const payload = await response.json();
        if (payload?.status === "NOT_YET_AVAILABLE") {
          setLookupUnavailable(payload as CollectiveLiveRunLookupUnavailable);
          return;
        }

        persistCollectiveLiveRun(payload as CollectiveLiveRun);
        setRun(payload as CollectiveLiveRun);
      })
      .catch(() => {
        if (indexEntry) {
          setLookupUnavailable({
            status: "NOT_YET_AVAILABLE",
            intentId,
            correlationId: indexEntry.correlationId,
            detail: "The website could not reach the durable lookup seam for this run.",
            hostSource: indexEntry.hostSource,
          });
        }
      })
      .finally(() => {
        setHydrated(true);
      });
  }, [intentId]);

  if (!hydrated) {
    return (
      <Panel>
        <PanelHeader>
          <PanelTitle>Loading Live Run</PanelTitle>
        </PanelHeader>
        <PanelContent>
          <p className="font-mono text-sm text-[--steel]">Restoring the last canonical host result from this browser session.</p>
        </PanelContent>
      </Panel>
    );
  }

  if (!run) {
    const indexEntry = readCollectiveLiveRunIndex().find((entry) => entry.intentId === intentId);
    return (
      <Panel notch glow>
        <PanelHeader>
          <div className="space-y-1">
            <PanelTitle>Run Retrieval Unavailable</PanelTitle>
            <PanelDescription>
              Historical lookup for `/{intentId}` is not yet exposed by the Collective host.
            </PanelDescription>
          </div>
          <Badge variant="warning">FAIL CLOSED</Badge>
        </PanelHeader>
        <PanelContent className="space-y-4">
          <p className="text-sm text-[--steel]">
            This route has a durable lookup contract now, but the Collective host does not yet serve historical run retrieval on the current seam. No mock replay is shown here.
          </p>
          {lookupUnavailable ? (
            <div className="rounded border border-[--safety-orange] bg-[#22160B] p-3 text-sm text-[--steel]">
              {lookupUnavailable.detail}
            </div>
          ) : null}
          {indexEntry ? (
            <div className="rounded border border-[--tungsten] bg-[--void] p-3">
              <div className="font-mono text-[10px] uppercase tracking-widest text-[--steel]">Indexed Run</div>
              <p className="mt-2 text-sm text-[--flash]">{indexEntry.objective}</p>
              <p className="mt-1 font-mono text-[11px] text-[--steel]">
                {indexEntry.correlationId} · {indexEntry.statusLabel}
              </p>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href="/collective/runs">Recent Runs</Link>
            </Button>
            <Button asChild>
              <Link href="/collective/submit">Submit A Live Run</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/collective">Back To Collective</Link>
            </Button>
          </div>
        </PanelContent>
      </Panel>
    );
  }

  return <CollectiveLiveRunView run={run} historyUnavailable={Boolean(lookupUnavailable)} />;
}
