"use client";

import Link from "next/link";
import { ArrowRight, CreditCard, KeyRound, Rocket, Waves } from "lucide-react";
import { Shell } from "@/components/layout";
import { Button, Panel, PanelContent, PanelDescription, PanelHeader, PanelTitle } from "@/components/ui";

const accountSummary = [
  { label: "Plan", value: "Builder", detail: "Start free now and upgrade from Admin > Subscription." },
  { label: "Billing state", value: "Provisioning-ready", detail: "Control is the source for billing visibility and plan actions." },
  { label: "First-run path", value: "3 steps", detail: "Create API key, run a request, inspect the receipt." },
  { label: "Customer boundary", value: "Single home", detail: "Subscription, billing, usage, and tenant admin all live here." },
];

const controlAreas = [
  {
    title: "Get Started",
    href: "/get-started",
    description: "First-login onboarding, quickstart steps, and receipt-backed activation.",
  },
  {
    title: "Admin > Subscription",
    href: "/admin/subscription",
    description: "Plan changes, invoices, payment methods, and enterprise escalation.",
  },
  {
    title: "Usage",
    href: "/usage",
    description: "Included executions, current consumption, and estimated overage exposure.",
  },
  {
    title: "API Keys",
    href: "/api-keys",
    description: "Issue and review credentials for governed execution environments.",
  },
] as const;

const controlPrinciples = [
  {
    icon: Rocket,
    title: "Onboarding terminates here",
    text: "Magic-link access should land customers in control, not back on the marketing site.",
  },
  {
    icon: CreditCard,
    title: "Billing belongs here",
    text: "Subscription changes, invoices, payment methods, and checkout initiation are authenticated control-plane workflows.",
  },
  {
    icon: KeyRound,
    title: "Tenant operations stay durable",
    text: "API keys, tenant administration, and usage visibility share the same internal entitlement model as billing.",
  },
] as const;

export default function Home() {
  return (
    <Shell>
      <div className="space-y-6 p-4">
        <Panel notch glow>
          <PanelContent className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1.4fr)_320px]">
            <div className="space-y-4">
              <div className="font-mono text-xs uppercase tracking-[0.28em] text-[#66FCF1]">
                Customer Control Plane
              </div>
              <div className="max-w-3xl space-y-3">
                <h1 className="font-['Rajdhani'] text-4xl font-bold tracking-tight text-[#EAEAEA]">
                  Subscription, billing, onboarding, API keys, usage, and tenant administration now converge in one authenticated home.
                </h1>
                <p className="max-w-2xl font-mono text-sm leading-7 text-[#C5C6C7]">
                  `control.keon.systems` is the canonical customer surface. The public site can
                  start free signup, but durable account management belongs here.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/get-started">Open get started</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/admin/subscription">Review subscription</Link>
                </Button>
              </div>
            </div>
            <div className="rounded border border-[#384656] bg-[#0B0C10] p-5">
              <div className="font-mono text-xs uppercase tracking-[0.22em] text-[#C5C6C7]">Customer focus</div>
              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3 text-sm text-[#C5C6C7]">
                  <Rocket className="mt-0.5 h-4 w-4 shrink-0 text-[#66FCF1]" />
                  <span>First login should end with a usable tenant, API key, and sample request.</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-[#C5C6C7]">
                  <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-[#66FCF1]" />
                  <span>Billing state is internally projected and shown here, not derived from raw Stripe text.</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-[#C5C6C7]">
                  <Waves className="mt-0.5 h-4 w-4 shrink-0 text-[#66FCF1]" />
                  <span>Usage, included limits, and overage visibility stay discoverable without reading docs.</span>
                </div>
              </div>
            </div>
          </PanelContent>
        </Panel>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {accountSummary.map((item) => (
            <Panel key={item.label} notch>
              <PanelContent className="space-y-3 p-5">
                <div className="font-mono text-xs uppercase tracking-[0.18em] text-[#C5C6C7]">{item.label}</div>
                <div className="font-['Rajdhani'] text-4xl font-bold text-[#EAEAEA]">{item.value}</div>
                <div className="font-mono text-xs leading-6 text-[#C5C6C7]">{item.detail}</div>
              </PanelContent>
            </Panel>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Panel notch>
            <PanelHeader>
              <div>
                <PanelTitle>Customer workstreams</PanelTitle>
                <PanelDescription>Core control-plane destinations for the new boundary model.</PanelDescription>
              </div>
            </PanelHeader>
            <PanelContent className="grid gap-4 md:grid-cols-2">
              {controlAreas.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded border border-[#384656] bg-[#0B0C10] p-4 transition-colors hover:border-[#66FCF1]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-xs uppercase tracking-[0.18em] text-[#EAEAEA]">{item.title}</div>
                      <div className="mt-2 text-sm leading-6 text-[#C5C6C7]">{item.description}</div>
                    </div>
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[#66FCF1]" />
                  </div>
                </Link>
              ))}
            </PanelContent>
          </Panel>

          <Panel>
            <PanelHeader>
              <div>
                <PanelTitle>Boundary rules</PanelTitle>
                <PanelDescription>Product rules this shell now needs to embody directly.</PanelDescription>
              </div>
            </PanelHeader>
            <PanelContent className="space-y-4">
              {controlPrinciples.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded border border-[#384656] bg-[#0B0C10] p-4">
                    <div className="flex items-start gap-3">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#66FCF1]" />
                      <div>
                        <div className="font-mono text-xs uppercase tracking-[0.18em] text-[#EAEAEA]">{item.title}</div>
                        <div className="mt-2 text-sm leading-6 text-[#C5C6C7]">{item.text}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </PanelContent>
          </Panel>
        </div>
      </div>
    </Shell>
  );
}
