import { redirect } from "next/navigation";

import { ServiceHistoryClient } from "@/components/service-history-client";
import { getSessionUserId } from "@/lib/current-user";
import { getEffectiveStatus, getEffectiveVerificationStatus } from "@/lib/membership-status";
import { prisma } from "@/lib/prisma";

const DAY_MS = 24 * 60 * 60 * 1000;

export default async function DashboardServiceHistoryPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");
  const memberships = await prisma.membership.findMany({ where: { userId }, include: { establishment: true }, orderBy: { doj: "desc" } });
  const now = new Date();
  const data = memberships.map((membership) => {
    const effectiveStatus = getEffectiveStatus(membership, now);
    const effectiveVerification = getEffectiveVerificationStatus(membership, now);
    const exitRequestedAt = membership.exitRequestedAt;
    const pendingExit = exitRequestedAt !== null && membership.exitConfirmedAt === null;
    const daysUntilAutoAccept = exitRequestedAt && membership.exitConfirmedAt === null
      ? Math.max(0, Math.ceil((10 * DAY_MS - (now.getTime() - exitRequestedAt.getTime())) / DAY_MS))
      : null;
    const verificationRequestedAt = membership.verificationRequestedAt;
    const verificationPending = verificationRequestedAt !== null && membership.verificationConfirmedAt === null && effectiveVerification !== "VERIFIED";
    const verificationDaysRemaining = verificationPending ? Math.max(0, Math.ceil((10 * DAY_MS - (now.getTime() - verificationRequestedAt.getTime())) / DAY_MS)) : null;
    return { id: membership.id, establishment: membership.establishment, doj: membership.doj.toISOString(), doe: membership.doe?.toISOString() ?? null, exitReason: membership.exitReason, effectiveStatus, source: membership.source, effectiveVerification, concurrentAcknowledgedAt: membership.concurrentAcknowledgedAt?.toISOString() ?? null, exitRequestedAt: membership.exitRequestedAt?.toISOString() ?? null, exitConfirmedAt: membership.exitConfirmedAt?.toISOString() ?? null, autoAccepted: pendingExit && effectiveStatus === "ENDOFSERVICE", daysUntilAutoAccept, verificationPending, verificationDaysRemaining };
  });
  const activeMemberships = data.filter((membership) => membership.effectiveStatus === "ACTIVE");
  let concurrentWarning: string | null = null;
  for (let left = 0; left < activeMemberships.length && !concurrentWarning; left += 1) {
    for (let right = left + 1; right < activeMemberships.length; right += 1) {
      const a = activeMemberships[left];
      const b = activeMemberships[right];
      const overlapStart = Math.max(new Date(a.doj).getTime(), new Date(b.doj).getTime());
      const overlapEnd = Math.min(a.doe ? new Date(a.doe).getTime() : now.getTime(), b.doe ? new Date(b.doe).getTime() : now.getTime());
      if (overlapEnd - overlapStart > 60 * DAY_MS && !a.concurrentAcknowledgedAt && !b.concurrentAcknowledgedAt) concurrentWarning = `${a.establishment.name} and ${b.establishment.name}`;
    }
  }
  return <ServiceHistoryClient memberships={data} concurrentWarning={concurrentWarning} />;
}
