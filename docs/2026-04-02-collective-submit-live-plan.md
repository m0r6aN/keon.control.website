# 2026-04-02 Collective Submit Live Plan

## Architecture findings

- `src/app/collective/*` already provides strong operator observation surfaces, but the existing overview explicitly says observation-only and the current Collective API routes are mock-backed.
- `keon.collective` already exposes the canonical host seam `POST /intents` via `ProcessIntentAsync`, which returns real inert cognition artifacts including runtime trace, evaluated branches, review, heat, collapse, and witness truth.
- The current host does **not** expose a corresponding read model endpoint for `GET /intents/{intentId}` or an equivalent run lookup by intent or correlation.
- Existing receipt, courtroom, and runtime drilldown pages inside `keon.control.website` are still fixture-backed or projection-only, so they cannot be used as live drilldowns without misrepresenting truth.

## Chosen implementation

1. Add a server-only website integration boundary at `/api/collective/live-runs`.
2. Validate operator submission input with explicit tenant, actor, actor-type, and correlation requirements.
3. Proxy the request directly to the real Collective host `POST /intents` endpoint.
4. Fail closed if the returned host result is missing required anchors for a completed cognition run:
   - intent identity
   - selected branch identity
   - winning branch
   - collapse lineage containing the selected branch
   - review anchor
   - heat anchor
   - witness truth package consistent with review/heat/collapse
5. Render the returned host result as a live operator view under `/collective/live/[intentId]`.
6. Preserve route legibility without inventing a second source of truth:
   - the browser persists the canonical host result and a recent-run index in local storage
   - `/collective/runs` exposes recoverable recent runs keyed by intent and correlation
   - `/api/collective/live-runs/[intentId]` attempts durable host lookup and returns structured `NOT_YET_AVAILABLE` when the backend seam is absent
   - if the route is reopened without a durable backend result, the page still fails closed and states exactly why

## Why this is the thinnest lawful path

- The website does not duplicate Collective cognition logic.
- The website does not bypass the governed boundary.
- The website does not fabricate governance or execution receipts.
- The website does not introduce a fake persistence layer or silent mock fallback.

## Explicitly unavailable on this pass

- True backend-owned historical run retrieval, because the host still lacks a lawful run retrieval endpoint.
- Governed authorization and reality-plane execution receipts for live Collective runs, because this host seam returns inert cognition only and the existing website receipt/courtroom pages remain mock-backed.

## Next backend dependency

- Expose a read endpoint from `keon.collective` keyed by intent or correlation so `/collective/live/[intentId]` can be fully reload-safe without any browser-session cache.
- Expose lawful governed authorization / execution receipt lookup for live Collective-originated reality actions before linking this workflow into runtime or courtroom drilldowns.
