import { PageHeader } from "@/ui-kit/components/PageHeader";
import { DecisionCaseClient } from "./decision-case-client";

type Props = {
  params: { caseId: string };
};

export default function DecisionCasePage({ params }: Props) {
  return (
    <>
      <PageHeader
        title="Decision Case"
        description={`Case ID: ${params.caseId}`}
      />
      <DecisionCaseClient caseId={params.caseId} />
    </>
  );
}

