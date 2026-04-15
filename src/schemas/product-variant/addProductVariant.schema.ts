import { zObjectId } from "@/utils/zObjectId.util";
import { z } from "zod";

/**
 * --- Add Product Variant Schema ---
 *
 * - Schema defination for adding product variants (actual sellable product)
 */

// --- Schema Defination ---
export const addProductVariantSchema = z.object({
  product: zObjectId,
  sku: z.string().min(1, "Zod ERR: SKU is required."),
  originalPrice: z
    .number()
    .min(0, "Zod ERR: Original price cannot be less than 0."),
  sellingPrice: z
    .number()
    .min(0, "Zod ERR: Selling price cannot be less than 0."),
  regularDiscount: z
    .number()
    .min(0, "Zod ERR: Regular discount cannot be less than 0."),
  inventoryQuantity: z
    .number()
    .min(0, "Zod ERR: Inventory quantity cannot be less than 0."),
});

// --- Schema Types ---
export type AddProductVariantType = z.infer<typeof addProductVariantSchema>;
