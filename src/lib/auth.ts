// Edge-safe: uses only Web Crypto (no fs, no Node crypto). Importable from middleware.
// Session token = base64url(payload) + "." + hmacHex(payload)
// payload = { email, exp }  (exp = unix seconds)

const encoder = new TextEncoder();

function b64urlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str: string): string {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  return atob(str.replace(/-/g, "+").replace(/_/g, "/") + pad);
}

async function hmacHex(message: string): Promise<string> {
  const secret = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type SessionRole = "admin" | "editor";
export interface Session { email: string; role: SessionRole }

export async function makeSessionToken(email: string, role: SessionRole): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload = b64urlEncode(JSON.stringify({ email, role, exp }));
  const sig = await hmacHex(payload);
  return `${payload}.${sig}`;
}

export async function validateSessionToken(token: string): Promise<Session | null> {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;

  const expected = await hmacHex(payload);
  // constant-ish comparison
  if (sig.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return null;

  try {
    const { email, role, exp } = JSON.parse(b64urlDecode(payload));
    if (typeof exp !== "number" || exp < Math.floor(Date.now() / 1000)) return null;
    if (role !== "admin" && role !== "editor") return null;
    return { email, role };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
