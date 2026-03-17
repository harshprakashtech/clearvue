import crypto from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

// Schemas
import { phoneNumberSchema } from "@/schemas/auth/definations.schema";

// Utils
import connectDB from "@/lib/db";

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

    // Generate short-lived secure token for the OTP login process
    const loginToken = crypto.randomBytes(32).toString("hex");

    user.loginToken = loginToken;
    user.loginTokenExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await user.save();

    // Generate WhatsApp verification link
    const botNumber = process.env.META_PHONE_NUMBER;

    const encodedMessage = encodeURIComponent(
      `Login to Clearvue: ${loginToken}`,
    );

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
