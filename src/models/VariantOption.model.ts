import mongoose, { Document, Schema } from "mongoose";

/**
 * --- Variant Option Model ---
 *
 * - Contains variant attribute options data model
 * - This model is used to store variant attribute options in the database
 */

// Variant Option interface
interface IVariantOption extends Document {
  product: mongoose.Types.ObjectId;
  name: string;
  priority: number;
}

// Variant Option schema
const VariantOptionSchema: Schema<IVariantOption> = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required."],
    },
    name: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Product option name is required."],
    },
    priority: {
      type: Number,
      required: [true, "Product option priority is required."],
    },
  },
  {
    timestamps: true,
  },
);

const VariantOption =
  (mongoose.models.VariantOption as mongoose.Model<IVariantOption>) ||
  mongoose.model<IVariantOption>("VariantOption", VariantOptionSchema);

export default VariantOption;
