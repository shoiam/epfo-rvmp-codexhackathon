import { NextResponse } from "next/server";

import { getEmployerEstablishmentId } from "@/lib/employer-session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ membershipId: string }> }) {
  const establishmentId = await getEmployerEstablishmentId();
  if (!establishmentId) return NextResponse.json({ message: "Please sign in as an employer." }, { status: 401 });
  const { membershipId } = await params;
  const { action, reason } = await request.json() as { action?: "approve" | "dispute"; reason?: string };
  const membership = await prisma.membership.findFirst({ where: { id: membershipId, establishmentId }, include: { user: true } });
  if (!membership || !membership.exitRequestedAt || membership.exitConfirmedAt || membership.exitDisputedAt) return NextResponse.json({ message: "This exit request is no longer pending." }, { status: 404 });
  if (action === "approve") {
    await prisma.membership.update({ where: { id: membership.id }, data: { exitConfirmedAt: new Date(), status: "ENDOFSERVICE" } });
    return NextResponse.json({ ok: true });
  }
  if (action === "dispute" && reason?.trim()) {
    await prisma.membership.update({ where: { id: membership.id }, data: { exitDisputedAt: new Date(), exitDisputeReason: reason.trim() } });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ message: "A reason is required to dispute an exit request." }, { status: 400 });
}
