import { redirect } from "next/navigation";

import { EmployerDashboard } from "@/components/employer-dashboard";
import { getEmployerEstablishmentId } from "@/lib/employer-session";
import { prisma } from "@/lib/prisma";

const DAY_MS = 24 * 60 * 60 * 1000;

export default async function EmployerDashboardPage() {
  const establishmentId = await getEmployerEstablishmentId();
  if (!establishmentId) redirect("/employer/login");
  const establishment = await prisma.establishment.findUnique({ where: { id: establishmentId } });
  if (!establishment) redirect("/employer/login");
  const memberships = await prisma.membership.findMany({ where: { establishmentId }, include: { user: true }, orderBy: { createdAt: "asc" } });
  const declarations = memberships.filter((membership) => membership.joinConfirmedAt === null && membership.joinRejectedAt === null).map((membership) => ({ id: membership.id, name: membership.user.name, uan: membership.user.uan, doj: membership.doj.toISOString(), declaredAt: (membership.joinDeclaredAt ?? membership.createdAt).toISOString() }));
  const now = Date.now();
  const exits = memberships.filter((membership) => membership.exitRequestedAt !== null && membership.exitConfirmedAt === null && membership.exitDisputedAt === null).map((membership) => ({ id: membership.id, name: membership.user.name, uan: membership.user.uan, doe: membership.doe?.toISOString() ?? null, reason: membership.exitReason, requestedAt: membership.exitRequestedAt!.toISOString(), daysRemaining: Math.max(0, Math.ceil((10 * DAY_MS - (now - membership.exitRequestedAt!.getTime())) / DAY_MS)) }));
  return <EmployerDashboard establishmentName={establishment.name} declarations={declarations} exits={exits} />;
}
