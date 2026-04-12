"use client";

import { usePathname } from "next/navigation";
import * as React from "react";
import { CollectiveBanner } from "./collective-banner";

/** Routes under /collective that should render without the banner and wrapper padding. */
const BARE_ROUTES = new Set(["/collective/showcase"]);

interface CollectiveLayoutShellProps {
  children: React.ReactNode;
}

export function CollectiveLayoutShell({ children }: CollectiveLayoutShellProps) {
  const pathname = usePathname();
  const isBare = BARE_ROUTES.has(pathname);

  if (isBare) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col gap-6 px-6 py-6">
      <CollectiveBanner />
      {children}
    </div>
  );
}
