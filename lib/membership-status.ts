export type MembershipStatus = "PENDING" | "ACTIVE" | "ENDOFSERVICE";

type MembershipForStatus = {
  status: MembershipStatus;
  exitRequestedAt: Date | null;
  exitConfirmedAt: Date | null;
};

const EXIT_RESPONSE_WINDOW_MS = 10 * 24 * 60 * 60 * 1000;

/** Returns the status visible to a member without writing time-driven changes. */
export function getEffectiveMembershipStatus(
  membership: MembershipForStatus,
  now = new Date(),
): MembershipStatus {
  const unansweredExitHasExpired =
    membership.exitRequestedAt !== null &&
    membership.exitConfirmedAt === null &&
    now.getTime() - membership.exitRequestedAt.getTime() >= EXIT_RESPONSE_WINDOW_MS;

  return unansweredExitHasExpired ? "ENDOFSERVICE" : membership.status;
}
