import mongoose from "mongoose";
import { z } from "zod";

// Zod utility for Object ID validation
export const zObjectId = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Zod ERR: Invalid ObjectId provided as input.",
  })
  .transform((val) => new mongoose.Types.ObjectId(val));
