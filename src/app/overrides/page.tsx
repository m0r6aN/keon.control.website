import { Shell, PageContainer, PageHeader, PageSection, Card, CardContent, CardHeader } from "@/components/layout";

const overridePanels = [
  "Active fail-open controls",
  "Temporary throttling exceptions",
  "Tenant-specific emergency flags",
  "Audit receipts and expiry windows",
];

export default function OverridesPage() {
  return (
    <Shell>
      <PageContainer
        header={
          <PageHeader
            title="Overrides"
            description="Privileged controls that alter runtime behavior across one or more tenants."
          />
        }
      >
        <PageSection title="Override posture" description="These controls stay internal, explicit, and reviewable.">
          <div className="grid gap-4 md:grid-cols-2">
            {overridePanels.map((item) => (
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
