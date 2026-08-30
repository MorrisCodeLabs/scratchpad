// Client-side AES-GCM encryption for note content (Pro). The passphrase
// never leaves the browser and is never persisted — Supabase only ever
// stores the ciphertext payload below in place of the note's Tiptap JSON.
export interface EncryptedPayload {
  __encrypted: true;
  ciphertext: string;
  iv: string;
  salt: string;
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, [
    "deriveKey",
  ]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: 150000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export function isEncryptedPayload(content: unknown): content is EncryptedPayload {
  return Boolean(content && typeof content === "object" && (content as Record<string, unknown>).__encrypted === true);
}

export async function encryptContent(content: Record<string, unknown>, passphrase: string): Promise<EncryptedPayload> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const plaintext = new TextEncoder().encode(JSON.stringify(content));
  const ciphertextBuf = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, plaintext);
  return {
    __encrypted: true,
    ciphertext: toBase64(new Uint8Array(ciphertextBuf)),
    iv: toBase64(iv),
    salt: toBase64(salt),
  };
}

// Throws if the passphrase is wrong (AES-GCM authentication fails).
export async function decryptContent(
  payload: EncryptedPayload,
  passphrase: string,
): Promise<Record<string, unknown>> {
  const salt = fromBase64(payload.salt);
  const iv = fromBase64(payload.iv);
  const key = await deriveKey(passphrase, salt);
  const ciphertext = fromBase64(payload.ciphertext);
  const plaintextBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    ciphertext as BufferSource,
  );
  return JSON.parse(new TextDecoder().decode(plaintextBuf));
}
