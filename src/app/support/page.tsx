import { Shell, PageContainer, PageHeader, PageSection, Card, CardContent, CardHeader } from "@/components/layout";

const supportPanels = [
  "Cross-tenant debug queue",
  "Execution replay and raw runtime links",
  "Escalation notes and support handoff state",
  "Trace-driven diagnosis shortcuts",
];

export default function SupportPage() {
  return (
    <Shell>
      <PageContainer
        header={
          <PageHeader
            title="Support"
            description="Privileged troubleshooting, tenant assistance, and runtime debug entry points."
          />
        }
      >
        <PageSection title="Support workspace" description="This surface replaces customer-shaped flows in the operator shell.">
          <div className="grid gap-4 md:grid-cols-2">
            {supportPanels.map((item) => (
              <Card key={item}>
                <CardHeader title={item} />
                <CardContent>
                  <p className="font-mono text-sm leading-6 text-[#C5C6C7]">
                    Internal-only operator tooling should land here or link from here, not from customer admin surfaces.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </PageSection>
      </PageContainer>
    </Shell>
  );
}
