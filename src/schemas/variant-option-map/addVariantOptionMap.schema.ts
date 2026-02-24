import { zObjectId } from "@/utils/zObjectId.util";
import { z } from "zod";

/**
 * --- Add Variant Option Map Schema ---
 *
 * - Schema defination for adding variant option map (product attribute option map)
 */

// --- Schema Defination ---
export const addVariantOptionMapSchema = z.object({
  variant: zObjectId,
  optionValue: zObjectId,
});

// --- Schema Types ---
export type AddVariantOptionMapSchema = z.infer<
  typeof addVariantOptionMapSchema
>;
