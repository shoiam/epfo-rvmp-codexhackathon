import { NextResponse } from "next/server";

import { getEmployerEstablishmentId } from "@/lib/employer-session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ membershipId: string }> }) {
  const establishmentId = await getEmployerEstablishmentId();
  if (!establishmentId) return NextResponse.json({ message: "Please sign in as an employer." }, { status: 401 });
  const { membershipId } = await params;
  const { action, reason } = await request.json() as { action?: "approve" | "reject"; reason?: string };
  const membership = await prisma.membership.findFirst({ where: { id: membershipId, establishmentId }, include: { user: true } });
  if (!membership || membership.joinConfirmedAt || membership.joinRejectedAt) return NextResponse.json({ message: "This declaration is no longer pending." }, { status: 404 });
  if (action === "approve") {
    await prisma.membership.update({ where: { id: membership.id }, data: { joinConfirmedAt: new Date(), status: "ACTIVE", joinRejectionReason: null, joinRejectedAt: null, verification: membership.verification === "UNVERIFIED" ? "VERIFIED" : membership.verification, verificationConfirmedAt: membership.verification === "UNVERIFIED" ? new Date() : undefined } });
    return NextResponse.json({ ok: true });
  }
  if (action === "reject" && reason?.trim()) {
    await prisma.membership.update({ where: { id: membership.id }, data: { joinRejectedAt: new Date(), joinRejectionReason: reason.trim() } });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ message: "A reason is required to reject a declaration." }, { status: 400 });
}
