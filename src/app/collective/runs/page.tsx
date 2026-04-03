import type { Metadata } from "next";
import { CollectiveLiveRunsPage } from "@/components/collective/collective-live-runs-page";

export const metadata: Metadata = {
  title: "Collective Runs",
  description: "Recent live Collective run registry for operator recovery and audit.",
};

export default function CollectiveRunsPage() {
  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <h1 className="font-display text-3xl text-[--flash]">Collective Runs</h1>
        <p className="max-w-4xl text-sm text-[--steel]">
          Recover recent live runs by intent and correlation, then reopen their canonical operator view.
        </p>
      </header>
      <CollectiveLiveRunsPage />
    </div>
  );
}
