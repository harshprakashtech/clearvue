import { NextResponse } from "next/server";

/**
 * --- Standard API Response Utility ---
 *
 * Standard utility for consistent API responses across all Next.js routes.
 */

// Interface for API response
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string | null;
  details?: any; // For zod validation errors etc.
}

// Success response generic
export function sendSuccess<T>(
  data: T,
  message: string = "Success",
  status: number = 200,
) {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data,
  };

  return NextResponse.json(payload, { status });
}

// Error response generic
export function sendError(
  error: string = "Internal Server Error",
  status: number = 500,
  details?: any,
) {
  const payload: ApiResponse<null> = {
    success: false,
    error,
  };

  if (details) {
    payload.details = details;
  }

  return NextResponse.json(payload, { status });
}

// Specific error shortcut for Zod validations
export function sendValidationError(details: any) {
  return sendError("Validation Failed", 400, details);
}
