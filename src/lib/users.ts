// Node-runtime only (uses fs + crypto.scrypt). Never import from middleware.
import fs from "fs";
import path from "path";
import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

export type Role = "admin" | "editor";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string; // salt:hash (hex)
  role: Role;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR    = path.join(process.cwd(), "data");
const USERS_FILE  = path.join(DATA_DIR, "admin-users.json");
const LEGACY_FILE = path.join(DATA_DIR, "admin-user.json"); // old single-user store

// Protected root account(s): always admin, cannot be demoted or deleted by anyone.
const PROTECTED_EMAILS = new Set(["uat@bombinoexp.com"]);

export function isProtectedUser(email: string): boolean {
  return PROTECTED_EMAILS.has(email.trim().toLowerCase());
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuf = Buffer.from(hash, "hex");
  const testBuf = scryptSync(password, salt, 64);
  return hashBuf.length === testBuf.length && timingSafeEqual(hashBuf, testBuf);
}

function uid(): string {
  return randomBytes(8).toString("hex");
}

export function readUsers(): AdminUser[] {
  // Preferred multi-user store
  try {
    const data = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    if (Array.isArray(data)) return data;
  } catch { /* fall through */ }

  // Migrate legacy single-user file → array (becomes the first admin)
  try {
    const legacy = JSON.parse(fs.readFileSync(LEGACY_FILE, "utf-8"));
    if (legacy?.email && legacy?.passwordHash) {
      const migrated: AdminUser[] = [{
        id: uid(),
        email: legacy.email,
        name: legacy.name ?? "Admin",
        passwordHash: legacy.passwordHash,
        role: "admin",
        createdAt: legacy.updatedAt ?? new Date().toISOString(),
        updatedAt: legacy.updatedAt ?? new Date().toISOString(),
      }];
      writeUsers(migrated);
      return migrated;
    }
  } catch { /* no legacy file */ }

  return [];
}

export function writeUsers(users: AdminUser[]) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

export function findByEmail(email: string): AdminUser | undefined {
  const target = email.trim().toLowerCase();
  return readUsers().find((u) => u.email.toLowerCase() === target);
}

export function findById(id: string): AdminUser | undefined {
  return readUsers().find((u) => u.id === id);
}

export function createUser(input: {
  email: string; name: string; password: string; role: Role;
}): AdminUser {
  const users = readUsers();
  if (users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase())) {
    throw new Error("A user with that email already exists");
  }
  const now = new Date().toISOString();
  const user: AdminUser = {
    id: uid(),
    email: input.email.trim(),
    name: input.name.trim() || input.email.trim(),
    passwordHash: hashPassword(input.password),
    role: input.role,
    createdAt: now,
    updatedAt: now,
  };
  users.push(user);
  writeUsers(users);
  return user;
}

export function updateUser(id: string, patch: Partial<{
  email: string; name: string; password: string; role: Role;
}>): AdminUser {
  const users = readUsers();
  const i = users.findIndex((u) => u.id === id);
  if (i === -1) throw new Error("User not found");

  const protectedUser = isProtectedUser(users[i].email);

  // A protected root account can never lose admin or change its email.
  if (protectedUser && patch.role && patch.role !== "admin") {
    throw new Error("This is a protected admin account and cannot be demoted");
  }
  if (protectedUser && patch.email && patch.email.trim().toLowerCase() !== users[i].email.toLowerCase()) {
    throw new Error("This is a protected admin account; its email cannot be changed");
  }

  if (patch.email && patch.email.trim().toLowerCase() !== users[i].email.toLowerCase()) {
    if (users.some((u) => u.id !== id && u.email.toLowerCase() === patch.email!.trim().toLowerCase())) {
      throw new Error("A user with that email already exists");
    }
    users[i].email = patch.email.trim();
  }
  if (patch.name !== undefined) users[i].name = patch.name.trim() || users[i].email;
  if (patch.role && !protectedUser) users[i].role = patch.role;
  if (patch.password) users[i].passwordHash = hashPassword(patch.password);
  users[i].updatedAt = new Date().toISOString();

  writeUsers(users);
  return users[i];
}

export function deleteUser(id: string) {
  const users = readUsers();
  const i = users.findIndex((u) => u.id === id);
  if (i === -1) throw new Error("User not found");
  if (isProtectedUser(users[i].email)) {
    throw new Error("This is a protected admin account and cannot be deleted");
  }
  if (users[i].role === "admin" && users.filter((u) => u.role === "admin").length === 1) {
    throw new Error("Cannot delete the last remaining admin");
  }
  users.splice(i, 1);
  writeUsers(users);
}

export function countAdmins(): number {
  return readUsers().filter((u) => u.role === "admin").length;
}
