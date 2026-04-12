import { NextResponse } from "next/server";

// Schemas
import { loginWithOTPSchema } from "@/schemas/auth/login.schema";

// Utils
import connectDB from "@/lib/db";

// Message Templates
import { getLoginOtpTemplate } from "@/messages/otp.message";

// Models
import User from "@/models/User.model";

// Services
import { generateOtp } from "@/services/otp.service";

/**
 * --- OTP Init API Route ---
 *
 * - Handles the initiation of a passwordless login via WhatsApp
 * - Generates a secure token for the Reverse OTP flow
 * - Returns the WhatsApp link for the user to message the bot
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginWithOTPSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message, details: result.error.issues },
        { status: 400 },
      );
    }

    const { phoneNumber } = result.data;

    await connectDB();

    // Check if user exists
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return NextResponse.json(
        { error: "OTP Login Error: User not found" },
        { status: 404 },
      );
    }

    // Generate a secure token
    const loginToken = await generateOtp(phoneNumber, "login");

    // Generate WhatsApp verification link
    const botNumber = process.env.META_PHONE_NUMBER;

    const messageTemplate = getLoginOtpTemplate(loginToken);
    const encodedMessage = encodeURIComponent(messageTemplate);

    const waLink = `https://wa.me/${botNumber}?text=${encodedMessage}`;

    return NextResponse.json({
      success: true,
      loginToken,
      waLink,
    });
  } catch (err: any) {
    console.error("OTP Init Error. ERR: ", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
