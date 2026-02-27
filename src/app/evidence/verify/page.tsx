"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel, PanelHeader, PanelContent } from "@/components/ui/panel";
import * as React from "react";

type ProofJson = Record<string, unknown> & {
  pack_hash?: string;
  PackHash?: string;
  trust_bundle?: {
    bundle_id?: string;
  };
  attestation?: {
    signer_kid?: string;
  };
};

const PACK_HASH_REGEX = /^[a-zA-Z0-9:_\-.]+$/;

function normalizePackHash(value: string) {
  return value.trim();
}

function extractPackSha(value?: string) {
  if (!value) {
    return null;
  }
  const normalized = value.startsWith("sha256:") ? value.slice(7) : value;
  return normalized;
}

export default function EvidenceVerifyPage() {
  const [packHash, setPackHash] = React.useState("");
  const [proofText, setProofText] = React.useState("");
  const [proofJson, setProofJson] = React.useState<ProofJson | null>(null);
  const [status, setStatus] = React.useState<"idle" | "valid" | "invalid">("idle");
  const [resultMessage, setResultMessage] = React.useState("Awaiting proof upload.");
  const [error, setError] = React.useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const handleProofUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      setProofJson(parsed);
      setProofText(JSON.stringify(parsed, null, 2));
      setStatus("idle");
      setResultMessage("Proof JSON loaded.");
      setError(null);
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
      setDownloadUrl(URL.createObjectURL(new Blob([JSON.stringify(parsed, null, 2)], { type: "application/json" })));
    } catch (err) {
      console.error(err);
      setError("Unable to parse proof JSON. Ensure the file is valid.");
      setProofJson(null);
      setProofText("");
      setDownloadUrl(null);
    } finally {
      event.target.value = "";
    }
  };

  const handleVerify = () => {
    setError(null);

    if (!normalizePackHash(packHash)) {
      setError("pack_hash is required.");
      return;
    }

    if (!PACK_HASH_REGEX.test(packHash)) {
      setError("pack_hash contains invalid characters.");
      return;
    }

    if (!proofJson) {
      setError("Proof JSON must be uploaded before verification.");
      return;
    }

    const proofPackHash = (proofJson.pack_hash ?? proofJson.PackHash ?? "").toString();
    if (!proofPackHash) {
      setStatus("invalid");
      setResultMessage("Proof JSON does not include pack_hash.");
      return;
    }

    const normalizedInput = normalizePackHash(packHash);
    if (proofPackHash.toLowerCase() === normalizedInput.toLowerCase()) {
      setStatus("valid");
      setResultMessage("Pack hash matches the exported proof.");
    } else {
      setStatus("invalid");
      setResultMessage("Pack hash does not match the proof export.");
    }
  };

  const proofPackHash = proofJson ? (proofJson.pack_hash ?? proofJson.PackHash ?? "") : "";
  const proofPackSha = extractPackSha(proofPackHash.toString());
  const trustBundleLabel = proofJson?.trust_bundle?.bundle_id ? proofJson.trust_bundle.bundle_id : "Not provided";
  const signaturesLabel = proofJson?.attestation?.signer_kid ?? "Awaiting proof upload";

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl text-[--flash]">Verify</h1>
        <p className="text-sm text-[--steel]">Inspect a verification proof and its result.</p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[2fr_3fr]">
        <Panel className="space-y-4" noise>
          <PanelHeader>Input</PanelHeader>
          <PanelContent className="space-y-4">
            <div className="space-y-1 text-xs font-mono uppercase tracking-[0.3em] text-[--steel]">
              <label htmlFor="packHash">pack_hash</label>
              <Input
                id="packHash"
                value={packHash}
                onChange={(event) => setPackHash(event.target.value)}
                placeholder="Paste a pack_hash (hash-addressed provenance)"
              />
              <p className="text-[--steel]">This identifier references a specific Evidence Pack.</p>
            </div>

            <div className="space-y-1 text-xs font-mono uppercase tracking-[0.3em] text-[--steel]">
              <label htmlFor="proof-upload">Proof JSON</label>
              <input
                id="proof-upload"
                type="file"
                accept="application/json"
                onChange={handleProofUpload}
                className="w-full rounded border border-[--tungsten] bg-[--void] px-3 py-2 text-sm font-mono text-[--steel]"
              />
              <p className="text-[--steel]">Upload the exported verification proof JSON.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="md" onClick={handleVerify}>
                Verify
              </Button>
              <Button
                variant="outline"
                size="md"
                disabled={!downloadUrl}
                onClick={() => {
                  if (!downloadUrl) return;
                  const anchor = document.createElement("a");
                  anchor.href = downloadUrl;
                  anchor.download = "verification-proof.json";
                  anchor.click();
                }}
              >
                Download proof JSON
              </Button>
            </div>

            {error && <p className="text-xs text-[--ballistic-red]">{error}</p>}
          </PanelContent>
        </Panel>

        <Panel className="space-y-4" noise>
          <PanelHeader>Results</PanelHeader>
          <PanelContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-[--steel]">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.4em]">Status</p>
                <p className={`text-sm font-mono ${status === "valid" ? "text-[--reactor-blue]" : status === "invalid" ? "text-[--ballistic-red]" : ""}`}>
                  {status === "valid" ? "Verified" : status === "invalid" ? "Failed" : "Awaiting verification"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.4em]">Pack hash</p>
                <p className="text-sm font-mono text-[--flash]">
                  {proofPackHash || packHash || "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.4em]">Pack SHA-256</p>
                <p className="text-sm font-mono text-[--steel]">{proofPackSha ?? "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.4em]">Trust bundle</p>
                <p className="text-sm font-mono text-[--steel]">{trustBundleLabel}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.4em]">Signatures</p>
                <p className="text-sm font-mono text-[--steel]">{signaturesLabel}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.4em]">Proof JSON</p>
                <details className="rounded border border-[--tungsten] bg-[--void] p-2 text-[11px]">
                  <summary className="cursor-pointer font-mono text-[--reactor-glow]">View</summary>
                  <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-[11px]">{proofText || "No proof uploaded."}</pre>
                </details>
              </div>
            </div>
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-[--steel]">{resultMessage}</p>
            {status === "invalid" && (
              <p className="text-sm text-[--ballistic-red]">
                Verification failed. Review the errors and the trust material used.
              </p>
            )}
            <p className="text-xs text-[--steel]">
              This view does not generate evidence. It only renders and inspects proof outputs.
            </p>
          </PanelContent>
        </Panel>
      </div>
    </div>
  );
}
