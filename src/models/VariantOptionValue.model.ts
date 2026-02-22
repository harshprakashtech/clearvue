import mongoose, { Document, Schema } from "mongoose";

/**
 * --- Variant Option Value Model ---
 *
 * - Contains variant attribute options data model
 * - This model is used to store variant attribute option values in the database
 */

// Variant Option Value interface
interface IVariantOptionValue extends Document {
  option: mongoose.Types.ObjectId;
  value: string;
}

// Variant Option Value schema
const VariantOptionValueSchema: Schema<IVariantOptionValue> = new Schema(
  {
    option: {
      type: Schema.Types.ObjectId,
      ref: "VariantOption",
      required: [true, "Option is required."],
    },
    value: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Value is required."],
    },
  },
  {
    timestamps: true,
  },
);

const VariantOptionValue =
  (mongoose.models.VariantOptionValue as mongoose.Model<IVariantOptionValue>) ||
  mongoose.model<IVariantOptionValue>(
    "VariantOptionValue",
    VariantOptionValueSchema,
  );

export default VariantOptionValue;
