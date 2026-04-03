"use client";

/**
 * COLLECTIVE REPLAY — KEON INTELLIGENCE VISUALIZATION
 *
 * This is NOT decoration. This is the product's first impression.
 *
 * While provisioning runs, this sequence teaches the user what Keon does:
 *   1. Keon receives an intention / goal
 *   2. Keon explores multiple execution paths
 *   3. Keon evaluates and challenges each path
 *   4. Keon selects the governed path
 *   5. Keon produces a receipt / proof of decision
 *
 * This must be understood WITHOUT reading a manual.
 * It is passive only. No controls. No interaction. Loops continuously.
 *
 * All scenarios are clearly labeled as examples.
 * No ambiguity between real and demo data.
 */

import { cn } from "@/lib/utils";
import * as React from "react";

// ─── Scenario Data ────────────────────────────────────────────────────────────

interface ReplayPath {
  id: string;
  label: string;
  sublabel: string;
  riskLevel: "low" | "medium" | "high";
  outcome: "approved" | "denied" | "selected";
}

interface ReplayScenario {
  id: string;
  goalLabel: string;
  goalDescription: string;
  paths: ReplayPath[];
  selectedPathId: string;
  receiptRef: string;
}

const SCENARIOS: ReplayScenario[] = [
  {
    id: "db-migration",
    goalLabel: "SCHEMA MIGRATION",
    goalDescription: "Database upgrade · v4.2.1 → v4.3.0",
    paths: [
      { id: "p1", label: "Execute now", sublabel: "No snapshot", riskLevel: "high", outcome: "denied" },
      { id: "p2", label: "Stage first", sublabel: "24h validation", riskLevel: "medium", outcome: "denied" },
      { id: "p3", label: "Snapshot + run", sublabel: "Rollback-safe", riskLevel: "low", outcome: "selected" },
      { id: "p4", label: "Defer 48h", sublabel: "Maintenance window", riskLevel: "low", outcome: "denied" },
    ],
    selectedPathId: "p3",
    receiptRef: "K-9A4C",
  },
  {
    id: "iam-expansion",
    goalLabel: "ACCESS EXPANSION",
    goalDescription: "Service account · elevated IAM request",
    paths: [
      { id: "p1", label: "Grant full role", sublabel: "Unrestricted", riskLevel: "high", outcome: "denied" },
      { id: "p2", label: "Scoped policy", sublabel: "Resource-bound", riskLevel: "medium", outcome: "denied" },
      { id: "p3", label: "MFA + scoped", sublabel: "Least-privilege", riskLevel: "low", outcome: "selected" },
      { id: "p4", label: "Escalate review", sublabel: "Human approval", riskLevel: "low", outcome: "denied" },
    ],
    selectedPathId: "p3",
    receiptRef: "K-2E7F",
  },
];

// ─── Animation Phase Model ────────────────────────────────────────────────────
// Each phase maps to a visual state of the SVG tree.

type ReplayPhase =
  | "blank"
  | "goal_appear"
  | "paths_branch"
  | "evaluating"
  | "challenging"
  | "selecting"
  | "approved"
  | "hold_result"
  | "fade_out";

const PHASE_DURATIONS_MS: Record<ReplayPhase, number> = {
  blank: 400,
  goal_appear: 900,
  paths_branch: 1400,
  evaluating: 1800,
  challenging: 1600,
  selecting: 1000,
  approved: 1200,
  hold_result: 2400,
  fade_out: 700,
};

const PHASE_ORDER: ReplayPhase[] = [
  "blank",
  "goal_appear",
  "paths_branch",
  "evaluating",
  "challenging",
  "selecting",
  "approved",
  "hold_result",
  "fade_out",
];

// ─── Risk Color Mapping ───────────────────────────────────────────────────────

const RISK_COLORS = {
  low: "#45A29E",
  medium: "#FFB000",
  high: "#FF2E2E",
} as const;

const RISK_LABELS = {
  low: "LOW",
  medium: "MED",
  high: "HIGH",
} as const;

// ─── SVG Layout Constants ─────────────────────────────────────────────────────

const VB_W = 480;
const VB_H = 370;

const GOAL_CX = VB_W / 2;
const GOAL_Y = 24;
const GOAL_W = 240;
const GOAL_H = 38;

// 4 path columns
const PATH_XS = [52, 164, 300, 420];
const PATH_Y = 116;
const PATH_W = 92;
const PATH_H = 30;

// Eval row
const EVAL_Y = 208;
const EVAL_R = 14;

// Result
const RESULT_CX = GOAL_CX;
const RESULT_Y = 290;
const RESULT_W = 180;
const RESULT_H = 44;

// ─── Component ────────────────────────────────────────────────────────────────

export function CollectiveReplay({ className }: { className?: string }) {
  const [scenarioIndex, setScenarioIndex] = React.useState(0);
  const [phase, setPhase] = React.useState<ReplayPhase>("blank");
  const [phaseIndex, setPhaseIndex] = React.useState(0);
  const [opacity, setOpacity] = React.useState(1);

  const scenario = SCENARIOS[scenarioIndex % SCENARIOS.length];

  // Advance phases
  React.useEffect(() => {
    const currentPhase = PHASE_ORDER[phaseIndex % PHASE_ORDER.length];
    setPhase(currentPhase);

    const duration = PHASE_DURATIONS_MS[currentPhase];

    const timer = setTimeout(() => {
      const nextIndex = (phaseIndex + 1) % PHASE_ORDER.length;

      // When we loop back to the start, advance to next scenario
      if (nextIndex === 0) {
        setScenarioIndex((i) => (i + 1) % SCENARIOS.length);
      }

      setPhaseIndex(nextIndex);
    }, duration);

    return () => clearTimeout(timer);
  }, [phaseIndex]);

  // Manage outer opacity for fade_out phase
  React.useEffect(() => {
    setOpacity(phase === "fade_out" || phase === "blank" ? 0 : 1);
  }, [phase]);

  const show = {
    goal: ["goal_appear", "paths_branch", "evaluating", "challenging", "selecting", "approved", "hold_result"].includes(phase),
    paths: ["paths_branch", "evaluating", "challenging", "selecting", "approved", "hold_result"].includes(phase),
    eval: ["evaluating", "challenging", "selecting", "approved", "hold_result"].includes(phase),
    challenge: ["challenging", "selecting", "approved", "hold_result"].includes(phase),
    selected: ["selecting", "approved", "hold_result"].includes(phase),
    result: ["approved", "hold_result"].includes(phase),
  };

  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-[3px] border border-white/[0.06]",
        "bg-[linear-gradient(160deg,#060a10_0%,#090d16_60%,#060a10_100%)]",
        className
      )}
      data-testid="collective-replay"
    >
      {/* Grid texture overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Header */}
      <div className="relative flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#45A29E]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#45A29E]">
            Collective Engine
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/20" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">
            {scenario.id}
          </span>
        </div>
      </div>

      {/* Scenario label */}
      <div className="relative border-b border-white/[0.04] px-5 py-2.5">
        <div className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-white/60">
          {scenario.goalLabel}
        </div>
        <div className="mt-0.5 font-mono text-[10px] text-white/30">{scenario.goalDescription}</div>
      </div>

      {/* SVG visualization */}
      <div
        className="relative flex-1 transition-opacity duration-500"
        style={{ opacity }}
      >
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="h-full w-full"
          aria-hidden="true"
          role="presentation"
        >
          <defs>
            <filter id="reactor-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ── Lines: Goal → Paths ── */}
          {scenario.paths.map((path, i) => {
            const px = PATH_XS[i];
            const pathCX = px + PATH_W / 2;
            const goalRight = GOAL_CX + GOAL_W / 2;
            const goalLeft = GOAL_CX - GOAL_W / 2;
            const startX = Math.min(Math.max(pathCX, goalLeft), goalRight);
            return (
              <path
                key={`gl-${path.id}`}
                d={`M ${startX} ${GOAL_Y + GOAL_H} C ${startX} ${GOAL_Y + GOAL_H + 28} ${pathCX} ${PATH_Y - 28} ${pathCX} ${PATH_Y}`}
                fill="none"
                stroke="#45A29E"
                strokeWidth="1"
                strokeOpacity={show.paths ? 0.35 : 0}
                className="transition-all duration-700"
              />
            );
          })}

          {/* ── Lines: Paths → Eval ── */}
          {scenario.paths.map((path, i) => {
            const px = PATH_XS[i];
            const pathCX = px + PATH_W / 2;
            const isSelected = path.id === scenario.selectedPathId;
            const isDenied = show.challenge && path.outcome === "denied";
            return (
              <line
                key={`pe-${path.id}`}
                x1={pathCX}
                y1={PATH_Y + PATH_H}
                x2={pathCX}
                y2={EVAL_Y - EVAL_R}
                stroke={isDenied ? "#FF2E2E" : isSelected && show.selected ? "#66FCF1" : "#45A29E"}
                strokeWidth="1"
                strokeOpacity={show.eval ? (isDenied ? 0.25 : isSelected && show.selected ? 0.8 : 0.3) : 0}
                className="transition-all duration-500"
              />
            );
          })}

          {/* ── Line: Selected Eval → Result ── */}
          {(() => {
            const selIdx = scenario.paths.findIndex((p) => p.id === scenario.selectedPathId);
            const selCX = PATH_XS[selIdx] + PATH_W / 2;
            return (
              <path
                d={`M ${selCX} ${EVAL_Y + EVAL_R} C ${selCX} ${EVAL_Y + 50} ${RESULT_CX} ${RESULT_Y - 50} ${RESULT_CX} ${RESULT_Y}`}
                fill="none"
                stroke="#66FCF1"
                strokeWidth="1.5"
                strokeOpacity={show.result ? 0.7 : 0}
                filter="url(#reactor-glow)"
                className="transition-all duration-700"
              />
            );
          })()}

          {/* ── Goal Node ── */}
          <g className="transition-all duration-500" style={{ opacity: show.goal ? 1 : 0 }}>
            <rect
              x={GOAL_CX - GOAL_W / 2}
              y={GOAL_Y}
              width={GOAL_W}
              height={GOAL_H}
              rx={2}
              fill="#0f1828"
              stroke="#45A29E"
              strokeWidth="1"
              strokeOpacity="0.6"
            />
            <text
              x={GOAL_CX}
              y={GOAL_Y + 14}
              textAnchor="middle"
              fill="#66FCF1"
              fontSize="9"
              fontFamily="DM Mono, monospace"
              letterSpacing="0.15em"
              fontWeight="500"
            >
              INTENTION
            </text>
            <text
              x={GOAL_CX}
              y={GOAL_Y + 28}
              textAnchor="middle"
              fill="#C5C6C7"
              fontSize="10"
              fontFamily="DM Mono, monospace"
            >
              {scenario.goalDescription}
            </text>
          </g>

          {/* ── Path Nodes ── */}
          {scenario.paths.map((path, i) => {
            const px = PATH_XS[i];
            const pathCX = px + PATH_W / 2;
            const isDenied = show.challenge && path.outcome === "denied";
            const isSelected = show.selected && path.id === scenario.selectedPathId;
            const isEval = show.eval && !show.challenge;

            return (
              <g
                key={`pn-${path.id}`}
                style={{
                  opacity: show.paths ? (isDenied && show.challenge ? 0.25 : 1) : 0,
                  transition: "opacity 0.5s ease",
                }}
              >
                <rect
                  x={px}
                  y={PATH_Y}
                  width={PATH_W}
                  height={PATH_H}
                  rx={2}
                  fill={isSelected ? "rgba(102,252,241,0.08)" : "#0d1520"}
                  stroke={isSelected ? "#66FCF1" : isEval ? "#FFB000" : "#384656"}
                  strokeWidth={isSelected ? 1.5 : 1}
                  strokeOpacity={isSelected ? 0.9 : isEval ? 0.5 : 0.5}
                />
                {isSelected && (
                  <rect
                    x={px}
                    y={PATH_Y}
                    width={PATH_W}
                    height={PATH_H}
                    rx={2}
                    fill="none"
                    stroke="#66FCF1"
                    strokeWidth="2"
                    strokeOpacity="0.3"
                    filter="url(#reactor-glow)"
                  />
                )}
                <text
                  x={pathCX}
                  y={PATH_Y + 12}
                  textAnchor="middle"
                  fill={isSelected ? "#66FCF1" : "#C5C6C7"}
                  fontSize="9"
                  fontFamily="DM Mono, monospace"
                  letterSpacing="0.05em"
                >
                  {path.label}
                </text>
                <text
                  x={pathCX}
                  y={PATH_Y + 24}
                  textAnchor="middle"
                  fill={isSelected ? "#45A29E" : "#7E8E9E"}
                  fontSize="8"
                  fontFamily="DM Mono, monospace"
                >
                  {path.sublabel}
                </text>
              </g>
            );
          })}

          {/* ── Eval Nodes ── */}
          {scenario.paths.map((path, i) => {
            const pathCX = PATH_XS[i] + PATH_W / 2;
            const isDenied = show.challenge && path.outcome === "denied";
            const isSelected = show.selected && path.id === scenario.selectedPathId;
            const isEval = show.eval;

            return (
              <g
                key={`en-${path.id}`}
                style={{
                  opacity: isEval ? 1 : 0,
                  transition: "opacity 0.4s ease",
                }}
              >
                <circle
                  cx={pathCX}
                  cy={EVAL_Y}
                  r={EVAL_R}
                  fill={isSelected ? "rgba(102,252,241,0.12)" : isDenied ? "rgba(255,46,46,0.1)" : "rgba(15,24,40,0.9)"}
                  stroke={isSelected ? "#66FCF1" : isDenied ? "#FF2E2E" : "#FFB000"}
                  strokeWidth="1"
                  strokeOpacity={isDenied ? 0.5 : isSelected ? 0.9 : 0.5}
                />
                {/* Eval pulse ring */}
                {isEval && !show.challenge && (
                  <circle
                    cx={pathCX}
                    cy={EVAL_Y}
                    r={EVAL_R + 5}
                    fill="none"
                    stroke="#FFB000"
                    strokeWidth="0.5"
                    strokeOpacity="0.25"
                    className="animate-ping"
                  />
                )}
                {/* Denied X */}
                {isDenied && (
                  <g>
                    <line
                      x1={pathCX - 5}
                      y1={EVAL_Y - 5}
                      x2={pathCX + 5}
                      y2={EVAL_Y + 5}
                      stroke="#FF2E2E"
                      strokeWidth="1.5"
                      strokeOpacity="0.8"
                    />
                    <line
                      x1={pathCX + 5}
                      y1={EVAL_Y - 5}
                      x2={pathCX - 5}
                      y2={EVAL_Y + 5}
                      stroke="#FF2E2E"
                      strokeWidth="1.5"
                      strokeOpacity="0.8"
                    />
                  </g>
                )}
                {/* Selected check */}
                {isSelected && (
                  <path
                    d={`M ${pathCX - 6} ${EVAL_Y} L ${pathCX - 2} ${EVAL_Y + 4} L ${pathCX + 6} ${EVAL_Y - 5}`}
                    fill="none"
                    stroke="#66FCF1"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#reactor-glow)"
                  />
                )}
                {/* Risk badge */}
                {isEval && !isDenied && !isSelected && (
                  <text
                    x={pathCX}
                    y={EVAL_Y + 4}
                    textAnchor="middle"
                    fill={RISK_COLORS[path.riskLevel]}
                    fontSize="7"
                    fontFamily="DM Mono, monospace"
                    letterSpacing="0.1em"
                    fontWeight="600"
                  >
                    {RISK_LABELS[path.riskLevel]}
                  </text>
                )}
              </g>
            );
          })}

          {/* ── Result Badge ── */}
          <g
            style={{
              opacity: show.result ? 1 : 0,
              transition: "opacity 0.6s ease",
            }}
          >
            <rect
              x={RESULT_CX - RESULT_W / 2}
              y={RESULT_Y}
              width={RESULT_W}
              height={RESULT_H}
              rx={2}
              fill="rgba(69,162,158,0.1)"
              stroke="#45A29E"
              strokeWidth="1.5"
              strokeOpacity="0.8"
            />
            <rect
              x={RESULT_CX - RESULT_W / 2}
              y={RESULT_Y}
              width={RESULT_W}
              height={RESULT_H}
              rx={2}
              fill="none"
              stroke="#66FCF1"
              strokeWidth="2"
              strokeOpacity="0.2"
              filter="url(#glow-strong)"
            />
            <text
              x={RESULT_CX}
              y={RESULT_Y + 18}
              textAnchor="middle"
              fill="#66FCF1"
              fontSize="12"
              fontFamily="DM Mono, monospace"
              letterSpacing="0.2em"
              fontWeight="600"
            >
              APPROVED
            </text>
            <text
              x={RESULT_CX}
              y={RESULT_Y + 33}
              textAnchor="middle"
              fill="#45A29E"
              fontSize="8"
              fontFamily="DM Mono, monospace"
              letterSpacing="0.15em"
            >
              RECEIPT #{scenario.receiptRef} · ANCHORED
            </text>
          </g>

          {/* ── Phase Label ── */}
          <text
            x={VB_W / 2}
            y={VB_H - 12}
            textAnchor="middle"
            fill="#384656"
            fontSize="8"
            fontFamily="DM Mono, monospace"
            letterSpacing="0.1em"
          >
            {phase === "evaluating" && "EVALUATING PATHS"}
            {phase === "challenging" && "CHALLENGING DECISIONS"}
            {phase === "selecting" && "GOVERNING SELECTION"}
            {(phase === "approved" || phase === "hold_result") && "COLLECTIVE OUTCOME REACHED"}
          </text>
        </svg>
      </div>

      {/* Disclaimer — mandatory, always present */}
      <div
        className="relative border-t border-white/[0.06] px-5 py-2.5"
        data-testid="replay-disclaimer"
        aria-label="Example scenario disclaimer"
      >
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-white/[0.06]" />
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">
            Example scenario — not from your environment
          </span>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>
      </div>
    </div>
  );
}
