import { NextResponse } from "next/server";

import { getSessionUserId } from "@/lib/current-user";
import { getEffectiveStatus } from "@/lib/membership-status";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ message: "Please sign in again." }, { status: 401 });
  const { entityId, concurrentAcknowledged, afterExitLoggedForMembershipId, doj: requestedDoj } = await request.json() as { entityId?: string; concurrentAcknowledged?: boolean; afterExitLoggedForMembershipId?: string; doj?: string };
  if (!entityId?.trim()) return NextResponse.json({ message: "An establishment entity ID is required." }, { status: 400 });
  const establishment = await prisma.establishment.findUnique({ where: { entityId: entityId.trim() } });
  if (!establishment) return NextResponse.json({ message: "No establishment was found for that entity ID." }, { status: 404 });
  const existing = await prisma.membership.findFirst({ where: { userId, establishmentId: establishment.id } });
  if (existing) return NextResponse.json({ message: "This employer is already in your service history." }, { status: 409 });
  const newDoj = requestedDoj ? new Date(`${requestedDoj}T00:00:00.000Z`) : new Date();
  if (Number.isNaN(newDoj.getTime())) return NextResponse.json({ message: "The joining date is invalid." }, { status: 400 });

  const otherMemberships = await prisma.membership.findMany({ where: { userId }, include: { establishment: true } });
  const activeMembership = otherMemberships.find((membership) => getEffectiveStatus(membership) === "ACTIVE");
  const allowedAfterExitLog = afterExitLoggedForMembershipId && activeMembership?.id === afterExitLoggedForMembershipId;
  if (activeMembership && !concurrentAcknowledged && !allowedAfterExitLog) {
    return NextResponse.json({ code: "ACTIVE_EMPLOYMENT_EXISTS", membershipId: activeMembership.id, company: activeMembership.establishment.name, message: `You're still marked as active at ${activeMembership.establishment.name}.` }, { status: 409 });
  }

  const conflictingMembership = otherMemberships.find((membership) => membership.doe !== null && newDoj.getTime() < membership.doe.getTime() - 90 * 24 * 60 * 60 * 1000);
  if (conflictingMembership) {
    return NextResponse.json({ code: "OVERLAPPING_SERVICE", company: conflictingMembership.establishment.name, message: `The joining date precedes the confirmed exit at ${conflictingMembership.establishment.name} by more than 90 days.` }, { status: 409 });
  }

  await prisma.membership.create({ data: { userId, establishmentId: establishment.id, status: "PENDING", doj: newDoj, joinDeclaredAt: new Date(), concurrentAcknowledgedAt: concurrentAcknowledged ? new Date() : null } });
  return NextResponse.json({ ok: true }, { status: 201 });
}
