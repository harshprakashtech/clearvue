import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// Utils
import connectDB from "@/lib/db";

// Message Templates
import { getRegisterOtpTemplate } from "@/messages/otp.message";

// Schemas
import { registerSchema } from "@/schemas/auth/register.schema";

// Models
import User from "@/models/User.model";

// Services
import { generateOtp } from "@/services/otp.service";

/**
 * --- Register API Route ---
 *
 * - Handles the initial registration request.
 * - Generates a verification token via OTP.
 * - Returns a WhatsApp link for the user to verify.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body); // Zod validation

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message, details: result.error.issues },
        { status: 400 },
      );
    }

    const { displayName, phoneNumber, password } = result.data;

    await connectDB();

    // Check if the user already exists
    let user = await User.findOne({ phoneNumber });

    if (user) {
      if (user.isVerified) {
        return NextResponse.json(
          {
            error:
              "Register Init Error: A user with this phone number is already verified.",
          },
          { status: 400 },
        );
      }

      // Update basic info for unverified user
      user.displayName = displayName;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(password, salt);
      }
      await user.save();
    } else {
      let passwordHash;

      if (password) {
        const salt = await bcrypt.genSalt(10);
        passwordHash = await bcrypt.hash(password, salt);
      }

      // Create new user entry
      user = await User.create({
        displayName,
        phoneNumber,
        passwordHash,
        isVerified: false,
      });
    }

    // Generate a secure token for the Reverse OTP process via Service
    const verificationToken = await generateOtp(phoneNumber, "registration");

    // Generate WhatsApp verification link
    const botNumber = process.env.META_PHONE_NUMBER;

    const messageTemplate = getRegisterOtpTemplate(verificationToken);
    const encodedMessage = encodeURIComponent(messageTemplate);

    const waLink = `https://wa.me/${botNumber}?text=${encodedMessage}`;

    // Return the verification token and WhatsApp link
    return NextResponse.json({
      success: true,
      verificationToken,
      waLink,
    });
  } catch (err: any) {
    console.error("Register Init Error. ERR: ", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
