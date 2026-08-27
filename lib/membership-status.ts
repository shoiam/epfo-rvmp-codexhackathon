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
  membership: { verification?: VerificationStatus | null; verificationRequestedAt?: Date | null; verificationConfirmedAt?: Date | null },
  now = new Date(),
): VerificationStatus {
  const requestedAt = membership.verificationRequestedAt ?? null;
  const confirmedAt = membership.verificationConfirmedAt ?? null;
  const requestExpired = requestedAt !== null && confirmedAt === null && now.getTime() - requestedAt.getTime() >= VERIFICATION_RESPONSE_WINDOW_MS;
  return requestExpired ? "VERIFIED" : (membership.verification ?? "VERIFIED");
}
