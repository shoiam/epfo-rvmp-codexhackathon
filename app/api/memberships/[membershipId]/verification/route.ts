import { NextResponse } from "next/server";

import { getSessionUserId } from "@/lib/current-user";
import { getEffectiveVerificationStatus } from "@/lib/membership-status";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ membershipId: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ message: "Please sign in again." }, { status: 401 });
  const { membershipId } = await params;
  const membership = await prisma.membership.findFirst({ where: { id: membershipId, userId } });
  if (!membership) return NextResponse.json({ message: "Membership not found." }, { status: 404 });
  if (getEffectiveVerificationStatus(membership) === "VERIFIED") return NextResponse.json({ message: "This membership is already verified." }, { status: 409 });
  await prisma.membership.update({ where: { id: membership.id }, data: { verificationRequestedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
