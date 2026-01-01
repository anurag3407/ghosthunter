/**
 * ============================================================================
 * DATABASE AGENT - ENCRYPTION UTILITIES
 * ============================================================================
 * Encrypt and decrypt database credentials.
 */

import CryptoJS from "crypto-js";

/**
 * Get encryption key from environment
 */
function getEncryptionKey(): string {
  const key = process.env.CREDENTIALS_ENCRYPTION_KEY;
  if (!key) {
    throw new Error("CREDENTIALS_ENCRYPTION_KEY is not configured");
  }
  return key;
}

/**
 * Encrypt sensitive data
 */
export function encrypt(data: string): string {
  const key = getEncryptionKey();
  return CryptoJS.AES.encrypt(data, key).toString();
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedData: string): string {
  const key = getEncryptionKey();
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Encrypt database credentials
 */
export function encryptCredentials(credentials: Record<string, unknown>): string {
  return encrypt(JSON.stringify(credentials));
}

/**
 * Decrypt database credentials
 */
export function decryptCredentials<T>(encryptedCredentials: string): T {
  const decrypted = decrypt(encryptedCredentials);
  return JSON.parse(decrypted) as T;
}
