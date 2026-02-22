import mongoose, { Document, Schema } from "mongoose";

/**
 * --- Product Variant Model ---
 *
 * - Stores product variant data model
 * - This model is used to store product variant data in the database
 */

interface IProductVariant extends Document {
  product: mongoose.Types.ObjectId;
  sku: string;
  originalPrice: number;
  sellingPrice: number;
  regularDiscount: number;
  inventoryQuantity: number;
  images: string[]; // Cloud URLs
  isAvailable: boolean;
}

const ProductVariantSchema: Schema<IProductVariant> = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Parent product is required."],
      index: true,
    },
    sku: {
      type: String,
      unique: true,
      trim: true,
      required: [true, "SKU is required."],
    },
    originalPrice: {
      type: Number,
      required: [true, "Original price is required."],
      min: [0, "Original price cannot be negative."],
    },
    sellingPrice: {
      type: Number,
      required: [true, "Selling price is required."],
      min: [0, "Selling price cannot be negative."],
    },
    regularDiscount: {
      type: Number, // in percentage
      required: [true, "Regular discount is required."],
      min: [0, "Regular discount cannot be negative."],
    },
    inventoryQuantity: {
      type: Number,
      default: 0,
      min: [0, "Inventory cannot be negative."],
    },
    images: {
      type: [String], // Cloud URLs
      default: [],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexing
ProductVariantSchema.index({ product: 1, isAvailable: 1 });

const ProductVariant =
  (mongoose.models.ProductVariant as mongoose.Model<IProductVariant>) ||
  mongoose.model<IProductVariant>("ProductVariant", ProductVariantSchema);

export default ProductVariant;
