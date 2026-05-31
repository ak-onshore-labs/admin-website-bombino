import { NextRequest, NextResponse } from "next/server";
import { findByEmail } from "@/lib/users";
import { canIssue, generateCode, setOtp, OTP_TTL_MINUTES } from "@/lib/otp-store";
import { sendMail, otpEmail } from "@/lib/mailer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  // Always respond the same way — never reveal whether an account exists.
  const generic = NextResponse.json({
    ok: true,
    message: "If that email is registered, a reset code has been sent.",
  });

  if (typeof email !== "string" || !email.trim()) return generic;

  const user = findByEmail(email);
  if (!user) return generic;

  if (!canIssue(user.email)) {
    return NextResponse.json(
      { error: "A code was just sent. Please wait a minute before requesting another." },
      { status: 429 }
    );
  }

  const code = generateCode();
  setOtp(user.email, code);

  const { subject, html, text } = otpEmail(code, OTP_TTL_MINUTES);
  try {
    await sendMail(user.email, subject, html, text);
  } catch (e) {
    console.error("Failed to send OTP email:", e);
    return NextResponse.json({ error: "Failed to send email. Try again later." }, { status: 502 });
  }

  return generic;
}
