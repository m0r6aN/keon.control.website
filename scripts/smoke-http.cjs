/* eslint-disable @typescript-eslint/no-require-imports */
const { spawn } = require("node:child_process");

const PORT = process.env.PORT || "3000";
const BASE = `http://127.0.0.1:${PORT}`;

function spawnNextStart(port) {
  if (process.platform === "win32") {
    return spawn("cmd.exe", ["/d", "/s", "/c", `pnpm exec next start -p ${port}`], {
      stdio: "pipe",
      env: { ...process.env, PORT: port },
      shell: false,
    });
  }

  return spawn("pnpm", ["exec", "next", "start", "-p", port], {
    stdio: "pipe",
    env: { ...process.env, PORT: port },
    shell: false,
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitReady(url, tries = 60) {
  for (let i = 0; i < tries; i += 1) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (res.ok) return;
    } catch {
      // Retry until timeout.
    }
    await sleep(250);
  }
  throw new Error(`Server not ready: ${url}`);
}

async function assertJson(path, expectStatus = 200) {
  const res = await fetch(`${BASE}${path}`);
  if (res.status !== expectStatus) {
    const txt = await res.text().catch(() => "");
    throw new Error(`${path} status=${res.status} expected=${expectStatus}\n${txt}`);
  }
  return res.json();
}

async function assertHomeMarker(marker) {
  const res = await fetch(`${BASE}/`, { redirect: "manual" });
  if (!res.ok) throw new Error(`/ status=${res.status}`);
  const html = await res.text();
  if (!html.includes(marker)) {
    throw new Error(`Homepage missing marker: "${marker}"`);
  }
}

(async () => {
  const child = spawnNextStart(PORT);

  let logs = "";
  child.stdout.on("data", (d) => {
    logs += d.toString();
  });
  child.stderr.on("data", (d) => {
    logs += d.toString();
  });

  try {
    await waitReady(`${BASE}/api/tenants`);

    const tenants = await assertJson("/api/tenants", 200);
    const policies = await assertJson("/api/policies", 200);
    const runs = await assertJson("/api/runs", 200);
    const alerts = await assertJson("/api/alerts", 200);

    for (const [name, obj] of Object.entries({ tenants, policies, runs, alerts })) {
      if (!obj || typeof obj !== "object") {
        throw new Error(`${name} returned non-object`);
      }
      if (!Object.prototype.hasOwnProperty.call(obj, "mode")) {
        throw new Error(`${name} missing "mode" envelope field`);
      }
    }

    await assertHomeMarker("Governance Surface");

    console.log("HTTP smoke: PASS");
  } catch (e) {
    console.error("HTTP smoke: FAIL");
    console.error(String(e));
    console.error("---- server logs (tail) ----");
    console.error(logs.slice(-5000));
    process.exitCode = 1;
  } finally {
    child.kill("SIGTERM");
    await sleep(200);
    child.kill("SIGKILL");
  }
})();
