import { CollectiveLayoutShell } from "@/components/collective/collective-layout-shell";
import { Shell } from "@/components/layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collaborative Review",
  description: "Collaborative review surfaces for higher-risk AI decisions and change approval.",
};

export default function CollectiveLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Shell>
      <CollectiveLayoutShell>{children}</CollectiveLayoutShell>
    </Shell>
  );
}
