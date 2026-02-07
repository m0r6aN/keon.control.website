"use client";

import { ActionDetailPanel } from "@/components/courtroom/action-detail-panel";
import { ActionTimeline } from "@/components/courtroom/action-timeline";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mapCollaborationLedgerEntry } from "@/lib/mappers";
import { useQuery } from "@tanstack/react-query";
import { Info, Lock, ShieldAlert, ShieldCheck, Unlock } from "lucide-react";
import * as React from "react";

interface CourtroomClientProps {
  runId: string;
}

export function CourtroomClient({ runId }: CourtroomClientProps) {
  const [selectedSeq, setSelectedSeq] = React.useState<number | null>(0);
  
  // Determine fixture bundle from runId
  const scenario = React.useMemo(() => {
    if (runId.includes("missing")) return "missing_manifest";
    if (runId.includes("deny")) return "gate_deny";
    return "happy";
  }, [runId]);

  const { data: manifest, isLoading: loadingManifest } = useQuery({
    queryKey: ["manifest", runId, scenario],
    queryFn: async () => {
      const res = await fetch(`/mock/pt013/${scenario}/evidence/manifest.json`);
      if (!res.ok) throw new Error("Manifest not found");
      return res.json();
    },
  });

  const { data: ledger, isLoading: loadingLedger } = useQuery({
    queryKey: ["ledger", runId, scenario],
    queryFn: async () => {
      const res = await fetch(`/mock/pt013/${scenario}/collaboration_ledger.jsonl`);
      if (!res.ok) throw new Error("Ledger not found");
      const text = await res.text();
      return text.trim().split("\n").map((line) => mapCollaborationLedgerEntry(JSON.parse(line)));
    },
  });

  const selectedEntry = React.useMemo(() => {
    if (!ledger || selectedSeq === null) return null;
    return ledger.find((e) => e.seq === selectedSeq) || null;
  }, [ledger, selectedSeq]);

  if (loadingManifest || loadingLedger) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0B0C10]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#66FCF1] border-t-transparent" />
          <span className="font-mono text-xs text-[#C5C6C7] opacity-50 uppercase tracking-widest">
            Resolving Evidence Bundle...
          </span>
        </div>
      </div>
    );
  }

  const isSealed = ledger?.some(e => e.actionType === 'pack.seal');
  const gateDecision = ledger?.find(e => e.actionType === 'gate.resolve')?.policyDecision;

  return (
    <div className="flex flex-1 overflow-hidden border-t border-[#384656]">
      {/* Left: Action Timeline (Docket) */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0B0C10]">
        <div className="p-4 border-b border-[#384656] bg-[#1F2833]/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-[#C5C6C7] opacity-50 uppercase font-bold tracking-wider">Provenance</span>
              <div className="flex items-center gap-2">
                {isSealed ? (
                  <Badge variant="healthy" className="gap-1 px-1.5">
                    <Lock className="h-3 w-3" /> SEALED
                  </Badge>
                ) : (
                  <Badge variant="warning" className="gap-1 px-1.5">
                    <Unlock className="h-3 w-3" /> UNSEALED
                  </Badge>
                )}
                {gateDecision === 'allow' && (
                  <Badge variant="healthy" className="gap-1 px-1.5">
                    <ShieldCheck className="h-3 w-3" /> COMPLIANT
                  </Badge>
                )}
                {gateDecision === 'deny' && (
                  <Badge variant="critical" className="gap-1 px-1.5 text-flash">
                    <ShieldAlert className="h-3 w-3" /> NON-COMPLIANT
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="h-8 w-px bg-[#384656]" />
            
            <div className="flex flex-col">
              <span className="text-[10px] text-[#C5C6C7] opacity-50 uppercase font-bold tracking-wider">Policy Tier</span>
              <span className="text-xs font-mono text-[#66FCF1]">HIGH_ASSURANCE_V1</span>
            </div>
          </div>

          <div className="flex items-center gap-2 group cursor-help">
            <Info className="h-4 w-4 text-[#C5C6C7] opacity-40 group-hover:opacity-100 transition-opacity" />
            <span className="text-[10px] text-[#C5C6C7] opacity-40 group-hover:opacity-100 transition-opacity uppercase font-bold tracking-tighter">PT-013 Standard</span>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <ActionTimeline 
            entries={ledger || []} 
            selectedSeq={selectedSeq} 
            onSelect={setSelectedSeq} 
          />
        </ScrollArea>
      </div>

      {/* Right: Details Panel (Ruling/Exhibits) */}
      <div className="w-[450px] border-l border-[#384656] flex flex-col shadow-2xl">
        {selectedEntry ? (
          <ActionDetailPanel 
            entry={selectedEntry} 
            manifest={manifest} 
            runId={runId}
            scenario={scenario}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-12 text-center bg-[#0B0C10]">
             <div className="space-y-4 opacity-30">
                <ShieldCheck className="h-12 w-12 mx-auto text-[#C5C6C7]" />
                <p className="text-sm font-mono text-[#C5C6C7]">
                  Select an action from the Docket to review verifiable evidence.
                </p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
