## What

Adds a `hygiene` job to `control-website-ci.yml` that fails hard when tracked files contain unresolved git conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).

## Why

Issue #31 triage surfaced live conflict markers in `src/lib/collective/queryKeys.ts` on `main` — they slipped past lint, build, and review. Conflict markers must fail CI independently of the linter, because parse errors mask them and other broken files can swallow the signal.

## How

- New job `hygiene` runs in parallel with `ci` on push + non-closed PR events.
- `git grep -nE` matches lines that are **exactly** a conflict marker (anchored to line start with escape-free pattern), so prose mentioning `<<<<<<<` in docs will not trip it.
- `.github/workflows` is excluded from the scan so the guardrail does not match its own regex definition.
- Clean repo prints `Clean — no conflict markers detected.` Dirty repo echoes `::error::` with file:line list and exits 1.

## Expected CI Behavior on this PR

**Hygiene job should FAIL** because `src/lib/collective/queryKeys.ts` on `main` still contains unresolved markers (tracked in #31). That failure is the proof the guardrail works. Once #31 lands and removes the markers, CI returns green.

## Scope

- One file changed: `.github/workflows/control-website-ci.yml` (+19 lines)
- No code edits, no cross-lane touch, no behavioral change to `ci` / `deploy` / `close_pull_request` jobs
- Branched from `origin/main` at `2f954ad`

## Validation

```
git diff --stat main
 .github/workflows/control-website-ci.yml | 19 +++++++++++++++++++
 1 file changed, 19 insertions(+)
```

## Related

- Issue #31 — conflict markers in Collective lane (this PR's failure is expected until #31 merges)
- Issue #32 — Cockpit CI debt (separate lane)
