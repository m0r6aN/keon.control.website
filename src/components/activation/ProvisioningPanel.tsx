"use client";

/**
 * PROVISIONING PANEL — LEFT SIDE
 *
 * Shows the user exactly what is happening, in human language.
 * No infrastructure jargon. No internal state names. No spinners.
 *
 * Visual structure:
 *   - Keon wordmark / identity anchor
 *   - Current step headline (large)
 *   - Calm, confident message
 *   - Checklist (completed / in-progress / pending)
 *   - Progress bar
 */

import type { ProvisioningChecklistItem, ProvisioningState } from "@/lib/activation/types";
import { cn } from "@/lib/utils";
import * as React from "react";

// ─── Checklist Item ───────────────────────────────────────────────────────────

function CheckItem({ item }: { item: ProvisioningChecklistItem }) {
  const isComplete = item.status === "complete";
  const isActive = item.status === "in_progress";
  const isFailed = item.status === "failed";
  const isPending = item.status === "pending";

  return (
    <div
      className={cn(
        "flex items-center gap-3 font-mono text-[13px] transition-all duration-300",
        isComplete && "text-[#66FCF1]",
        isActive && "text-[#EAEAEA]",
        isFailed && "text-[#FF2E2E]",
        isPending && "text-[#384656]"
      )}
      data-testid={`checklist-item-${item.id}`}
      data-status={item.status}
    >
      {/* Status icon */}
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
        {isComplete && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-label="Complete">
            <path
              d="M3 8L6.5 11.5L13 5"
              stroke="#66FCF1"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {isActive && (
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#45A29E] opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-[#45A29E]" />
          </span>
        )}
        {isFailed && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-label="Failed">
            <line x1="3" y1="3" x2="11" y2="11" stroke="#FF2E2E" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="11" y1="3" x2="3" y2="11" stroke="#FF2E2E" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
        {isPending && (
          <span className="block h-2 w-2 rounded-full border border-[#384656]" />
        )}
      </span>

      {/* Label */}
      <span className="tracking-[0.04em]">{item.label}</span>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProvisioningPanelProps {
  state: ProvisioningState;
  className?: string;
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function ProvisioningPanel({ state, className }: ProvisioningPanelProps) {
  const isReady = state.userStep === "ready";

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[3px]",
        "border border-white/[0.06] bg-[linear-gradient(160deg,#07101a_0%,#050c14_100%)]",
        className
      )}
      data-testid="provisioning-panel"
    >
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#45A29E]/60 to-transparent" />

      {/* Keon identity */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-8 py-5">
        <div>
          <div className="font-display text-base font-semibold tracking-[0.18em] text-white">
            KEON CONTROL
          </div>
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#45A29E]/70">
            Workspace activation
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className={cn(
            "h-1.5 w-1.5 rounded-full",
            isReady ? "bg-[#00D9A3]" : "animate-pulse bg-[#45A29E]"
          )} />
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/30">
            {isReady ? "Ready" : "Running"}
          </span>
        </div>
      </div>

      {/* Step headline + message */}
      <div className="px-8 pt-8 pb-6">
        <div
          className="font-display text-2xl font-semibold leading-tight tracking-[-0.01em] text-[#EAEAEA] transition-all duration-500"
          data-testid="step-label"
        >
          {state.stepLabel}
        </div>
        <p
          className="mt-3 font-mono text-[13px] leading-relaxed text-[#7E8E9E] transition-all duration-500"
          data-testid="step-message"
        >
          {state.stepMessage}
        </p>
      </div>

      {/* Progress bar */}
      <div className="px-8">
        <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#45A29E] to-[#66FCF1] transition-all duration-700 ease-out"
            style={{ width: `${state.progressPercent}%` }}
            role="progressbar"
            aria-valuenow={state.progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Provisioning progress"
            data-testid="progress-bar"
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="flex flex-col gap-4 px-8 pt-7 pb-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/20">
          Setup progress
        </div>
        <div className="flex flex-col gap-3.5" data-testid="provisioning-checklist" role="list">
          {state.checklist.map((item) => (
            <CheckItem key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Ready state CTA */}
      {isReady && (
        <div className="border-t border-white/[0.06] px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-[#00D9A3]" />
            <span className="font-mono text-[12px] text-[#00D9A3] tracking-[0.08em]">
              Launching your control plane…
            </span>
          </div>
        </div>
      )}

      {/* Subtle bottom scanline */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
    </div>
  );
}
