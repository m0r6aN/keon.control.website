"use client";

import { Badge } from "@/components/ui/badge";
import { formatTimestamp } from "@/lib/format";
import { UICollaborationLedgerEntry } from "@/lib/mappers";
import { cn } from "@/lib/utils";
import { Clock, Shield, ShieldAlert, ShieldCheck } from "lucide-react";

interface ActionTimelineProps {
  entries: UICollaborationLedgerEntry[];
  selectedSeq: number | null;
  onSelect: (seq: number) => void;
}

export function ActionTimeline({ entries, selectedSeq, onSelect }: ActionTimelineProps) {
  return (
    <div className="flex flex-col">
      {entries.map((entry) => {
        const isSelected = selectedSeq === entry.seq;
        
        return (
          <div
            key={entry.seq}
            onClick={() => onSelect(entry.seq)}
            className={cn(
              "group relative flex cursor-pointer border-b border-[#384656] p-4 transition-all hover:bg-[#384656]/20",
              isSelected && "bg-[#384656]/30 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[#66FCF1]"
            )}
          >
            <div className="mr-4 flex flex-col items-center">
              <span className="font-mono text-[10px] text-[#C5C6C7] opacity-40">
                {entry.seq.toString().padStart(3, "0")}
              </span>
              <div className={cn(
                "my-2 h-full w-px bg-[#384656]",
                entry.seq === entries.length - 1 && "h-0"
              )} />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-[#66FCF1]">
                    {entry.actionType}
                  </span>
                  {entry.policyDecision && (
                    <PolicyDecisionBadge decision={entry.policyDecision} />
                  )}
                </div>
                <span className="font-mono text-xs text-[#C5C6C7] opacity-60">
                  {formatTimestamp(new Date(entry.timestamp))}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[#C5C6C7] opacity-60">Actor:</span>
                  <span className="font-mono text-xs text-[#C5C6C7]">{entry.actorId}</span>
                  <Badge variant="outline" className="text-[10px] h-4 px-1 opacity-50">
                    {entry.actorType}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-[#C5C6C7] opacity-40" />
                  <span className="font-mono text-xs text-[#C5C6C7] opacity-70">
                    {entry.durationMs}ms
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 ml-auto">
                    <StatusIndicator status={entry.status} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PolicyDecisionBadge({ decision }: { decision: "allow" | "flag" | "deny" }) {
  const configs = {
    allow: { icon: ShieldCheck, color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20", label: "ALLOWED" },
    flag: { icon: Shield, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", label: "FLAGGED" },
    deny: { icon: ShieldAlert, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", label: "DENIED" },
  };

  const config = configs[decision];
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold", config.bg, config.color, config.border)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </div>
  );
}

function StatusIndicator({ status }: { status: string }) {
    const isSuccess = status === 'success';
    return (
        <div className="flex items-center gap-2">
            <div className={cn("h-1.5 w-1.5 rounded-full", isSuccess ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,44,44,0.6)]")} />
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#C5C6C7] opacity-60">
                {status}
            </span>
        </div>
    );
}
