"use client";

import { useEffect, useState } from "react";
import { Panel, PanelHeader, PanelContent } from "./panel";
import { DataValue } from "./data-value";
import { Separator } from "./separator";
import { Badge } from "./badge";

export interface ProvenanceData {
  element: string;
  provenance: {
    source: string;
    hash: string;
    timestamp: string;
  };
  lastMutation: {
    agent: string;
    action: string;
    timestamp: string;
    receipt: string;
  };
  policySource: {
    pack: string;
    rule: string;
    version: string;
  };
  signer: {
    identity: string;
    publicKey: string;
    verified: boolean;
  };
}

interface ExplainOverlayProps {
  data: ProvenanceData | null;
  onClose: () => void;
}

/**
 * Explain This Mode Overlay
 * Hotkey: ? - Shows provenance, last mutation, policy source, and signer
 * 
 * Implements the "Explain This" directive:
 * "Instantly overlays provenance, last mutation, policy source, and signer for the focused element"
 */
export function ExplainOverlay({ data, onClose }: ExplainOverlayProps) {
  if (!data) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[--void]/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-w-3xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <Panel noise glow>
          <PanelHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm uppercase tracking-wider text-[--reactor-glow]">
                  ⚡ Explain This Mode
                </span>
                <Badge variant="neutral">Press ESC to close</Badge>
              </div>
            </div>
          </PanelHeader>
          <PanelContent className="space-y-6">
            {/* Element Info */}
            <div className="space-y-2">
              <p className="font-mono text-xs text-[--steel] uppercase">
                Focused Element
              </p>
              <p className="font-mono text-lg text-[--flash]">
                {data.element}
              </p>
            </div>

            <Separator />

            {/* Provenance */}
            <div className="space-y-3">
              <p className="font-mono text-xs text-[--steel] uppercase">
                📜 Provenance
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DataValue
                  variant="text"
                  value={data.provenance.source}
                  label="Source"
                  size="sm"
                />
                <DataValue
                  variant="timestamp"
                  value={data.provenance.timestamp}
                  label="Created"
                  size="sm"
                />
              </div>
              <DataValue
                variant="hash"
                value={data.provenance.hash}
                label="Content Hash"
                copyable
                size="md"
              />
            </div>

            <Separator />

            {/* Last Mutation */}
            <div className="space-y-3">
              <p className="font-mono text-xs text-[--steel] uppercase">
                🔄 Last Mutation
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DataValue
                  variant="text"
                  value={data.lastMutation.agent}
                  label="Agent"
                  size="sm"
                />
                <DataValue
                  variant="text"
                  value={data.lastMutation.action}
                  label="Action"
                  size="sm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DataValue
                  variant="timestamp"
                  value={data.lastMutation.timestamp}
                  label="Timestamp"
                  size="sm"
                />
                <DataValue
                  variant="hash"
                  value={data.lastMutation.receipt}
                  label="Receipt"
                  copyable
                  size="sm"
                />
              </div>
            </div>

            <Separator />

            {/* Policy Source */}
            <div className="space-y-3">
              <p className="font-mono text-xs text-[--steel] uppercase">
                📋 Policy Source
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DataValue
                  variant="text"
                  value={data.policySource.pack}
                  label="Pack"
                  size="sm"
                />
                <DataValue
                  variant="text"
                  value={data.policySource.rule}
                  label="Rule"
                  size="sm"
                />
                <DataValue
                  variant="text"
                  value={data.policySource.version}
                  label="Version"
                  size="sm"
                />
              </div>
            </div>

            <Separator />

            {/* Signer */}
            <div className="space-y-3">
              <p className="font-mono text-xs text-[--steel] uppercase">
                ✍️ Signer
              </p>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={data.signer.verified ? "healthy" : "critical"}>
                  {data.signer.verified ? "VERIFIED" : "UNVERIFIED"}
                </Badge>
              </div>
              <DataValue
                variant="text"
                value={data.signer.identity}
                label="Identity"
                size="sm"
              />
              <DataValue
                variant="hash"
                value={data.signer.publicKey}
                label="Public Key"
                copyable
                size="md"
              />
            </div>
          </PanelContent>
        </Panel>
      </div>
    </div>
  );
}

