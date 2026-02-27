"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import * as React from "react";

const tabs = ["Summary", "Proof JSON", "Artifacts"] as const;

interface EvidencePackTabsProps {
  packHash: string;
}

const artifacts = [
  {
    label: "Evidence Pack archive",
    path: "samples/buyer-wow/out/evidence-pack/keon-evidence-pack-sample.zip",
    details: "Includes the ZIP that encapsulates the deterministic evidence artifacts.",
  },
  {
    label: "SHA-256 output",
    path: "samples/buyer-wow/out/sha256sum.txt",
    details: "Records the SHA-256 hash for the generated pack.",
  },
  {
    label: "Verification proof JSON",
    path: "samples/buyer-wow/out/verification-proof.json",
    details: "Exported via verify-pack.ps1 to demonstrate zero-trust auditing.",
  },
  {
    label: "Verification logs",
    path: "samples/buyer-wow/out/verification.log (optional)",
    details: "Contains the verification CLI execution details.",
  },
];

export function EvidencePackTabs({ packHash }: EvidencePackTabsProps) {
  const [activeTab, setActiveTab] = React.useState<typeof tabs[number]>("Summary");
  const packSha = packHash.startsWith("sha256:") ? packHash.slice(7) : packHash;

  const renderContent = () => {
    switch (activeTab) {
      case "Summary":
        return (
          <div className="space-y-4 text-sm text-[--steel]">
            <p>
              Hash-addressed provenance for <span className="font-mono">{packHash}</span>. Use the exported proof to confirm
              signatures, trust bundles, and artifacts produced by the Golden Path.
            </p>
            <p>
              Pack SHA-256 <span className="font-mono">{packSha}</span> is deterministic—you can recompute it
              by rerunning the Golden Path with the same inputs.
            </p>
          </div>
        );
      case "Proof JSON":
        return (
          <div className="space-y-3 text-sm text-[--steel]">
            <p>
              The exported proof JSON captures <span className="font-mono">pack_hash</span>, <span className="font-mono">manifest_hash</span>, signatures, and trust bundle assertions.
            </p>
            <p>
              Upload the proof at <Link className="text-[--reactor-glow]" href="/evidence/verify">/evidence/verify</Link> to see the verification status, proof preview, and trust bundle metadata.
            </p>
            <p className="text-xs uppercase tracking-[0.4em] text-[--steel]">Reference: docs/audit/EXTERNAL_VERIFICATION_SPEC.md</p>
          </div>
        );
      case "Artifacts":
        return (
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-[--steel]">Artifacts listed here are produced by the Golden Path and are intended for inspection and audit workflows.</p>
            <div className="space-y-3">
              {artifacts.map((artifact) => (
                <div key={artifact.label} className="rounded border border-[--tungsten] bg-[#0B0C10] p-3 text-sm text-[--steel]">
                  <p className="text-xs uppercase tracking-[0.3em] text-[--steel]">{artifact.label}</p>
                  <p className="font-mono text-[0.85em] text-[--reactor-blue]">{artifact.path}</p>
                  <p>{artifact.details}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-[--steel]">
              This environment may not host pack files. Use the Golden Path run output (samples/buyer-wow/out/) to locate these artifacts locally.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded border border-[--tungsten] bg-[#0E1118]">
      <div className="flex border-b border-[--tungsten]">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={cn(
              "flex-1 px-4 py-3 text-xs font-mono uppercase tracking-[0.3em] transition-colors",
              activeTab === tab ? "text-[--reactor-glow]" : "text-[--steel] hover:text-[--reactor-blue]"
            )}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="p-5">{renderContent()}</div>
    </div>
  );
}
