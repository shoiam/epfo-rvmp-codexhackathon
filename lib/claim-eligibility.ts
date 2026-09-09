import { getEffectiveStatus } from "@/lib/membership-status";

const DAY = 86400000;
type MembershipLike = {
  status: "PENDING" | "ACTIVE" | "ENDOFSERVICE";
  exitRequestedAt: Date | null;
  exitConfirmedAt: Date | null;
  doj: Date;
  doe: Date | null;
  establishment?: { name: string };
};

export function claimEligibility(
  formType: string,
  memberships: MembershipLike[],
  dob: Date,
  now = new Date(),
) {
  const active = memberships.filter((m) => getEffectiveStatus(m, now) === "ACTIVE");
  const ended = memberships.filter((m) => getEffectiveStatus(m, now) === "ENDOFSERVICE");
  const latestEnd = ended.reduce<Date | null>((latest, m) => {
    const d = m.doe ?? m.exitConfirmedAt;
    return d && (!latest || d > latest) ? d : latest;
  }, null);
  const serviceDays = memberships.reduce(
    (sum, m) => sum + Math.max(0, ((m.doe ?? now).getTime() - m.doj.getTime()) / DAY),
    0,
  );
  const age =
    now.getUTCFullYear() -
    dob.getUTCFullYear() -
    (now.getUTCMonth() < dob.getUTCMonth() ||
    (now.getUTCMonth() === dob.getUTCMonth() && now.getUTCDate() < dob.getUTCDate())
      ? 1
      : 0);
  const noActive = active.length === 0;
  const unemployed = latestEnd ? now.getTime() - latestEnd.getTime() >= 60 * DAY : false;
  const left = ended.length > 0 && noActive;
  const checks = (labels: string[], passed: boolean[], reasons: string[]) =>
    labels.map((label, i) => ({
      label,
      passed: passed[i],
      reason: passed[i] ? "Eligible" : reasons[i],
    }));
  const firstActive = active[0]?.establishment?.name;
  return {
    F31: checks(
      ["Active employment", "Approved advance purpose"],
      [active.length > 0, true],
      [
        firstActive
          ? `You are not marked active at ${firstActive}.`
          : "You do not have an active employment membership.",
        "Choose one of the approved purposes.",
      ],
    ),
    F19: checks(
      ["No active employment", "Unemployed for at least 2 months"],
      [noActive, unemployed],
      [
        firstActive
          ? `You are still marked active at ${firstActive}.`
          : "You still have an active employment membership.",
        latestEnd
          ? "Your latest exit was less than 2 months ago."
          : "We could not find a confirmed employment exit.",
      ],
    ),
    F10C: checks(
      ["Left employment", "Service under 10 years"],
      [left, serviceDays < 3650],
      [
        "You must leave employment before claiming EPS withdrawal.",
        `Your eligible service is ${(serviceDays / 365).toFixed(1)} years, which is not under 10 years.`,
      ],
    ),
    F10D: checks(
      ["At least 10 years of service", "Age 58 or above"],
      [serviceDays >= 3650, age >= 58],
      [
        `Your eligible service is ${(serviceDays / 365).toFixed(1)} years; 10 years are required.`,
        `You are ${age}; pension starts at age 58.`,
      ],
    ),
  }[formType as "F31" | "F19" | "F10C" | "F10D"];
}
