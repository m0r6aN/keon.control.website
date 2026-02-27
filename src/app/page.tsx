"use client";

import { ActivityFeed, SystemStatus as SystemStatusChart } from "@/components/charts";
import {
  CommandRail,
  GovernanceStatusPanel,
  MetricsPanel,
  QuickStats,
  StatusBar,
  type Subsystem as StatusBarSubsystem,
} from "@/components/hud";
import { Shell } from "@/components/layout";
import { ExplainOverlay, Panel, PanelContent, PanelHeader } from "@/components/ui";
import { useExplainMode } from "@/lib";
import {
  mockActivityEvents,
  mockSubsystems,
  mockSystemMetrics,
  type SystemStatus,
} from "@/lib/mock-data";

const statusMap: Record<SystemStatus, StatusBarSubsystem["status"]> = {
  healthy: "operational",
  degraded: "degraded",
  critical: "offline",
};

const statusBarSubsystems: StatusBarSubsystem[] = mockSubsystems.map((subsystem) => ({
  id: subsystem.id,
  name: subsystem.name,
  status: statusMap[subsystem.status],
}));

/**
 * Keon Command Center - Main Dashboard
 * Mission Control Interface for Keon Governance System
 *
 * Features:
 * - Glass Rule: Critical metrics visible without scrolling on 1440p
 * - Numerical Law: All auditable values use monospace
 * - Explain This Mode: Press "?" to see provenance overlay
 */
export default function Home() {
  const { provenanceData, closeExplainMode } = useExplainMode();

  // Convert system metrics to quick stats format
  const quickStats = [
    {
      id: "active-executions",
      label: "Active Ops",
      value: mockSystemMetrics.activeExecutions,
      status: "nominal" as const,
    },
    {
      id: "pending-decisions",
      label: "Pending",
      value: mockSystemMetrics.pendingDecisions,
      status: mockSystemMetrics.pendingDecisions > 5 ? ("warning" as const) : ("nominal" as const),
    },
    {
      id: "compliance-score",
      label: "Compliance",
      value: `${mockSystemMetrics.complianceScore}%`,
      status: mockSystemMetrics.complianceScore >= 95 ? ("nominal" as const) : ("warning" as const),
    },
    {
      id: "receipts-24h",
      label: "Receipts/24h",
      value: mockSystemMetrics.recentReceipts24h,
      status: "neutral" as const,
    },
  ];

  return (
    <Shell>
      {/* HUD - Always visible metrics (Glass Rule compliance) */}
      <StatusBar subsystems={statusBarSubsystems} />

      {/* Main Dashboard Grid - 3 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
        {/* Left Column - System Health (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <QuickStats stats={quickStats} variant="bordered" />

          <Panel noise notch>
            <PanelHeader>System Health</PanelHeader>
            <PanelContent>
              <SystemStatusChart
                systems={mockSubsystems.map((s) => ({
                  id: s.id,
                  name: s.name,
                  status: s.status,
                  lastUpdate: s.lastCheck,
                  load: s.load, // Pressure indicator
                }))}
              />
            </PanelContent>
          </Panel>
        </div>

        {/* Center Column - Activity Feed & Metrics (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Panel noise glow notch>
            <PanelHeader>Live Activity</PanelHeader>
            <PanelContent>
              <ActivityFeed
                events={mockActivityEvents.map(event => ({
                  id: event.id,
                  timestamp: event.timestamp,
                  type: event.type === 'alert' ? (event.status === 'critical' ? 'error' : 'warning') :
                        event.type === 'receipt' ? 'success' : 'info',
                  title: event.description,
                  signer: event.signer,
                  policyRef: event.policyRef,
                  hashPrefix: event.hashPrefix,
                }))}
              />
            </PanelContent>
          </Panel>

          <MetricsPanel
            metrics={[
              {
                id: "trust-score",
                label: "Trust Score",
                value: 98.7,
                unit: "%",
                status: "nominal",
                trend: "up",
                trendValue: "+0.3%",
              },
              {
                id: "active-agents",
                label: "Active Agents",
                value: 12,
                status: "nominal",
              },
              {
                id: "avg-latency",
                label: "Avg Latency",
                value: 23,
                unit: "ms",
                status: "nominal",
                trend: "down",
                trendValue: "-5ms",
              },
            ]}
            columns={3}
          />
        </div>

        {/* Right Column - Command Rail (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <GovernanceStatusPanel />
          <CommandRail />
        </div>
      </div>

      {/* Explain This Mode Overlay - Hotkey: ? */}
      <ExplainOverlay data={provenanceData} onClose={closeExplainMode} />
    </Shell>
  );
}
