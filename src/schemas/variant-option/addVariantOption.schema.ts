import { zObjectId } from "@/utils/zObjectId.util";
import { z } from "zod";

/**
 * --- Add Variant Option Schema ---
 *
 * - Schema defination for adding variant options (product attribute options)
 */

// --- Schema Defination ---
export const addVariantOptionSchema = z.object({
  product: zObjectId,
  name: z.string().min(1, "Zod ERR: Variant option name is required."),
  displayType: z.enum(["swatch", "button", "dropdown"]),
  priority: z.number().min(0, "Zod ERR: Priority cannot be less than 0."),
});

// --- Schema Types ---
export type AddVariantOptionType = z.infer<typeof addVariantOptionSchema>;
