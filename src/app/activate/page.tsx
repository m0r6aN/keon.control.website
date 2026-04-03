/**
 * /activate — MAGIC LINK LANDING PAGE
 *
 * This is the entry point for users arriving via a magic link invitation.
 * It renders the provisioning + activation experience before onboarding begins.
 *
 * ─── Magic Link Integration ────────────────────────────────────────────────────
 *
 * When wiring to a real auth/invite system:
 *
 *   1. Your email provider sends a link in the form:
 *        https://app.keon.ai/activate?token=<signed_jwt_or_opaque_token>
 *
 *   2. This page reads `?token` from the URL and passes it to the API.
 *
 *   3. POST /api/activation/provision validates the token against your database
 *      (invite_tokens table), ensures it hasn't expired or been consumed, and
 *      begins the provisioning pipeline.
 *
 *   4. On successful provisioning, the user is redirected to /welcome to begin
 *      the guided onboarding flow.
 *
 *   5. If you use a middleware-based auth layer (e.g., NextAuth, Clerk, Auth0):
 *      - Configure it to allow unauthenticated access to /activate
 *      - After provisioning, your auth session should be established before
 *        the redirect to /welcome
 *      - The ActivationFlow component's `isComplete` handler is the correct
 *        insertion point for session establishment before redirect.
 *
 * ─── Route Access ──────────────────────────────────────────────────────────────
 *
 * This route is intentionally outside the app shell and remains accessible to
 * unauthenticated users as the magic-link entry point. ActivationGate now
 * ensures it is only shown while provisioning is still incomplete.
 *
 * ─── Metadata ─────────────────────────────────────────────────────────────────
 */

import { ActivationFlow } from "@/components/activation";
import { ActivationGate } from "@/components/onboarding/route-gates";
import type { Metadata } from "next";
import * as React from "react";

export const metadata: Metadata = {
  title: "Activating your workspace — Keon Control",
  description: "Setting up your governed workspace.",
  robots: { index: false, follow: false },
};

export default function ActivatePage() {
  return (
    <ActivationGate>
      <React.Suspense>
        <ActivationFlow />
      </React.Suspense>
    </ActivationGate>
  );
}
