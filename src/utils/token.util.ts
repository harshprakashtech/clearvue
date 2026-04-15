import User from "@/models/User.model";
import jwt from "jsonwebtoken";

/**
 * --- Auth Token Utility ---
 *
 * Helper functions for generating JWT tokens.
 */

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generates Access and Refresh tokens for a user
 *
 * @param userId - MongoDB ID of the user
 * @param role - Role of the user
 * @returns - Object containing accessToken and refreshToken
 */
export function generateTokens(userId: any, role: string): Tokens {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT Secret is missing from environment variables.");
  }

  const accessToken = jwt.sign({ userId, role }, jwtSecret, {
    expiresIn: "3d", // 3 days
  });

  const refreshToken = jwt.sign({ userId }, jwtSecret, {
    expiresIn: "10d", // 10 days
  });

  return { accessToken, refreshToken };
}

/**
 * Updates the refresh token in the database
 *
 * @param userId - MongoDB ID of the user
 * @param refreshToken - The new refresh token
 */
export async function updateRefreshToken(userId: any, refreshToken: string) {
  await User.findByIdAndUpdate(userId, { $set: { refreshToken } });
}
