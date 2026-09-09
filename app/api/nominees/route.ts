import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/current-user";
export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const b = await req.json();
  const share = Number(b.sharePercent);
  if (!b.name || !b.relation || !b.dob || !b.address || !Number.isFinite(share) || share <= 0)
    return NextResponse.json({ error: "Complete every field." }, { status: 400 });
  const existing = await prisma.nominee.findMany({ where: { userId } });
  if (existing.reduce((n, x) => n + Number(x.sharePercent), 0) + share > 100)
    return NextResponse.json({ error: "Nominee shares cannot exceed 100%." }, { status: 400 });
  const nominee = await prisma.nominee.create({
    data: {
      userId,
      name: b.name,
      relation: b.relation,
      dob: new Date(`${b.dob}T00:00:00.000Z`),
      sharePercent: share,
    },
  });
  return NextResponse.json(nominee);
}
