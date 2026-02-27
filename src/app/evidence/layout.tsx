import { EvidenceBanner } from "@/components/evidence/evidence-banner";
import { Shell } from "@/components/layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evidence Mode",
  description: "Read-only proof surface for evidence packs and verification proofs.",
};

export default function EvidenceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Shell>
      <div className="flex min-h-[calc(100vh-4rem)] flex-col gap-6 px-6 py-6">
        <EvidenceBanner />
        {children}
      </div>
    </Shell>
  );
}
