import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/current-user";
import { canEscalateClaimStage } from "@/lib/claim-stage-status";
import { nextEscalationOfficer } from "@/lib/escalation-ladder";
export async function POST(req: Request, { params }: { params: Promise<{ claimId: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const { claimId } = await params;
  const claim = await prisma.claim.findFirst({
    where: { id: claimId, userId },
    include: { stages: { orderBy: { seq: "asc" } } },
  });
  if (!claim) return NextResponse.json({ error: "Claim not found." }, { status: 404 });
  const current = [...claim.stages].reverse().find((s) => !s.exitedAt);
  if (!current || !canEscalateClaimStage(current))
    return NextResponse.json({ error: "This stage cannot be escalated yet." }, { status: 400 });
  const next = nextEscalationOfficer(current.officerDesignation);
  if (next.designation === current.officerDesignation)
    return NextResponse.json(
      { error: "This claim is already with the final officer." },
      { status: 400 },
    );
  const now = new Date();
  const office = current.office || "Regional Office";
  await prisma.$transaction([
    prisma.claimStage.update({ where: { id: current.id }, data: { exitedAt: now } }),
    prisma.claimStage.create({
      data: {
        claimId,
        seq: current.seq + 1,
        stageName: "Escalated by member",
        officerName: current.officerName,
        officerDesignation: current.officerDesignation,
        office,
        enteredAt: now,
        exitedAt: now,
        escalatedFrom: current.id,
      },
    }),
    prisma.claimStage.create({
      data: {
        claimId,
        seq: current.seq + 2,
        stageName: next.designation,
        officerName: next.name,
        officerDesignation: next.designation,
        office,
        enteredAt: now,
      },
    }),
  ]);
  return NextResponse.json({
    ok: true,
    officerName: next.name,
    officerDesignation: next.designation,
    office,
    message: `Escalated. Email sent to ${next.name} (${next.designation}), ${office}.`,
  });
}
