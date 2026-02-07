import { VersionedPolicyClient } from "./versioned-policy-client";

type Props = {
  params: { policyId: string; version: string };
};

export default async function VersionedPolicyPage({ params }: Props) {
  const { policyId, version } = await params;
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <VersionedPolicyClient 
        policyId={policyId} 
        version={version} 
      />
    </div>
  );
}
