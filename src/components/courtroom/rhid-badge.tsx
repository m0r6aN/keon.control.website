"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UIManifestEntry } from "@/lib/mappers";
import { cn } from "@/lib/utils";
import { AlertTriangle, Code, Database, FileText, HelpCircle, Key, Shield, type LucideProps } from "lucide-react";
import type { ComponentType } from "react";

interface RHIDBadgeProps {
  rhid: string;
  entry: UIManifestEntry | null;
  className?: string;
}

export function RHIDBadge({ rhid, entry, className }: RHIDBadgeProps) {
  const kind = rhid.split(":")[1] || "unknown";
  
  const iconMap: Record<string, ComponentType<LucideProps>> = {
    receipt: Key,
    artifact: FileText,
    llm: Shield,
    toolio: Code,
    policy: Shield,
    gate: Shield,
    logslice: Database,
  };

  const Icon = iconMap[kind] || HelpCircle;

  if (!entry) {
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        <div className="flex items-center gap-2 px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono">
          <AlertTriangle className="h-3 w-3" />
          {rhid}
        </div>
        <span className="text-[10px] text-red-400/70 font-bold ml-1">
          BLOCKED / INVALID PACK (Entry missing from manifest)
        </span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "inline-flex items-center gap-2 px-2 py-1 rounded bg-[#384656]/30 border border-[#384656] text-[#C5C6C7] text-xs font-mono cursor-help hover:border-[#66FCF1]/50 transition-colors",
            className
          )}>
            <Icon className="h-3 w-3 text-[#66FCF1]" />
            {rhid}
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-[#0B0C10] border-[#384656] text-[#C5C6C7] p-3 space-y-2 max-w-xs shadow-xl">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-[#66FCF1] uppercase font-bold tracking-wider">Manifest Resolution</span>
            <div className="grid grid-cols-[60px_1fr] gap-x-2 gap-y-1 text-[11px]">
              <span className="opacity-50">SHA256:</span>
              <span className="font-mono truncate">{entry.sha256}</span>
              <span className="opacity-50">Type:</span>
              <span className="font-mono">{entry.contentType}</span>
              <span className="opacity-50">Size:</span>
              <span className="font-mono">{entry.sizeBytes} bytes</span>
              <span className="opacity-50">Actor:</span>
              <span className="font-mono text-[#66FCF1]">{entry.createdByActorId}</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
