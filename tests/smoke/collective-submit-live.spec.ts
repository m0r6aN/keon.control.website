import { test, expect } from "@playwright/test";

test("submit challenge prompt and land on live run screen", async ({ page, baseURL }) => {
  test.skip(!baseURL, "BASE_URL is required for smoke tests.");

  await page.route("**/api/collective/live-runs", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        dataMode: "LIVE",
        retrievalMode: "session-cache",
        hostSource: "http://localhost:5122",
        run: {
          intentId: "intent:tenant-keon:corr:playwright",
          selectedBranchId: "branch:selected",
          correlationId: "corr:playwright",
          status: "completed",
          statusLabel: "Completed",
          summary: "Selected branch anchored by truth refs.",
          submittedAtUtc: "2026-04-02T12:00:00Z",
          completedAtUtc: "2026-04-02T12:05:00Z",
        },
        submission: {
          objective: "Create a plan to colonize Mars",
          context: "Include phases and constraints.",
          constraints: "No execution authority.",
          oversightMode: "observer-supervised",
          governanceAuthority: "collective.operator.supervision",
          governanceBindingRef: "gov:binding:1",
          challengePreset: "mars-colony-plan",
          tenantId: "tenant-keon",
          actorId: "operator:control",
          actorType: "human-operator",
          correlationId: "corr:playwright",
        },
        cognition: {
          runtimeTrace: [
            {
              step: "intent_received",
              detail: "Intent accepted for cognition.",
              plane: "cognition",
              timestampUtc: "2026-04-02T12:00:00Z",
              metadata: { phase: "intent" },
            },
          ],
          materializedBranches: [],
          evaluatedBranches: [
            {
              branchId: "branch:selected",
              parentBranchId: null,
              state: "Collapsed Winner",
              hypothesis: "Primary branch",
              utilityScore: 0.91,
              riskScore: 0.22,
              lineageDepth: 1,
              participants: ["agent:alpha"],
              spawnedUtc: "2026-04-02T12:01:00Z",
              lastUpdatedUtc: "2026-04-02T12:04:00Z",
            },
          ],
          winningBranch: {
            branchId: "branch:selected",
            parentBranchId: null,
            state: "Collapsed Winner",
            hypothesis: "Primary branch",
            utilityScore: 0.91,
            riskScore: 0.22,
            lineageDepth: 1,
            participants: ["agent:alpha"],
            spawnedUtc: "2026-04-02T12:01:00Z",
            lastUpdatedUtc: "2026-04-02T12:04:00Z",
          },
          losingBranches: [],
          review: {
            reviewId: "review:1",
            branchId: "branch:selected",
            status: "Completed With Findings",
            challengeDepth: 2,
            inducedHeat: 0.34,
            summary: "Review completed with one material finding.",
            timestampUtc: "2026-04-02T12:03:00Z",
            findings: [],
          },
          heatProfile: {
            heatProfileId: "heat:1",
            entityHeat: 0.12,
            branchHeat: 0.22,
            interactionHeat: 0.16,
            challengeHeat: 0.34,
            boundaryHeat: 0.18,
            swarmHeat: 0.11,
            compositeHeat: 0.24,
            thresholdState: "Warm",
            calculationVersion: "v1",
            timestampUtc: "2026-04-02T12:03:30Z",
            contributors: [],
          },
          collapseRecord: {
            collapseId: "collapse:1",
            selectedBranchId: "branch:selected",
            disposition: "Resolved",
            selectionRationale: "Selected for strongest utility/risk ratio.",
            comparativeHeatSummary: "Selected branch remained warm but below critical threshold.",
            comparativeUtilitySummary: "Selected branch dominated utility across compared alternatives.",
            challengeSummary: "One finding remained open and accepted into witness narrative.",
            candidateBranchIds: ["branch:selected", "branch:alternate"],
            loserBranchIds: ["branch:alternate"],
            witnessDigestId: "witness:1",
            timestampUtc: "2026-04-02T12:04:00Z",
          },
          witnessTruth: {
            collapseId: "collapse:1",
            reviewId: "review:1",
            heatProfileId: "heat:1",
            winningBranchId: "branch:selected",
            losingBranchIds: ["branch:alternate"],
            collapseDisposition: "Resolved",
            compositeHeat: 0.24,
            heatThresholdState: "Warm",
            truthRefs: ["receipt:truth:1"],
            witnessNarrative: "Witness narrative anchored to collapse and review.",
            truthNarrative: "Truth narrative anchored to receipt refs.",
            timestampUtc: "2026-04-02T12:05:00Z",
          },
        },
        governance: {
          status: "unavailable",
          label: "Governed Authorization Unavailable",
          detail: "No governed receipt was returned.",
        },
        execution: {
          status: "unavailable",
          label: "Reality Execution Unavailable",
          detail: "No execution receipt was returned.",
        },
        anchors: {
          collapseId: "collapse:1",
          reviewId: "review:1",
          heatProfileId: "heat:1",
          truthRefs: ["receipt:truth:1"],
        },
        operatorMessages: ["Receipts outrank stories."],
      }),
    });
  });

  await page.goto("/collective/submit");
  await page.getByRole("button", { name: /mars-colony-plan/i }).click();
  await page.getByRole("button", { name: /submit live run/i }).click();

  await expect(page).toHaveURL(/\/collective\/live\/intent%3Atenant-keon%3Acorr%3Aplaywright/);
  await expect(page.getByText("receipt:truth:1")).toBeVisible();
  await expect(page.getByText("Governed Authorization Unavailable")).toBeVisible();
});
