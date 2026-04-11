# Integration Selection Step — Design Spec

**Date:** 2026-04-11
**Status:** Approved
**Scope:** `keon.control.website` — onboarding flow

---

## Summary

Add a new **Integration Selection** step to the onboarding wizard, positioned between Access Confirmation and Guardrails. The step presents the two operating models — BYO AI and Keon Collective — as an informational decision frame with a micro-animated deliberation preview and a "new tab" showcase CTA for Collective.

---

## Onboarding Flow (after)

```
1. DEFINE_GOALS       — goals step (unchanged)
2. CONFIRM_ACCESS     — workspace + environment (unchanged)
3. SELECT_INTEGRATION — new: operating model frame  ← this spec
4. SET_GUARDRAILS     — guardrail preset (unchanged)
5. READY              — complete step (unchanged)
```

The step is **informational** — no required choice is enforced, but the state machine captures both completion (for routing) and the user's optional card selection (for future personalization and analytics).

---

## State Machine Changes

### `src/lib/onboarding/state-machine.ts`

**`onboardingSteps` array** — insert `"SELECT_INTEGRATION"` between `CONFIRM_ACCESS` and `SET_GUARDRAILS`:

```ts
export const onboardingSteps = [
  "WELCOME",
  "DEFINE_GOALS",
  "CONFIRM_ACCESS",
  "SELECT_INTEGRATION",  // new
  "SET_GUARDRAILS",
  "READY",
] as const;
```

**`OnboardingState`** — add two fields:

```ts
integrationStepCompleted: boolean;                          // set true when user clicks Continue
selectedIntegrationMode?: "BYO_AI" | "COLLECTIVE";         // optional — set when user clicks a card
```

`selectedIntegrationMode` is purely informational: clicking a card sets it, but Continue works with or without a selection. No card is pre-selected on render.

**New event:**

```ts
| { type: "ADVANCE_INTEGRATION"; payload?: { selectedMode?: "BYO_AI" | "COLLECTIVE" } }
```

**Transition: `CONFIRM_ACCESS`** — advance to `SELECT_INTEGRATION` (not `SET_GUARDRAILS`):

```ts
case "CONFIRM_ACCESS": {
  // ...existing guard...
  return { ...state, workspaceId: ..., currentStep: "SELECT_INTEGRATION" };
}
```

**New transition: `ADVANCE_INTEGRATION`:**

```ts
case "ADVANCE_INTEGRATION": {
  if (!state.workspaceId) return state;
  return {
    ...state,
    integrationStepCompleted: true,
    selectedIntegrationMode: event.payload?.selectedMode ?? state.selectedIntegrationMode,
    currentStep: "SET_GUARDRAILS",
  };
}
```

**`getNextRequiredStep`** — insert integration check:

```ts
if (!state.integrationStepCompleted) return "SELECT_INTEGRATION";
```
(between workspaceId check and guardrailPreset check)

**`defaultOnboardingState`** — add fields:

```ts
integrationStepCompleted: false,
selectedIntegrationMode: undefined,
```

**`sanitizeOnboardingState`** — hydrate both fields:

```ts
const integrationStepCompleted = input?.integrationStepCompleted === true;
const selectedIntegrationMode =
  input?.selectedIntegrationMode === "BYO_AI" || input?.selectedIntegrationMode === "COLLECTIVE"
    ? input.selectedIntegrationMode
    : undefined;
```

**`getRequiredCompletionCount`** — this step does NOT increment the completion counter (it's infrastructure-step, not data-collection). The "3/3 required steps" display stays counting goals, access, guardrails.

---

## Experience / Routing Changes

### `src/lib/onboarding/experience.ts`

**`SetupRouteKey`** — add `"integration"`:

```ts
export type SetupRouteKey = "welcome" | "goals" | "access" | "integration" | "guardrails" | "ready";
```

**`stepRouteMap`** — add entry:

```ts
SELECT_INTEGRATION: "integration",
```

**`routeStepMap`** — add entry **in position between `access` and `guardrails`** (insertion order matters — `clampVisibleStep` uses `Object.values(routeStepMap)` for step ordering):

```ts
// Must be inserted between access and guardrails entries:
integration: "SELECT_INTEGRATION",
```

**`stepLabels`** — add:

```ts
SELECT_INTEGRATION: "Choose operating model",
```

**`REQUIRED_ITEMS`** — no change. This step is not surfaced in the setup checklist.

**`getCurrentBlocker`** — add case:

```ts
case "SELECT_INTEGRATION":
  return "Review how Keon governs decisions before continuing.";
```

---

## Component

### `src/components/onboarding/steps/integration-selection-step.tsx` (new file)

**Props / dependencies:**
- `useOnboardingState()` for `dispatch({ type: "ADVANCE_INTEGRATION", payload: { selectedMode } })`
- `useRouter()` for `router.replace("/setup?step=guardrails")` after dispatch

**Card selection behaviour:**
- Local `useState<"BYO_AI" | "COLLECTIVE" | undefined>` — no card selected on mount
- Clicking a card toggles selection (clicking the already-selected card deselects it)
- Selected card gets a stronger active border; unselected cards dim slightly
- Continue dispatches the current selection (or `undefined` if none) — **Continue is never disabled**

**Layout:**
- `StepShell` wrapper with eyebrow "Step 3 of 5", title, description
- Two-column card grid with center divider
- Footer: Continue button + reassurance hint

**Header copy:**
- Title: `"How do you want governed decisions to happen?"`
- Description: `"This is not a vendor choice. It determines how Keon evaluates, challenges, and seals every decision."`

**Super-labels above cards:**
- Left: `GOVERNANCE LAYER`
- Right: `DECISION SYSTEM`

### BYO AI Card

- Tag: `● BYO AI` (green)
- Title: `"Govern the AI you already use"`
- Anchor: `"Best for existing AI stacks"`
- Body: route existing models/providers through MCP Gateway; policy-evaluated and receipted without replacing your stack
- Features (4): connect via MCP Gateway / fastest path to governed execution / no changes to model setup / policy-bound receipt-verified output

### Collective Card

- Tag: `● Keon Collective` (teal)
- Title: `"Deliberation, not generation"`
- Anchor: `"For high-stakes decisions that demand more than one output"`
- Body: replace single-model output with governed deliberation; proposals branch, face adversarial challenge, converge, collapse into a cryptographically sealed outcome
- Features (4): branching analysis / adversarial challenge phase / convergence via weighted vote / cryptographically sealed append-only outcome
- Visual weight: slightly stronger border (`rgba(126,232,224,0.28)`) and gradient background vs BYO AI card

#### Micro-preview (inside Collective card)

A CSS-only animated mini deliberation flow — no JS animation library, no canvas.

**Nodes (top to bottom):**
1. `Intent submitted` — teal bordered pill
2. Horizontal spread bar → three branch nodes
   - `Branch A — Proceed` (dim, stagger-reveal)
   - `Adversarial Challenge` (amber, slow pulse glow — `adv-pulse` keyframe)
   - `Branch C — Synthesize` (dim, stagger-reveal)
3. Horizontal converge bar
4. `Sealed · Receipt issued` — teal, snap animation on loop

**Animation timing:**
- Branch reveal stagger: `120–180ms` offset between branches
- Adversarial pulse: `2.8s` ease-in-out, slow and ominous (not flashy)
- Traveling dot (intent → branches): `3.6s` loop
- Seal snap: quick scale-up (`80–120ms` spring), then soft glow linger

**Optional addition (phase 2):** label `"Execution authorized"` beneath the sealed node — bridges decision → real-world consequence. Not in this pass.

#### Learn More CTA

- Label: `"Watch a decision unfold ↗"`
- Behavior: `window.open(collectiveShowcaseUrl, "_blank", "noopener,noreferrer")`
- Target URL: `/collective/showcase` (new page — see below)
- Styled as monospace ghost button (teal border, subtle bg)

### Footer

- Primary action: `<Button size="lg">Continue</Button>`
- On click: `dispatch({ type: "ADVANCE_INTEGRATION" })` then `router.replace("/setup?step=guardrails")`
- Hint text: `"You can start with BYO AI and upgrade later."`

---

## `OnboardingFlow.tsx` Changes

Add `SELECT_INTEGRATION` case:

```tsx
case "SELECT_INTEGRATION":
  return <IntegrationSelectionStep />;
```

---

## Collective Showcase Page

### Route: `/collective/showcase`

**Purpose:** The "new tab" destination opened by "Watch a decision unfold ↗". A standalone read-only showcase that introduces Keon Collective — the content from the `collective-with-imagery.html` mockup, adapted as a Next.js page.

**File:** `src/app/collective/showcase/page.tsx`

**Shell:** Topbar-only layout — no left sidebar. The sidebar is deliberately removed so the page feels like stepping into a mode rather than navigating to a standard page. The widened canvas lets the visuals breathe and reinforces that this is something qualitatively different. The topbar stays for continuity (user knows they're in the product) and provides the close action.

**Close behavior:** A `"← Close tab"` button at the top calls `window.close()`. If `window.close()` is blocked (not opened by script), falls back to `router.back()`.

**Content sections (matching mockup):**
1. Hero: `● KEON COLLECTIVE · GROUP COGNITION LAYER` eyebrow, `"Decisions that transcend the individual"` headline, description, feature tags, orbital 3D visual (`/images/keon-orbit-2.jpg` or similar)
2. Metrics bar: active deliberations / sealed decisions / governance coverage / ungoverned actions
3. Lifecycle diagram: 6-step horizontal track (01 Proposal → 02 Branch → 03 Adversarial → 04 Vote → 05 Collapse → 06 Sealed)
4. Live deliberation tree: Branch A / B (adversarial) / C visualization with sealed receipt
5. Optional: "Activate Collective →" CTA linking to `/collective`

**Note:** The showcase is read-only and contains no real API calls. It uses static/demo content only.

---

## Files Changed Summary

| File | Change |
|------|--------|
| `src/lib/onboarding/state-machine.ts` | Add `SELECT_INTEGRATION` step, `ADVANCE_INTEGRATION` event, `integrationStepCompleted` + `selectedIntegrationMode` state fields |
| `src/lib/onboarding/experience.ts` | Add `"integration"` route key, step/route maps, step label, blocker message |
| `src/components/onboarding/OnboardingFlow.tsx` | Add `SELECT_INTEGRATION` case |
| `src/components/onboarding/steps/integration-selection-step.tsx` | **New** — full step component with cards, micro-preview, CTA |
| `src/app/collective/showcase/page.tsx` | **New** — Collective showcase page (new-tab destination) |

---

## What Does NOT Change

- The existing `CONFIRM_ACCESS` state payload shape (workspaceId)
- The `APPLY_GUARDRAILS` transition
- The setup checklist item count (3 required items)
- The `complete-step.tsx` goal labels (separate cleanup task)
- The `/collective` dashboard page

---

## Visual Quality Bar

When a user lands on this step, the reaction should be:

> "I immediately understand the difference — and now I'm curious about Collective."

Not:

> "Looks cool, but I'm not really sure what changed."

---

## Out of Scope (This Pass)

- "Execution authorized" label under sealed node (Phase 2)
- Micro-preview reduced-motion after 1–2 loops / pause-on-hover (Phase 2)
- "Viewed" indicator on Collective card after returning from new tab (Phase 2)
- Analytics instrumentation for "Watch a decision unfold" click-through rate (Phase 2)
- Cortex showcase page (separate spec)
- Public site `/experience-keon` demo mode
