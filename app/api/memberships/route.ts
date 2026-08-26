import { NextResponse } from "next/server";

import { getSessionUserId } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ message: "Please sign in again." }, { status: 401 });
  const { entityId } = await request.json() as { entityId?: string };
  if (!entityId?.trim()) return NextResponse.json({ message: "An establishment entity ID is required." }, { status: 400 });
  const establishment = await prisma.establishment.findUnique({ where: { entityId: entityId.trim() } });
  if (!establishment) return NextResponse.json({ message: "No establishment was found for that entity ID." }, { status: 404 });
  const existing = await prisma.membership.findFirst({ where: { userId, establishmentId: establishment.id } });
  if (existing) return NextResponse.json({ message: "This employer is already in your service history." }, { status: 409 });

  await prisma.membership.create({ data: { userId, establishmentId: establishment.id, status: "PENDING", doj: new Date(), joinDeclaredAt: new Date() } });
  return NextResponse.json({ ok: true }, { status: 201 });
}
