import { PlaceholderPage } from "@/components/placeholder-page";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams;
  return <PlaceholderPage title={welcome ? "Welcome to EPFO Reimagined" : "Dashboard"} description={welcome ? "Your UAN has been generated and your member account is ready." : "Your PF and pension summary, recent contribution health, and items needing your attention will appear here."} />;
}
