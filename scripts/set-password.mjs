#!/usr/bin/env node
// Create or reset an admin-panel user (lockout recovery).
// Usage: npm run set-password
import { scryptSync, randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import readline from "node:readline";

const DATA_DIR    = path.join(process.cwd(), "data");
const USERS_FILE  = path.join(DATA_DIR, "admin-users.json");
const LEGACY_FILE = path.join(DATA_DIR, "admin-user.json");

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function uid() {
  return randomBytes(8).toString("hex");
}

function loadUsers() {
  try {
    const data = JSON.parse(readFileSync(USERS_FILE, "utf-8"));
    if (Array.isArray(data)) return data;
  } catch { /* try legacy */ }
  try {
    const legacy = JSON.parse(readFileSync(LEGACY_FILE, "utf-8"));
    if (legacy?.email && legacy?.passwordHash) {
      return [{
        id: uid(), email: legacy.email, name: legacy.name ?? "Admin",
        passwordHash: legacy.passwordHash, role: "admin",
        createdAt: legacy.updatedAt ?? new Date().toISOString(),
        updatedAt: legacy.updatedAt ?? new Date().toISOString(),
      }];
    }
  } catch { /* none */ }
  return [];
}

function ask(question, { hidden = false } = {}) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    if (hidden) {
      const onData = () => {
        process.stdout.write("\x1b[2K\x1b[200D" + question + "*".repeat(rl.line.length));
      };
      process.stdin.on("data", onData);
      rl.question(question, (answer) => {
        process.stdin.removeListener("data", onData);
        rl.close();
        process.stdout.write("\n");
        resolve(answer.trim());
      });
    } else {
      rl.question(question, (answer) => { rl.close(); resolve(answer.trim()); });
    }
  });
}

(async () => {
  console.log("\n  Bombino Admin — create / reset a user\n");

  const users = loadUsers();
  const email = (await ask("  Email: ")).toLowerCase();
  if (!email) { console.error("  ✗ Email is required.\n"); process.exit(1); }

  const password = await ask("  New password: ", { hidden: true });
  if (password.length < 6) { console.error("  ✗ Password must be at least 6 characters.\n"); process.exit(1); }
  const confirm = await ask("  Confirm password: ", { hidden: true });
  if (password !== confirm) { console.error("  ✗ Passwords do not match.\n"); process.exit(1); }

  const existing = users.find((u) => u.email.toLowerCase() === email);
  let role = existing?.role ?? "admin";
  const roleAns = (await ask(`  Role (admin/editor) [${role}]: `)).toLowerCase();
  if (roleAns === "admin" || roleAns === "editor") role = roleAns;

  const now = new Date().toISOString();
  if (existing) {
    existing.passwordHash = hashPassword(password);
    existing.role = role;
    existing.updatedAt = now;
  } else {
    users.push({
      id: uid(), email, name: "Admin", passwordHash: hashPassword(password),
      role, createdAt: now, updatedAt: now,
    });
  }

  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");

  console.log(`\n  ✓ Saved ${email} (${role})\n`);
  process.exit(0);
})();
