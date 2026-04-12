/**
 * KEON ACTIVATION — PROVISION API
 *
 * POST /api/activation/provision
 *   Start a provisioning session for a magic-link token.
 *   In production: validates the invite token against the database,
 *   creates the tenant/membership, and returns a provisioning session ID.
 *   Currently: simulates the flow using time-based state progression.
 *
 * GET /api/activation/provision?id=<provisioningId>
 *   Poll for current provisioning state.
 *   Returns the derived user-facing state (never internal state names).
 *
 * ─── Magic Link Integration Note ──────────────────────────────────────────────
 * When wiring to a real auth layer:
 *   1. The magic link handler should redirect to /activate?token=<signed_token>
 *   2. POST here with that token — server validates signature + expiry
 *   3. On valid token: create tenant row + membership binding, return provisioningId
 *   4. On invalid/expired token: return 401 with failureCode "token_expired" or "token_invalid"
 *   5. Store provisioningId in session/cookie for safe refresh support
 */

import { deriveProvisioningState, resolveSimulatedState } from "@/lib/activation/state-machine";
import { INTERNAL_TEST_ACTIVATION } from "@/lib/activation/test-mode";
import type {
  ActivationContextSummary,
  ActivationMode,
  ProvisioningStatusResponse,
  StartProvisioningResponse,
} from "@/lib/activation/types";
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

// ─── In-process session store ─────────────────────────────────────────────────
// In production: replace with Redis/Postgres-backed provisioning records.
// This module-level map persists within a single server process.

interface ProvisioningRecord {
  id: string;
  token: string;
  activation: ActivationContextSummary;
  createdAt: number;
  forceFailed?: boolean;
}

const sessions = new Map<string, ProvisioningRecord>();

function getConfiguredTestActivationToken(): string {
  return (process.env.KEON_TEST_ACTIVATION_TOKEN ?? "").trim();
}

function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
}

function isTestActivationAllowed(): boolean {
  return !isProductionEnvironment() || process.env.ALLOW_TEST_ACTIVATION === "true";
}

function buildInviteActivationContext(): ActivationContextSummary {
  return {
    mode: "invite",
    source: "invite_token",
  };
}

function getRequestedActivationMode(value: unknown, token: string): ActivationMode {
  if (value === "test") {
    return "test";
  }

  const configuredTestToken = getConfiguredTestActivationToken();
  if (configuredTestToken && token === configuredTestToken) {
    return "test";
  }

  return "invite";
}

// ─── POST — Start Provisioning ────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    const activationMode = getRequestedActivationMode(body?.activationMode, token);

    // In production: validate token signature, check expiry, prevent replay.
    // For now: accept any non-empty token string.
    if (!token) {
      return NextResponse.json(
        { error: "activation_token_required", message: "A valid activation token is required." },
        { status: 400 }
      );
    }

    let activation = buildInviteActivationContext();

    if (activationMode === "test") {
      const configuredTestToken = getConfiguredTestActivationToken();

      if (!configuredTestToken) {
        return NextResponse.json(
          { error: "test_activation_not_configured", message: "Test activation is not configured." },
          { status: 503 }
        );
      }

      if (!isTestActivationAllowed()) {
        return NextResponse.json(
          {
            error: "activation_test_token_disabled",
            message: "Test activation tokens are disabled in production.",
          },
          { status: 403 }
        );
      }

      if (token !== configuredTestToken) {
        return NextResponse.json(
          { error: "token_invalid", message: "The test activation token is invalid." },
          { status: 401 }
        );
      }

      activation = INTERNAL_TEST_ACTIVATION;
    }

    // Check if a session already exists for this token (idempotent POST)
    for (const [, record] of sessions) {
      if (record.token === token && record.activation.mode === activationMode) {
        return NextResponse.json<StartProvisioningResponse>({
          provisioningId: record.id,
          activation: record.activation,
        });
      }
    }

    const provisioningId = `prov_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
    sessions.set(provisioningId, {
      id: provisioningId,
      token,
      activation,
      createdAt: Date.now(),
    });

    if (activation.mode === "test") {
      console.info("[activation] accepted internal test activation token", {
        provisioningId,
        environment: activation.environment,
        tenantId: activation.tenantId,
        workspaceId: activation.workspaceId,
      });
    }

    // Cleanup stale sessions (> 30 minutes old) on each new session creation
    const cutoff = Date.now() - 30 * 60 * 1000;
    for (const [id, record] of sessions) {
      if (record.createdAt < cutoff) sessions.delete(id);
    }

    return NextResponse.json<StartProvisioningResponse>({ provisioningId, activation }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "internal_error", message: "Unable to start provisioning." },
      { status: 500 }
    );
  }
}

// ─── GET — Poll Provisioning State ───────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  const provisioningId = request.nextUrl.searchParams.get("id");

  if (!provisioningId) {
    return NextResponse.json(
      { error: "provisioning_id_required", message: "Provisioning ID is required." },
      { status: 400 }
    );
  }

  const record = sessions.get(provisioningId);
  if (!record) {
    return NextResponse.json(
      { error: "session_not_found", message: "Provisioning session not found or has expired." },
      { status: 404 }
    );
  }

  const internalState = record.forceFailed
    ? "provisioning_failed"
    : resolveSimulatedState(record.createdAt);

  const state = deriveProvisioningState(internalState);

  const response: ProvisioningStatusResponse = {
    provisioningId,
    state,
    activation: record.activation,
    ...(internalState === "provisioning_complete" && {
      completedAt: new Date().toISOString(),
    }),
    ...(internalState === "provisioning_failed" && {
      failedAt: new Date().toISOString(),
      failureCode: "workspace_bootstrap_failed",
      failureMessage: "Unable to initialize workspace. Your invitation is still valid.",
    }),
  };

  return NextResponse.json(response);
}
