import { zObjectId } from "@/utils/zObjectId.util";
import { z } from "zod";

/**
 * --- Add Product Schema ---
 *
 * - Schema defination for adding product parent group
 */

// --- Schema Defination ---
export const addProductSchema = z.object({
  name: z.string().min(1, "Zod ERR: Product name is required."),
  description: z.string().min(1, "Zod ERR: Product description is required."),
  category: zObjectId,
  genderCategory: z.enum(["men", "women", "unisex"]),
  ageCategory: z.enum(["adult", "kids"]),
  slug: z.string().min(1, "Zod ERR: Product slug is required."),
  tags: z.array(z.string()).optional(),
});

// --- Schema Types ---
export type AddProductType = z.infer<typeof addProductSchema>;
