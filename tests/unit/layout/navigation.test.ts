import { describe, expect, it } from "vitest";
import { navigationSections } from "@/components/layout/navigation";

describe("navigationSections", () => {
  it("keeps first-run destinations in the sidebar", () => {
    const labels = navigationSections.flatMap((section) => section.items.map((item) => item.label));

    expect(labels).toContain("Welcome");
    expect(labels).toContain("Workspace overview");
    expect(labels).toContain("Setup checklist");
    expect(labels).toContain("Guardrails");
    expect(labels).toContain("Integrations");
    expect(labels).toContain("Receipts");
  });
});
