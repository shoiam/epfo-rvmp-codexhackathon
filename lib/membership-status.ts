export type MembershipStatus = "PENDING" | "ACTIVE" | "ENDOFSERVICE";
export type VerificationStatus = "VERIFIED" | "UNVERIFIED" | "DISPUTED";

type MembershipForStatus = {
  status: MembershipStatus;
  exitRequestedAt: Date | null;
  exitConfirmedAt: Date | null;
};

const EXIT_RESPONSE_WINDOW_MS = 10 * 24 * 60 * 60 * 1000;

/** Returns the status visible to a member without writing time-driven changes. */
export function getEffectiveStatus(
  membership: MembershipForStatus,
  now = new Date(),
): MembershipStatus {
  const unansweredExitHasExpired =
    membership.exitRequestedAt !== null &&
    membership.exitConfirmedAt === null &&
    now.getTime() - membership.exitRequestedAt.getTime() >= EXIT_RESPONSE_WINDOW_MS;

  return unansweredExitHasExpired ? "ENDOFSERVICE" : membership.status;
}

const VERIFICATION_RESPONSE_WINDOW_MS = 10 * 24 * 60 * 60 * 1000;

export function getEffectiveVerificationStatus(
  membership: { verification: VerificationStatus; verificationRequestedAt: Date | null; verificationConfirmedAt: Date | null },
  now = new Date(),
): VerificationStatus {
  const requestExpired = membership.verificationRequestedAt !== null && membership.verificationConfirmedAt === null && now.getTime() - membership.verificationRequestedAt.getTime() >= VERIFICATION_RESPONSE_WINDOW_MS;
  return requestExpired ? "VERIFIED" : membership.verification;
}
