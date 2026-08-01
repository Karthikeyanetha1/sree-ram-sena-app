// Client-Side Web Crypto API (AES-GCM 256-bit End-to-End Encryption) for SAAS Security

const E2E_SECRET_KEY = "SREE_RAM_SENA_SAAS_E2E_SECRET_2026";

async function getKey() {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(E2E_SECRET_KEY),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("sreeramsenasalt"),
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptData(plainText) {
  try {
    const key = await getKey();
    const enc = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      enc.encode(plainText)
    );

    const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
    const dataHex = Array.from(new Uint8Array(encrypted)).map(b => b.toString(16).padStart(2, '0')).join('');

    return `E2E:${ivHex}:${dataHex}`;
  } catch (err) {
    console.error("Encryption error:", err);
    return plainText; // Fallback
  }
}

export async function decryptData(cipherText) {
  if (!cipherText || typeof cipherText !== 'string' || !cipherText.startsWith('E2E:')) {
    return cipherText;
  }

  try {
    const parts = cipherText.split(':');
    const ivHex = parts[1];
    const dataHex = parts[2];

    const iv = new Uint8Array(ivHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const data = new Uint8Array(dataHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

    const key = await getKey();
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (err) {
    console.error("Decryption error:", err);
    return cipherText;
  }
}
