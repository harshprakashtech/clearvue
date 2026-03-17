import axios from "axios";
import jwt from "jsonwebtoken";
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

// Handle Register Verification
async function handleRegisterVerification(
  messageText: string,
  senderPhone: string,
) {
  try {
    await connectDB();

    const token = messageText
      .replace("Verify my Clearvue account: ", "")
      .trim();

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

    const token = messageText.replace("Login to Clearvue: ", "").trim();

    // Find user by login token
    const user = await User.findOne({
      loginToken: token,
      loginTokenExpiresAt: { $gt: new Date() }, // Must not be expired
    });

    if (user) {
      // Generate an Exchange Token
      const jwtSecret = process.env.JWT_SECRET as string;

      const exchangeToken = jwt.sign(
        { userId: user._id, type: "magic-link" },
        jwtSecret,
        { expiresIn: "2m" }, // Valid for 2 minutes
      );

      await User.findByIdAndUpdate(user._id, {
        $unset: { loginToken: "", loginTokenExpiresAt: "" },
      });

      // Determine App URL
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;

      const magicURL = `${appUrl}/auth/callback?token=${exchangeToken}`;
      const replyText = `Successfully Verified! Click here to login securely: ${magicURL}\n\nThis link will expire in 2 minutes.`;

      // Send message back to user via Meta API
      const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
      const PHONE_ID = process.env.META_PHONE_NUMBER_ID;

      await axios.post(
        `https://graph.facebook.com/v19.0/${PHONE_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: senderPhone,
          type: "text",
          text: { body: replyText },
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      );

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
            if (messageText?.startsWith("Verify my Clearvue account: ")) {
              await handleRegisterVerification(messageText, senderPhone);
            }
            // Handle login verification messages
            else if (messageText?.startsWith("Login to Clearvue: ")) {
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
