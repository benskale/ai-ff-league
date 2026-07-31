import crypto from "crypto";

// API key encryption using AES-256-GCM
// Requires ENCRYPTION_KEY env var (32-byte hex string or generate one)
// Generate with: node -e "console.log(crypto.randomBytes(32).toString('hex'))"

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    // Fallback: derive from a static seed for dev only
    // In production, always set ENCRYPTION_KEY
    return crypto.scryptSync("ai-ff-league-dev-key", "salt", 32);
  }
  return Buffer.from(raw, "hex");
}

export function encryptApiKey(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12); // GCM standard is 12 bytes
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  // Format: iv:authTag:encrypted
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decryptApiKey(ciphertext: string): string {
  const key = getKey();
  const [ivHex, authTagHex, encrypted] = ciphertext.split(":");

  if (!ivHex || !authTagHex || !encrypted) {
    throw new Error("Invalid ciphertext format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function maskApiKey(key: string): string {
  if (key.length <= 8) return "•".repeat(key.length);
  return key.slice(0, 4) + "•".repeat(Math.min(key.length - 8, 24)) + key.slice(-4);
}
