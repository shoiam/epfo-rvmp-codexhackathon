export const PREFLIGHT_RULES = {
  TWO_MONTH_RULE: "Two-month unemployment rule",
  SERVICE_UNDER_6M: "At least six months of service",
  ADVANCE_LIMIT_EXCEEDED: "Advance amount is within the permitted limit",
  NO_15G_15H: "Tax declaration requirement",
  IFSC_INVALID: "Valid IFSC code",
  ACTIVE_EMPLOYMENT_EXISTS: "Active employment check (Form-19 only)",
} as const;
export type PreflightCode = keyof typeof PREFLIGHT_RULES;
export const PREFLIGHT_ENTRIES = Object.entries(PREFLIGHT_RULES).map(([code, label]) => ({ code: code as PreflightCode, label }));
