import connectDB from "@/lib/db";
import User from "@/models/User.model";
import { NextResponse } from "next/server";

/**
 * --- Check Verification Route ---
 *
 * - Checks if the user is verified via phone number.
 * - Returns true if the user is verified, false otherwise.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get("phoneNumber");

    // Check if phone number is provided
    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Check Verification Error: Phone number required" },
        { status: 400 },
      );
    }

    await connectDB();
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return NextResponse.json(
        { error: "Check Verification Error: User not found" },
        { status: 404 },
      );
    }

    // Check if user is verified
    if (user.isVerified) {
      return NextResponse.json({ isVerified: true });
    } else {
      return NextResponse.json({ isVerified: false });
    }
  } catch (err: any) {
    console.error("Check Verification Error. ERR: ", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
