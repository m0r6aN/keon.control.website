"use client";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatHash, formatTimestamp } from "@/lib/format";
import { mapThinReceipt, UIThinReceipt } from "@/lib/mappers";
import { PageHeader } from "@/ui-kit/components/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Key, Search } from "lucide-react";
import Link from "next/link";
import * as React from "react";

export default function GlobalReceiptsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const { data: receipts, isLoading } = useQuery({
    queryKey: ["global-receipts"],
    queryFn: async () => {
      const fixtures = ["happy", "gate_deny"];
      const allReceipts: UIThinReceipt[] = [];
      
      for (const f of fixtures) {
        try {
          const res = await fetch(`/mock/pt013/${f}/evidence/manifest.json`);
          const manifest = await res.json();
          const receiptEntries = manifest.entries.filter((e: any) => e.rhid.startsWith("rhid:receipt:"));
          
          for (const entry of receiptEntries) {
            const safeRhid = entry.rhid.replace(/:/g, "_");
            const rRes = await fetch(`/mock/pt013/${f}/evidence/receipts/${safeRhid}.json`);
            const rData = await rRes.json();
            allReceipts.push(mapThinReceipt(rData));
          }
        } catch (e) {
          console.error(`Failed to load receipts for fixture ${f}`, e);
        }
      }
      return allReceipts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
  });

  const filteredReceipts = React.useMemo(() => {
    if (!receipts) return [];
    return receipts.filter(r => 
        r.receiptId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.actionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.runId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [receipts, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-[#0B0C10]">
      <PageHeader
        title="Receipts Registry"
        description="Global explorer for verifiable governance receipts and immutable rulings"
      />
      
      <div className="px-6 py-4 border-b border-[#384656]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C5C6C7] opacity-50" />
          <Input
            placeholder="Search by Receipt ID, Action Type, or Run..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-[#1F2833]/20 border-[#384656] text-sm"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6">
          {isLoading ? (
            <div className="font-mono text-xs opacity-40">Scanning chain of custody...</div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredReceipts.map((receipt) => (
                <div 
                  key={receipt.hash}
                  className="group relative bg-[#1F2833]/10 border border-[#384656] hover:border-[#66FCF1]/50 p-4 rounded transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-[#66FCF1]/10">
                        <Key className="h-4 w-4 text-[#66FCF1]" />
                      </div>
                      <div>
                        <h4 className="font-mono text-sm text-[#66FCF1]">{receipt.actionType}</h4>
                        <span className="text-[10px] text-[#C5C6C7] opacity-60 uppercase font-bold tracking-widest">Action Outcome</span>
                      </div>
                    </div>
                    <Link 
                      href={`/runtime/executions/${receipt.runId}`}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-[#66FCF1] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider"
                    >
                      View Case <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <span className="block text-[10px] text-[#C5C6C7] opacity-40 uppercase font-bold mb-1">Receipt ID</span>
                      <span className="font-mono text-xs text-[#C5C6C7]">{formatHash(receipt.receiptId, 12)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-[#C5C6C7] opacity-40 uppercase font-bold mb-1">Run ID</span>
                      <span className="font-mono text-xs text-[#C5C6C7]">{receipt.runId}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-[#C5C6C7] opacity-40 uppercase font-bold mb-1">Timestamp</span>
                      <span className="font-mono text-xs text-[#C5C6C7]">{formatTimestamp(new Date(receipt.timestamp))}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-[#C5C6C7] opacity-40 uppercase font-bold mb-1">Chain Hash</span>
                      <span className="font-mono text-xs text-[#C5C6C7]">{formatHash(receipt.hash, 16)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {filteredReceipts.length === 0 && (
                <div className="text-center py-12 border border-dashed border-[#384656] rounded opacity-30">
                   No matching receipts found in current registry scan.
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
