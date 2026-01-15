import mongoose, { Document, Schema } from "mongoose";

/**
 * --- User Model ---
 *
 * - Contains user data model
 * - This model is used to store user data in the database
 */

// User interface
interface IUser extends Document {
  displayName: string;
  email?: string;
  phoneNumber: string;
  isVerified: boolean;
  otp?: string;
  otpExpiresAt?: Date;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  avatar?: string; // Cloudinary URL
  passwordHash: string; // bcrypt hashed password
  role: "user" | "admin";
  refreshToken?: string;
  accessToken?: string;
}

// User schema
const UserSchema: Schema<IUser> = new Schema(
  {
    displayName: {
      type: String,
      trim: true,
      required: [true, "Display name is required."],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Email is required."],
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address.",
      ],
      unique: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, "Please enter a valid phone number."], // 10 digits
      required: [true, "Phone number is required."],
      unique: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      trim: true,
      uppercase: true,
      match: [/^\d{6}$/, "Please enter a valid OTP."], // 6 digits
    },
    otpExpiresAt: {
      type: Date,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    avatar: {
      type: String, // Cloudinary URL
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      lowercase: true,
      trim: true,
      enum: ["user", "admin"],
      default: "user",
    },
    refreshToken: {
      type: String,
    },
    accessToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const User =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
