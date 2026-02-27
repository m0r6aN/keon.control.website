import Link from "next/link";
import { evidenceDocRegistry } from "@/lib/evidence-docs";
import { GoldenPathStep } from "@/components/evidence/golden-path-step";

const docSlugs = ["start-here", "buyer-wow", "api-surface", "run-golden-path", "verify-pack"];

export default function GoldenPathPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-3xl text-[--flash]">Golden Path</h1>
        <p className="text-sm text-[--steel]">Single-command proof run. Repeatable. Inspectable.</p>
      </header>

      <section className="space-y-2 rounded border border-[#384656] bg-[#0E1118] p-5">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-[--steel]">Prerequisites</p>
        <p className="text-sm text-[--steel]">
          Use the repository entrypoint and follow the documented steps.
        </p>
      </section>

      <section className="space-y-4">
        <GoldenPathStep
          step={1}
          title="Run the Golden Path"
          command="pwsh -ExecutionPolicy Bypass -File .\\samples\\buyer-wow\\run.ps1"
          lookFor="Evidence Pack SHA-256 and pack_hash"
          whyItMatters="The pack is hash-addressed and reproducible from inputs."
        />
        <GoldenPathStep
          step={2}
          title="Verify the Pack"
          command="pwsh -ExecutionPolicy Bypass -File .\\samples\\golden-path\\verify-pack.ps1 -ExportProofPath .\\samples\\buyer-wow\\out\\verification-proof.json"
          lookFor="Signature and trust bundle validation"
          whyItMatters="Verification enforces trust material, not just metadata."
        />
        <GoldenPathStep
          step={3}
          title="Export the External Proof"
          command="dotnet run --project src/Keon.Cli -- verify-pack --path <pack.zip> --export-proof .\\samples\\buyer-wow\\out\\verification-proof.json"
          lookFor="Verification proof JSON output"
          whyItMatters="A third party can validate results without your runtime."
        />
      </section>

      <section className="rounded border border-[#384656] bg-[#0E1118] p-5">
        <p className="text-sm text-[--steel]">
          If you change inputs and rerun, the outputs change coherently and verification remains consistent.
        </p>
      </section>

      <section className="space-y-4">
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-[--steel]">Source documents</div>
        <div className="grid gap-4 md:grid-cols-2">
          {evidenceDocRegistry
            .filter((doc) => docSlugs.includes(doc.slug))
            .map((doc) => (
              <Link
                key={doc.slug}
                href={`/evidence/source/${doc.slug}`}
                className="flex flex-col justify-between rounded border border-[#384656] bg-[#0B0C10] p-4 transition-colors hover:border-[--reactor-blue]"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[--steel]">{doc.label}</p>
                  <p className="text-sm text-[--flash]">{doc.description}</p>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-[--reactor-glow]">View</span>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
