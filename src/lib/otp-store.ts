// Node-runtime only. Stores password-reset OTPs (hashed) with expiry + attempt cap.
import fs from "fs";
import path from "path";
import { hashPassword, verifyPassword } from "@/lib/users";

const DATA_DIR = path.join(process.cwd(), "data");
const OTP_FILE = path.join(DATA_DIR, "reset-otps.json");

export const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;

interface OtpEntry {
  codeHash: string;   // salt:hash
  expiresAt: number;  // unix ms
  attempts: number;
  createdAt: number;  // unix ms
}

type Store = Record<string, OtpEntry>; // keyed by lowercased email

function read(): Store {
  try {
    return JSON.parse(fs.readFileSync(OTP_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function write(store: Store) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(OTP_FILE, JSON.stringify(store, null, 2), "utf-8");
}

function prune(store: Store): Store {
  const now = Date.now();
  for (const k of Object.keys(store)) {
    if (store[k].expiresAt < now) delete store[k];
  }
  return store;
}

export function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

/** Returns false if a code was issued too recently (cooldown). */
export function canIssue(email: string): boolean {
  const store = prune(read());
  const entry = store[email.toLowerCase()];
  if (!entry) return true;
  return Date.now() - entry.createdAt >= RESEND_COOLDOWN_MS;
}

export function setOtp(email: string, code: string) {
  const store = prune(read());
  const now = Date.now();
  store[email.toLowerCase()] = {
    codeHash: hashPassword(code),
    expiresAt: now + OTP_TTL_MINUTES * 60 * 1000,
    attempts: 0,
    createdAt: now,
  };
  write(store);
}

export function clearOtp(email: string) {
  const store = read();
  delete store[email.toLowerCase()];
  write(store);
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: "missing" | "expired" | "too_many" | "mismatch" };

export function verifyOtp(email: string, code: string): VerifyResult {
  const store = prune(read());
  const key = email.toLowerCase();
  const entry = store[key];

  if (!entry) return { ok: false, reason: "missing" };
  if (entry.expiresAt < Date.now()) {
    delete store[key]; write(store);
    return { ok: false, reason: "expired" };
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    delete store[key]; write(store);
    return { ok: false, reason: "too_many" };
  }

  if (!verifyPassword(code, entry.codeHash)) {
    entry.attempts += 1;
    write(store);
    return { ok: false, reason: "mismatch" };
  }

  delete store[key]; write(store); // single-use
  return { ok: true };
}
