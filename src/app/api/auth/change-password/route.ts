import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE, validateSessionToken, makeSessionToken, SESSION_MAX_AGE,
} from "@/lib/auth";
import { findByEmail, verifyPassword, updateUser } from "@/lib/users";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await validateSessionToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = findByEmail(session.email);
  if (!user) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const { currentPassword, newPassword, email } = await req.json();

  if (!verifyPassword(String(currentPassword ?? ""), user.passwordHash)) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }
  if (typeof newPassword !== "string" || newPassword.length < 6) {
    return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
  }

  let updated;
  try {
    updated = updateUser(user.id, {
      password: newPassword,
      email: typeof email === "string" && email.trim() ? email.trim() : undefined,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Update failed" }, { status: 400 });
  }

  // Re-issue session (email may have changed; role unchanged)
  const newToken = await makeSessionToken(updated.email, updated.role);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return res;
}
