# UI Evidence Bundles (PT-013)

This document describes how the Keon Control UI utilizes PT-013 evidence bundles for development, testing, and high-assurance verification.

## Bundle Structure
Evidence bundles are stored as directory structures in `/public/mock/pt013/`. Each bundle represents a specific execution run or scenario.

```text
/public/mock/pt013/<bundle_id>/
├── collaboration_ledger.jsonl    # The Action Timeline (Docket)
├── evidence/
│   ├── manifest.json            # Chain-of-custody index (RHID -> SHA256)
│   ├── receipts/                # JSON receipts for each ledger action
│   └── objects/                 # Artifact content (.md, .json, .txt)
└── artifacts/                   # High-level run metadata
```

## Available Scenarios (Fixtures)
- `happy`: Standard successful run with complete provenance and a sealed pack.
- `gate_deny`: A run where the Federation Core (FC) policy gate issued a DENIED ruling.
- `missing_manifest`: A "tampered" bundle where a ledger action references an RHID that is not present in the manifest (triggers BLOCKED state in UI).

## Adding a New Run
To generate a new fixture bundle, use the internal generation script:

```bash
npx tsx scripts/generate-pt013-mock.ts
```

This script produces deterministic bundles based on the `BundleGenerator` class. To add a new scenario:
1. Edit `scripts/generate-pt013-mock.ts`.
2. Add a new scenario block at the bottom of the file.
3. Define actors, objects, and actions.
4. Run the generator script to update the public fixtures.

## UI Integration
The `CourtroomClient` and `ActionTimeline` components load these bundles via standardized fetch patterns. 
- **RHID Resolution**: Handled by `src/lib/rhid-resolver.ts`.
- **Mapping**: Snake-case contract data is converted to camelCase via `src/lib/mappers.ts`.
