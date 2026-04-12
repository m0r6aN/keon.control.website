"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

const LIFECYCLE_STEPS = [
  { n: "01", label: "Proposal" },
  { n: "02", label: "Branch" },
  { n: "03", label: "Adversarial" },
  { n: "04", label: "Vote" },
  { n: "05", label: "Collapse" },
  { n: "06", label: "Sealed" },
] as const;

const FEATURE_TAGS = [
  "Temporal Branching",
  "Adversarial Self-Review",
  "Vote + Collapse",
  "Cryptographic Seal",
  "Append-Only Ledger",
] as const;

const METRICS = [
  { value: "3", label: "Active Branches" },
  { value: "12", label: "Sealed Decisions" },
  { value: "100%", label: "Governance Coverage" },
  { value: "0", label: "Ungoverned Actions" },
] as const;

export default function CollectiveShowcasePage() {
  const router = useRouter();

  const handleClose = () => {
    if (typeof window !== "undefined" && window.opener) {
      window.close();
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-[#070d14] text-[#C5C6C7]">
      {/* Topbar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-12 items-center justify-between border-b border-[#1e2d3d] bg-[#0d1520]/92 px-5 backdrop-blur-md">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#7EE8E0]">
          Keon Control
        </span>
        <button
          type="button"
          onClick={handleClose}
          className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40 hover:text-white/70 transition-colors"
        >
          ← Close tab
        </button>
      </header>

      <main className="pt-12">
        {/* Hero */}
        <section className="relative min-h-[520px] flex items-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25"
            style={{ backgroundImage: "url('/images/keon-orbit-2.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070d14] via-[#070d14]/80 to-transparent" />

          <div className="relative z-10 max-w-5xl mx-auto w-full px-10 py-16">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#7EE8E0] mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7EE8E0]" />
              Keon Collective
              <span className="text-white/30 mx-1">·</span>
              Group Cognition Layer
            </div>

            <h1 className="font-display text-5xl font-bold text-white leading-tight mb-6 max-w-xl">
              Decisions that{" "}
              <span className="text-[#7EE8E0]">transcend</span>{" "}
              the individual.
            </h1>

            <p className="text-base leading-7 text-white/68 max-w-lg mb-8">
              AI proposals don&apos;t just execute. They branch across multiple entities, face
              adversarial challenge, collect votes, and collapse into cryptographically-sealed
              outcomes — governed decisions no single system could reach alone.
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {FEATURE_TAGS.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[9px] uppercase tracking-[0.14em] border border-[#7EE8E0]/30 text-[#7EE8E0]/75 rounded-full px-3 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>

            <a
              href="/collective"
              className="inline-flex items-center h-11 px-6 rounded-[8px] bg-[#7EE8E0] text-[#061117] font-mono text-[11px] uppercase tracking-[0.18em] font-bold hover:bg-[#9ff0e8] transition-colors"
            >
              Activate Collective →
            </a>
          </div>
        </section>

        {/* Metrics bar */}
        <div className="border-y border-[#1e2d3d] bg-[#0a1118]">
          <div className="max-w-5xl mx-auto px-10 py-5 grid grid-cols-4 divide-x divide-[#1e2d3d]">
            {METRICS.map(({ value, label }) => (
              <div key={label} className="px-6 first:pl-0 last:pr-0">
                <div className="font-display text-3xl font-bold text-white">{value}</div>
                <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40 mt-1">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lifecycle diagram */}
        <section className="max-w-5xl mx-auto px-10 py-16">
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35 mb-8 text-center">
            How Collective works — the deliberation lifecycle
          </div>
          <div className="relative flex items-center justify-between">
            {/* Connecting line */}
            <div className="absolute left-0 right-0 top-1/2 h-px bg-[#7EE8E0]/20 -translate-y-1/2" />
            {LIFECYCLE_STEPS.map(({ n, label }, i) => (
              <div key={n} className="relative flex flex-col items-center gap-3">
                <div
                  className={`h-11 w-11 rounded-full border flex items-center justify-center font-mono text-xs font-bold ${
                    i === 2
                      ? "border-[#7EE8E0] bg-[#7EE8E0] text-[#061117]"
                      : "border-[#7EE8E0]/30 bg-[#070d14] text-[#7EE8E0]/60"
                  }`}
                >
                  {n}
                </div>
                <span
                  className={`font-mono text-[9px] uppercase tracking-[0.15em] ${
                    i === 2 ? "text-[#7EE8E0]" : "text-white/35"
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Deliberation tree */}
        <section className="max-w-5xl mx-auto px-10 pb-16">
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35 mb-8 text-center">
            Live deliberation — Deploy inference model v3.1 to production
          </div>

          <div className="flex flex-col items-center gap-4">
            {/* Intent */}
            <div className="w-full max-w-xl border border-[#1e2d3d] bg-[#0e1520] rounded-[8px] p-4">
              <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/35 mb-1">
                Intent · submitted 14m ago
              </div>
              <div className="text-sm text-white/80">
                Deploy inference model v3.1 to production cluster
              </div>
            </div>

            <div className="w-px h-4 bg-[#7EE8E0]/20" />

            {/* Branches */}
            <div className="grid grid-cols-3 gap-3 w-full">
              {[
                {
                  id: "A",
                  verdict: "Proceed",
                  body: "Drift within acceptable tolerance. Deploy immediately.",
                  proceed: 62,
                  hold: 38,
                  variant: "neutral",
                },
                {
                  id: "B",
                  verdict: "Adversarial Challenge",
                  body: "p99 latency spike in staging. Risk score 0.74 — defer pending investigation.",
                  proceed: 44,
                  hold: 56,
                  variant: "adversarial",
                },
                {
                  id: "C",
                  verdict: "Synthesized",
                  body: "Proceed — bind p99 < 180ms monitoring alert as execution condition.",
                  proceed: 81,
                  hold: 19,
                  variant: "neutral",
                },
              ].map(({ id, verdict, body, proceed, hold, variant }) => (
                <div
                  key={id}
                  className={`border rounded-[8px] p-4 ${
                    variant === "adversarial"
                      ? "border-[#F4D35E]/30 bg-[#F4D35E]/05"
                      : "border-[#1e2d3d] bg-[#0e1520]"
                  }`}
                >
                  <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-white/35 mb-1">
                    Branch {id} · {verdict}
                  </div>
                  <p className="text-[12px] leading-[1.6] text-white/65 mb-3">{body}</p>
                  <div className="h-0.5 bg-[#1e2d3d] rounded-full overflow-hidden mb-1">
                    <div
                      className={`h-full rounded-full ${
                        variant === "adversarial" ? "bg-[#F4D35E]/60" : "bg-[#7EE8E0]/50"
                      }`}
                      style={{ width: `${proceed}%` }}
                    />
                  </div>
                  <div className="flex justify-between font-mono text-[8px] text-white/30">
                    <span>{proceed}% proceed</span>
                    <span>{hold}% hold</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-px h-4 bg-[#7EE8E0]/20" />

            {/* Sealed */}
            <div className="w-full max-w-xl border border-[#7EE8E0]/25 bg-[#7EE8E0]/05 rounded-[8px] p-4">
              <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#7EE8E0]/60 mb-2">
                Collapsed · Sealed · Receipt #C-4421
              </div>
              <div className="flex items-start gap-2 text-sm text-white/80">
                <span className="text-[#7EE8E0] mt-0.5">✓</span>
                Proceed with p99 &lt; 180ms monitoring alert bound. Branch C adopted. Execution authorized.
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
