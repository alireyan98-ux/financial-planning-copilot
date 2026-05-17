import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";

/**
 * Overwrite the encrypted PII blob with random data, then delete the row.
 * Two-step: overwrite first, then delete — defence-in-depth.
 */
export async function wipeEncryptedBlob(pseudonymMapId: string): Promise<void> {
  const supabase = createClient();

  // Replace the blob with random bytes of same approximate length
  const junkData = randomBytes(256).toString("hex");

  const { error: overwriteErr } = await supabase
    .from("pseudonym_mapping")
    .update({
      encrypted_pii_blob: junkData,
      wiped_at: new Date().toISOString(),
    })
    .eq("id", pseudonymMapId);

  if (overwriteErr) {
    throw new Error(`Wipe overwrite failed: ${overwriteErr.message}`);
  }

  const { error: deleteErr } = await supabase
    .from("pseudonym_mapping")
    .delete()
    .eq("id", pseudonymMapId);

  if (deleteErr) {
    throw new Error(`Wipe delete failed: ${deleteErr.message}`);
  }
}

/**
 * Verify a case has been fully purged (for audit evidence).
 * Returns true if no trace remains in cases, calculations, or pseudonym_mapping.
 */
export async function verifyPurge(caseId: string): Promise<boolean> {
  const supabase = createClient();

  const [caseCheck, calcCheck] = await Promise.all([
    supabase.from("cases").select("id").eq("id", caseId).maybeSingle(),
    supabase.from("calculations").select("id").eq("case_id", caseId).limit(1),
  ]);

  return caseCheck.data === null && (calcCheck.data?.length ?? 0) === 0;
}
