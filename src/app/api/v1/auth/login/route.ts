import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

// Schemas
import { loginSchema } from "@/schemas/auth/login.schema";

// Utils
import connectDB from "@/lib/db";
import { setAuthCookies } from "@/utils/cookies";

// Models
import User from "@/models/User.model";

/**
 * --- Login API Route ---
 *
 * - Handles user login requests
 * - Validates user credentials (via password or verification token send to wp)
 * - Generates JWT token for authenticated users
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error.issues[0].message,
          details: result.error.issues,
        },
        { status: 400 },
      );
    }

    const { phoneNumber, password } = result.data;

    await connectDB();

    // Find user by phone number
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return NextResponse.json(
        {
          error: "Login Error: User not found",
        },
        { status: 404 },
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Login Error: Password is required for this route" },
        { status: 400 },
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        {
          error:
            "Login Error: User has not set up a password. Please login via WhatsApp.",
        },
        { status: 400 },
      );
    }

    // Check if password is valid
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Login Error: Invalid credentials" },
        { status: 401 },
      );
    }

    const jwtSecret = process.env.JWT_SECRET || "fallback_secret";

    // Generate Long-Lived Tokens
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      jwtSecret,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "7d",
    });

    // Update the refresh token in DB
    await User.findByIdAndUpdate(user._id, { $set: { refreshToken } });

    // Create response
    const response = NextResponse.json({
      success: true,
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
