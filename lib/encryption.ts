import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;   // 96-bit IV recommended for GCM
const TAG_LENGTH = 16;  // 128-bit auth tag

/** Derive a 32-byte key from an env variable (hex string or passphrase) */
function deriveKey(keyMaterial: string): Buffer {
  // If already 64 hex chars (32 bytes), use directly; otherwise hash it
  if (/^[a-f0-9]{64}$/i.test(keyMaterial)) {
    return Buffer.from(keyMaterial, "hex");
  }
  return createHash("sha256").update(keyMaterial).digest();
}

export async function encrypt(plaintext: string, keyMaterial: string): Promise<string> {
  const key = deriveKey(keyMaterial);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

export async function decrypt(ciphertext: string, keyMaterial: string): Promise<string> {
  const parts = ciphertext.split(":");
  if (parts.length !== 3) throw new Error("Invalid ciphertext format");

  const [ivHex, tagHex, dataHex] = parts;
  const key = deriveKey(keyMaterial);
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(tagHex, "hex");
  const data = Buffer.from(dataHex, "hex");

  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString("utf8");
}

/** Zero-fill a buffer before releasing — additional in-memory protection */
export function secureClear(buf: Buffer): void {
  buf.fill(0);
}
