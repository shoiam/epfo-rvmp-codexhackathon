/** Machine-checkable claim validation belongs here before submission. */
export const preflightRules = {
  ACTIVE_EMPLOYMENT_EXISTS: {
    blockedForms: ["Form-19"],
    description: "An active employment must be ended before a Form-19 final settlement claim.",
  },
} as const;

export function isBlockedByActiveEmployment(formType: string, hasActiveEmployment: boolean) {
  return hasActiveEmployment && preflightRules.ACTIVE_EMPLOYMENT_EXISTS.blockedForms.includes(formType as "Form-19");
}
