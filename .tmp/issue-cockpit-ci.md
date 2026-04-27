## Cockpit lane CI debt — React Hook rule violations blocking `Lint & Build Check`

`origin/main` has failed `Lint & Build Check` on the last 5+ runs. Parse errors in the Collective lane are tracked in #31; this issue covers the **Cockpit lane** violations that bleed into CI even after the Collective lane is green.

All errors reproduce on `main @ 2f954ad` (post-#29). No Cockpit source is touched by #29 or #31 — this debt is pre-existing.

### Error inventory (9 errors across 8 files)

| # | File | Line:Col | Rule |
|---|---|---|---|
| 1 | `src/components/cockpit/cockpit-shell.tsx` | 23:3 | `react-hooks/rules-of-hooks` — `React.useEffect` called conditionally |
| 2 | `src/components/cockpit/evidence/use-evidence-data.ts` | 67:7 | `react-hooks/set-state-in-effect` |
| 3 | `src/components/cockpit/governance/governance-drift-section.tsx` | 54:21 | `@typescript-eslint/no-explicit-any` |
| 4 | `src/components/cockpit/horizon/causal-pulse.tsx` | 35:7 | `react-hooks/set-state-in-effect` |
| 5 | `src/components/cockpit/horizon/use-horizon-data.ts` | 86:7 | `react-hooks/set-state-in-effect` |
| 6 | `src/components/cockpit/horizon/use-horizon-data.ts` | 109:5 | `react-hooks/set-state-in-effect` |
| 7 | `src/components/cockpit/theater/alerts-mode.tsx` | 36:5 | `react-hooks/set-state-in-effect` |
| 8 | `src/components/cockpit/theater/executions-mode.tsx` | 45:5 | `react-hooks/set-state-in-effect` |
| 9 | `src/components/cockpit/theater/incidents-mode.tsx` | 41:5 | `react-hooks/set-state-in-effect` |
| 10 | `tests/unit/lib/cockpit/focus-reducer.test.ts` | 347:72 | `@typescript-eslint/no-explicit-any` |

### Root cause

React 19 / newer `eslint-plugin-react-hooks` enforces two rules that this code pre-dates:

- **`rules-of-hooks`**: Hooks must run in the same order on every render. `cockpit-shell.tsx:23` calls `React.useEffect` inside a conditional branch.
- **`set-state-in-effect`** (new in the React 19 plugin): Synchronous `setState` inside a `useEffect` body triggers cascading renders. Guidance: <https://react.dev/learn/you-might-not-need-an-effect>.

Neither rule change was paired with a codebase sweep — the Cockpit lane was left behind.

### Blast radius

- `Lint & Build Check` blocks every merge into `main` (PR #29 was admin-merged to bypass).
- No runtime regression is proven; these are static-analysis failures. But `rules-of-hooks` violations are genuine bugs — the conditional effect in `cockpit-shell.tsx` can crash the component if the branch flips across renders.
- Isolated to `src/components/cockpit/**`, `src/lib/cockpit/**`, and `tests/unit/lib/cockpit/**`. Does not affect Control API, Onboarding, Billing, or Collective.

### Repair guidance

**One dedicated branch, Cockpit lane only (AGENTS §6.1, §6.2).**

1. `cockpit-shell.tsx:23` — lift the `useEffect` out of the conditional. The branch condition should gate the *body* of the effect, not the hook call itself.
2. For each `set-state-in-effect` violation, apply one of the refactors from the React 19 guidance:
   - If state is derivable from props → compute in render, drop the effect.
   - If synchronizing with an external store → use `useSyncExternalStore`.
   - If event-driven → move the `setState` into the event handler.
   - If truly effect-driven → wrap in `queueMicrotask` / `startTransition` only as a last resort and document why.
3. `no-explicit-any` in `governance-drift-section.tsx:54` and `focus-reducer.test.ts:347` — replace with the narrow type from `@/lib/cockpit/**` contracts. Do not widen to `unknown` without a type guard.

### Validation

- `pnpm lint` (or equivalent) must report 0 errors, 0 warnings for these files.
- No functional changes to Cockpit UI behavior — this is a mechanical refactor.
- CI `Lint & Build Check` must pass on the branch before merge.

### Out of scope (track separately)

- Parse errors in `src/lib/collective/**` — #31
- `setState`-in-effect in `src/components/collective/collective-live-run*-page.tsx` — folded into #31 (same Collective lane)
