import axios from "axios";

/**
 * --- Send WhatsApp Message (Text) ---
 * Send a WhatsApp text message to a specific phone number using the WhatsApp Business API
 *
 * @param to: The phone number to send the message to
 * @param message: The message to send
 * @returns: The response from the WhatsApp API
 */
export async function sendWhatsAppMessage(to: string, message: string) {
  const token = process.env.META_ACCESS_TOKEN;
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;

  const version = "v24.0"; // API version
  const url = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;

  // Request body for the WhatsApp API
  const body = {
    messaging_product: "whatsapp",
    to: to,
    type: "text",
    text: { body: message },
  };

  // Send the message using the WhatsApp API
  try {
    const response = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("WhatsApp API Response: ", response);
    const data = response.data;

    if (response.status !== 200) {
      console.error("WhatsApp API Error:", data);
      throw new Error(data.error?.message || "Failed to send message");
    }

    return data;
  } catch (err) {
    console.error("Error sending WhatsApp message:", err);
    throw err;
  }
}
