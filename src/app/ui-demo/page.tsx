"use client";

import {
  Button,
  Panel,
  PanelHeader,
  PanelContent,
  Badge,
  Input,
  DataValue,
  StatusIndicator,
  Separator,
} from "@/components/ui";

/**
 * UI Component Demo Page
 * Showcases all Keon Command Center components in action
 */
export default function UIDemoPage() {
  return (
    <div className="min-h-screen bg-[--void] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold text-[--flash] uppercase tracking-wider">
            Keon Command Center
          </h1>
          <p className="font-mono text-sm text-[--steel]">
            UI Component Arsenal - Mission Control Interface
          </p>
        </div>

        <Separator />

        {/* Buttons Section */}
        <Panel>
          <PanelHeader>Button Components</PanelHeader>
          <PanelContent className="space-y-6">
            <div className="space-y-3">
              <p className="font-mono text-xs text-[--steel] uppercase">
                Variants
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary Action</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Abort Mission</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="primary" disabled>
                  Disabled
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="font-mono text-xs text-[--steel] uppercase">
                Sizes
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>
          </PanelContent>
        </Panel>

        {/* Badges Section */}
        <Panel>
          <PanelHeader>Status Badges</PanelHeader>
          <PanelContent className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <Badge variant="healthy">ONLINE</Badge>
              <Badge variant="warning">WARNING</Badge>
              <Badge variant="critical">CRITICAL</Badge>
              <Badge variant="neutral">STANDBY</Badge>
              <Badge variant="offline">OFFLINE</Badge>
            </div>
          </PanelContent>
        </Panel>

        {/* Status Indicators Section */}
        <Panel>
          <PanelHeader>Status Indicators</PanelHeader>
          <PanelContent className="space-y-6">
            <div className="space-y-3">
              <p className="font-mono text-xs text-[--steel] uppercase">
                LED Status Lights
              </p>
              <div className="flex flex-wrap gap-4">
                <StatusIndicator status="online" label="System A" />
                <StatusIndicator status="running" label="Process" />
                <StatusIndicator status="warning" label="Alert" />
                <StatusIndicator status="critical" label="Breach" />
                <StatusIndicator status="standby" label="Ready" />
                <StatusIndicator status="offline" label="Offline" />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="font-mono text-xs text-[--steel] uppercase">
                Sizes
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <StatusIndicator status="online" size="sm" />
                <StatusIndicator status="running" size="md" />
                <StatusIndicator status="critical" size="lg" />
              </div>
            </div>
          </PanelContent>
        </Panel>

        {/* Input Fields Section */}
        <Panel>
          <PanelHeader>Input Fields</PanelHeader>
          <PanelContent className="space-y-6">
            <div className="space-y-3 max-w-md">
              <Input
                type="text"
                placeholder="Enter hash value..."
                inputSize="md"
              />
              <Input
                type="number"
                placeholder="0x..."
                inputSize="sm"
              />
              <Input
                type="text"
                placeholder="Large input field"
                inputSize="lg"
              />
              <Input
                type="text"
                placeholder="Disabled state"
                disabled
              />
            </div>
          </PanelContent>
        </Panel>

        {/* DataValue Section */}
        <Panel>
          <PanelHeader>Data Values</PanelHeader>
          <PanelContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="font-mono text-xs text-[--steel] uppercase">
                  Hash Values (Click to Copy)
                </p>
                <DataValue
                  variant="hash"
                  value="0x1234567890abcdef1234567890abcdef"
                  copyable
                  size="md"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="font-mono text-xs text-[--steel] uppercase">
                  Numbers with Trends
                </p>
                <div className="flex flex-wrap gap-4">
                  <DataValue
                    variant="number"
                    value={1234567}
                    trend="up"
                    label="Total Ops"
                  />
                  <DataValue
                    variant="number"
                    value={98765}
                    trend="down"
                    label="Pending"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="font-mono text-xs text-[--steel] uppercase">
                  Timestamps
                </p>
                <DataValue
                  variant="timestamp"
                  value="2026-01-04T12:34:56Z"
                  label="Last Updated"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="font-mono text-xs text-[--steel] uppercase">
                  Status Values
                </p>
                <DataValue
                  variant="status"
                  value="OPERATIONAL"
                  size="lg"
                />
              </div>
            </div>
          </PanelContent>
        </Panel>

        {/* Panel Variants */}
        <Panel>
          <PanelHeader>Panel Component Variants</PanelHeader>
          <PanelContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Panel>
                <PanelContent>
                  <p className="font-mono text-sm text-[--steel]">
                    Default Panel - Clean surface
                  </p>
                </PanelContent>
              </Panel>

              <Panel noise>
                <PanelContent>
                  <p className="font-mono text-sm text-[--steel]">
                    Panel with Noise Texture
                  </p>
                </PanelContent>
              </Panel>

              <Panel glow>
                <PanelContent>
                  <p className="font-mono text-sm text-[--steel]">
                    Panel with Reactor Glow
                  </p>
                </PanelContent>
              </Panel>

              <Panel noise glow>
                <PanelContent>
                  <p className="font-mono text-sm text-[--steel]">
                    Panel with Both Effects
                  </p>
                </PanelContent>
              </Panel>
            </div>
          </PanelContent>
        </Panel>

        {/* Mission Status Dashboard Example */}
        <Panel noise glow>
          <PanelHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <StatusIndicator status="running" />
                <h3 className="font-mono text-sm uppercase tracking-wider text-[--flash]">
                  Mission Control - Live Status
                </h3>
              </div>
              <Badge variant="healthy">OPERATIONAL</Badge>
            </div>
          </PanelHeader>
          <PanelContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="font-mono text-xs text-[--steel] uppercase">
                  Active Operations
                </p>
                <DataValue
                  variant="number"
                  value={42}
                  trend="up"
                  size="xl"
                />
              </div>
              <div className="space-y-2">
                <p className="font-mono text-xs text-[--steel] uppercase">
                  Trust Chain ID
                </p>
                <DataValue
                  variant="hash"
                  value="0xabcd...ef01"
                  copyable
                  size="md"
                />
              </div>
              <div className="space-y-2">
                <p className="font-mono text-xs text-[--steel] uppercase">
                  Last Sync
                </p>
                <DataValue
                  variant="timestamp"
                  value="2026-01-04T06:59:42Z"
                  size="sm"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="font-mono text-xs text-[--steel] uppercase">
                System Health
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2">
                  <StatusIndicator status="online" size="sm" />
                  <span className="font-mono text-xs text-[--steel]">
                    Provenance
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIndicator status="online" size="sm" />
                  <span className="font-mono text-xs text-[--steel]">
                    Trust Ops
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIndicator status="warning" size="sm" />
                  <span className="font-mono text-xs text-[--steel]">
                    Storage
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIndicator status="online" size="sm" />
                  <span className="font-mono text-xs text-[--steel]">
                    Network
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex gap-3">
              <Button variant="primary" size="sm">
                Run Analysis
              </Button>
              <Button variant="secondary" size="sm">
                View Logs
              </Button>
              <Button variant="ghost" size="sm">
                Settings
              </Button>
            </div>
          </PanelContent>
        </Panel>
      </div>
    </div>
  );
}
