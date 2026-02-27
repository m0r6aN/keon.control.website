"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Manifest, ManifestEntry } from "@/lib/contracts/pt013";
import { UICollaborationLedgerEntry } from "@/lib/mappers";
import { isRhidValid, resolveRhid } from "@/lib/rhid-resolver";
import { useQuery } from "@tanstack/react-query";
import { FileJson, FileText, Fingerprint, ShieldAlert } from "lucide-react";
import { RHIDBadge } from "./rhid-badge";

interface ActionDetailPanelProps {
  entry: UICollaborationLedgerEntry;
  manifest: Manifest | null;
  runId: string;
  scenario: string;
}

export function ActionDetailPanel({ entry, manifest, runId, scenario }: ActionDetailPanelProps) {
  const receiptRhid = entry.receiptRhid;
  
  const { data: receipt, isLoading: loadingReceipt } = useQuery({
    queryKey: ["receipt", receiptRhid, scenario],
    enabled: !!receiptRhid,
    queryFn: async () => {
      const safeRhid = receiptRhid!.replace(/:/g, "_");
      const res = await fetch(`/mock/pt013/${scenario}/evidence/receipts/${safeRhid}.json`);
      if (!res.ok) throw new Error("Receipt not found");
      return res.json();
    },
  });

  return (
    <div className="flex flex-col h-full bg-[#0B0C10]">
      <div className="p-4 border-b border-[#384656]">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-[#66FCF1] uppercase tracking-wider">
            Action Details
          </h3>
          <span className="font-mono text-[10px] text-[#C5C6C7] opacity-40">
            SEQ: {entry.seq} | STEP: {entry.stepId}
          </span>
        </div>
        <p className="text-xs text-[#C5C6C7] opacity-60">
          Attribution for <span className="text-[#66FCF1]">{entry.actionType}</span> performed by <span className="text-[#66FCF1]">{entry.actorId}</span>
        </p>
      </div>

      <Tabs defaultValue="receipt" className="flex-1 flex flex-col min-h-0">
        <div className="px-4 border-b border-[#384656]">
          <TabsList className="bg-transparent border-none p-0 h-10 gap-4">
            <TabsTrigger value="receipt" className="p-0 h-full border-b-2 border-transparent data-[state=active]:border-[#66FCF1] rounded-none bg-transparent data-[state=active]:bg-transparent text-[#C5C6C7] data-[state=active]:text-[#66FCF1] text-xs font-bold transition-all">
              RULING (RECEIPT)
            </TabsTrigger>
            <TabsTrigger value="exhibits" className="p-0 h-full border-b-2 border-transparent data-[state=active]:border-[#66FCF1] rounded-none bg-transparent data-[state=active]:bg-transparent text-[#C5C6C7] data-[state=active]:text-[#66FCF1] text-xs font-bold transition-all">
              EXHIBITS (IO)
            </TabsTrigger>
            <TabsTrigger value="artifacts" className="p-0 h-full border-b-2 border-transparent data-[state=active]:border-[#66FCF1] rounded-none bg-transparent data-[state=active]:bg-transparent text-[#C5C6C7] data-[state=active]:text-[#66FCF1] text-xs font-bold transition-all">
              PREVIEWS
            </TabsTrigger>
            <TabsTrigger value="manifest" className="p-0 h-full border-b-2 border-transparent data-[state=active]:border-[#66FCF1] rounded-none bg-transparent data-[state=active]:bg-transparent text-[#C5C6C7] data-[state=active]:text-[#66FCF1] text-xs font-bold transition-all">
              MANIFEST
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <TabsContent value="receipt" className="p-4 m-0">
              {loadingReceipt ? (
                <div className="font-mono text-[10px] opacity-40">Loading receipt...</div>
              ) : receipt ? (
                <div className="space-y-6">
                  {!isRhidValid(receiptRhid || "", manifest) && (
                    <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-500 mb-4">
                      <ShieldAlert className="h-4 w-4" />
                      <AlertTitle className="text-xs font-bold uppercase tracking-wider">Invalid Chain of Custody</AlertTitle>
                      <AlertDescription className="text-[10px] opacity-80">
                        The receipt RHID {receiptRhid} is not registered in the proof manifest. 
                        This pack is untrusted and potentially tampered with.
                      </AlertDescription>
                    </Alert>
                  )}
                  <section>
                    <h4 className="flex items-center gap-2 text-[10px] font-bold text-[#C5C6C7] mb-3 opacity-50 uppercase tracking-widest">
                      <Fingerprint className="h-3 w-3" />
                      Cryptographic Evidence
                    </h4>
                    <div className="rounded border border-[#384656] bg-[#1F2833]/30 p-3 space-y-3">
                      <div>
                        <span className="block text-[10px] text-[#C5C6C7] opacity-50 mb-1">Receipt ID</span>
                        <code className="text-xs text-[#66FCF1] break-all">{receipt.receipt_id}</code>
                      </div>
                      <div>
                        <span className="block text-[10px] text-[#C5C6C7] opacity-50 mb-1">Content Hash (SHA256)</span>
                        <code className="text-[11px] text-[#C5C6C7] break-all">{receipt.hash}</code>
                      </div>
                      {receipt.signature && (
                        <div>
                          <span className="block text-[10px] text-[#C5C6C7] opacity-50 mb-1">Signature</span>
                          <code className="text-[11px] text-[#C5C6C7] break-all">{receipt.signature}</code>
                        </div>
                      )}
                    </div>
                  </section>
                  
                  <section>
                    <h4 className="flex items-center gap-2 text-[10px] font-bold text-[#C5C6C7] mb-3 opacity-50 uppercase tracking-widest">
                      <FileJson className="h-3 w-3" />
                      Raw Receipt Payload
                    </h4>
                    <pre className="text-[11px] font-mono text-[#C5C6C7] bg-[#1F2833]/50 p-3 rounded border border-[#384656] overflow-x-auto">
                      {JSON.stringify(receipt, null, 2)}
                    </pre>
                  </section>
                </div>
              ) : (
                <div className="text-xs text-red-400">Error: Receipt could not be resolved.</div>
              )}
            </TabsContent>

            <TabsContent value="exhibits" className="p-4 m-0 space-y-6">
              <section>
                <h4 className="text-[10px] font-bold text-[#C5C6C7] mb-3 opacity-50 uppercase tracking-widest">
                  Input Exhibits ({entry.inputs.length})
                </h4>
                <div className="flex flex-col gap-2">
                  {entry.inputs.length > 0 ? (
                    entry.inputs.map((rhid) => (
                      <RHIDBadge key={rhid} rhid={rhid} entry={resolveRhid(rhid, manifest)} />
                    ))
                  ) : (
                    <span className="text-xs text-[#C5C6C7] opacity-40 italic">No inputs referenced</span>
                  )}
                </div>
              </section>

              <section>
                <h4 className="text-[10px] font-bold text-[#C5C6C7] mb-3 opacity-50 uppercase tracking-widest">
                  Output Exhibits ({entry.outputs.length})
                </h4>
                <div className="flex flex-col gap-2">
                  {entry.outputs.length > 0 ? (
                    entry.outputs.map((rhid) => (
                      <RHIDBadge key={rhid} rhid={rhid} entry={resolveRhid(rhid, manifest)} />
                    ))
                  ) : (
                    <span className="text-xs text-[#C5C6C7] opacity-40 italic">No outputs produced</span>
                  )}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="artifacts" className="p-4 m-0 space-y-4">
              <div className="flex flex-col gap-4">
                {[...entry.inputs, ...entry.outputs].filter(r => r.startsWith('rhid:artifact')).map(rhid => (
                  <ArtifactPreviewItem key={rhid} rhid={rhid} manifest={manifest} scenario={scenario} />
                ))}
              </div>
              {([...entry.inputs, ...entry.outputs].filter(r => r.startsWith('rhid:artifact')).length === 0) && (
                <div className="text-xs text-[#C5C6C7] opacity-40 italic">No renderable artifacts associated with this action.</div>
              )}
            </TabsContent>

            <TabsContent value="manifest" className="p-4 m-0">
              <section>
                <h4 className="text-[10px] font-bold text-[#C5C6C7] mb-3 opacity-50 uppercase tracking-widest">
                  Proof Manifest (Chain of Custody)
                </h4>
                <div className="space-y-2">
                  {manifest?.entries.map((mEntry: ManifestEntry) => (
                    <div key={mEntry.rhid} className="p-2 rounded border border-[#384656] bg-[#1F2833]/20 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-[#66FCF1]">{mEntry.rhid}</span>
                        <Badge variant="neutral" className="text-[9px] h-3.5 px-1">{mEntry.content_type}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#C5C6C7] opacity-50 font-mono">
                        <span className="truncate mr-4">{mEntry.sha256}</span>
                        <span>{mEntry.size_bytes} B</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </TabsContent>
          </ScrollArea>
        </div>
      </Tabs>
    </div>
  );
}

function ArtifactPreviewItem({ rhid, manifest, scenario }: { rhid: string, manifest: Manifest | null, scenario: string }) {
  const entry = resolveRhid(rhid, manifest);
  
  const { data: content, isLoading } = useQuery({
    queryKey: ["artifact-content", rhid, scenario],
    enabled: !!entry,
    queryFn: async () => {
      const safeRhid = rhid.replace(/:/g, "_");
      const res = await fetch(`/mock/pt013/${scenario}/evidence/objects/${safeRhid}.dat`);
      if (!res.ok) return "Content failed to load.";
      return res.text();
    }
  });

  if (!entry) return null;

  return (
    <div className="rounded border border-[#384656] overflow-hidden">
      <div className="bg-[#1F2833]/50 p-2 border-b border-[#384656] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-3 w-3 text-[#66FCF1]" />
          <span className="font-mono text-[11px] text-[#C5C6C7]">{rhid}</span>
        </div>
        <Badge variant="neutral" className="text-[10px] h-4 py-0">{entry.contentType}</Badge>
      </div>
      <div className="p-3 bg-black/40">
        {isLoading ? (
          <div className="animate-pulse h-12 bg-[#384656]/20 rounded" />
        ) : (
          <pre className="text-[11px] text-[#C5C6C7]/80 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
            {content}
          </pre>
        )}
      </div>
    </div>
  )
}
