import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, createSessionToken } from "@/lib/session";
import { isValidAadhaar, normaliseAadhaar } from "@/lib/verhoeff";

export async function POST(request: Request) {
  const { aadhaar, otp } = await request.json() as { aadhaar?: string; otp?: string };
  const digits = normaliseAadhaar(aadhaar ?? "");

  if (!isValidAadhaar(digits) || otp !== "123456") {
    return NextResponse.json({ message: "We could not verify those details." }, { status: 400 });
  }

  const user = await prisma.user.findFirst({ where: { aadhaarLast4: digits.slice(-4) } });
  if (!user) {
    return NextResponse.json({ message: "No member account was found. Please register first." }, { status: 404 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: await createSessionToken(user.id),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}
