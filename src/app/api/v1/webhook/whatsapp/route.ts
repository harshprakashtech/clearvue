import { NextResponse } from "next/server";

// Utils
import connectDB from "@/lib/db";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

// Message Templates
import {
  getLoginAckTemplate,
  getRegisterAckTemplate,
} from "@/messages/ack.message";

// Services
import { verifyIncomingOtp } from "@/services/otp.service";

/**
 * --- WhatsApp API Webhooks ---
 *
 * Includes:
 * - Handles GET requests to the webhook endpoint.
 * - Handles POST requests to the webhook endpoint.
 */

/**
 * --- GET Request API ---
 *
 * - Verifies the webhook subscription request from Meta.
 * - Responds with 200 OK and challenge token from the request if verify tokens match.
 * - Responds with '403 Forbidden' if verify tokens do not match.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");

  const token = searchParams.get("hub.verify_token");

  const challenge = searchParams.get("hub.challenge");

  const WEBHOOK_VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN;

  // Check if a request is a webhook verification request
  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse("Forbidden", { status: 403 });
  }
}

// Handle Register Verification
async function handleRegisterVerification(
  messageText: string,
  senderPhone: string,
) {
  try {
    await connectDB();

    const codeMatch = messageText.match(
      /([A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4})/i,
    );
    const token = codeMatch ? codeMatch[1].toUpperCase() : "";

    // Verify OTP
    const isVerified = await verifyIncomingOtp(senderPhone, token);

    if (isVerified) {
      console.info(
        `User with phone ${senderPhone} verified successfully via WhatsApp!`,
      );

      const replyText = getRegisterAckTemplate();
      await sendWhatsAppMessage(senderPhone, replyText);
    } else {
      console.warn(
        `Verification failed for ${senderPhone}: Token not found or expired.`,
      );
    }
  } catch (error) {
    console.error("Webhook Error: Error verifying registration in DB:", error);
  }
}

// Handle Login Verification
async function handleLoginVerification(
  messageText: string,
  senderPhone: string,
) {
  try {
    await connectDB();

    const codeMatch = messageText.match(
      /([A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4})/i,
    );
    const token = codeMatch ? codeMatch[1].toUpperCase() : "";

    // Verify via service
    const isVerified = await verifyIncomingOtp(senderPhone, token);

    if (isVerified) {
      console.info(`Login code for ${senderPhone} verified successfully!`);

      const replyText = getLoginAckTemplate();
      await sendWhatsAppMessage(senderPhone, replyText);
    } else {
      console.warn(
        `Login verification failed for ${senderPhone}: Token not found or expired.`,
      );
    }
  } catch (error) {
    console.error(
      "Webhook Error: Error parsing login verification in DB:",
      error,
    );
  }
}

/**
 * --- POST Request API ---
 *
 * - Handles POST requests to the webhook endpoint.
 * - Processes incoming WhatsApp messages and events.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if application/json or valid body
    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          // Check if there is a message
          if (change.value && change.value.messages) {
            const msg = change.value.messages[0];

            const senderPhone = msg.from;
            const messageText = msg.text?.body;

            console.log(`Received message from ${senderPhone}: ${messageText}`);

            // Handle register verification messages
            if (messageText?.includes("Clearvue Registration")) {
              await handleRegisterVerification(messageText, senderPhone);
            }
            // Handle login verification messages
            else if (messageText?.includes("Clearvue Login")) {
              await handleLoginVerification(messageText, senderPhone);
            }
          }
        }
      }
      // Return 200 OK immediately so Meta doesn't retry the request
      return new NextResponse("OK", { status: 200 });
    } else {
      return new NextResponse("Not Found", { status: 404 });
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
