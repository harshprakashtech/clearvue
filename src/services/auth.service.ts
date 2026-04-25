import { getRegisterOtpTemplate } from "@/messages/otp.message";
import { userRepo } from "@/repositories/user.repo";
import { generateOtp } from "@/services/otp.service";
import { generateTokens, updateRefreshToken } from "@/utils/token.util";
import bcrypt from "bcryptjs";

/**
 * --- Auth Service ---
 *
 * Includes:
 * - registerUser: Handles user registration
 * - loginUserWithPassword: Handles user login with password
 */

// Register new user
export const registerUser = async (data: any) => {
  const { displayName, phoneNumber, password } = data;

  // Check if the user already exists
  const existingUser = await userRepo.findByPhoneNumber(phoneNumber);

  if (existingUser) {
    if (existingUser.isVerified) {
      throw new Error("A user with this phone number is already verified.");
    }

    // Update basic info for unverified user
    const updateData: any = { displayName };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(password, salt);
    }
    await userRepo.update(existingUser._id.toString(), updateData);
  } else {
    // Create new user entry
    let passwordHash;

    // Hash password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    // Create new user entry
    await userRepo.create({
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
  if (!botNumber) {
    throw new Error(
      "META_PHONE_NUMBER is not defined in environment variables.",
    );
  }

  const messageTemplate = getRegisterOtpTemplate(verificationToken);
  const encodedMessage = encodeURIComponent(messageTemplate);

  const waLink = `https://wa.me/${botNumber}?text=${encodedMessage}`;

  return { verificationToken, waLink };
};

// Login user with password
export const loginUserWithPassword = async (data: any) => {
  const { phoneNumber, password } = data;

  // Find user by phone number
  const user = await userRepo.findByPhoneNumber(phoneNumber);

  if (!user) {
    throw new Error("Login Error: User not found");
  }

  if (!user.passwordHash) {
    throw new Error(
      "Login Error: User has not set up a password. Please login via OTP.",
    );
  }

  // Check if password is valid
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    throw new Error("Login Error: Invalid credentials");
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("Login Error: JWT Secret is missing.");
  }

  // Generate Long-Lived Tokens via Utility
  const { accessToken, refreshToken } = generateTokens(
    user._id.toString(),
    user.role,
  );

  // Update the refresh token in DB
  await updateRefreshToken(user._id.toString(), refreshToken);

  return {
    user: {
      id: user._id,
      displayName: user.displayName,
      phoneNumber: user.phoneNumber,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};
