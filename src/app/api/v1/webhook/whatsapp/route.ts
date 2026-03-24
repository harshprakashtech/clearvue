import { NextResponse } from "next/server";

// Utils
import connectDB from "@/lib/db";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { generateHexCode } from "@/utils/codeGenerator.util";

// Message Templates
import { getMagicLinkTemplate } from "@/messages/magicLink.message";

// Models
import User from "@/models/User.model";

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

    // Find user by verification token
    const user = await User.findOne({ verificationToken: token });

    if (user) {
      user.isVerified = true;
      user.verificationToken = undefined;
      await user.save();

      console.log(
        `User ${user.displayName} verified successfully via WhatsApp!`,
      );
    } else {
      console.log(`Verification failed: Token ${token} not found or expired.`);
    }
  } catch (dbError) {
    console.error("Webhook Error: Error verifying user in DB:", dbError);
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

    // Find user by login token
    const user = await User.findOne({
      loginToken: token,
      loginTokenExpiresAt: { $gt: new Date() }, // Must not be expired
    });

    if (user) {
      // Generate a Stateful Short Magic Token (12 characters formatted)
      const exchangeToken = generateHexCode();
      const magicTokenExpiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

      await User.findByIdAndUpdate(user._id, {
        $set: { magicToken: exchangeToken, magicTokenExpiresAt },
        $unset: { loginToken: "", loginTokenExpiresAt: "" },
      });

      // Determine App URL
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;

      const magicURL = `${appUrl}/auth/callback?token=${exchangeToken}`;
      const replyText = getMagicLinkTemplate(magicURL);

      // Send message back to user via Meta API using the centralized utility
      await sendWhatsAppMessage(senderPhone, replyText);

      console.log(`User ${user.displayName} logic magic link sent!`);
    } else {
      console.log(`Login failed: Token ${token} not found or expired.`);
    }
  } catch (dbError) {
    console.error(
      "Webhook Error: Error parsing login verification in DB:",
      dbError,
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
