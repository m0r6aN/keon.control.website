import { test, expect } from "@playwright/test";
import { spawn } from "node:child_process";

const PORT = process.env.PORT ?? "3000";
const BASE = `http://127.0.0.1:${PORT}`;
function spawnNextStart(port: string) {
  if (process.platform === "win32") {
    return spawn("cmd.exe", ["/d", "/s", "/c", `pnpm exec next start -p ${port}`], {
      env: { ...process.env, PORT: port },
      shell: false,
      stdio: "pipe",
    });
  }

  return spawn("pnpm", ["exec", "next", "start", "-p", port], {
    env: { ...process.env, PORT: port },
    shell: false,
    stdio: "pipe",
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitReady(url: string, tries = 60) {
  for (let i = 0; i < tries; i += 1) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (res.ok) return;
    } catch {
      // Retry until ready.
    }
    await sleep(250);
  }
  throw new Error(`Server not ready: ${url}`);
}

test.describe("Governance Panel Smoke", () => {
  let child: ReturnType<typeof spawn> | null = null;
  let logs = "";

  test.beforeAll(async () => {
    child = spawnNextStart(PORT);

    child.stdout.on("data", (d) => {
      logs += d.toString();
    });
    child.stderr.on("data", (d) => {
      logs += d.toString();
    });

    await waitReady(`${BASE}/api/tenants`);
  });

  test.afterAll(async () => {
    if (!child) return;
    child.kill("SIGTERM");
    await sleep(200);
    child.kill("SIGKILL");
  });

  test("homepage renders Governance Surface panel header", async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Governance Surface")).toBeVisible();
  });

  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      testInfo.annotations.push({ type: "server-logs-tail", description: logs.slice(-5000) });
    }
  });
});
