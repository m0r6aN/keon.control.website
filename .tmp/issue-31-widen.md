## Scope widening — Collective lane parse damage extends beyond `mocks.ts`

Surfaced while triaging CI on `origin/main` (red for 5+ consecutive runs). The botched merge in `c1431eb` left three additional Collective files with parsing errors, not just `mocks.ts`. All four fail the `Lint & Build Check` workflow.

### Additional files affected (all on `main` at `2f954ad`)

| File | Line | ESLint error |
|---|---|---|
| `src/lib/collective/mocks.ts` | 220:1 | `Parsing error: ',' expected` (original) |
| `src/lib/collective/queryKeys.ts` | 57:0 | `Parsing error: Merge conflict marker encountered` |
| `src/lib/collective/normalization.ts` | 21:0 | `Parsing error: Identifier expected` |
| `src/lib/collective/repositories.ts` | 48:0 | `Parsing error: Identifier expected` |

### Evidence

**`queryKeys.ts` — unresolved merge conflict markers still in tree (lines 57–74):**

```
<<<<<<< HEAD
...
=======
...
>>>>>>> origin/main
```

**`normalization.ts:20` — unterminated `import type` block (missing `}` before the next declaration):**

```ts
import type {
  BadgePresentation,
  DispositionPresentation,
// missing closing `}` — parser hits `export function` on L21

export function presentExecutionEligibilityStatus(...) { ... }
```

**`repositories.ts:47` — same pattern (unterminated `import type`):**

```ts
  AuthorityActivationListItem,
  DelegatedAuthorityGrantDetail,
  DelegatedAuthorityGrantListItem,
  DelegatedAuthorityLineageNode,
// missing closing `}` — parser hits next `import` on L48
import { presentExecutionEligibilityStatus } from "./normalization";
```

### Secondary Collective lint failures (same lane, non-parse)

These unblock once the parse errors are fixed, but should be addressed in the same Collective PR:

- `src/components/collective/collective-live-run-page.tsx:22:7` — `setState` in effect (cascading renders)
- `src/components/collective/collective-live-runs-page.tsx:13:5` — `setState` in effect (cascading renders)

### Blast radius

- `/collective/*` routes remain broken
- `Lint & Build Check` red on every PR targeting `main`
- Onboarding, Cockpit (hooks), Control API, Billing — all independent

### Repair guidance (unchanged from original issue)

1. Restore `queryKeys.ts` by resolving the merge conflict — pick the side that matches current contracts; do not invent identifiers.
2. Close the `import type` blocks in `normalization.ts` and `repositories.ts`. The missing identifier list is visible in the preceding lines; restore the closing `}` only — no speculative additions.
3. Apply minimal parse-safe stubs for `mocks.ts` as originally proposed.
4. Fix the two `setState`-in-effect warnings in `collective-live-run*-page.tsx` using the `react.dev/learn/you-might-not-need-an-effect` pattern (derive from render or use `useSyncExternalStore`).

All work in one dedicated branch off `origin/main`, in the Collective lane only (AGENTS §6.2).
