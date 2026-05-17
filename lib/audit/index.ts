import { createClient } from "@/lib/supabase/server";
import type { AuditAction, AuditEvent } from "./types";

export async function auditLog(event: AuditEvent): Promise<void> {
  const supabase = createClient();

  // Scrub any accidental PII before persisting
  const safeMeta = sanitizeMetadata(event.metadata);

  const { error } = await supabase.from("audit_logs").insert({
    organization_id: event.organizationId,
    user_id: event.userId,
    action: event.action,
    case_reference: event.caseReference ?? null,
    metadata: safeMeta,
    ip_address: event.ipAddress ?? null,
    created_at: new Date().toISOString(),
  });

  if (error) {
    // Audit failures are silent to user but must alert monitoring
    console.error("[AUDIT LOG FAILURE]", {
      action: event.action,
      error: error.message,
    });
  }
}

/** Remove any fields that look like PII from metadata object */
function sanitizeMetadata(
  meta?: Record<string, unknown>
): Record<string, unknown> | null {
  if (!meta) return null;

  const PII_KEYS = ["name", "email", "phone", "address", "dob", "nino", "postcode"];
  return Object.fromEntries(
    Object.entries(meta).filter(
      ([k]) => !PII_KEYS.some((pii) => k.toLowerCase().includes(pii))
    )
  );
}

export type { AuditAction, AuditEvent } from "./types";
