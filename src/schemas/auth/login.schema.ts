import { z } from "zod";

// --- Auth Defination Imports ---
import {
  emailSchema,
  passwordSchema,
  phoneNumberSchema,
} from "./definations.schema";

/**
 * --- Login Schema ---
 *
 * - Login schema object to validate login input data
 * - Login can be done by either email or phone number
 */

export const loginSchema = z
  .object({
    email: emailSchema.optional(),
    phoneNumber: phoneNumberSchema.optional(),
    password: passwordSchema.optional(),
  })
  .refine((data) => data.email || data.phoneNumber, {
    message: "Either email or phone number must be provided.",
    path: ["identifier"], //
  });

export type LoginSchema = z.infer<typeof loginSchema>;
