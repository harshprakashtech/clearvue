import { z } from "zod";

/**
 * --- Auth Defination Schemas ---
 *
 * - Schema definations related to Auth
 */

// --- Email Schema ---
export const emailSchema = z.string().email("Invalid email address format.");

// --- Phone Number Schema ---
export const phoneNumberSchema = z
  .string()
  .length(10, "Phone number must be 10 characters long.");

// --- Password Schema ---
// Password is not hashed here, it is raw string sent by user
export const passwordSchema = z
  .string()
  .min(8, {
    message: "Password must be at least 8 characters long.",
  })
  .max(32, {
    message: "Password must be at most 32 characters long.",
  });

// --- OTP Schema ---
export const otpSchema = z
  .string()
  .length(6, "OTP must be 6 characters long.")
  .regex(/^[a-zA-Z0-9]+$/, "OTP must contain only numbers and letters."); // Alphanumeric

// --- Address Schema ---
export const addressSchema = z.object({
  street: z.string().min(1, {
    message: "Street is required in address.",
  }),
  city: z.string().min(1, {
    message: "City is required in address.",
  }),
  state: z.string().min(1, {
    message: "State is required in address.",
  }),
  zipCode: z.string().min(1, {
    message: "Zip code is required in address.",
  }),
  country: z.string().min(1, {
    message: "Country is required in address.",
  }),
});

// --- Schema Types ---
export type AddressSchema = z.infer<typeof addressSchema>;
