import { createClient } from "@/lib/supabase/server";
import { auditLog } from "@/lib/audit";
import { wipeEncryptedBlob } from "@/lib/anonymization/purge";

export interface DeletionReport {
  deletedCount: number;
  failedCount: number;
  errors: string[];
  runAt: string;
}

export async function runExpiredCaseDeletion(): Promise<DeletionReport> {
  const supabase = createClient();
  const report: DeletionReport = {
    deletedCount: 0,
    failedCount: 0,
    errors: [],
    runAt: new Date().toISOString(),
  };

  // Find all cases whose expiry has passed
  const { data: expiredCases, error: fetchErr } = await supabase
    .from("cases")
    .select("id, case_reference, organization_id, pseudonym_map_id")
    .lt("expires_at", new Date().toISOString());

  if (fetchErr) {
    report.errors.push(`Failed to fetch expired cases: ${fetchErr.message}`);
    return report;
  }

  if (!expiredCases?.length) return report;

  for (const c of expiredCases) {
    try {
      // Step 1: Overwrite the PII blob with random bytes before deletion
      if (c.pseudonym_map_id) {
        await wipeEncryptedBlob(c.pseudonym_map_id);
      }

      // Step 2: Delete the case (cascades to calculations + documents via FK)
      const { error: deleteErr } = await supabase
        .from("cases")
        .delete()
        .eq("id", c.id);

      if (deleteErr) throw new Error(deleteErr.message);

      // Step 3: Audit log — NO PII, just the reference
      await auditLog({
        organizationId: c.organization_id,
        userId: "SYSTEM",
        action: "CASE_AUTO_DELETED",
        caseReference: c.case_reference,
        metadata: { reason: "7-day-expiry" },
      });

      report.deletedCount++;
    } catch (err) {
      report.failedCount++;
      // NEVER include client names/data in error messages
      report.errors.push(
        `Failed to delete case_ref=${c.case_reference}: ${err instanceof Error ? err.message : "unknown error"}`
      );
    }
  }

  return report;
}

/**
 * Send 48-hour warning emails before deletion.
 * Call this separately (e.g., cron at 02:00 on day 5).
 */
export async function sendDeletionWarnings(): Promise<number> {
  const supabase = createClient();
  const warningDate = new Date();
  warningDate.setHours(warningDate.getHours() + 48);

  const { data: soonExpiring } = await supabase
    .from("cases")
    .select("id, case_reference, organization_id")
    .lt("expires_at", warningDate.toISOString())
    .gt("expires_at", new Date().toISOString())
    .eq("deletion_warning_sent", false);

  if (!soonExpiring?.length) return 0;

  // TODO Phase 10: send email via Resend/SendGrid
  // For now, log to audit trail
  for (const c of soonExpiring) {
    await auditLog({
      organizationId: c.organization_id,
      userId: "SYSTEM",
      action: "DELETION_WARNING_SENT",
      caseReference: c.case_reference,
      metadata: { hoursUntilDeletion: 48 },
    });

    await supabase
      .from("cases")
      .update({ deletion_warning_sent: true })
      .eq("id", c.id);
  }

  return soonExpiring.length;
}
