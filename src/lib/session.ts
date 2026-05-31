// Node-runtime server helper. Resolves the current user from the session cookie
// AND re-reads the user file so role changes take effect without re-login.
import { cookies } from "next/headers";
import { SESSION_COOKIE, validateSessionToken } from "@/lib/auth";
import { findByEmail, type AdminUser } from "@/lib/users";

export async function getCurrentUser(): Promise<AdminUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await validateSessionToken(token);
  if (!session) return null;
  return findByEmail(session.email) ?? null;
}
