import { NextResponse } from "next/server";

// Utils
import connectDB from "@/lib/db";

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

            if (
              messageText &&
              messageText.startsWith("Verify my Clearvue account: ")
            ) {
              try {
                await connectDB();
                const token = messageText
                  .replace("Verify my Clearvue account: ", "")
                  .trim();

                const user = await User.findOne({ verificationToken: token });
                if (user) {
                  user.isVerified = true;
                  user.verificationToken = undefined;
                  await user.save();
                  console.log(
                    `User ${user.displayName} verified successfully via WhatsApp!`,
                  );
                } else {
                  console.log(
                    `Verification failed: Token ${token} not found or expired.`,
                  );
                }
              } catch (dbError) {
                console.error(
                  "Webhook Error: Error verifying user in DB:",
                  dbError,
                );
              }
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
