import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";

describe("collective API boundary routes", () => {
  beforeEach(() => {
    process.env.KEON_COLLECTIVE_HOST_BASE_URL = "http://collective.test";
    process.env.KEON_COLLECTIVE_HOST_TIMEOUT_MS = "15000";
    delete process.env.NEXT_PUBLIC_API_LIVE_MODE;
    delete process.env.NEXT_PUBLIC_API_USE_MOCK_FALLBACK;
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("degrades mock-backed Collective routes in live mode without proof-like claims", async () => {
    process.env.NEXT_PUBLIC_API_LIVE_MODE = "true";
    process.env.NEXT_PUBLIC_API_USE_MOCK_FALLBACK = "true";
    const route = await import("@/app/api/collective/deliberations/route");

    const response = await route.GET();
    const body = await response.json();
    const serialized = JSON.stringify(body);

    expect(response.status).toBe(503);
    expect(body).toMatchObject({
      status: "COLLECTIVE_UNAVAILABLE",
      mode: "LIVE",
      source: "collective-host",
    });
    expect(serialized).not.toContain("SEALED");
    expect(serialized).not.toContain("VALID");
  });

  it("uses mock-safe governance labels only when local mocks are explicitly enabled", async () => {
    process.env.NEXT_PUBLIC_API_LIVE_MODE = "false";
    process.env.NEXT_PUBLIC_API_USE_MOCK_FALLBACK = "true";
    const route = await import("@/app/api/collective/reforms/route");

    const response = await route.GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.mode).toBe("MOCK");
    expect(body.source).toBe("local-mock-provider");
    expect(body.governance).toMatchObject({
      determinismStatus: "MOCK_UNVERIFIED",
      sealValidationResult: "NOT_APPLICABLE",
    });
  });

  it("proxies opportunities as non-effecting Collective records with propagated headers", async () => {
    process.env.NEXT_PUBLIC_API_LIVE_MODE = "true";
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify([{ offeringId: { value: "offering-1" }, status: 0 }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const route = await import("@/app/api/collective/opportunities/route");

    const response = await route.GET(new NextRequest(
      "http://localhost/api/collective/opportunities?status=Suggested&limit=5",
      {
        headers: {
          authorization: "Bearer operator-token",
          "x-correlation-id": "corr:route",
        },
      },
    ));
    const body = await response.json();
    const [, init] = fetchMock.mock.calls[0] ?? [];
    const headers = init?.headers as Record<string, string>;

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://collective.test/opportunities?tenantId=ten_keon_builder&status=Suggested&limit=5",
      expect.objectContaining({ method: "GET" }),
    );
    expect(headers.Authorization).toBe("Bearer operator-token");
    expect(headers["X-Keon-Tenant-Id"]).toBe("ten_keon_builder");
    expect(headers["X-Keon-Actor-Id"]).toBe("usr_clint");
    expect(headers["X-Correlation-Id"]).toBe("corr:route");
    expect(body.operatorMessages.join(" ")).toContain("does not accept offerings");
    expect(body.operatorMessages.join(" ")).toContain("MCP Gateway");
  });

  it("keeps cognition routes free of Runtime/MCP execution imports", () => {
    const routeFiles = [
      "src/app/api/collective/live-runs/route.ts",
      "src/app/api/collective/live-runs/[intentId]/route.ts",
      "src/app/api/collective/deliberations/route.ts",
      "src/app/api/collective/deliberations/[sessionId]/route.ts",
      "src/app/api/collective/reforms/route.ts",
      "src/app/api/collective/reforms/[artifactId]/route.ts",
      "src/app/api/collective/legitimacy/route.ts",
      "src/app/api/collective/chain/[kind]/[id]/route.ts",
      "src/app/api/collective/opportunities/route.ts",
      "src/lib/server/collective-client.ts",
    ];

    for (const file of routeFiles) {
      const imports = fs.readFileSync(path.join(process.cwd(), file), "utf8")
        .split(/\r?\n/)
        .filter((line) => line.trim().startsWith("import"))
        .join("\n");

      expect(imports).not.toMatch(/runtime|mcp|gateway/i);
    }
  });
});