# KEON SYSTEMS — AGENTS OPERATING STANDARD
Version: v1.0
Status: ENFORCED

This document defines how all agents (Claude, Codex, GPT, etc.) must operate when working on the Keon Systems web experience.

This is NOT guidance.
This is a contract.

Violations must result in rejection of work.

---

# 1. CORE PRINCIPLE

The Keon website is NOT a marketing site.

It is a **deterministic interface to a governed execution system**.

All pages must reflect real system behavior grounded in:

- Doctrine
- Contracts
- CAES standard

If a page cannot be mapped to reality, it is invalid.

---

# 2. CANONICAL SOURCES (NON-NEGOTIABLE)

All work must align with:

- KEON COLLECTIVE DOCTRINE v1.0
- KEON COLLECTIVE CANONICAL CONTRACTS v0.1
- KEON COLLECTIVE COMMON INTERFACES v0.1
- CAES (Constitutional AI Execution Standard)

Key truths:

- Thought is free. Effects are governed.
- Receipts outrank stories.
- Missing anchors fail closed.
- Cognition ≠ execution authority.

If UI contradicts these → UI is wrong.

---

# 3. PAGE CONTRACT SYSTEM

Every page MUST define:

## 3.1 Purpose
What job this page performs.

## 3.2 Primary Question
The ONE question this page answers.

## 3.3 Allowed Concepts
What is permitted on this page.

## 3.4 Forbidden Concepts
What must NOT appear.

---

## Example

### /control

Purpose:
Operational command surface for governed execution.

Primary Question:
"What is happening right now?"

Allowed:
- runtime boundary
- execution state
- decisions
- receipts
- ledger
- causal chain

Forbidden:
- collective explanation
- cortex explanation
- architecture philosophy
- long-form narrative

---

# 4. ARCHITECTURAL INVARIANTS (MUST HOLD)

## 4.1 Plane Purity

Pages must not mix planes:

- Control → Reality Plane
- Collective → Cognition Plane
- Cortex → Truth Plane

Violation = automatic rejection

---

## 4.2 Show > Explain

If something can be interactive:
→ it MUST be interactive

If it is static explanation:
→ it likely belongs elsewhere

---

## 4.3 One Job Per Page

Each page answers ONE question only.

No multi-purpose pages.

---

## 4.4 No Redundancy

Content must exist in ONE place.

Other pages may reference it, not duplicate it.

---

## 4.5 Operator First

Every page must answer:

"What can the operator DO here?"

---

# 5. PAGE LOCKING SYSTEM

Once a page is approved:

/page-name → LOCKED v1

Rules:

- No edits without explicit unlock directive
- All changes require version bump (v2, v3…)
- Agents may NOT “improve” locked pages

---

# 6. REPO HYGIENE RULES

## 6.1 Branching

- Always branch from origin/main
- No stacked branches
- No cross-lane edits

## 6.2 Scope Discipline

Each PR must:
- affect ONE page or ONE system only
- not introduce unrelated changes

## 6.3 Diff Discipline

Before submission:

- git status --short
- git diff --stat

Must be clean and scoped.

---

# 7. IMPLEMENTATION RULES

## 7.1 No Invented Features

If it is not in:
- code
- contracts
- doctrine

→ do not invent it

---

## 7.2 No Concept Drift

Agents may NOT reinterpret:

- system names
- responsibilities
- architecture

If unclear → ask, do not guess

---

## 7.3 System Names Are Canonical

Correct structure:

- Keon Systems → governance substrate
- Keon Cortex → truth + memory
- Keon Collective → cognition layer

Do NOT merge or blur these.

---

## 7.4 Reality Boundary is Sacred

All execution must map to:

MCP Gateway → Decide → Execute → Receipts

Anything else is invalid.

---

# 8. UI DESIGN RULES

## 8.1 This is NOT SaaS UI

Avoid:
- generic dashboards
- marketing fluff
- vague AI language

Prefer:
- system state
- signals
- causality
- proof surfaces

---

## 8.2 Density > Emptiness

Keon UI should feel:
- high-signal
- information-rich
- precise

Not:
- airy
- vague
- decorative

---

## 8.3 Legibility Under Depth

System can be complex.

But must always allow:

- drilldown
- inspection
- traceability

---

# 9. VALIDATION CHECKLIST (REQUIRED)

Before submitting any work:

- Does this match doctrine?
- Does this match contracts?
- Does this page have ONE purpose?
- Does this violate plane separation?
- Is anything duplicated?
- Is anything invented?
- Can an operator DO something here?

If any answer is wrong → fix before submission.

---

# 10. FAILURE MODES (WATCH FOR THESE)

Common violations:

- turning Control into a marketing page
- explaining instead of demonstrating
- mixing Collective + Control
- duplicating content across pages
- inventing system behavior
- removing interactivity
- flattening the architecture

These must be rejected immediately.

---

# 11. BUILD STRATEGY (MANDATORY)

## ONE PAGE AT A TIME

Process:

1. Select page
2. Define contract
3. Implement
4. Validate against invariants
5. Lock page
6. Move to next

No parallel page development.

---

# 12. FINAL RULE

This system is category-defining.

Do not optimize for:
- speed
- convenience
- aesthetics alone

Optimize for:

CLARITY OF A NEW COMPUTING MODEL

---

END OF FILE