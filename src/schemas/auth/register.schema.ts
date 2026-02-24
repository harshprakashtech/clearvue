import { z } from "zod";

// --- Auth Defination Imports ---
import { passwordSchema, phoneNumberSchema } from "./definations.schema";

/**
 * --- Register Schema ---
 *
 * - Register schema object to validate register input data
 * - Register can be done by phone number only
 */

export const registerSchema = z.object({
  displayName: z
    .string()
    .min(3, "Zod ERR: Display name must be at least 3 characters long")
    .max(30, "Zod ERR: Display name must be at most 30 characters long"),
  phoneNumber: phoneNumberSchema,
  password: passwordSchema.optional(),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
