import { cookies } from "next/headers";

import { createSessionToken, verifySessionToken } from "@/lib/session";

export const EMPLOYER_COOKIE_NAME = "epfo_employer_session";

export async function createEmployerSessionToken(establishmentId: string) {
  return createSessionToken(`employer:${establishmentId}`);
}

export async function getEmployerEstablishmentId() {
  const cookieStore = await cookies();
  const signedValue = cookieStore.get(EMPLOYER_COOKIE_NAME)?.value;
  const subject = await verifySessionToken(signedValue);
  return subject?.startsWith("employer:") ? subject.slice("employer:".length) : null;
}
