export const ESCALATION_LADDER = [
  { designation: "SSA", name: "R. Kulkarni" },
  { designation: "Section Supervisor", name: "S. Iyer" },
  { designation: "Accounts Officer", name: "A. Deshmukh" },
  { designation: "APFC", name: "M. Fernandes" },
  { designation: "RPFC-II", name: "P. Chatterjee" },
] as const;

export function nextEscalationOfficer(currentDesignation: string | null) {
  const currentIndex = ESCALATION_LADDER.findIndex(
    (rung) => rung.designation === currentDesignation,
  );
  return ESCALATION_LADDER[Math.min(currentIndex + 1, ESCALATION_LADDER.length - 1)];
}
