import { redirect } from "next/navigation";

import { DashboardOverview } from "@/components/dashboard-overview";
import { formatINR } from "@/lib/format";
import { getSessionUserId } from "@/lib/current-user";
import { getEffectiveStatus } from "@/lib/membership-status";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { memberships: { include: { contributions: true, claims: true } }, nominees: true },
  });
  if (!user) redirect("/login");

  const depositedContributions = user.memberships.flatMap((membership) => membership.contributions).filter((contribution) => contribution.depositedAt !== null);
  const employeeShare = depositedContributions.reduce((total, contribution) => total + Number(contribution.eeShare), 0);
  const employerShare = depositedContributions.reduce((total, contribution) => total + Number(contribution.erShare), 0);
  const interest = depositedContributions.reduce((total, contribution) => total + Number(contribution.interestCredited), 0);
  const missingMonths = user.memberships.flatMap((membership) => membership.contributions).filter((contribution) => contribution.depositedAt === null).length;
  const claimsInProgress = user.memberships.flatMap((membership) => membership.claims).filter((claim) => claim.status !== "SETTLED" && claim.status !== "REJECTED").length;
  const pendingDeclarations = user.memberships.filter((membership) => getEffectiveStatus(membership) === "PENDING").length;

  await searchParams;
  return <DashboardOverview balance={formatINR(employeeShare + employerShare + interest)} employeeShare={formatINR(employeeShare)} employerShare={formatINR(employerShare)} interest={formatINR(interest)} claimsInProgress={claimsInProgress} missingMonths={missingMonths} nomineeCount={user.nominees.length} pendingDeclarations={pendingDeclarations} />;
}
