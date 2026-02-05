"use client";

import * as React from "react";
import { Panel, PanelHeader, PanelContent, TrustScore } from "@/components/ui";
import { MiniChart } from "./mini-chart";

/**
 * Command Rail - Right-Side Tactical Intelligence
 * 
 * Always-on executive-grade signals:
 * - Trust Vector Sparkline (last 60m)
 * - Active Policy Overrides (count + severity)
 * - Quorum Health (nodes participating / required)
 * - Last Irreversible Action (timestamp + signer)
 * 
 * Rule: No scrolling. Read from 10 feet away.
 */

interface CommandRailProps {
  className?: string;
}

export function CommandRail({ className }: CommandRailProps) {
  // Mock data - replace with real data from backend
  const trustVectorData = [98.2, 98.5, 98.3, 98.7, 98.9, 98.7, 98.8, 98.7];
  const policyOverrides = 2;
  const quorumNodes = { participating: 7, required: 5 };
  const lastIrreversibleActionTimestamp = new Date("2026-01-04T14:03:00.000Z");
  const lastIrreversibleAction = {
    timestamp: lastIrreversibleActionTimestamp,
    signer: "ClaudeTitan",
    action: "POLICY_UPDATE",
  };
  const lastIrreversibleAgeMinutes = 3;

  return (
    <div className={className}>
      {/* Trust Vector with Composite Backbone */}
      <Panel noise notch className="mb-4">
        <PanelHeader>
          <span className="font-mono text-xs uppercase tracking-wider text-[--steel]">
            Trust Vector
          </span>
        </PanelHeader>
        <PanelContent>
          <TrustScore
            score={98.7}
            components={{
              policyAdherence: 99.2,
              receiptCompleteness: 98.9,
              quorumStability: 97.8,
              latencyVariance: 98.9,
            }}
            size="md"
            showBreakdown={true}
          />
          <div className="mt-4">
            <MiniChart
              data={trustVectorData}
              height={32}
              color="var(--reactor-glow)"
              showGrid={false}
            />
            <p className="font-mono text-[10px] text-[--steel] mt-2">
              Last 60m • Stable
            </p>
          </div>
        </PanelContent>
      </Panel>

      {/* Policy Overrides */}
      <Panel noise notch className="mb-4">
        <PanelContent className="py-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-[--steel]">
              Policy Overrides
            </span>
            <span className={`font-mono text-2xl font-bold tabular-nums ${
              policyOverrides > 0 ? 'text-[--safety-orange]' : 'text-[--steel]'
            }`}>
              {policyOverrides}
            </span>
          </div>
          {policyOverrides > 0 && (
            <p className="font-mono text-[10px] text-[--safety-orange] mt-1">
              ⚠ Manual intervention active
            </p>
          )}
        </PanelContent>
      </Panel>

      {/* Quorum Health */}
      <Panel noise notch className="mb-4">
        <PanelContent className="py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[--steel]">
              Quorum Health
            </span>
            <span className="font-mono text-lg font-bold tabular-nums text-[--reactor-glow]">
              {quorumNodes.participating}/{quorumNodes.required}
            </span>
          </div>
          {/* Visual quorum bar */}
          <div className="h-1 bg-[--gun-metal] rounded-sm overflow-hidden">
            <div
              className="h-full bg-[--reactor-glow] transition-all duration-300"
              style={{
                width: `${(quorumNodes.participating / quorumNodes.required) * 100}%`,
              }}
            />
          </div>
          <p className="font-mono text-[10px] text-[--steel] mt-1">
            {quorumNodes.participating > quorumNodes.required ? 'Surplus' : 'Minimum'} consensus
          </p>
        </PanelContent>
      </Panel>

      {/* Last Irreversible Action */}
      <Panel noise glow notch>
        <PanelHeader>
          <span className="font-mono text-xs uppercase tracking-wider text-[--steel]">
            Last Irreversible
          </span>
        </PanelHeader>
        <PanelContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[--steel]">Action:</span>
              <span className="font-mono text-xs text-[--flash]">
                {lastIrreversibleAction.action}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[--steel]">Signer:</span>
              <span className="font-mono text-xs text-[--reactor-blue]">
                {lastIrreversibleAction.signer}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[--steel]">Age:</span>
                <span className="font-mono text-xs tabular-nums text-[--steel]">
                  {lastIrreversibleAgeMinutes}m ago
                </span>
            </div>
          </div>
        </PanelContent>
      </Panel>

      {/* Glass Rule Compliance Note */}
      <p className="font-mono text-[9px] text-[--tungsten] mt-4 text-center">
        COMMAND RAIL • NO SCROLL
      </p>
    </div>
  );
}
