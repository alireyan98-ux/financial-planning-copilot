/** Raw fact-find as submitted by the adviser — contains PII */
export interface RawFactFind {
  // PII — stripped before processing
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  postcode?: string;
  dateOfBirth?: string;         // ISO date string
  nationalInsuranceNumber?: string;

  // Financial / planning — safe for calculations
  employmentStatus?: EmploymentStatus;
  maritalStatus?: MaritalStatus;
  dependants?: number;
  retirementAge?: number;
  annualIncome?: number;
  annualExpenditure?: number;
  pensionValue?: number;
  investmentValue?: number;
  propertyValue?: number;
  mortgageBalance?: number;
  otherLiabilities?: number;
  emergencyFund?: number;
  primaryGoal?: string;
  secondaryGoals?: string[];
  timeHorizonYears?: number;
  riskNotes?: string;
}

/** PII fields — encrypted and stored separately */
export interface PIIFields {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  postcode?: string;
  dateOfBirth?: string;
  nationalInsuranceNumber?: string;
}

/** Sanitized fields safe for calculations */
export interface SanitizedFactFind {
  ageBand: string;               // e.g. "50-59"
  incomeBand: string;            // e.g. "60k-100k"
  employmentStatus?: EmploymentStatus;
  maritalStatus?: MaritalStatus;
  dependants?: number;
  retirementAge?: number;
  annualIncome?: number;
  annualExpenditure?: number;
  pensionValue?: number;
  investmentValue?: number;
  propertyValue?: number;
  mortgageBalance?: number;
  otherLiabilities?: number;
  emergencyFund?: number;
  primaryGoal?: string;
  secondaryGoals?: string[];
  timeHorizonYears?: number;
  riskNotes?: string;
}

/** Anonymized fact-find — safe for all processing */
export interface AnonymizedFactFind {
  clientId: string;              // e.g. "CLIENT_lz4k2r_a3f9b21c"
  ageBand: string;               // e.g. "50-59"
  incomeBand: string;            // e.g. "60k-100k"
  employmentStatus?: EmploymentStatus;
  maritalStatus?: MaritalStatus;
  dependants?: number;
  retirementAge?: number;
  annualIncome?: number;
  annualExpenditure?: number;
  pensionValue?: number;
  investmentValue?: number;
  propertyValue?: number;
  mortgageBalance?: number;
  otherLiabilities?: number;
  emergencyFund?: number;
  primaryGoal?: string;
  secondaryGoals?: string[];
  timeHorizonYears?: number;
  riskNotes?: string;
  createdAt: string;
  expiresAt: string;
}

export interface PseudonymRecord {
  id: string;
  clientId: string;
  encryptedPIIBlob: string;      // AES-256-GCM encrypted JSON of PIIFields
  createdAt: string;
  wipedAt?: string;
}

// ─── Enums ───────────────────────────────────────────────────

export type EmploymentStatus =
  | "employed"
  | "self-employed"
  | "director"
  | "retired"
  | "not-working";

export type MaritalStatus =
  | "single"
  | "married"
  | "civil-partnership"
  | "divorced"
  | "widowed"
  | "cohabiting";
