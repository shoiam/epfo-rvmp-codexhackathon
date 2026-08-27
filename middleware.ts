import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";
import { EMPLOYER_COOKIE_NAME } from "@/lib/employer-session";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/employer/dashboard")) {
    const subject = await verifySessionToken(request.cookies.get(EMPLOYER_COOKIE_NAME)?.value);
    if (subject?.startsWith("employer:")) return NextResponse.next();
    return NextResponse.redirect(new URL("/employer/login", request.url));
  }
  const userId = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (userId) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = { matcher: ["/dashboard/:path*", "/employer/dashboard/:path*"] };
