import bcrypt from "bcryptjs";

// Schemas
import { loginWithPasswordSchema } from "@/schemas/auth/login.schema";

// Utils
import connectDB from "@/lib/db";
import {
  sendError,
  sendSuccess,
  sendValidationError,
} from "@/utils/apiResponse.util";
import { setAuthCookies } from "@/utils/cookies.util";
import { generateTokens, updateRefreshToken } from "@/utils/token.util";

// Models
import User from "@/models/User.model";

/**
 * --- Login API Route ---
 *
 * - Handles user login requests
 * - Validates user credentials (via password)
 * - Generates JWT token for authenticated users
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginWithPasswordSchema.safeParse(body);

    if (!result.success) {
      return sendValidationError(result.error.issues);
    }

    const { phoneNumber, password } = result.data;

    await connectDB();

    // Find user by phone number
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return sendError("Login Error: User not found", 404);
    }

    if (!user.passwordHash) {
      return sendError(
        "Login Error: User has not set up a password. Please login via OTP.",
        400,
      );
    }

    // Check if password is valid
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return sendError("Login Error: Invalid credentials", 401);
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("Login Error: JWT Secret is missing.");
    }

    // Generate Long-Lived Tokens via Utility
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    // Update the refresh token in DB
    await updateRefreshToken(user._id, refreshToken);

    // Create response
    const response = sendSuccess({
      user: {
        id: user._id,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    });

    // Set auth cookies and return response
    return setAuthCookies(response, { accessToken, refreshToken });
  } catch (err: any) {
    console.error("Login Error. ERR: ", err);
    return sendError(err.message, 500);
  }
}
