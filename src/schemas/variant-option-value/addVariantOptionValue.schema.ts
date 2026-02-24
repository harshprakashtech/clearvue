import { zObjectId } from "@/utils/zObjectId.util";
import { z } from "zod";

/**
 * --- Add Variant Option Value Schema ---
 *
 * - Schema defination for adding variant option values (product attribute option values)
 */

// --- Schema Defination ---
export const addVariantOptionValueSchema = z.object({
  option: zObjectId,
  value: z.string().min(1, "Zod ERR: Variant option value is required."),
});

// --- Schema Types ---
export type AddVariantOptionValueSchema = z.infer<
  typeof addVariantOptionValueSchema
>;
