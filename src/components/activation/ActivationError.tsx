"use client";

/**
 * ACTIVATION ERROR STATE
 *
 * Shown when provisioning fails or the token is invalid.
 * Controlled error handling — no dead ends, no raw error dumps.
 *
 * Rules:
 *   - Plain language only
 *   - Always provide a retry path
 *   - Always provide an escalation path
 *   - Never show error codes or stack traces to users
 */

import { cn } from "@/lib/utils";
import * as React from "react";

export type ActivationErrorKind =
  | "token_missing"
  | "token_invalid"
  | "token_expired"
  | "provisioning_failed"
  | "network_error"
  | "unknown";

const ERROR_COPY: Record<ActivationErrorKind, { headline: string; message: string }> = {
  token_missing: {
    headline: "No activation link found",
    message:
      "This page requires a valid activation link. Please use the link from your invitation email, or request a new one.",
  },
  token_invalid: {
    headline: "Activation link not recognized",
    message:
      "This link doesn't match any pending invitation. It may have already been used, or the URL may be incomplete.",
  },
  token_expired: {
    headline: "Activation link has expired",
    message:
      "For security, activation links expire after 24 hours. Please request a new invitation link to continue.",
  },
  provisioning_failed: {
    headline: "Setup encountered a problem",
    message:
      "Your workspace setup was interrupted. No changes were committed to your account. You can try again — your invitation is still valid.",
  },
  network_error: {
    headline: "Unable to reach Keon",
    message:
      "We couldn't connect to the activation service. Please check your connection and try again. Your invitation remains valid.",
  },
  unknown: {
    headline: "Something went wrong",
    message:
      "An unexpected error occurred during setup. Your invitation has not been used and remains valid.",
  },
};

interface ActivationErrorProps {
  kind?: ActivationErrorKind;
  onRetry?: () => void;
  className?: string;
}

export function ActivationError({
  kind = "unknown",
  onRetry,
  className,
}: ActivationErrorProps) {
  const copy = ERROR_COPY[kind];
  const canRetry = kind !== "token_missing" && kind !== "token_invalid";

  return (
    <div
      className={cn(
        "relative flex flex-col items-start justify-center overflow-hidden rounded-[3px]",
        "border border-[#FF2E2E]/20 bg-[linear-gradient(160deg,#0c0a0a_0%,#070508_100%)] px-8 py-10",
        className
      )}
      data-testid="activation-error"
      role="alert"
      aria-live="assertive"
    >
      {/* Top accent line — critical red */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF2E2E]/50 to-transparent" />

      {/* Error indicator */}
      <div className="mb-6 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-[#FF2E2E]/30 bg-[#FF2E2E]/10">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 3V9" stroke="#FF2E2E" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="12" r="0.75" fill="#FF2E2E" />
            <path
              d="M2 13.5L8 2.5L14 13.5H2Z"
              stroke="#FF2E2E"
              strokeWidth="1"
              strokeLinejoin="round"
              fill="none"
              strokeOpacity="0.5"
            />
          </svg>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF2E2E]/70">
          Activation failed
        </span>
      </div>

      {/* Headline */}
      <h2
        className="font-display text-xl font-semibold text-[#EAEAEA]"
        data-testid="error-headline"
      >
        {copy.headline}
      </h2>

      {/* Message */}
      <p className="mt-3 max-w-md font-mono text-[13px] leading-relaxed text-[#7E8E9E]">
        {copy.message}
      </p>

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3">
        {canRetry && onRetry && (
          <button
            onClick={onRetry}
            className={cn(
              "flex items-center gap-2.5 rounded-[2px] border border-[#45A29E]/40 bg-[#45A29E]/10",
              "px-5 py-3 font-mono text-[12px] uppercase tracking-[0.15em] text-[#66FCF1]",
              "transition-colors hover:border-[#66FCF1]/60 hover:bg-[#66FCF1]/10",
              "active:scale-[0.98]"
            )}
            data-testid="retry-button"
            aria-label="Retry activation"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M10 6C10 8.20914 8.20914 10 6 10C3.79086 10 2 8.20914 2 6C2 3.79086 3.79086 2 6 2C7.46491 2 8.76312 2.72657 9.56569 3.84"
                stroke="#66FCF1"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path d="M9.5 2V4.5H7" stroke="#66FCF1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Try again
          </button>
        )}

        <div className="flex items-center gap-2 pt-1">
          <span className="font-mono text-[11px] text-[#384656]">Need help?</span>
          <a
            href="mailto:support@keon.ai?subject=Activation%20Issue"
            className="font-mono text-[11px] text-[#45A29E] underline-offset-2 hover:underline"
          >
            Contact support
          </a>
          <span className="font-mono text-[11px] text-[#384656]">·</span>
          <a
            href="/welcome"
            className="font-mono text-[11px] text-[#384656] underline-offset-2 hover:text-white/50 hover:underline"
          >
            Return to start
          </a>
        </div>
      </div>
    </div>
  );
}
