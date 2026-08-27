import { NextResponse } from "next/server";

import { createEmployerSessionToken, EMPLOYER_COOKIE_NAME } from "@/lib/employer-session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { entityId, passcode } = await request.json() as { entityId?: string; passcode?: string };
  if (!entityId?.trim() || passcode !== "demo1234") return NextResponse.json({ message: "Enter a valid entity ID and the demo passcode." }, { status: 400 });
  const establishment = await prisma.establishment.findUnique({ where: { entityId: entityId.trim() } });
  if (!establishment) return NextResponse.json({ message: "No establishment was found for that entity ID." }, { status: 404 });

  const response = NextResponse.json({ ok: true });
  // The employer APIs live under /api/employer, so the cookie must cover both the UI and API paths.
  response.cookies.set({ name: EMPLOYER_COOKIE_NAME, value: await createEmployerSessionToken(establishment.id), httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
  return response;
}
