export type AuditAction =
  // Auth
  | "USER_SIGNED_IN"
  | "USER_SIGNED_OUT"
  | "DPA_ACCEPTED"
  // Cases
  | "CASE_CREATED"
  | "CASE_ACCESSED"
  | "CASE_UPDATED"
  | "CASE_DELETED_MANUAL"
  | "CASE_AUTO_DELETED"
  | "DELETION_WARNING_SENT"
  // Fact-find
  | "FACT_FIND_SUBMITTED"
  | "FACT_FIND_UPDATED"
  // Calculations
  | "CALCULATION_RUN"
  | "CALCULATION_VIEWED"
  // Documents
  | "WORKSHEET_GENERATED"
  | "WORKSHEET_EXPORTED_DOCX"
  | "WORKSHEET_EXPORTED_PDF"
  | "ADVISER_SIGNED_OFF"
  // Risk
  | "RISK_QUESTIONNAIRE_COMPLETED"
  // Admin
  | "USER_INVITED"
  | "USER_ROLE_CHANGED"
  | "USER_REMOVED"
  // Data rights
  | "GDPR_SAR_REQUESTED"
  | "GDPR_DELETION_REQUESTED";

export interface AuditEvent {
  organizationId: string;
  userId: string;          // Clerk user ID (not a client name)
  action: AuditAction;
  caseReference?: string;  // e.g. "CASE-2024-A3F2" — NOT client name
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}
