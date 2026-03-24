import crypto from "crypto";

/**
 * --- Auth Utilities ---
 *
 * Helper functions for authentication.
 */

/**
 * Generates a 12-character alphanumeric code
 * Example: A4B9-8F2D-C3E1
 */
export function generateHexCode(): string {
  const rawCode = crypto.randomBytes(6).toString("hex").toUpperCase();
  return `${rawCode.slice(0, 4)}-${rawCode.slice(4, 8)}-${rawCode.slice(8, 12)}`;
}
