import { NextResponse } from "next/server";

/**
 * --- Cookie Utilities ---
 * Helper functions to attach or clear auth cookies on Next.js responses.
 */

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN_MAX_AGE = 3 * 24 * 60 * 60; // 3 days

const REFRESH_TOKEN_MAX_AGE = 10 * 24 * 60 * 60; // 10 days

const isProduction = process.env.NODE_ENV === "production";

// Sets the access and refresh tokens as HttpOnly cookies
export function setAuthCookies(response: NextResponse, tokens: AuthTokens) {
  response.cookies.set({
    name: "accessToken",
    value: tokens.accessToken,
    httpOnly: true,
    secure: isProduction,
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  response.cookies.set({
    name: "refreshToken",
    value: tokens.refreshToken,
    httpOnly: true,
    secure: isProduction,
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });

  return response;
}

// Clears the auth cookies by setting their maxAge to 0
export function clearAuthCookies(response: NextResponse) {
  response.cookies.set({
    name: "accessToken",
    value: "",
    httpOnly: true,
    secure: isProduction,
    path: "/",
    maxAge: 0,
  });

  response.cookies.set({
    name: "refreshToken",
    value: "",
    httpOnly: true,
    secure: isProduction,
    path: "/",
    maxAge: 0,
  });

  return response;
}
