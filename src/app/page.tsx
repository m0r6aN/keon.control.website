import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * ForgePilot — Product Homepage
 * Your AI Co-Founder for Launching Real Businesses
 *
 * VLG compliant: semantic tokens, no gradients, no glow in light mode,
 * max 4px border-radius, WCAG AA accessible.
 */

const features = [
  {
    title: "Brand Identity",
    description:
      "AI-generated name, tagline, and visual identity tailored to your audience and market.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    title: "Launch Blueprint",
    description:
      "A structured plan covering positioning, pricing, audience, and go-to-market — in under 10 minutes.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    title: "Market Validation",
    description:
      "Competitive analysis and audience research so you launch with evidence, not assumptions.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

const steps = [
  { step: "1", title: "Describe your idea", description: "Tell us your concept in plain language." },
  { step: "2", title: "AI generates your plan", description: "Brand, positioning, pricing, and audience — assembled in real time." },
  { step: "3", title: "Review & launch", description: "Download your blueprint and start building with clarity." },
];

export default function Home() {
  return (
    <MainLayout>
      {/* ── Hero ── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Go from idea to validated launch plan
            <span className="block text-primary mt-1">in under 10 minutes.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            ForgePilot is your AI co-founder. Describe your business idea and get a
            complete brand identity, market analysis, and launch blueprint — instantly.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/launch">
              <Button size="lg">Start Your Launch Session</Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg">View Pricing</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 md:py-20 border-t border-border/40">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-center">
            Everything you need to launch with confidence
          </h2>
          <p className="mt-3 text-muted-foreground text-center max-w-xl mx-auto">
            No guesswork. No blank-page paralysis. Just clarity.
          </p>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-sm border border-border bg-card p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-muted text-primary">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-16 md:py-20 border-t border-border/40 bg-muted/50">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-center">
            Three steps. One blueprint.
          </h2>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-sm bg-primary text-primary-foreground text-sm font-semibold">
                  {s.step}
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 md:py-24 border-t border-border/40">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
            Ready to build something real?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Stop planning in circles. Start your launch session and get a validated
            blueprint in minutes.
          </p>
          <div className="mt-8">
            <Link href="/launch">
              <Button size="lg">Launch Now</Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
