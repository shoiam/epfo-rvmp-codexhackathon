import { prisma } from "@/lib/prisma";
export async function resumeClaim(claimId: string) {
  const claim = await prisma.claim.findUnique({
    where: { id: claimId },
    include: { stages: { orderBy: { seq: "desc" } } },
  });
  if (!claim) throw new Error("Claim not found");
  const returned = claim.stages.find((s) => s.outcome === "RETURNED");
  if (!returned) throw new Error("No returned stage");
  return prisma.$transaction([
    prisma.claim.update({
      where: { id: claimId },
      data: { correctionRound: { increment: 1 }, status: "IN_PROGRESS" },
    }),
    prisma.claimStage.create({
      data: {
        claimId,
        seq: returned.seq,
        stageName: returned.stageName,
        officerName: returned.officerName,
        officerDesignation: returned.officerDesignation,
        office: returned.office,
        enteredAt: new Date(),
        outcome: "PASSED",
      },
    }),
  ]);
}
