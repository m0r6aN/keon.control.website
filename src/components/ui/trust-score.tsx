"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Trust Score Component with Composite Backbone
 * 
 * Shows that trust is EARNED, not cosmetic.
 * Visually hints at composite components:
 * - Policy adherence
 * - Receipt completeness
 * - Quorum stability
 * - Latency variance
 */

interface TrustScoreProps {
  score: number; // 0-100
  components?: {
    policyAdherence: number; // 0-100
    receiptCompleteness: number; // 0-100
    quorumStability: number; // 0-100
    latencyVariance: number; // 0-100
  };
  size?: "sm" | "md" | "lg";
  showBreakdown?: boolean;
  className?: string;
}

export function TrustScore({
  score,
  components = {
    policyAdherence: 99.2,
    receiptCompleteness: 98.9,
    quorumStability: 97.8,
    latencyVariance: 98.9,
  },
  size = "md",
  showBreakdown = false,
  className,
}: TrustScoreProps) {
  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl",
  };

  const barHeight = {
    sm: "h-1",
    md: "h-1.5",
    lg: "h-2",
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main Score */}
      <div className="flex items-baseline gap-2">
        <span className={cn("font-mono font-bold tabular-nums text-[--reactor-glow]", sizeClasses[size])}>
          {score.toFixed(1)}
        </span>
        <span className="font-mono text-sm text-[--steel]">%</span>
      </div>

      {/* Composite Backbone - Stacked Bar */}
      <div className={cn("w-full bg-[--gun-metal] rounded-sm overflow-hidden", barHeight[size])}>
        <div className="flex h-full">
          {/* Policy Adherence */}
          <div
            className="bg-[--reactor-blue] transition-all duration-500"
            style={{ width: `${components.policyAdherence / 4}%` }}
            title={`Policy Adherence: ${components.policyAdherence}%`}
          />
          {/* Receipt Completeness */}
          <div
            className="bg-[--reactor-glow] transition-all duration-500"
            style={{ width: `${components.receiptCompleteness / 4}%` }}
            title={`Receipt Completeness: ${components.receiptCompleteness}%`}
          />
          {/* Quorum Stability */}
          <div
            className="bg-[#45A29E]/70 transition-all duration-500"
            style={{ width: `${components.quorumStability / 4}%` }}
            title={`Quorum Stability: ${components.quorumStability}%`}
          />
          {/* Latency Variance */}
          <div
            className="bg-[#66FCF1]/50 transition-all duration-500"
            style={{ width: `${components.latencyVariance / 4}%` }}
            title={`Latency Variance: ${components.latencyVariance}%`}
          />
        </div>
      </div>

      {/* Breakdown (optional) */}
      {showBreakdown && (
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-[--reactor-blue]" />
            <span className="text-[--steel]">Policy</span>
            <span className="text-[--flash] ml-auto tabular-nums">{components.policyAdherence}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-[--reactor-glow]" />
            <span className="text-[--steel]">Receipts</span>
            <span className="text-[--flash] ml-auto tabular-nums">{components.receiptCompleteness}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-[#45A29E]/70" />
            <span className="text-[--steel]">Quorum</span>
            <span className="text-[--flash] ml-auto tabular-nums">{components.quorumStability}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-[#66FCF1]/50" />
            <span className="text-[--steel]">Latency</span>
            <span className="text-[--flash] ml-auto tabular-nums">{components.latencyVariance}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

