"use client";

import { cn } from "@/lib/utils";

export function DataSourceNotice({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded border border-[#F0B56B]/30 bg-[#F0B56B]/10 p-4", className)}>
      <div className="font-mono text-xs uppercase tracking-[0.18em] text-[#F0B56B]">{title}</div>
      <p className="mt-2 text-sm leading-6 text-[#F3F5F7] opacity-85">{description}</p>
    </div>
  );
}
