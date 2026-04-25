import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import jwt from "jsonwebtoken";
import { logContext } from "@/lib/asyncLocalStorage";

/**
 * --- API Logger Wrapper ---
 *
 * Higher-order function to intercept Next.js App Router requests,
 * extract IP and User ID, and log them using Winston.
 */

// Define the type for standard App Router handlers
type AppRouteHandler = (
  req: NextRequest | Request,
  context?: any
) => Promise<NextResponse | Response> | NextResponse | Response;

// Helper to extract IP
function extractIp(req: NextRequest | Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  // Fallback for NextRequest
  const ip = (req as any).ip;
  if (typeof ip === "string") {
    return ip;
  }
  return "UNKNOWN";
}

// Helper to extract User ID from accessToken
function extractUserId(req: NextRequest | Request): string {
  try {
    // We can only reliably parse cookies if it's a NextRequest or we manually parse headers.
    // However, App Router injects standard headers.
    let token = "";
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/accessToken=([^;]+)/);
    
    if (match && match[1]) {
      token = match[1];
    }

    if (!token) return "ANONYMOUS";

    const secret = process.env.JWT_SECRET;
    if (!secret) return "ANONYMOUS";

    // Decode token
    const decoded = jwt.verify(token, secret) as any;
    return decoded?.userId || "ANONYMOUS";
  } catch (err) {
    // Token might be expired or invalid, just return ANONYMOUS
    return "ANONYMOUS";
  }
}

/**
 * Wraps a route handler with Winston logging
 */
export function withLogging(handler: AppRouteHandler): AppRouteHandler {
  return async (req: NextRequest | Request, context?: any) => {
    const ip = extractIp(req);
    const userId = extractUserId(req);
    const method = req.method;
    
    // Attempt to get the pathname safely
    let pathname = req.url;
    try {
      const url = new URL(req.url);
      pathname = url.pathname;
    } catch (e) {
      // ignore
    }

    return logContext.run({ ip, userId }, async () => {
      // Log the incoming request with the IP and User ID passed as meta
      logger.info(`Incoming ${method} request to ${pathname}`);

      // Execute the actual handler
      try {
        return await handler(req, context);
      } catch (err) {
        logger.error(`Error in ${method} ${pathname}`, {
          error: err instanceof Error ? err.message : String(err),
        });
        throw err;
      }
    });
  };
}
