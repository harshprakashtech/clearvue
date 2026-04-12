/**
 * --- WhatsApp OTP Initiation Message Templates ---
 *
 * These messages are sent to the user when they start the registration
 * or login process, and contain the code they need to send back.
 */

/**
 * Returns the template for account registration initiation
 */
export function getRegisterOtpTemplate(code: string): string {
  return `*Clearvue Registration*\n_System Authorization_\n\n*Code:* \`\`\`${code}\`\`\``;
}

/**
 * Returns the template for account login initiation
 */
export function getLoginOtpTemplate(code: string): string {
  return `*Clearvue Login*\n_System Authorization_\n\n*Code:* \`\`\`${code}\`\`\``;
}
