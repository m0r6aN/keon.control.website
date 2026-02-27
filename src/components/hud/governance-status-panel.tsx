"use client";

import { useEffect, useState } from "react";
import { Badge, Panel, PanelContent, PanelHeader } from "@/components/ui";

type GovernanceEnvelope = {
  mode: "MOCK" | "LIVE";
  governance: {
    determinismStatus: "SEALED" | "DEGRADED" | "UNKNOWN";
    sealValidationResult: "VALID" | "INVALID" | "UNKNOWN";
    incidentFlag: boolean;
  };
  data: unknown[];
  source: string;
  generatedAt: string;
  mockLabel?: "MOCK";
};

type GovernanceState =
  | { kind: "loading" }
  | { kind: "unavailable"; reason: string }
  | {
      kind: "ready";
      mode: "MOCK" | "LIVE";
      determinismStatus: "SEALED" | "DEGRADED" | "UNKNOWN";
      sealValidationResult: "VALID" | "INVALID" | "UNKNOWN";
      incidentFlag: boolean;
      counts: { tenants: number; policies: number; runs: number; alerts: number };
      source: string;
      generatedAt: string;
    };

function badgeVariantForStatus(value: string) {
  switch (value) {
    case "SEALED":
    case "VALID":
      return "healthy" as const;
    case "DEGRADED":
    case "INVALID":
      return "critical" as const;
    default:
      return "offline" as const;
  }
}

function badgeVariantForIncident(incidentFlag: boolean) {
  return incidentFlag ? ("critical" as const) : ("healthy" as const);
}

export function GovernanceStatusPanel() {
  const [state, setState] = useState<GovernanceState>({ kind: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 5000);

    async function load() {
      try {
        const [tenantsRes, policiesRes, runsRes, alertsRes] = await Promise.all([
          fetch("/api/tenants", { cache: "no-store", signal: controller.signal }),
          fetch("/api/policies", { cache: "no-store", signal: controller.signal }),
          fetch("/api/runs", { cache: "no-store", signal: controller.signal }),
          fetch("/api/alerts", { cache: "no-store", signal: controller.signal }),
        ]);

        if (!tenantsRes.ok || !policiesRes.ok || !runsRes.ok || !alertsRes.ok) {
          throw new Error("One or more governance endpoints returned non-success");
        }

        const [tenants, policies, runs, alerts] = (await Promise.all([
          tenantsRes.json(),
          policiesRes.json(),
          runsRes.json(),
          alertsRes.json(),
        ])) as [GovernanceEnvelope, GovernanceEnvelope, GovernanceEnvelope, GovernanceEnvelope];

        const governance = {
          determinismStatus:
            runs.governance.determinismStatus !== "UNKNOWN"
              ? runs.governance.determinismStatus
              : alerts.governance.determinismStatus,
          sealValidationResult:
            runs.governance.sealValidationResult !== "UNKNOWN"
              ? runs.governance.sealValidationResult
              : alerts.governance.sealValidationResult,
          incidentFlag: runs.governance.incidentFlag || alerts.governance.incidentFlag,
        };

        setState({
          kind: "ready",
          mode: runs.mode,
          determinismStatus: governance.determinismStatus,
          sealValidationResult: governance.sealValidationResult,
          incidentFlag: governance.incidentFlag,
          counts: {
            tenants: tenants.data.length,
            policies: policies.data.length,
            runs: runs.data.length,
            alerts: alerts.data.length,
          },
          source: runs.source,
          generatedAt: runs.generatedAt,
        });
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        setState({ kind: "unavailable", reason });
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    load();

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  return (
    <Panel notch noise>
      <PanelHeader>Governance Surface</PanelHeader>
      <PanelContent className="space-y-3">
        {state.kind === "loading" && (
          <div className="space-y-2">
            <Badge variant="neutral">LOADING</Badge>
            <p className="text-xs font-mono text-[--steel]">Polling local governance API surface...</p>
          </div>
        )}

        {state.kind === "unavailable" && (
          <div className="space-y-3">
            <Badge variant="critical">OFFLINE</Badge>
            <p className="text-sm font-mono uppercase tracking-wide text-[--flash]">
              GOVERNANCE UNAVAILABLE
            </p>
            <p className="text-xs font-mono text-[--steel] break-words">{state.reason}</p>
          </div>
        )}

        {state.kind === "ready" && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant={state.mode === "MOCK" ? "warning" : "healthy"}>{state.mode}</Badge>
              {state.mode === "MOCK" ? <Badge variant="warning">MOCK DATA</Badge> : null}
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs font-mono">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[--steel]">DETERMINISM</span>
                <Badge variant={badgeVariantForStatus(state.determinismStatus)}>{state.determinismStatus}</Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[--steel]">SEAL VALIDATION</span>
                <Badge variant={badgeVariantForStatus(state.sealValidationResult)}>{state.sealValidationResult}</Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[--steel]">INCIDENT FLAG</span>
                <Badge variant={badgeVariantForIncident(state.incidentFlag)}>
                  {state.incidentFlag ? "ACTIVE" : "CLEAR"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="border border-[--tungsten] rounded-sm p-2">
                <div className="text-[--steel]">TENANTS</div>
                <div className="text-[--flash]">{state.counts.tenants}</div>
              </div>
              <div className="border border-[--tungsten] rounded-sm p-2">
                <div className="text-[--steel]">POLICIES</div>
                <div className="text-[--flash]">{state.counts.policies}</div>
              </div>
              <div className="border border-[--tungsten] rounded-sm p-2">
                <div className="text-[--steel]">RUNS</div>
                <div className="text-[--flash]">{state.counts.runs}</div>
              </div>
              <div className="border border-[--tungsten] rounded-sm p-2">
                <div className="text-[--steel]">ALERTS</div>
                <div className="text-[--flash]">{state.counts.alerts}</div>
              </div>
            </div>

            <div className="text-[10px] font-mono text-[--steel]">
              <div>SOURCE: {state.source}</div>
              <div>STAMP: {state.generatedAt}</div>
            </div>
          </div>
        )}
      </PanelContent>
    </Panel>
  );
}
