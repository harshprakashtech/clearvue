import mongoose, { Document, Schema } from "mongoose";

/**
 * --- Variant Option Map Model ---
 *
 * - Contains variant option mapping data model
 * - This model is used to store relationship between attribute options and product variants in the database
 */

// Variant Option Map interface
interface IVariantOptionMap extends Document {
  variant: mongoose.Types.ObjectId;
  optionValue: mongoose.Types.ObjectId;
}

// Variant Option Map schema
const VariantOptionMapSchema: Schema<IVariantOptionMap> = new Schema(
  {
    variant: {
      type: Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: [true, "Variant is required."],
    },
    optionValue: {
      type: Schema.Types.ObjectId,
      ref: "VariantOptionValue",
      required: [true, "Option value is required."],
    },
  },
  {
    timestamps: true,
  },
);

const VariantOptionMap =
  (mongoose.models.VariantOptionMap as mongoose.Model<IVariantOptionMap>) ||
  mongoose.model<IVariantOptionMap>("VariantOptionMap", VariantOptionMapSchema);

export default VariantOptionMap;
