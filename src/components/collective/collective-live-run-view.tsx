"use client";

import Link from "next/link";
import type { CollectiveLiveRun } from "@/lib/contracts/collective-live";
import { collectiveLiveRunPhase, collectiveLiveStageStates, summarizeBranch } from "@/lib/collective/live-run";
import { Badge, Button, Panel, PanelContent, PanelDescription, PanelHeader, PanelTitle } from "@/components/ui";

function phaseBadgeVariant(plane: "cognition" | "governance" | "execution") {
  switch (plane) {
    case "execution":
      return "critical" as const;
    case "governance":
      return "warning" as const;
    default:
      return "healthy" as const;
  }
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

interface CollectiveLiveRunViewProps {
  readonly run: CollectiveLiveRun;
  readonly historyUnavailable?: boolean;
}

export function CollectiveLiveRunView({
  run,
  historyUnavailable = false,
}: CollectiveLiveRunViewProps) {
  const phase = collectiveLiveRunPhase(run);
  const stageStates = collectiveLiveStageStates(run);
  const runtimeHref = `/runtime/executions?intentId=${encodeURIComponent(run.run.intentId)}&correlationId=${encodeURIComponent(run.run.correlationId)}`;
  const evidenceHref = `/evidence?intentId=${encodeURIComponent(run.run.intentId)}&correlationId=${encodeURIComponent(run.run.correlationId)}`;
  const receiptsHref = `/receipts?intentId=${encodeURIComponent(run.run.intentId)}&correlationId=${encodeURIComponent(run.run.correlationId)}`;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <Panel notch glow>
          <PanelHeader>
            <div className="space-y-1">
              <PanelTitle>Run Status</PanelTitle>
              <PanelDescription>
                Submitter intent, current plane, and canonical identifiers for this live Collective run.
              </PanelDescription>
            </div>
            <Badge variant={phaseBadgeVariant(phase.plane)}>{phase.label}</Badge>
          </PanelHeader>
          <PanelContent className="space-y-4" id="status">
            <div className="space-y-2">
              <p className="font-display text-2xl text-[--flash]">{run.submission.objective}</p>
              <p className="text-sm text-[--steel]">{run.run.summary}</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded border border-[--tungsten] bg-[--void] p-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[--steel]">Intent</div>
                <div className="mt-1 break-all font-mono text-xs text-[--flash]">{run.run.intentId}</div>
              </div>
              <div className="rounded border border-[--tungsten] bg-[--void] p-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[--steel]">Correlation</div>
                <div className="mt-1 break-all font-mono text-xs text-[--flash]">{run.run.correlationId}</div>
              </div>
              <div className="rounded border border-[--tungsten] bg-[--void] p-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[--steel]">Tenant / Actor</div>
                <div className="mt-1 font-mono text-xs text-[--flash]">{run.submission.tenantId}</div>
                <div className="font-mono text-[11px] text-[--steel]">
                  {run.submission.actorId} · {run.submission.actorType}
                </div>
              </div>
              <div className="rounded border border-[--tungsten] bg-[--void] p-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[--steel]">Selected Branch</div>
                <div className="mt-1 break-all font-mono text-xs text-[--flash]">
                  {run.run.selectedBranchId}
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded border border-[--tungsten] bg-[--void] p-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[--steel]">Submitted</div>
                <div className="mt-1 font-mono text-xs text-[--flash]">
                  {formatTimestamp(run.run.submittedAtUtc)}
                </div>
              </div>
              <div className="rounded border border-[--tungsten] bg-[--void] p-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[--steel]">Completed</div>
                <div className="mt-1 font-mono text-xs text-[--flash]">
                  {formatTimestamp(run.run.completedAtUtc)}
                </div>
              </div>
            </div>

            {historyUnavailable ? (
              <div className="rounded border border-[--safety-orange] bg-[#22160B] p-3 text-sm text-[--flash]">
                Historical run retrieval is not yet exposed by the Collective host. This route can reopen a live run only when the submitting browser session still holds the canonical host result.
              </div>
            ) : null}
          </PanelContent>
        </Panel>

        <Panel>
          <PanelHeader>
            <div className="space-y-1">
              <PanelTitle>Three-Stage Lifecycle</PanelTitle>
              <PanelDescription>
                Every live run is rendered against the Keon system model: cognition, governance, then execution.
              </PanelDescription>
            </div>
          </PanelHeader>
          <PanelContent className="space-y-3">
            {stageStates.map((stage, index) => (
              <div
                key={stage.key}
                className="rounded border border-[--tungsten] bg-[--void] p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-[--steel]">
                      [{index + 1}] {stage.label} ({stage.scope})
                    </div>
                    <div className="mt-1 font-mono text-xs text-[--flash]">{stage.status}</div>
                  </div>
                  <Badge variant={stage.tone}>{stage.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-[--steel]">{stage.detail}</p>
              </div>
            ))}
          </PanelContent>
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader>
            <div className="space-y-1">
              <PanelTitle>Collective Trace</PanelTitle>
              <PanelDescription>
                Real runtime steps from the host result. These steps remain cognition-plane unless explicit governed or execution anchors appear.
              </PanelDescription>
            </div>
            <Link href={`#evidence`} className="font-mono text-xs uppercase tracking-widest text-[--reactor-glow] hover:underline">
              Jump To Evidence
            </Link>
          </PanelHeader>
          <PanelContent id="trace">
            <div className="space-y-3">
              {run.cognition.runtimeTrace.length === 0 ? (
                <div className="rounded border border-[--tungsten] bg-[--void] p-4 text-sm text-[--steel]">
                  No runtime trace steps were returned for this run.
                </div>
              ) : (
                run.cognition.runtimeTrace.map((step) => (
                  <div key={`${step.step}-${step.timestampUtc}`} className="rounded border border-[--tungsten] bg-[--void] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={phaseBadgeVariant(step.plane)}>{step.plane}</Badge>
                      <span className="font-mono text-xs uppercase tracking-widest text-[--flash]">{step.step}</span>
                      <span className="font-mono text-[11px] text-[--steel]">{formatTimestamp(step.timestampUtc)}</span>
                    </div>
                    <p className="mt-2 text-sm text-[--flash]">{step.detail}</p>
                    {Object.keys(step.metadata).length > 0 ? (
                      <dl className="mt-3 grid gap-2 md:grid-cols-2">
                        {Object.entries(step.metadata).map(([key, value]) => (
                          <div key={key} className="rounded border border-[#24313D] px-2 py-1.5">
                            <dt className="font-mono text-[10px] uppercase tracking-widest text-[--steel]">{key}</dt>
                            <dd className="mt-1 break-all font-mono text-[11px] text-[--flash]">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </PanelContent>
        </Panel>

        <Panel>
          <PanelHeader>
            <div className="space-y-1">
              <PanelTitle>Branch Selection</PanelTitle>
              <PanelDescription>
                Candidate branches, selected lineage, and collapse identity from the canonical host result.
              </PanelDescription>
            </div>
          </PanelHeader>
          <PanelContent className="space-y-4">
            <div className="rounded border border-[--reactor-blue] bg-[#081316] p-3">
              <div className="font-mono text-[10px] uppercase tracking-widest text-[--steel]">Selected Branch Summary</div>
              <p className="mt-2 text-sm text-[--flash]">{summarizeBranch(run.cognition.winningBranch)}</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded border border-[--tungsten] bg-[--void] p-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[--steel]">Materialized</div>
                <div className="mt-1 font-mono text-2xl text-[--flash]">{run.cognition.materializedBranches.length}</div>
              </div>
              <div className="rounded border border-[--tungsten] bg-[--void] p-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[--steel]">Evaluated</div>
                <div className="mt-1 font-mono text-2xl text-[--flash]">{run.cognition.evaluatedBranches.length}</div>
              </div>
            </div>

            <div className="space-y-2">
              {run.cognition.evaluatedBranches.length === 0 ? (
                <div className="rounded border border-[--tungsten] bg-[--void] p-4 text-sm text-[--steel]">
                  No evaluated branches were returned for this run.
                </div>
              ) : (
                run.cognition.evaluatedBranches.map((branch) => (
                  <div key={branch.branchId} className="rounded border border-[--tungsten] bg-[--void] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-all font-mono text-xs text-[--flash]">{branch.branchId}</p>
                        <p className="mt-1 text-sm text-[--steel]">{branch.hypothesis}</p>
                      </div>
                      <Badge variant={branch.branchId === run.run.selectedBranchId ? "healthy" : "neutral"}>
                        {branch.branchId === run.run.selectedBranchId ? "selected" : branch.state}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PanelContent>
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Panel>
          <PanelHeader>
            <div className="space-y-1">
              <PanelTitle>Adversarial Review</PanelTitle>
              <PanelDescription>Challenge depth, material findings, and review anchor state.</PanelDescription>
            </div>
          </PanelHeader>
          <PanelContent className="space-y-3">
            {run.cognition.review ? (
              <>
                <div className="flex items-center justify-between">
                  <Badge variant="warning">{run.cognition.review.status}</Badge>
                  <span className="font-mono text-[11px] text-[--steel]">{run.cognition.review.reviewId}</span>
                </div>
                <p className="text-sm text-[--flash]">{run.cognition.review.summary}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded border border-[--tungsten] bg-[--void] p-3">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-[--steel]">Challenge Depth</div>
                    <div className="mt-1 font-mono text-xl text-[--flash]">{run.cognition.review.challengeDepth}</div>
                  </div>
                  <div className="rounded border border-[--tungsten] bg-[--void] p-3">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-[--steel]">Induced Heat</div>
                    <div className="mt-1 font-mono text-xl text-[--flash]">{run.cognition.review.inducedHeat.toFixed(2)}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {run.cognition.review.findings.length === 0 ? (
                    <div className="rounded border border-[--tungsten] bg-[--void] p-3 text-sm text-[--steel]">
                      No material findings were returned for this run.
                    </div>
                  ) : (
                    run.cognition.review.findings.map((finding) => (
                      <div key={finding.code} className="rounded border border-[--tungsten] bg-[--void] p-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-mono text-xs uppercase tracking-widest text-[--flash]">{finding.code}</span>
                          <Badge variant={finding.resolved ? "healthy" : "warning"}>
                            {finding.resolved ? "resolved" : "open"}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-[--steel]">{finding.narrative}</p>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="rounded border border-[--tungsten] bg-[--void] p-4 text-sm text-[--steel]">
                Review state is not yet available for this run.
              </div>
            )}
          </PanelContent>
        </Panel>

        <Panel>
          <PanelHeader>
            <div className="space-y-1">
              <PanelTitle>Heat</PanelTitle>
              <PanelDescription>Composite risk posture from the cognition heat profile.</PanelDescription>
            </div>
          </PanelHeader>
          <PanelContent className="space-y-3">
            {run.cognition.heatProfile ? (
              <>
                <div className="flex items-center justify-between">
                  <Badge variant={run.cognition.heatProfile.thresholdState === "Critical" ? "critical" : "warning"}>
                    {run.cognition.heatProfile.thresholdState}
                  </Badge>
                  <span className="font-mono text-[11px] text-[--steel]">{run.cognition.heatProfile.heatProfileId}</span>
                </div>
                <div className="rounded border border-[--tungsten] bg-[--void] p-3">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[--steel]">Composite Heat</div>
                  <div className="mt-1 font-mono text-2xl text-[--flash]">
                    {run.cognition.heatProfile.compositeHeat.toFixed(2)}
                  </div>
                </div>
                <dl className="grid gap-2 md:grid-cols-2">
                  <div className="rounded border border-[#24313D] px-2 py-2">
                    <dt className="font-mono text-[10px] uppercase tracking-widest text-[--steel]">Branch</dt>
                    <dd className="mt-1 font-mono text-xs text-[--flash]">{run.cognition.heatProfile.branchHeat.toFixed(2)}</dd>
                  </div>
                  <div className="rounded border border-[#24313D] px-2 py-2">
                    <dt className="font-mono text-[10px] uppercase tracking-widest text-[--steel]">Boundary</dt>
                    <dd className="mt-1 font-mono text-xs text-[--flash]">{run.cognition.heatProfile.boundaryHeat.toFixed(2)}</dd>
                  </div>
                  <div className="rounded border border-[#24313D] px-2 py-2">
                    <dt className="font-mono text-[10px] uppercase tracking-widest text-[--steel]">Challenge</dt>
                    <dd className="mt-1 font-mono text-xs text-[--flash]">{run.cognition.heatProfile.challengeHeat.toFixed(2)}</dd>
                  </div>
                  <div className="rounded border border-[#24313D] px-2 py-2">
                    <dt className="font-mono text-[10px] uppercase tracking-widest text-[--steel]">Swarm</dt>
                    <dd className="mt-1 font-mono text-xs text-[--flash]">{run.cognition.heatProfile.swarmHeat.toFixed(2)}</dd>
                  </div>
                </dl>
              </>
            ) : (
              <div className="rounded border border-[--tungsten] bg-[--void] p-4 text-sm text-[--steel]">
                Heat profile is not yet available for this run.
              </div>
            )}
          </PanelContent>
        </Panel>

        <Panel>
          <PanelHeader>
            <div className="space-y-1">
              <PanelTitle>Witness And Collapse</PanelTitle>
              <PanelDescription>
                Witness narrative and collapse lineage. Narratives are always subordinate to anchors.
              </PanelDescription>
            </div>
          </PanelHeader>
          <PanelContent className="space-y-3">
            {run.cognition.collapseRecord ? (
              <div className="rounded border border-[--tungsten] bg-[--void] p-3">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="healthy">{run.cognition.collapseRecord.disposition}</Badge>
                  <span className="font-mono text-[11px] text-[--steel]">{run.cognition.collapseRecord.collapseId}</span>
                </div>
                <p className="mt-2 text-sm text-[--flash]">{run.cognition.collapseRecord.selectionRationale}</p>
              </div>
            ) : (
              <div className="rounded border border-[--tungsten] bg-[--void] p-4 text-sm text-[--steel]">
                Collapse lineage is not yet available for this run.
              </div>
            )}

            {run.cognition.witnessTruth ? (
              <div className="rounded border border-[--tungsten] bg-[--void] p-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[--steel]">Witness Narrative</div>
                <p className="mt-2 text-sm text-[--flash]">{run.cognition.witnessTruth.witnessNarrative}</p>
                <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-[--steel]">Truth Narrative</div>
                <p className="mt-2 text-sm text-[--steel]">{run.cognition.witnessTruth.truthNarrative}</p>
              </div>
            ) : null}
          </PanelContent>
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,1fr)]" id="evidence">
        <Panel>
          <PanelHeader>
            <div className="space-y-1">
              <PanelTitle>Receipts And Evidence</PanelTitle>
              <PanelDescription>
                Actual anchor identifiers returned by the run. Missing governed or execution receipts are stated explicitly.
              </PanelDescription>
            </div>
          </PanelHeader>
          <PanelContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded border border-[--tungsten] bg-[--void] p-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[--steel]">Collapse Anchor</div>
                <div className="mt-1 break-all font-mono text-xs text-[--flash]">{run.anchors.collapseId ?? "Unavailable"}</div>
              </div>
              <div className="rounded border border-[--tungsten] bg-[--void] p-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[--steel]">Review Anchor</div>
                <div className="mt-1 break-all font-mono text-xs text-[--flash]">{run.anchors.reviewId ?? "Unavailable"}</div>
              </div>
              <div className="rounded border border-[--tungsten] bg-[--void] p-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[--steel]">Heat Anchor</div>
                <div className="mt-1 break-all font-mono text-xs text-[--flash]">{run.anchors.heatProfileId ?? "Unavailable"}</div>
              </div>
            </div>

            <div className="rounded border border-[--tungsten] bg-[--void] p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[--steel]">Truth References</div>
                <Badge variant={run.anchors.truthRefs.length > 0 ? "healthy" : "warning"}>
                  {run.anchors.truthRefs.length > 0 ? `${run.anchors.truthRefs.length} anchors` : "Unavailable"}
                </Badge>
              </div>
              {run.anchors.truthRefs.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {run.anchors.truthRefs.map((truthRef) => (
                    <li key={truthRef} className="break-all rounded border border-[#24313D] px-2 py-2 font-mono text-xs text-[--flash]">
                      {truthRef}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-[--steel]">
                  This run did not return truth references on the current host seam.
                </p>
              )}
            </div>

            <div className="rounded border border-[--safety-orange] bg-[#22160B] p-3 text-sm text-[--steel]">
              Destination pages below may still be mock-backed, but the drilldown path now exists so operators can follow the audit trail rather than being stranded on this screen.
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="secondary">
                <Link href={runtimeHref}>View In Runtime</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href={receiptsHref}>View Receipts</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href={evidenceHref}>View Evidence</Link>
              </Button>
            </div>
          </PanelContent>
        </Panel>

        <Panel>
          <PanelHeader>
            <div className="space-y-1">
              <PanelTitle>Operator Notes</PanelTitle>
              <PanelDescription>Constitutional reminders and raw normalized payload inspection.</PanelDescription>
            </div>
          </PanelHeader>
          <PanelContent className="space-y-3">
            {run.operatorMessages.map((message) => (
              <div key={message} className="rounded border border-[--tungsten] bg-[--void] p-3 text-sm text-[--steel]">
                {message}
              </div>
            ))}

            <details className="rounded border border-[--tungsten] bg-[--void] p-3">
              <summary className="cursor-pointer font-mono text-xs uppercase tracking-widest text-[--flash]">
                Inspect Normalized Payload
              </summary>
              <pre className="mt-3 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] text-[--steel]">
                {JSON.stringify(run, null, 2)}
              </pre>
            </details>

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="secondary">
                <Link href="/collective/submit">Submit Another Run</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/collective">Back To Collective</Link>
              </Button>
            </div>
          </PanelContent>
        </Panel>
      </section>
    </div>
  );
}
