/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function routeModulePath(routeName) {
  return path.join(process.cwd(), ".next", "server", "app", "api", routeName, "route.js");
}

function clearRouteCaches() {
  for (const key of Object.keys(require.cache)) {
    if (key.includes(`${path.sep}.next${path.sep}server${path.sep}`)) {
      delete require.cache[key];
    }
  }
}

async function loadRoute(routeName) {
  const mod = require(routeModulePath(routeName));
  const getHandler = mod?.routeModule?.userland?.GET;
  assert(typeof getHandler === "function", `Route ${routeName} does not export GET`);
  return { GET: getHandler };
}

async function callRoute(routeName) {
  const mod = await loadRoute(routeName);
  const response = await mod.GET();
  assert(response && typeof response.status === "number", `Route ${routeName} did not return a Response`);
  const body = await response.json();
  return { status: response.status, body };
}

async function mockModeChecks() {
  process.env.KEON_CONTROL_GOVERNANCE_MODE = "mock";
  delete process.env.KEON_CONTROL_GOVERNANCE_BASE_URL;
  delete process.env.KEON_CONTROL_GOVERNANCE_TIMEOUT_MS;
  clearRouteCaches();

  const routes = ["tenants", "policies", "runs", "alerts"];
  for (const routeName of routes) {
    const { status, body } = await callRoute(routeName);
    assert(status === 200, `${routeName}: expected 200 in mock mode, got ${status}`);
    assert(body.mode === "MOCK", `${routeName}: expected mode=MOCK`);
    assert(Array.isArray(body.data), `${routeName}: expected data[]`);
    assert(body.governance && typeof body.governance === "object", `${routeName}: missing governance object`);
    assert(body.mockLabel === "MOCK", `${routeName}: expected mockLabel=MOCK`);
    console.log(`MOCK ${routeName}: status=${status} count=${body.data.length}`);
  }
}

async function liveFailClosedCheck() {
  process.env.KEON_CONTROL_GOVERNANCE_MODE = "live";
  process.env.KEON_CONTROL_GOVERNANCE_BASE_URL = "http://127.0.0.1:9";
  process.env.KEON_CONTROL_GOVERNANCE_TIMEOUT_MS = "250";
  clearRouteCaches();

  const { status, body } = await callRoute("tenants");
  assert(status === 503, `tenants live fail-closed: expected 503, got ${status}`);
  assert(body.status === "GOVERNANCE UNAVAILABLE", "tenants live fail-closed: expected GOVERNANCE UNAVAILABLE status");
  assert(body.endpoint === "/api/tenants", "tenants live fail-closed: endpoint mismatch");
  console.log(`LIVE fail-closed tenants: status=${status} error=${body.error}`);
}

async function main() {
  try {
    await mockModeChecks();
    await liveFailClosedCheck();
    console.log("Governance route smoke: PASS");
  } catch (error) {
    console.error("Governance route smoke: FAIL");
    console.error(error instanceof Error ? error.stack || error.message : String(error));
    process.exit(1);
  }
}

main();
