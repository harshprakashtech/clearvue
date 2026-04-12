import bcrypt from "bcryptjs";

// Types
import {
  PhoneNumberType,
  phoneNumberSchema,
} from "@/schemas/auth/definations.schema";

// Utils
import { generateHexCode } from "@/utils/codeGenerator.util";
import { generateTokens, updateRefreshToken } from "@/utils/token.util";

// Models
import Otp from "@/models/Otp.model";
import User from "@/models/User.model";

/**
 * OTP related services
 *
 * Includes:
 * - generateOtp: Generates OTP for a given phone number and type
 * - verifyIncomingOtp: Verifies the code sent via WhatsApp against hashed storage
 * - checkVerificationStatus: Checks if the OTP has been verified and issues tokens
 */

/**
 * Helper to normalize phone numbers to a 10-digit format for consistent matching.
 * Strips non-digits and returns the last 10 characters.
 */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.slice(-10);

  // Validate utilizing the Zod schema to ensure it's exactly 10 digits
  return phoneNumberSchema.parse(normalized);
}

/**
 * Generates OTP for a given phone number and type and stores hashed OTP in the database
 */
export async function generateOtp(
  phoneNumber: PhoneNumberType,
  type: "registration" | "login",
): Promise<string> {
  try {
    const normalizedPhone = normalizePhone(phoneNumber);

    // Check if user exists for login
    if (type === "login") {
      const user = await User.findOne({ phoneNumber: normalizedPhone });
      if (!user) throw new Error("User not found");
      if (!user.isVerified)
        throw new Error("User is not verified. Please register first.");
    }

    // Delete any old pending OTPs for this phone and type to keep DB clean
    await Otp.deleteMany({ phoneNumber: normalizedPhone, type });

    const plainOtp: string = generateHexCode();
    const hashedOtp: string = await bcrypt.hash(plainOtp, 10);

    // Get user id if exists
    const user = await User.findOne({ phoneNumber: normalizedPhone });

    await Otp.create({
      user: user?._id,
      phoneNumber: normalizedPhone,
      hashedOtp,
      type,
      isVerified: false,
    });

    console.info(`OTP generated successfully for ${normalizedPhone}`);
    return plainOtp;
  } catch (err) {
    if (err instanceof Error) throw new Error(err.message);
    throw new Error("Failed to generate OTP");
  }
}

/**
 * Verifies the plain text code from WhatsApp against hashed versions in the DB
 */
export async function verifyIncomingOtp(
  senderPhone: string,
  plainOtp: string,
): Promise<boolean> {
  try {
    const normalizedSender = normalizePhone(senderPhone);

    // Find all active OTPs for this phone number
    const activeOtps = await Otp.find({
      phoneNumber: normalizedSender,
      isVerified: false,
      expiresAt: { $gt: new Date() },
    });

    for (const otp of activeOtps) {
      const isMatch = await bcrypt.compare(plainOtp, otp.hashedOtp);
      if (isMatch) {
        otp.isVerified = true;
        await otp.save();
        return true;
      }
    }

    return false;
  } catch (err) {
    console.error("Verify OTP Error. ERR:", err);
    return false;
  }
}

/**
 * Polling endpoint logic: Checks if verification is done and returns session data
 */
export async function checkVerificationStatus(
  phoneNumber: string,
  type: "registration" | "login",
) {
  try {
    const normalizedPhone = normalizePhone(phoneNumber);

    const otp = await Otp.findOne({
      phoneNumber: normalizedPhone,
      type,
      isVerified: true,
      expiresAt: { $gt: new Date() },
    }).populate("user");

    if (!otp) return { verified: false };

    const user = await User.findById(otp.user);
    if (!user) throw new Error("User not found during verification check");

    // 1. Mark user verified if this was a registration
    if (type === "registration" && !user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    // 2. Generate Session Tokens (Auto-login for both)
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);
    await updateRefreshToken(user._id, refreshToken);

    // 3. Burn the OTP immediately (One-time use)
    await Otp.findByIdAndDelete(otp._id);

    return {
      verified: true,
      tokens: { accessToken, refreshToken },
      user: {
        id: user._id,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    };
  } catch (err) {
    console.error("Check Verification Status Error. ERR:", err);
    throw err;
  }
}
