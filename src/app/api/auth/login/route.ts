import { NextRequest, NextResponse } from "next/server";
import { makeSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import { findByEmail, verifyPassword } from "@/lib/users";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = findByEmail(email);
  const passOk = user ? verifyPassword(password, user.passwordHash) : false;

  if (!user || !passOk) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await makeSessionToken(user.email, user.role);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return res;
}
