import { NextRequest, NextResponse } from "next/server";
import { findByEmail, updateUser } from "@/lib/users";
import { verifyOtp } from "@/lib/otp-store";

export const runtime = "nodejs";

const REASON_MSG: Record<string, string> = {
  missing: "No active reset code. Request a new one.",
  expired: "This code has expired. Request a new one.",
  too_many: "Too many incorrect attempts. Request a new code.",
  mismatch: "Incorrect code. Please check and try again.",
};

export async function POST(req: NextRequest) {
  const { email, code, newPassword } = await req.json();

  if (typeof email !== "string" || typeof code !== "string") {
    return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
  }
  if (typeof newPassword !== "string" || newPassword.length < 6) {
    return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
  }

  const user = findByEmail(email);

  // Verify OTP regardless (timing); but only apply if the user exists.
  const result = verifyOtp(email, code);
  if (!result.ok) {
    return NextResponse.json({ error: REASON_MSG[result.reason] ?? "Invalid code" }, { status: 400 });
  }

  if (!user) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  updateUser(user.id, { password: newPassword });
  return NextResponse.json({ ok: true });
}
