import { z } from "zod";

// --- Auth Defination Imports ---
import { passwordSchema, phoneNumberSchema } from "./definations.schema";

/**
 * --- Login Schema ---
 *
 * - Login schema object to validate login input data
 *
 * Includes:
 *  - Login with password
 *  - Login with OTP
 */

// Password Login Schema
export const loginWithPasswordSchema = z.object({
  phoneNumber: phoneNumberSchema,
  password: passwordSchema,
});

// OTP Login Schema
export const loginWithOTPSchema = z.object({
  phoneNumber: phoneNumberSchema,
});

// Schema Types
export type LoginWithPasswordType = z.infer<typeof loginWithPasswordSchema>;
export type LoginWithOTPType = z.infer<typeof loginWithOTPSchema>;
