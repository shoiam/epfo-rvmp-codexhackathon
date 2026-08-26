import { redirect } from "next/navigation";

import { ServiceHistoryClient } from "@/components/service-history-client";
import { getSessionUserId } from "@/lib/current-user";
import { getEffectiveStatus } from "@/lib/membership-status";
import { prisma } from "@/lib/prisma";

const DAY_MS = 24 * 60 * 60 * 1000;

export default async function DashboardServiceHistoryPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");
  const memberships = await prisma.membership.findMany({ where: { userId }, include: { establishment: true }, orderBy: { doj: "desc" } });
  const now = new Date();
  const data = memberships.map((membership) => {
    const effectiveStatus = getEffectiveStatus(membership, now);
    const exitRequestedAt = membership.exitRequestedAt;
    const pendingExit = exitRequestedAt !== null && membership.exitConfirmedAt === null;
    const daysUntilAutoAccept = exitRequestedAt && membership.exitConfirmedAt === null
      ? Math.max(0, Math.ceil((10 * DAY_MS - (now.getTime() - exitRequestedAt.getTime())) / DAY_MS))
      : null;
    return { id: membership.id, establishment: membership.establishment, doj: membership.doj.toISOString(), doe: membership.doe?.toISOString() ?? null, exitReason: membership.exitReason, effectiveStatus, exitRequestedAt: membership.exitRequestedAt?.toISOString() ?? null, exitConfirmedAt: membership.exitConfirmedAt?.toISOString() ?? null, autoAccepted: pendingExit && effectiveStatus === "ENDOFSERVICE", daysUntilAutoAccept };
  });
  return <ServiceHistoryClient memberships={data} />;
}
