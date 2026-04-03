import type { Metadata } from "next";
import { CollectiveLiveSubmitClient } from "@/components/collective/collective-live-submit-client";

export const metadata: Metadata = {
  title: "Submit To Collective",
  description:
    "Live Collective submission surface for real inert cognition runs from Keon Control.",
};

export default function CollectiveSubmitPage() {
  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <h1 className="font-display text-3xl text-[--flash]">Submit To Collective</h1>
        <p className="max-w-4xl text-sm text-[--steel]">
          Launch a real Collective cognition run, preserve tenant and actor identity, and inspect canonical host artifacts without crossing the governed reality boundary.
        </p>
      </header>
      <CollectiveLiveSubmitClient />
    </div>
  );
}
