import { NextRequest } from "next/server";
import { SESSION_COOKIE, validateSessionToken } from "@/lib/auth";
import { findByEmail, type AdminUser } from "@/lib/users";

// Resolve the acting user from a route-handler request (Node runtime).
export async function getActor(req: NextRequest): Promise<AdminUser | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await validateSessionToken(token) : null;
  return session ? (findByEmail(session.email) ?? null) : null;
}
