import { randomBytes } from "crypto";

export function generateClientId(): string {
  const ts = Date.now().toString(36); // base-36 timestamp
  const rand = randomBytes(4).toString("hex");
  return `CLIENT_${ts}_${rand}`;
}

/**
 * Generate a case reference — human-readable for UI display.
 * Format: CASE-2024-XXXX (org-scoped sequential would be set in DB)
 * This version generates a random reference for when DB isn't available.
 */
export function generateCaseReference(orgPrefix?: string): string {
  const year = new Date().getFullYear();
  const rand = randomBytes(2).toString("hex").toUpperCase();
  const prefix = orgPrefix?.toUpperCase().slice(0, 4) ?? "CASE";
  return `${prefix}-${year}-${rand}`;
}

/** Validate that a string looks like a valid Client_ID (not a real name) */
export function isValidClientId(id: string): boolean {
  return /^CLIENT_[a-z0-9]+_[a-f0-9]+$/.test(id);
}
