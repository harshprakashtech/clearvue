import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// Utils
import connectDB from "@/lib/db";
import { generateHexCode } from "@/utils/codeGenerator.util";

// Message Templates
import { getRegisterTemplate } from "@/messages/register.message";

// Schemas
import { registerSchema } from "@/schemas/auth/register.schema";

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

    // Generate a 12-character formatted secure token (e.g. A4B9-8F2D-C3E1)
    const verificationToken = generateHexCode();

    user.verificationToken = verificationToken;
    await user.save();

    // Generate WhatsApp verification link
    const botNumber = process.env.META_PHONE_NUMBER;

    const messageTemplate = getRegisterTemplate(verificationToken);
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
