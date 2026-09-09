export type ClaimField = {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select";
  required?: boolean;
  options?: string[];
  helpText?: string;
};

export type ClaimFormConfig = {
  title: string;
  plainEnglish: string;
  plainEnglishOneLiner: string;
  whoItsFor: string;
  eligibility: string[];
  requiredDocs: { key: string; label: string; required: boolean }[];
  fields: ClaimField[];
};

export const FORM_CONFIG: Record<"F31" | "F19" | "F10C" | "F10D", ClaimFormConfig> = {
  F31: {
    title: "Form-31 · PF advance",
    plainEnglish: "Take a partial advance from your PF while you are still employed.",
    plainEnglishOneLiner: "Take a partial advance from your PF while you are still employed.",
    whoItsFor: "Members with an active employment who need support for an approved purpose.",
    eligibility: [
      "You have an active employment membership.",
      "Your advance purpose must be one of the approved purposes.",
    ],
    requiredDocs: [
      { key: "cancelledCheque", label: "Cancelled cheque or bank proof", required: true },
      { key: "purposeProof", label: "Purpose-specific proof", required: true },
    ],
    fields: [
      {
        key: "amount",
        label: "Advance amount",
        type: "number",
        required: true,
        helpText: "Enter the amount in rupees.",
      },
      {
        key: "purpose",
        label: "Purpose",
        type: "select",
        required: true,
        options: [
          "Medical treatment",
          "Marriage",
          "Education",
          "Home purchase or construction",
          "Home loan repayment",
          "Natural calamity",
        ],
      },
      { key: "purposeDetails", label: "Tell us a little more", type: "text", required: true },
    ],
  },
  F19: {
    title: "Form-19 · Final EPF settlement",
    plainEnglish: "Withdraw your final EPF balance after leaving employment.",
    plainEnglishOneLiner: "Withdraw your final EPF balance after leaving employment.",
    whoItsFor:
      "Members who have left all employment and have been unemployed for at least two months.",
    eligibility: [
      "You have no active employment membership.",
      "You have been unemployed for at least 2 months after your latest exit.",
    ],
    requiredDocs: [
      { key: "cancelledCheque", label: "Cancelled cheque or bank proof", required: true },
      { key: "form15GH", label: "Form 15G/H (if applicable)", required: false },
    ],
    fields: [
      { key: "amount", label: "Settlement amount requested", type: "number", required: true },
      { key: "exitDate", label: "Last date of employment", type: "date", required: true },
    ],
  },
  F10C: {
    title: "Form-10C · EPS withdrawal benefit",
    plainEnglish: "Withdraw your EPS pension amount when your service is under 10 years.",
    plainEnglishOneLiner: "Withdraw your EPS pension amount when your service is under 10 years.",
    whoItsFor:
      "Members who have left employment and completed less than 10 years of eligible service.",
    eligibility: ["You have left employment.", "Your total eligible service is under 10 years."],
    requiredDocs: [
      { key: "cancelledCheque", label: "Cancelled cheque or bank proof", required: true },
    ],
    fields: [
      { key: "amount", label: "Withdrawal amount requested", type: "number", required: true },
    ],
  },
  F10D: {
    title: "Form-10D · Monthly pension",
    plainEnglish: "Start your monthly pension when you meet the service and age requirements.",
    plainEnglishOneLiner:
      "Start your monthly pension when you meet the service and age requirements.",
    whoItsFor: "Members with 10 or more years of service who are aged 58 or above.",
    eligibility: [
      "You have at least 10 years of eligible service.",
      "You are 58 years old or above.",
    ],
    requiredDocs: [
      { key: "cancelledCheque", label: "Cancelled cheque or bank proof", required: true },
      { key: "ageProof", label: "Age proof", required: true },
    ],
    fields: [
      {
        key: "amount",
        label: "Monthly pension amount (if known)",
        type: "number",
        required: false,
      },
      {
        key: "pensionStartDate",
        label: "Requested pension start date",
        type: "date",
        required: true,
      },
    ],
  },
};

export const FORM_TYPES = ["F31", "F19", "F10C", "F10D"] as const;
export type ClaimFormType = (typeof FORM_TYPES)[number];
export function formatFormType(value: string) {
  const labels: Record<ClaimFormType, string> = {
    F31: "Form-31",
    F19: "Form-19",
    F10C: "Form-10C",
    F10D: "Form-10D",
  };
  return labels[value as ClaimFormType] ?? value;
}
