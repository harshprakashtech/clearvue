import { z } from "zod";

/**
 * --- Auth Defination Schemas ---
 *
 * - Schema definations related to Auth
 */

// --- Email Schema ---
export const emailSchema = z
  .string()
  .email("Zod ERR: Invalid email address format.");

// --- Phone Number Schema ---
export const phoneNumberSchema = z
  .string()
  .length(10, "Zod ERR: Phone number must be 10 characters long.");

// --- Password Schema ---
// Password is not hashed here, it is raw string sent by user
export const passwordSchema = z
  .string()
  .min(8, {
    message: "Zod ERR: Password must be at least 8 characters long.",
  })
  .max(32, {
    message: "Zod ERR: Password must be at most 32 characters long.",
  });

// --- OTP Schema ---
export const otpSchema = z
  .string()
  .length(6, "Zod ERR: OTP must be 6 characters long.")
  .regex(
    /^[a-zA-Z0-9]+$/,
    "Zod ERR: OTP must contain only numbers and letters.",
  ); // Alphanumeric
