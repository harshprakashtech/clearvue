import { z } from "zod";

/**
 * --- User Defination Schemas ---
 *
 * - User schema definations to validate user-related input data
 */

// --- Address Schema ---
export const addressSchema = z.object({
  houseNumber: z.string().min(1, {
    message: "Zod ERR: House number is required in address.",
  }),
  street: z.string().min(1, {
    message: "Zod ERR: Street is required in address.",
  }),
  landmark: z.string().optional(),
  city: z.string().min(1, {
    message: "Zod ERR: City is required in address.",
  }),
  state: z.string().min(1, {
    message: "Zod ERR: State is required in address.",
  }),
  zipCode: z.string().min(1, {
    message: "Zod ERR: Zip code is required in address.",
  }),
  country: z.string().min(1, {
    message: "Zod ERR: Country is required in address.",
  }),
});

// --- Schema Types ---
export type AddressSchema = z.infer<typeof addressSchema>;
