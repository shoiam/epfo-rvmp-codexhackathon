import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/current-user";
import { claimEligibility } from "@/lib/claim-eligibility";
import ClaimsWorkspace from "@/components/claims-workspace";
export default async function ClaimsPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      memberships: { include: { establishment: true } },
      claims: { include: { stages: { orderBy: { seq: "asc" } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!user) redirect("/login");
  const eligibility = {
    F31: claimEligibility("F31", user.memberships, user.dob),
    F19: claimEligibility("F19", user.memberships, user.dob),
    F10C: claimEligibility("F10C", user.memberships, user.dob),
    F10D: claimEligibility("F10D", user.memberships, user.dob),
  };
  const claims = user.claims.map((c) => ({
    ...c,
    amount: c.amount.toString(),
    createdAt: c.createdAt.toISOString(),
    stages: c.stages.map((s) => ({
      ...s,
      enteredAt: s.enteredAt.toISOString(),
      exitedAt: s.exitedAt?.toISOString() || null,
    })),
  }));
  return <ClaimsWorkspace eligibility={eligibility} claims={claims} />;
}
