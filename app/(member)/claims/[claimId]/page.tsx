import { PlaceholderPage } from "@/components/placeholder-page";

export default async function ClaimDetailPage({
  params,
}: {
  params: Promise<{ claimId: string }>;
}) {
  const { claimId } = await params;
  return (
    <PlaceholderPage
      title="Claim details"
      description={`Claim reference ${claimId}. Its documents and processing-stage timeline will appear here.`}
    />
  );
}
