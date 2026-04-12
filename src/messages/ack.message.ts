/**
 * --- WhatsApp Acknowledgment Message Templates ---
 *
 * These messages are sent as replies when a code is received via the webhook.
 */

/**
 * Returns the template for registration code acknowledgment
 */
export function getRegisterAckTemplate(): string {
  return "✅ Registration code received! You can now go back to the website to complete your registration.";
}

/**
 * Returns the template for login code acknowledgment
 */
export function getLoginAckTemplate(): string {
  return "✅ Login code received! Returning to the website will automatically log you in.";
}
