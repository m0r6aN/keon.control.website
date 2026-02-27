"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel, PanelHeader, PanelContent } from "@/components/ui/panel";
import { useRouter } from "next/navigation";
import * as React from "react";

const PACK_HASH_REGEX = /^[a-zA-Z0-9:_\-.]+$/;

export default function ViewPackEntryPage() {
  const router = useRouter();
  const [packHash, setPackHash] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = packHash.trim();
    if (!trimmed) {
      setError("pack_hash is required.");
      return;
    }
    if (!PACK_HASH_REGEX.test(trimmed)) {
      setError("pack_hash contains unsupported characters.");
      return;
    }
    setError(null);
    router.push(`/evidence/pack/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl text-[--flash]">View a Pack</h1>
        <p className="text-sm text-[--steel]">
          Enter a pack_hash to inspect its summary and associated proof output.
        </p>
      </header>

      <Panel noise>
        <PanelHeader>Entry</PanelHeader>
        <PanelContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2 text-xs font-mono uppercase tracking-[0.3em] text-[--steel]">
              <label htmlFor="pack-hash-input">pack_hash</label>
              <Input
                id="pack-hash-input"
                value={packHash}
                onChange={(event) => setPackHash(event.target.value)}
                placeholder="Paste a pack_hash"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button size="md" variant="primary" type="submit">
                View Pack
              </Button>
              <p className="text-xs text-[--steel]">Provide the hash-addressed identifier from export.</p>
            </div>

            {error && <p className="text-xs text-[--ballistic-red]">{error}</p>}
          </form>
        </PanelContent>
      </Panel>
    </div>
  );
}
