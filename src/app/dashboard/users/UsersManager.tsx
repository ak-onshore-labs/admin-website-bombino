"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Shield, Trash2, KeyRound, X } from "lucide-react";

type Role = "admin" | "editor";
interface UserRow {
  id: string; email: string; name: string; role: Role;
  createdAt: string; updatedAt: string;
}

const ROLE_LABEL: Record<Role, string> = { admin: "Admin", editor: "Editor" };
const ROLE_DESC: Record<Role, string> = {
  admin: "Full access — blog posts, settings, and user management.",
  editor: "Can create and manage blog posts only.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function UsersManager({
  initialUsers, currentUserId,
}: {
  initialUsers: UserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [showAdd, setShowAdd] = useState(false);
  const [resetFor, setResetFor] = useState<UserRow | null>(null);
  const [error, setError] = useState("");

  function refresh() {
    router.refresh();
  }

  async function changeRole(u: UserRow, role: Role) {
    setError("");
    const res = await fetch(`/api/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role } : x)));
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to update role");
    }
  }

  async function remove(u: UserRow) {
    if (!confirm(`Delete ${u.email}? This cannot be undone.`)) return;
    setError("");
    const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to delete user");
    }
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#076292] hover:bg-[#054e73] px-5 py-2.5 rounded-xl transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-[1fr_140px_110px_90px] gap-4 px-6 py-3 border-b border-slate-100 bg-slate-50">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">User</span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Added</span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</span>
        </div>

        <div className="divide-y divide-slate-100">
          {users.map((u) => (
            <div key={u.id} className="grid grid-cols-[1fr_140px_110px_90px] gap-4 px-6 py-4 items-center">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {u.name}
                  {u.id === currentUserId && (
                    <span className="ml-2 text-[0.65rem] font-bold text-[#076292] bg-[#076292]/10 px-1.5 py-0.5 rounded">YOU</span>
                  )}
                </p>
                <p className="text-xs text-slate-400 truncate">{u.email}</p>
              </div>

              {/* Role selector */}
              <select
                value={u.role}
                onChange={(e) => changeRole(u, e.target.value as Role)}
                className="text-xs font-semibold rounded-lg border border-slate-200 px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#076292]"
                title={ROLE_DESC[u.role]}
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
              </select>

              <span className="text-xs text-slate-400">{formatDate(u.createdAt)}</span>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setResetFor(u)}
                  title="Reset password"
                  className="text-slate-400 hover:text-[#076292] transition-colors"
                >
                  <KeyRound className="w-4 h-4" />
                </button>
                {u.id !== currentUserId && (
                  <button
                    onClick={() => remove(u)}
                    title="Delete user"
                    className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role legend */}
      <div className="grid grid-cols-2 gap-3">
        {(["admin", "editor"] as Role[]).map((r) => (
          <div key={r} className="flex items-start gap-2.5 bg-white border border-slate-200 rounded-xl p-3">
            <Shield className={`w-4 h-4 mt-0.5 shrink-0 ${r === "admin" ? "text-[#076292]" : "text-slate-400"}`} />
            <div>
              <p className="text-sm font-semibold text-slate-900">{ROLE_LABEL[r]}</p>
              <p className="text-xs text-slate-500">{ROLE_DESC[r]}</p>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <AddUserModal
          onClose={() => setShowAdd(false)}
          onCreated={() => { setShowAdd(false); refresh(); }}
        />
      )}

      {resetFor && (
        <ResetPasswordModal
          user={resetFor}
          onClose={() => setResetFor(null)}
          onDone={() => setResetFor(null)}
        />
      )}
    </div>
  );
}

/* ── Add user modal ──────────────────────────────────────── */
function AddUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("editor");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      if (res.ok) onCreated();
      else {
        const d = await res.json();
        setError(d.error ?? "Failed to create user");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Add User" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        {error && <ErrorBox>{error}</ErrorBox>}
        <Field label="Name">
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
        </Field>
        <Field label="Email *">
          <input className={inputCls} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@bombinoexp.com" autoComplete="off" />
        </Field>
        <Field label="Temporary Password *">
          <input className={inputCls} type="text" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="off" />
          <p className="text-xs text-slate-400 mt-1">Share this with the user — they can change it from Settings.</p>
        </Field>
        <Field label="Role">
          <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="editor">Editor — blog posts only</option>
            <option value="admin">Admin — full access</option>
          </select>
        </Field>
        <div className="flex items-center gap-3 pt-1">
          <button type="submit" disabled={saving}
            className="px-5 py-2.5 bg-[#076292] hover:bg-[#054e73] disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors">
            {saving ? "Creating…" : "Create User"}
          </button>
          <button type="button" onClick={onClose} className="text-sm font-medium text-slate-500 hover:text-slate-700">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ── Reset password modal ────────────────────────────────── */
function ResetPasswordModal({ user, onClose, onDone }: { user: UserRow; onClose: () => void; onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) { setDone(true); setTimeout(onDone, 900); }
      else {
        const d = await res.json();
        setError(d.error ?? "Failed to reset password");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Reset password — ${user.email}`} onClose={onClose}>
      {done ? (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          Password updated.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {error && <ErrorBox>{error}</ErrorBox>}
          <Field label="New Password *">
            <input className={inputCls} type="text" required value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="off" />
          </Field>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving}
              className="px-5 py-2.5 bg-[#076292] hover:bg-[#054e73] disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors">
              {saving ? "Saving…" : "Set Password"}
            </button>
            <button type="button" onClick={onClose} className="text-sm font-medium text-slate-500 hover:text-slate-700">
              Cancel
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

/* ── Small UI primitives ─────────────────────────────────── */
const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#076292] focus:border-transparent transition bg-white";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl">{children}</div>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900 text-sm">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
