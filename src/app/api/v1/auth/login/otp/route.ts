import { NextResponse } from "next/server";
import { z } from "zod";

// Schemas
import { phoneNumberSchema } from "@/schemas/auth/definations.schema";

// Utils
import connectDB from "@/lib/db";
import { generateHexCode } from "@/utils/codeGenerator.util";

// Message Templates
import { getLoginTemplate } from "@/messages/login.message";

// Models
import User from "@/models/User.model";

const otpInitSchema = z.object({
  phoneNumber: phoneNumberSchema,
});

/**
 * --- OTP Init API Route ---
 *
 * - Handles the initiation of a passwordless login via WhatsApp
 * - Generates a short-lived loginToken
 * - Sends the WhatsApp link for the user to message the bot
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = otpInitSchema.safeParse(body);

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

    // Generate a 12-character formatted secure token (e.g. A4B9-8F2D-C3E1) for the OTP login process
    const loginToken = generateHexCode();

    user.loginToken = loginToken;
    user.loginTokenExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await user.save();

    // Generate WhatsApp verification link
    const botNumber = process.env.META_PHONE_NUMBER;

    const messageTemplate = getLoginTemplate(loginToken);
    const encodedMessage = encodeURIComponent(messageTemplate);

    const waLink = `https://wa.me/${botNumber}?text=${encodedMessage}`;

    return NextResponse.json({
      success: true,
      waLink,
    });
  } catch (err: any) {
    console.error("OTP Init Error. ERR: ", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
