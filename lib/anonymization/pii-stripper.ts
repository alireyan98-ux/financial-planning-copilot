import type { RawFactFind, SanitizedFactFind, PIIFields } from "@/types/anonymization";

// Fields that identify a person — must NEVER reach the calculations engine
const PII_FIELDS: (keyof RawFactFind)[] = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "address",
  "postcode",
  "dateOfBirth",         // exact DOB is PII; we store age band instead
  "nationalInsuranceNumber",
];

export function stripPII(raw: RawFactFind): {
  pii: PIIFields;
  sanitized: SanitizedFactFind;
} {
  const pii: Partial<PIIFields> = {};
  const sanitized: Partial<SanitizedFactFind> = {};

  for (const key of PII_FIELDS) {
    if (raw[key] !== undefined) {
      (pii as Record<string, unknown>)[key] = raw[key];
    }
  }

  // Financial/planning fields — safe to process
  sanitized.ageBand = toAgeBand(raw.dateOfBirth);
  sanitized.incomeBand = toIncomeBand(raw.annualIncome);
  sanitized.employmentStatus = raw.employmentStatus;
  sanitized.maritalStatus = raw.maritalStatus;
  sanitized.dependants = raw.dependants;
  sanitized.retirementAge = raw.retirementAge;
  sanitized.annualIncome = raw.annualIncome;
  sanitized.annualExpenditure = raw.annualExpenditure;
  sanitized.pensionValue = raw.pensionValue;
  sanitized.investmentValue = raw.investmentValue;
  sanitized.propertyValue = raw.propertyValue;
  sanitized.mortgageBalance = raw.mortgageBalance;
  sanitized.otherLiabilities = raw.otherLiabilities;
  sanitized.emergencyFund = raw.emergencyFund;
  sanitized.primaryGoal = raw.primaryGoal;
  sanitized.secondaryGoals = raw.secondaryGoals;
  sanitized.timeHorizonYears = raw.timeHorizonYears;
  sanitized.riskNotes = sanitizeText(raw.riskNotes); // remove any names mentioned

  return { pii: pii as PIIFields, sanitized: sanitized as SanitizedFactFind };
}

// ─── Banding helpers (reduce precision, further anonymize) ───

function toAgeBand(dob?: string): string {
  if (!dob) return "unknown";
  const age = Math.floor(
    (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );
  if (age < 30) return "under-30";
  if (age < 40) return "30-39";
  if (age < 50) return "40-49";
  if (age < 60) return "50-59";
  if (age < 70) return "60-69";
  return "70+";
}

function toIncomeBand(income?: number): string {
  if (income == null) return "unknown";
  if (income < 20_000) return "under-20k";
  if (income < 40_000) return "20k-40k";
  if (income < 60_000) return "40k-60k";
  if (income < 100_000) return "60k-100k";
  if (income < 150_000) return "100k-150k";
  return "150k+";
}

/** Remove potential names/identifiers from free-text fields */
function sanitizeText(text?: string): string {
  if (!text) return "";
  // Strip email patterns and phone numbers from free text
  return text
    .replace(/[\w.+-]+@[\w-]+\.[a-z]{2,}/gi, "[email removed]")
    .replace(/(\+44|0)[\d\s]{10,}/g, "[phone removed]");
}
