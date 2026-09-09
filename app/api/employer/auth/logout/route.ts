import { NextResponse } from "next/server";

import { EMPLOYER_COOKIE_NAME } from "@/lib/employer-session";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/employer/login", request.url), { status: 303 });
  response.cookies.set({
    name: EMPLOYER_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  return response;
}
