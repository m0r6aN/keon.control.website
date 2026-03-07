import { Shell, PageContainer, PageHeader, PageSection, Card, CardContent, CardHeader } from "@/components/layout";

const rolloutChecks = [
  "Upcoming maintenance window approvals",
  "Canary progress and rollback readiness",
  "Customer communication state",
  "Global dependency change watchlist",
];

export default function RolloutsPage() {
  return (
    <Shell>
      <PageContainer
        header={
          <PageHeader
            title="Rollouts"
            description="Maintenance, release coordination, and platform change management."
          />
        }
      >
        <PageSection title="Release controls" description="Operator-owned rollout workflows stay out of the customer app.">
          <div className="grid gap-4 md:grid-cols-2">
            {rolloutChecks.map((item) => (
              <Card key={item}>
                <CardHeader title={item} />
                <CardContent>
                  <p className="font-mono text-sm leading-6 text-[#C5C6C7]">{item}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </PageSection>
      </PageContainer>
    </Shell>
  );
}
