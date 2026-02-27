import { EvidencePackTabs } from "@/components/evidence/evidence-pack-tabs";
import { DataValue } from "@/components/ui/data-value";

interface EvidencePackPageProps {
  params: {
    pack_hash: string;
  };
}

export default function EvidencePackDetailPage({ params }: EvidencePackPageProps) {
  const packHash = params.pack_hash;
  const packSha = packHash.startsWith("sha256:") ? packHash.slice(7) : packHash;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl text-[--flash]">Evidence Pack</h1>
        <p className="text-sm text-[--steel]">Hash-addressed pack summary and proof fields.</p>
      </header>

      <section className="grid gap-6 rounded border border-[#384656] bg-[#0E1118] p-5 md:grid-cols-2">
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[--steel]">Pack hash</p>
          <DataValue value={packHash} copyable variant="hash" />
        </div>
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[--steel]">Pack SHA-256</p>
          <DataValue value={packSha} variant="hash" />
        </div>
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[--steel]">Created</p>
          <p className="text-sm text-[--steel]">See the exported proof JSON for timestamps.</p>
        </div>
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[--steel]">Trust bundle</p>
          <DataValue value="Refer to trust bundle in proof JSON." variant="text" />
        </div>
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[--steel]">Signatures</p>
          <DataValue value="Manifest + receipt signatures (see proof)" variant="text" />
        </div>
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[--steel]">Verification status</p>
          <p className="text-sm text-[--steel]">Upload proof at /evidence/verify to confirm results.</p>
        </div>
      </section>

      <EvidencePackTabs packHash={packHash} />
    </div>
  );
}
