import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/current-user";
import { FORM_CONFIG } from "@/lib/claim-forms";
import { claimEligibility } from "@/lib/claim-eligibility";
import { getEffectiveStatus } from "@/lib/membership-status";
export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const body = await req.json();
  const config = FORM_CONFIG[body.formType as keyof typeof FORM_CONFIG];
  if (!config) return NextResponse.json({ error: "Unknown claim form." }, { status: 400 });
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { memberships: { include: { establishment: true } } },
  });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
  const checks = claimEligibility(body.formType, user.memberships, user.dob);
  if (!checks.every((c) => c.passed))
    return NextResponse.json({ error: checks.find((c) => !c.passed)?.reason }, { status: 400 });
  const membership =
    user.memberships.find((m) =>
      body.formType === "F31" ? getEffectiveStatus(m) === "ACTIVE" : true,
    ) ?? user.memberships[0];
  if (!membership) return NextResponse.json({ error: "No membership found." }, { status: 400 });
  const fields = body.fields ?? {};
  const amount = Number(fields.amount || 0);
  if (!Number.isFinite(amount) || amount < 0)
    return NextResponse.json({ error: "Enter a valid amount." }, { status: 400 });
  for (const field of config.fields)
    if (field.required && !fields[field.key])
      return NextResponse.json({ error: `${field.label} is required.` }, { status: 400 });
  const documents = body.documents ?? {};
  for (const doc of config.requiredDocs)
    if (doc.required && !documents[doc.key]?.filename)
      return NextResponse.json({ error: `${doc.label} is required.` }, { status: 400 });
  const now = new Date();
  const claim = await prisma.claim.create({
    data: {
      userId,
      membershipId: membership.id,
      formType: body.formType,
      amount,
      purpose: fields.purpose || config.title,
      status: "IN_PROGRESS",
      documents: {
        create: Object.entries(documents)
          .filter(([, d]) => (d as { filename?: string }).filename)
          .map(([key, d]) => ({
            docType: key,
            filename: (d as { filename: string }).filename,
            sizeBytes: Number((d as { sizeBytes?: number }).sizeBytes || 0),
          })),
      },
      stages: {
        create: [
          { seq: 1, stageName: "Submitted", enteredAt: now, exitedAt: now },
          {
            seq: 2,
            stageName: "Scrutiny",
            enteredAt: now,
            officerDesignation: "SSA",
            officerName: "R. Kulkarni",
            office: "Regional Office",
          },
        ],
      },
    },
  });
  return NextResponse.json({ ok: true, claimId: claim.id });
}
