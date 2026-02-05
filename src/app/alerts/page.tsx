"use client";

import * as React from "react";
import { PageContainer, PageHeader, Card, CardHeader, CardContent } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LiveIndicator } from "@/components/realtime/live-indicator";
import { AlertCircle, AlertTriangle, Info, CheckCircle, Eye, Settings } from "lucide-react";
import { formatTimestamp } from "@/lib/format";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { REALTIME_CONFIG, type AlertPayload } from "@/lib/realtime";

const mockAlerts = [
  {
    id: "alert-001",
    title: "Budget threshold exceeded",
    message: "Monthly token budget has reached 90% utilization",
    severity: "warning",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    acknowledged: false,
  },
  {
    id: "alert-002",
    title: "High-risk execution blocked",
    message: "Agent attempted unauthorized data export - action blocked by policy",
    severity: "error",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    acknowledged: false,
  },
  {
    id: "alert-003",
    title: "New policy version available",
    message: "Authority policy v2.1.0 is ready for review and activation",
    severity: "info",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    acknowledged: false,
  },
  {
    id: "alert-004",
    title: "Execution latency spike",
    message: "Average execution time increased by 40% in the last hour",
    severity: "warning",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    acknowledged: true,
  },
];

const severityConfig = {
  error: { icon: AlertCircle, variant: "critical" as const, color: "text-[#FF6B6B]" },
  warning: { icon: AlertTriangle, variant: "warning" as const, color: "text-[#FFA500]" },
  info: { icon: Info, variant: "neutral" as const, color: "text-[#66FCF1]" },
};

export default function AlertsPage() {
  const [alerts, setAlerts] = React.useState(mockAlerts);

  const { status } = useRealtimeSubscription({
    topic: "alerts",
    onEvent: (event) => {
      if (event.type === "alert.created") {
        const payload = event.payload as AlertPayload;
        const nextAlert = {
          id: payload.id ?? `alert_${Date.now()}`,
          title: payload.title,
          message: payload.message,
          severity: payload.severity,
          timestamp: payload.timestamp ?? new Date().toISOString(),
          acknowledged: payload.acknowledged ?? false,
        };
        setAlerts((prev) => [nextAlert, ...prev]);
      }

      if (event.type === "alert.acknowledged") {
        const payload = event.payload as { id: string };
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === payload.id ? { ...alert, acknowledged: true } : alert
          )
        );
      }
    },
  });

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;
  const liveState =
    status === "connected"
      ? "live"
      : REALTIME_CONFIG.REALTIME_ENABLED
        ? "degraded"
        : "offline";

  return (
    <PageContainer>
      <PageHeader
        title="Alerts"
        description="System alerts and governance notifications"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Acknowledge All
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Alert Settings
            </Button>
          </div>
        }
      />

      {/* Alert Summary */}
      <div className="mb-6 flex items-center gap-4">
        <Badge variant="critical" className="px-3 py-1 text-sm uppercase">
          {unacknowledgedCount} Unacknowledged
        </Badge>
        <Badge variant="neutral" className="px-3 py-1 text-sm uppercase">
          {alerts.length} Total
        </Badge>
        <LiveIndicator state={liveState} />
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.map((alert) => {
          const config = severityConfig[alert.severity as keyof typeof severityConfig];
          const Icon = config.icon;

          return (
            <Card
              key={alert.id}
              className={`transition-colors ${
                alert.acknowledged ? "opacity-60" : "hover:border-[#66FCF1]/30"
              }`}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border border-[#384656] bg-[#0B0C10] ${config.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-['Rajdhani'] text-base font-semibold text-[#C5C6C7]">
                        {alert.title}
                      </h3>
                      <Badge variant={config.variant} className="uppercase">
                        {alert.severity}
                      </Badge>
                      {alert.acknowledged && (
                        <Badge variant="default" className="uppercase">
                          acknowledged
                        </Badge>
                      )}
                    </div>
                    <p className="mb-2 text-sm text-[#C5C6C7] opacity-70">{alert.message}</p>
                    <span className="font-mono text-xs text-[#C5C6C7] opacity-50">
                      {formatTimestamp(new Date(alert.timestamp))}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!alert.acknowledged && (
                      <Button variant="outline" size="sm" className="gap-2">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Acknowledge
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="mt-6">
        <CardHeader
          title="About Alerts"
          description="Real-time governance event notifications"
        />
        <CardContent>
          <div className="space-y-3 text-sm text-[#C5C6C7] opacity-80">
            <p>
              <strong className="text-[#66FCF1]">Alerts</strong> notify you of important governance
              events such as policy violations, budget thresholds, and system anomalies.
            </p>
            <p>
              Critical alerts may require immediate action and are linked to specific Receipts for
              full audit trail visibility.
            </p>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
