import mongoose, { Document, Schema } from "mongoose";

/**
 * --- Product Category Model ---
 *
 * - Contains product category data model
 * - This model is used to store product category data in the database
 */

// Product category interface
interface IProductCategory extends Document {
  name: string;
  slug: string;
}

// Product category schema
const ProductCategorySchema: Schema<IProductCategory> = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Product category name is required."],
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Product category slug is required."],
    },
  },
  {
    timestamps: true,
  },
);

const ProductCategory =
  (mongoose.models.ProductCategory as mongoose.Model<IProductCategory>) ||
  mongoose.model<IProductCategory>("ProductCategory", ProductCategorySchema);

export default ProductCategory;
