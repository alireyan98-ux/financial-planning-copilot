import { generateClientId } from "./client-id";
import { stripPII } from "./pii-stripper";
import { encrypt, decrypt } from "@/lib/encryption";
import type { RawFactFind, AnonymizedFactFind, PseudonymRecord } from "@/types/anonymization";

/**
 * Anonymize a raw fact-find submission.
 * Returns the Client_ID and anonymized data safe for processing.
 * The encrypted PII blob must be stored separately in pseudonym_mapping.
 */
export async function anonymizeFactFind(raw: RawFactFind): Promise<{
  clientId: string;
  anonymized: AnonymizedFactFind;
  encryptedPIIBlob: string; // store this in pseudonym_mapping
}> {
  const clientId = generateClientId();
  const { pii, sanitized } = stripPII(raw);

  // Encrypt the original PII separately — calculations never see this
  const encryptedPIIBlob = await encrypt(
    JSON.stringify(pii),
    process.env.PSEUDONYM_MAP_ENCRYPTION_KEY!
  );

  const anonymized: AnonymizedFactFind = {
    clientId,
    ...sanitized,
    createdAt: new Date().toISOString(),
    expiresAt: getExpiryDate(7),
  };

  return { clientId, anonymized, encryptedPIIBlob };
}

/**
 * Reconstruct client-identifiable data for document export only.
 * PII is immediately discarded after export assembly — never stored again.
 */
export async function decryptForExport(
  encryptedPIIBlob: string
): Promise<Record<string, string>> {
  const json = await decrypt(
    encryptedPIIBlob,
    process.env.PSEUDONYM_MAP_ENCRYPTION_KEY!
  );
  return JSON.parse(json);
}

// ─── Helpers ─────────────────────────────────────────────────

function getExpiryDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export * from "./client-id";
export * from "./pii-stripper";
export * from "./purge";
