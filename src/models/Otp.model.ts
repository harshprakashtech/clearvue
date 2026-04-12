import mongoose, { Document, Schema } from "mongoose";

/**
 * --- OTP Model ---
 *
 * - Contains OTP data model
 * - This model is used to store OTP data in the database
 */

// OTP interface
interface IOtp extends Document {
  user: mongoose.Types.ObjectId;
  phoneNumber: string;
  type: "registration" | "login";
  hashedOtp: string;
  isVerified: boolean;
  expiresAt: Date;
}

// OTP Schema
const OtpSchema: Schema<IOtp> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required."],
    },
    phoneNumber: {
      type: String,
      trim: true,
      required: [true, "Phone number is required."],
    },
    type: {
      type: String,
      enum: ["registration", "login"],
      required: [true, "Type is required."],
    },
    hashedOtp: {
      type: String,
      required: [true, "Hashed OTP is required."],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      index: { expires: 0 }, // TTL index
    },
  },
  {
    timestamps: true,
  },
);

const Otp =
  (mongoose.models.Otp as mongoose.Model<IOtp>) ||
  mongoose.model<IOtp>("Otp", OtpSchema);

export default Otp;
