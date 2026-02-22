import mongoose, { Document, Schema } from "mongoose";

/**
 * --- Product Model ---
 *
 * - Contains product parent data model
 * - This model is used to store product parent data in the database
 */

// Product interface
interface IProduct extends Document {
  name: string;
  description: string;
  category: string;
  genderCategory: "men" | "women" | "unisex";
  ageCategory: "adult" | "kids";
  slug: string;
  reviewCount: number;
  avgRating: number;
  isAvailable: boolean;
  isFeatured: boolean;
}

// Product schema
const ProductSchema: Schema<IProduct> = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Product name is required."],
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Product description is required."],
    },
    category: {
      type: String,
      trim: true,
      required: [true, "Product category is required."],
    },
    genderCategory: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ["men", "women", "unisex"],
      required: [true, "Product gender category is required."],
    },
    ageCategory: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ["adult", "kids"],
      required: [true, "Product age category is required."],
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Product slug is required."],
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    avgRating: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Product =
  (mongoose.models.Product as mongoose.Model<IProduct>) ||
  mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
