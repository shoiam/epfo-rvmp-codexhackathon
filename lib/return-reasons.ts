export const RETURN_REASONS = {
  NAME_MISMATCH_BANK: {
    code: "NAME_MISMATCH_BANK",
    officialText: "Name differs from bank records",
    plainEnglish: "The name on your bank account does not match the name on your PF record.",
    faultParty: "MEMBER",
    whatItMeansForYou: "Your bank details need correcting before payment.",
    remedy: { type: "FIX_FIELD", label: "Update bank name", targetField: "bankName" },
    typicalFixDays: 3,
    resumesAtStage: "Scrutiny",
  },
  CHEQUE_ILLEGIBLE: {
    code: "CHEQUE_ILLEGIBLE",
    officialText: "Cancelled cheque is illegible",
    plainEnglish: "We cannot read the details on the cancelled cheque you uploaded.",
    faultParty: "MEMBER",
    whatItMeansForYou: "Please upload a clearer cheque image.",
    remedy: {
      type: "REUPLOAD_DOC",
      label: "Upload a clearer cheque",
      targetDocKey: "cancelledCheque",
    },
    typicalFixDays: 2,
    resumesAtStage: "Scrutiny",
  },
  SIGNATURE_MISMATCH: {
    code: "SIGNATURE_MISMATCH",
    officialText: "Signature mismatch",
    plainEnglish: "The signature does not match the signature held for your account.",
    faultParty: "MEMBER",
    whatItMeansForYou: "A fresh signed document is needed.",
    remedy: {
      type: "REUPLOAD_DOC",
      label: "Upload a signed document",
      targetDocKey: "cancelledCheque",
    },
    typicalFixDays: 4,
    resumesAtStage: "Verification",
  },
  PURPOSE_PROOF_INSUFFICIENT: {
    code: "PURPOSE_PROOF_INSUFFICIENT",
    officialText: "Purpose proof insufficient",
    plainEnglish: "The document does not clearly show why you need this advance.",
    faultParty: "MEMBER",
    whatItMeansForYou: "Please provide stronger proof for your chosen purpose.",
    remedy: { type: "REUPLOAD_DOC", label: "Upload purpose proof", targetDocKey: "purposeProof" },
    typicalFixDays: 5,
    resumesAtStage: "Verification",
  },
  EXIT_DATE_DISPUTED: {
    code: "EXIT_DATE_DISPUTED",
    officialText: "Exit date disputed",
    plainEnglish: "Your employer has given a different last working date.",
    faultParty: "EMPLOYER",
    whatItMeansForYou: "The employer must confirm the correct date.",
    remedy: { type: "AUTO_EMPLOYER_REQUEST", label: "Ask employer to confirm date" },
    typicalFixDays: 10,
    resumesAtStage: "Verification",
  },
  OVERLAPPING_SERVICE: {
    code: "OVERLAPPING_SERVICE",
    officialText: "Overlapping service requires review",
    plainEnglish: "The dates of two jobs overlap by more than the allowed window.",
    faultParty: "EPFO",
    whatItMeansForYou: "EPFO needs to review the conflicting service dates.",
    remedy: { type: "WAIT", label: "Wait for EPFO review" },
    typicalFixDays: 15,
    resumesAtStage: "Scrutiny",
  },
  EMPLOYER_CONTRIBUTION_GAP: {
    code: "EMPLOYER_CONTRIBUTION_GAP",
    officialText:
      "Contribution not received for 03/2026, 04/2026 — eligible advance amount cannot be computed",
    plainEnglish:
      "Your employer deducted PF from your salary for two months but never deposited it, so the amount you can withdraw cannot be worked out.",
    faultParty: "EMPLOYER",
    whatItMeansForYou:
      "Your claim is correct. ₹43,200 is missing from your account, and it was never yours to deposit.",
    remedy: {
      type: "AUTO_EMPLOYER_REQUEST",
      label: "Raise recovery notice against Northwind Systems",
      fallback: "Non-deposit after 15 days is referred for Section 7A recovery proceedings.",
    },
    typicalFixDays: 12,
    resumesAtStage: "Verification",
  },
} as const;
export type ReturnReasonCode = keyof typeof RETURN_REASONS;

if (process.env.NODE_ENV === "development") {
  const preflight = new Set(Object.keys(PREFLIGHT_CODES));
  for (const code of Object.keys(RETURN_REASONS))
    if (preflight.has(code)) throw new Error(`Reason code appears in both registries: ${code}`);
}
import { PREFLIGHT_RULES as PREFLIGHT_CODES } from "@/lib/preflight-rules";
