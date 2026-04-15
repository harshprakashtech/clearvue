import { z } from "zod";

/**
 * --- Add Product Category Schema ---
 *
 * - Schema defination for adding product categories
 */

// --- Schema Defination ---
export const addProductCategorySchema = z.object({
  name: z.string().min(1, "Zod ERR: Category name is required."),
  slug: z.string().min(1, "Zod ERR: Category slug is required."),
});

// --- Schema Types ---
export type AddProductCategoryType = z.infer<typeof addProductCategorySchema>;
