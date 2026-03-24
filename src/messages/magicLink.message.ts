/**
 * Returns the highly professional WhatsApp template for the Magic Link reply
 */
export function getMagicLinkTemplate(magicURL: string): string {
  return `*Clearvue System*\n_Authorization Successful_\n\nYour secure magic link has been generated. Click the link below to instantly log in:\n🔗 ${magicURL}\n\n*Security Notice:*\n• Valid for 2 Minutes\n• Single-Use Only`;
}
