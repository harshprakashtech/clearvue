import { loginWithPasswordSchema } from "@/schemas/auth/login.schema";

// Utils
import connectDB from "@/lib/db";
import {
  sendError,
  sendSuccess,
  sendValidationError,
} from "@/utils/apiResponse.util";
import { setAuthCookies } from "@/utils/cookies.util";

// Services
import { loginUserWithPassword } from "@/services/auth.service";

/**
 * --- Login API Route ---
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginWithPasswordSchema.safeParse(body);

    if (!result.success) {
      return sendValidationError(result.error.issues);
    }

    await connectDB();

    const { user, accessToken, refreshToken } = await loginUserWithPassword(
      result.data,
    );

    // Create response
    const response = sendSuccess({ user });

    // Set auth cookies and return response
    return setAuthCookies(response, { accessToken, refreshToken });
  } catch (err: any) {
    console.error("Login Error. ERR: ", err);

    // Determine status based on error message
    let status = 500;
    if (err.message.includes("not found")) status = 404;
    else if (
      err.message.includes("Invalid credentials") ||
      err.message.includes("login via OTP")
    )
      status = 400;

    return sendError(err.message, status);
  }
}
