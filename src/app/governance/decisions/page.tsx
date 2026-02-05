import { PageHeader } from "@/ui-kit/components/PageHeader";
import { DecisionsClient } from "./decisions-client";

export default function DecisionsPage() {
  return (
    <>
      <PageHeader
        title="Decisions"
        description="Pending governance decisions"
      />
      <DecisionsClient />
    </>
  );
}

