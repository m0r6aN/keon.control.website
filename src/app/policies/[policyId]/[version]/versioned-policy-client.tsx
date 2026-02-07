"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, FileText, Shield } from "lucide-react";
import * as React from "react";

interface VersionedPolicyClientProps {
  policyId: string;
  version: string;
}

export function VersionedPolicyClient({ policyId, version }: VersionedPolicyClientProps) {
  // Mock policy resolution
  const scenario = "happy";
  
  const { data: manifest } = useQuery({
    queryKey: ["manifest", scenario],
    queryFn: async () => {
      const res = await fetch(`/mock/pt013/${scenario}/evidence/manifest.json`);
      return res.json();
    }
  });

  const policyEntry = React.useMemo(() => {
    if (!manifest) return null;
    return manifest.entries.find((e: any) => e.rhid.startsWith('rhid:policy:'));
  }, [manifest]);

  const { data: content, isLoading } = useQuery({
    queryKey: ["policy-content", policyEntry?.rhid],
    enabled: !!policyEntry,
    queryFn: async () => {
      const safeRhid = policyEntry.rhid.replace(/:/g, "_");
      const res = await fetch(`/mock/pt013/${scenario}/evidence/objects/${safeRhid}.dat`);
      return res.text();
    }
  });

  return (
    <div className="flex flex-col h-full bg-[#0B0C10]">
      <div className="px-6 py-4 border-b border-[#384656] flex items-center justify-between bg-[#1F2833]/10">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-[#66FCF1]/10 border border-[#66FCF1]/20">
            <Shield className="h-6 w-6 text-[#66FCF1]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#C5C6C7]">{policyId}</h2>
              <Badge variant="healthy" className="h-5">v{version}</Badge>
            </div>
            <div className="flex items-center gap-3 mt-1 text-[10px] text-[#C5C6C7] opacity-50 uppercase font-bold tracking-widest">
              <span>Immutable Reference</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Published Feb 7, 2026</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="text-right">
                <span className="block text-[10px] text-[#C5C6C7] opacity-40 uppercase font-bold">Policy Hash</span>
                <span className="font-mono text-xs text-[#C5C6C7]">{policyEntry?.sha256 ? `${policyEntry.sha256.slice(0, 32)}...` : 'Calculating...'}</span>
            </div>
            <div className="h-8 w-px bg-[#384656] mx-2" />
            <Badge variant="healthy" className="gap-1 px-2 py-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> VERIFIED
            </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto p-12">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-4 w-full bg-[#384656]/20 animate-pulse rounded" />
              <div className="h-4 w-3/4 bg-[#384656]/20 animate-pulse rounded" />
              <div className="h-4 w-5/6 bg-[#384656]/20 animate-pulse rounded" />
            </div>
          ) : content ? (
            <article className="prose prose-invert prose-slate max-w-none">
              <div className="rounded-xl border border-[#384656] bg-[#1F2833]/10 p-8 shadow-inner">
                <div className="flex items-center gap-2 mb-8 pb-4 border-b border-[#384656]/50">
                    <FileText className="h-5 w-5 text-[#66FCF1]" />
                    <span className="font-mono text-sm text-[#C5C6C7] opacity-60">Source: {policyEntry?.rhid}</span>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-lg leading-relaxed text-[#C5C6C7]/90">
                  {content}
                </pre>
              </div>
            </article>
          ) : (
            <div className="text-center py-24 opacity-30">
                Policy reference could not be resolved in the current scope.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
