import { PageHeader } from "@/ui-kit/components/PageHeader";
import { CourtroomClient } from "./courtroom-client";

type Props = {
  params: { runId: string };
};

export default async function CourtroomPage({ params }: Props) {
  const { runId } = await params;
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Courtroom"
        description={`Audit and attribution for Run: ${runId}`}
      />
      <CourtroomClient runId={runId} />
    </div>
  );
}
