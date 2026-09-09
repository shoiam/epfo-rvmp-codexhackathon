import { NextResponse } from "next/server";

import { getSessionUserId } from "@/lib/current-user";
import { getEffectiveStatus } from "@/lib/membership-status";
import { prisma } from "@/lib/prisma";

const exitReasons = new Set([
  "Resignation",
  "Retirement",
  "Termination",
  "End of contract",
  "Death",
  "Other",
]);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ membershipId: string }> },
) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ message: "Please sign in again." }, { status: 401 });
  const { membershipId } = await params;
  const { doe, exitReason } = (await request.json()) as { doe?: string; exitReason?: string };
  const exitDate = doe ? new Date(`${doe}T00:00:00.000Z`) : null;
  if (
    !exitDate ||
    Number.isNaN(exitDate.getTime()) ||
    !exitReason ||
    !exitReasons.has(exitReason)
  ) {
    return NextResponse.json({ message: "Provide a valid exit date and reason." }, { status: 400 });
  }
  const membership = await prisma.membership.findFirst({ where: { id: membershipId, userId } });
  if (!membership) return NextResponse.json({ message: "Membership not found." }, { status: 404 });
  if (getEffectiveStatus(membership) !== "ACTIVE") {
    return NextResponse.json(
      { message: "An exit can only be logged for an active membership." },
      { status: 409 },
    );
  }
  await prisma.membership.update({
    where: { id: membership.id },
    data: { doe: exitDate, exitReason, exitRequestedAt: new Date(), exitConfirmedAt: null },
  });
  return NextResponse.json({ ok: true });
}
