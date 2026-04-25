// Utils
import connectDB from "@/lib/db";
import { logger } from "@/lib/logger";
import {
  sendError,
  sendSuccess,
  sendValidationError,
} from "@/utils/apiResponse.util";

// Schemas
import { registerSchema } from "@/schemas/auth/register.schema";

// Services
import { registerUser } from "@/services/auth.service";

/**
 * --- Register API Route ---
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body); // Zod validation

    if (!result.success) {
      return sendValidationError(result.error.issues);
    }

    await connectDB();

    const data = await registerUser(result.data);

    // Return the verification token and WhatsApp link
    return sendSuccess(data);
  } catch (err: any) {
    logger.error("Register Init Error. ERR: ", err);
    return sendError(
      err.message,
      err.message.includes("already verified") ? 400 : 500,
    );
  }
}
