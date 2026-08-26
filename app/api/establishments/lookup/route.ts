import { NextResponse } from "next/server";

import { getSessionUserId } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ message: "Please sign in again." }, { status: 401 });

  const entityId = new URL(request.url).searchParams.get("entityId")?.trim();
  if (!entityId) return NextResponse.json({ message: "Enter an entity ID to search." }, { status: 400 });
  const establishment = await prisma.establishment.findUnique({ where: { entityId } });
  if (!establishment) return NextResponse.json({ message: "No establishment was found for that entity ID." }, { status: 404 });
  return NextResponse.json(establishment);
}
