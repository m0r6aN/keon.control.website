import type { Metadata } from "next";
import { CollectiveLiveRunPage } from "@/components/collective/collective-live-run-page";

export const metadata: Metadata = {
  title: "Collective Live Run",
  description:
    "Operator view for a live Collective cognition run with canonical anchors and inert trace data.",
};

export default async function CollectiveLiveRunRoute({
  params,
}: {
  params: Promise<{ intentId: string }>;
}) {
  const { intentId } = await params;

  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <h1 className="font-display text-3xl text-[--flash]">Collective Live Run</h1>
        <p className="max-w-4xl text-sm text-[--steel]">
          Canonical cognition artifacts for intent <span className="font-mono text-[--flash]">{intentId}</span>. Authorization and execution remain separate governed planes.
        </p>
      </header>
      <CollectiveLiveRunPage intentId={decodeURIComponent(intentId)} />
    </div>
  );
}
