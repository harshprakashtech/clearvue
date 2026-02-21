import mongoose from "mongoose";

/**
 * --- Mongo DB Connection ---
 *
 * - Setup secure and cached connection to database (MongoDB).
 * - Prevents multiple connections.
 */

mongoose.set("strictQuery", true); // Enforce strict query mode.

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("ERR: Missing MONGO DB connection URI.");
}

let cached = (global as any).mongoose; // Cache connection.

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

// --- Database connection ---
const connectDB = async () => {
  // Return cached connection if exists.
  if (cached.conn) {
    return cached.conn;
  }

  // Create new connection if not exists.
  if (!cached.promise) {
    const options = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, options);
  }

  // Wait for connection to complete.
  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;
