import { NextResponse } from "next/server";

import { getMockEkycProfile } from "@/lib/mock-ekyc";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, createSessionToken } from "@/lib/session";
import { isValidAadhaar, normaliseAadhaar } from "@/lib/verhoeff";

function dateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

async function generateUan() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const uan = String(Math.floor(100_000_000_000 + Math.random() * 900_000_000_000));
    const existing = await prisma.user.findUnique({ where: { uan }, select: { id: true } });
    if (!existing) return uan;
  }
  throw new Error("Could not generate a unique UAN. Please try again.");
}

export async function POST(request: Request) {
  const { aadhaar, email, otp } = await request.json() as { aadhaar?: string; email?: string; otp?: string };
  const digits = normaliseAadhaar(aadhaar ?? "");

  if (!isValidAadhaar(digits) || otp !== "123456" || !email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ message: "Please complete Aadhaar, email, and verification correctly." }, { status: 400 });
  }
  const aadhaarLast4 = digits.slice(-4);
  const existing = await prisma.user.findFirst({ where: { OR: [{ aadhaarLast4 }, { email }] } });
  if (existing) {
    return NextResponse.json({ message: "An account already exists for these details. Please sign in." }, { status: 409 });
  }

  const profile = getMockEkycProfile();
  const user = await prisma.user.create({
    data: {
      uan: await generateUan(),
      aadhaarLast4,
      name: profile.name,
      dob: dateOnly(profile.dob),
      address: profile.address,
      email,
      emailVerified: new Date(),
    },
  });

  const response = NextResponse.json({ ok: true, uan: user.uan });
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
