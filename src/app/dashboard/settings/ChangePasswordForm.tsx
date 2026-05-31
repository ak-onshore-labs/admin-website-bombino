"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export function ChangePasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirm) {
      setError("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, email: email.trim() || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirm("");
        router.refresh();
      } else {
        setError(data.error ?? "Failed to update password");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#076292] focus:border-transparent transition bg-white";
  const labelCls = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 rounded-xl">
          {success}
        </div>
      )}

      <div>
        <label className={labelCls}>Email <span className="font-normal text-slate-400">(leave blank to keep current)</span></label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="New login email (optional)"
          autoComplete="username"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Current Password *</label>
        <input
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>New Password *</label>
        <input
          type="password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 6 characters"
          autoComplete="new-password"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Confirm New Password *</label>
        <input
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          className={inputCls}
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-6 py-2.5 bg-[#076292] hover:bg-[#054e73] disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors"
      >
        {saving ? "Updating…" : "Update Password"}
      </button>
    </form>
  );
}
