// Utils
import connectDB from "@/lib/db";
import { logger } from "@/lib/logger";
import { sendError, sendSuccess } from "@/utils/apiResponse.util";
import { setAuthCookies } from "@/utils/cookies.util";
import { withLogging } from "@/utils/apiLogger.util";

// Services
import { checkVerificationStatus } from "@/services/otp.service";

/**
 * --- Check Verification Route (Polling) ---
 *
 * - Polled by the frontend to check if OTP has been verified.
 * - If verified:
 *    - Performs auto-login by issuing JWT tokens.
 *    - Burns the OTP record.
 */
export const GET = withLogging(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get("phoneNumber");
    const type = searchParams.get("type") as "registration" | "login";

    if (!phoneNumber || !type) {
      return sendError(
        "Check Verification Error: Phone number and type are required",
        400,
      );
    }

    await connectDB();

    // Check verification status
    const result = await checkVerificationStatus(phoneNumber, type);

    if (result.verified) {
      // Create response and set auth cookies
      const response = sendSuccess({
        isVerified: true,
        user: result.user,
      });

      if (result.tokens) {
        return setAuthCookies(response, result.tokens);
      }

      return response;
    } else {
      // Still pending
      return sendSuccess({
        isVerified: false,
      });
    }
  } catch (err: any) {
    logger.error("Check Verification Error. ERR: ", err);
    return sendError(err.message, 500);
  }
});
