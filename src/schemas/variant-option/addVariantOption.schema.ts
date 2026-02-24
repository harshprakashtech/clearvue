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
  priority: z.number().min(0, "Zod ERR: Priority cannot be negative."),
});

// --- Schema Types ---
export type AddVariantOptionSchema = z.infer<typeof addVariantOptionSchema>;
