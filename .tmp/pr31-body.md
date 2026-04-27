## Summary

Repairs the Collective lib layer damaged by the botched merge `c1431eb` ("chore: merge main into claude/nice-saha, resolve conflicts"). That merge produced a buildable-looking but semantically broken tree:

- `src/lib/collective/queryKeys.ts` — **3 unresolved conflict markers** at L57/58/74 (caught by the Conflict Marker Guard from #33).
- `src/lib/collective/normalization.ts` — truncated from 174 → 25 lines; **15 of 17 `presentXxx` functions dropped**.
- `src/lib/collective/mocks.ts` — truncated from 1998 → 1061 lines; mid-file concatenation collapsed the `delegationSummaries` array into the `delegationDetails` Map, producing `TS1005` on the stitched closers.
- `src/lib/collective/repositories.ts` — truncated from 622 → 422 lines; multiple `create*Repository` factories and provider interfaces dropped.

Nothing since `c1431eb` has modified these four files (verified via `git log c1431eb..origin/main -- src/lib/collective/{mocks,normalization,queryKeys,repositories}.ts` → empty). The broken state has been sitting on `main` unchanged.

## Fix

Restored all four files verbatim from commit `2e8adb5` — the `main`-side parent of the botched merge and the intended target of the merge resolution. `2e8adb5`'s versions are the unified/consolidated structure that `index.ts` already exports (confirmed: current `index.ts` and `2e8adb5`'s `index.ts` differ only by the post-merge addition of `export * from "./ui-bridge"`).

```
git checkout 2e8adb5 -- \
  src/lib/collective/mocks.ts \
  src/lib/collective/normalization.ts \
  src/lib/collective/queryKeys.ts \
  src/lib/collective/repositories.ts
```

## Validation

**`git diff --stat`**

```
 src/lib/collective/mocks.ts         | 994 +++++++++++++++++++++++++++++++++++-
 src/lib/collective/normalization.ts | 168 ++++++
 src/lib/collective/queryKeys.ts     |   3 -
 src/lib/collective/repositories.ts  | 221 ++++++++
 4 files changed, 1358 insertions(+), 28 deletions(-)
```

**Files touched** (4; Collective lane only — AGENTS §6.1):

- `src/lib/collective/mocks.ts`
- `src/lib/collective/normalization.ts`
- `src/lib/collective/queryKeys.ts`
- `src/lib/collective/repositories.ts`

**Conflict Marker Guard (#33) — local simulation using the workflow's exact regex**

```
pattern='^(<<<<<<<( |$)|=======$|>>>>>>>( |$))'
git grep -nE "$pattern" -- ':!.github/workflows'
→ PASS: no conflict markers detected in tracked files.
```

**TypeScript parse check** on the four restored files

```
pnpm exec tsc --noEmit
→ no diagnostics under src/lib/collective/{mocks,normalization,queryKeys,repositories}.ts
```

**No cross-lane changes introduced.** Cockpit (#32) debt and unrelated lint warnings remain untouched per lane isolation.

## Scope discipline (AGENTS §6.1 / §6.2 / §6.3 / §7.1)

- Branch cut from `origin/main @ 17e29dd`.
- No stacked branches, no cross-lane edits.
- No invented content — bytes came from `2e8adb5`, which is already part of the repo history.
- No temporary allowlists, no CI bypasses, no changes to `.github/workflows/`.
- After merge: Conflict Marker Guard turns green on `main`.
