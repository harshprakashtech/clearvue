import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextResponse } from "next/server";

// Utils
import connectDB from "@/lib/db";

// Models
import User from "@/models/User.model";
/**
 * --- Register API Route ---
 *
 * - Handles the initial registration request.
 * - Generates a verification token.
 * - Sends the verification token to the user's phone number via WhatsApp.
 */
export async function POST(request: Request) {
  try {
    await connectDB();
    const { displayName, phoneNumber, password } = await request.json();

    if (!displayName || !phoneNumber) {
      return NextResponse.json(
        { error: "Display name and phone number are required" },
        { status: 400 },
      );
    }

    // Check if the user already exists
    let user = await User.findOne({ phoneNumber });

    if (user) {
      if (user.isVerified) {
        return NextResponse.json(
          { error: "A user with this phone number is already verified." },
          { status: 400 },
        );
      }

      // User exists but not verified. Update them.
      user.displayName = displayName;

      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(password, salt);
      }
    } else {
      let passwordHash;

      if (password) {
        const salt = await bcrypt.genSalt(10);
        passwordHash = await bcrypt.hash(password, salt);
      }

      // Create new user entry
      user = new User({
        displayName,
        phoneNumber,
        passwordHash,
        isVerified: false,
      });
    }

    // Generate secure token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    user.verificationToken = verificationToken;
    await user.save();

    // Generate WhatsApp verification link
    const botNumber = process.env.META_PHONE_NUMBER;

    const encodedMessage = encodeURIComponent(
      `Verify my Clearvue account: ${verificationToken}`,
    );

    const waLink = `https://wa.me/${botNumber}?text=${encodedMessage}`; // TODO: Add a proper template message

    // Return the verification token and WhatsApp link
    return NextResponse.json({
      success: true,
      verificationToken,
      waLink,
    });
  } catch (error: any) {
    console.error("Register Init Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
