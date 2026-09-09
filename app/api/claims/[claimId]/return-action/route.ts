import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/current-user";
export async function POST(req: Request, { params }: { params: Promise<{ claimId: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const { claimId } = await params;
  const claim = await prisma.claim.findFirst({
    where: { id: claimId, userId },
    include: { stages: true },
  });
  if (!claim) return NextResponse.json({ error: "Claim not found." }, { status: 404 });
  const stage = claim.stages.find((s) => s.outcome === "RETURNED");
  if (!stage) return NextResponse.json({ error: "No returned stage." }, { status: 400 });
  const contribution = stage.evidenceRef
    ? await prisma.contribution.findUnique({ where: { id: stage.evidenceRef } })
    : null;
  if (!contribution)
    return NextResponse.json({ error: "Evidence is not a contribution." }, { status: 400 });
  const existing = await prisma.grievance.findFirst({
    where: { userId, contributionId: contribution.id },
    orderBy: { createdAt: "asc" },
  });
  if (existing)
    await prisma.grievance.update({
      where: { id: existing.id },
      data: { subject: `Recovery notice for claim ${claimId}`, status: "OPEN" },
    });
  else
    await prisma.grievance.create({
      data: {
        userId,
        contributionId: contribution.id,
        subject: `Recovery notice for claim ${claimId}`,
        status: "OPEN",
      },
    });
  return NextResponse.json({
    ok: true,
    message: "Recovery notice raised against Northwind Systems.",
  });
}
