import Link from "next/link";
import { Shell, PageContainer, PageHeader, PageSection, Card, CardContent, CardHeader } from "@/components/layout";
import { Button } from "@/components/ui";

const queues = [
  { title: "Active bridges", description: "1 sev-1 and 1 sev-2 incident currently staffed." },
  { title: "Waiting for action", description: "3 incidents need operator ack, evidence export, or rollback approval." },
  { title: "Recent closures", description: "7 incidents closed in the last 72 hours with receipts archived." },
];

export default function IncidentsPage() {
  return (
    <Shell>
      <PageContainer
        header={
          <PageHeader
            title="Incidents"
            description="Internal incident response, escalation, and bridge management."
            actions={
              <Button asChild>
                <Link href="/incident-mode">Enter incident mode</Link>
              </Button>
            }
          />
        }
      >
        <PageSection title="Queue" description="Operator-first incident handling.">
          <div className="grid gap-4 md:grid-cols-3">
            {queues.map((item) => (
              <Card key={item.title}>
                <CardHeader title={item.title} />
                <CardContent>
                  <p className="font-mono text-sm leading-6 text-[#C5C6C7]">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </PageSection>
      </PageContainer>
    </Shell>
  );
}
