"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPage() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function requestCode(e: FormEvent) {
    e.preventDefault();
    setError(""); setInfo(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setInfo("If that email is registered, a 6-digit code is on its way. Check your inbox.");
        setStep("reset");
      } else {
        setError(data.error ?? "Something went wrong");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e: FormEvent) {
    e.preventDefault();
    setError(""); setInfo("");
    if (newPassword !== confirm) { setError("Passwords do not match"); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code.trim(), newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
        setTimeout(() => router.push("/login"), 1600);
      } else {
        setError(data.error ?? "Failed to reset password");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full px-3.5 py-2.5 rounded-xl bg-slate-700 border border-slate-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#076292] focus:border-transparent transition";
  const labelCls = "block text-sm font-medium text-slate-300 mb-1.5";

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="mx-auto mb-5 w-[200px] h-[52px] bg-white"
            style={{
              maskImage: "url('/bombino-logo-01.png')", maskSize: "contain",
              maskRepeat: "no-repeat", maskPosition: "center",
              WebkitMaskImage: "url('/bombino-logo-01.png')", WebkitMaskSize: "contain",
              WebkitMaskRepeat: "no-repeat", WebkitMaskPosition: "center",
            }}
            role="img" aria-label="Bombino Express"
          />
          <div className="flex items-center justify-center gap-2">
            <span className="h-px w-6 bg-slate-700" />
            <p className="text-[0.7rem] font-bold tracking-[0.25em] uppercase text-[#FBAD1F]">Reset Password</p>
            <span className="h-px w-6 bg-slate-700" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          {done ? (
            <div className="text-center py-4">
              <p className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2.5 mb-3">
                Password reset. Redirecting to sign in…
              </p>
            </div>
          ) : step === "request" ? (
            <form onSubmit={requestCode} className="space-y-4">
              <p className="text-slate-400 text-sm">
                Enter your account email and we&apos;ll send a 6-digit reset code.
              </p>
              <div>
                <label className={labelCls}>Email</label>
                <input
                  type="email" required autoFocus value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@bombinoexp.com" className={inputCls}
                />
              </div>
              {error && <ErrBox>{error}</ErrBox>}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-[#076292] hover:bg-[#054e73] disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors">
                {loading ? "Sending…" : "Send Reset Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={resetPassword} className="space-y-4">
              {info && (
                <p className="text-slate-300 text-xs bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2">
                  {info}
                </p>
              )}
              <div>
                <label className={labelCls}>6-Digit Code</label>
                <input
                  inputMode="numeric" required autoFocus value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  className={`${inputCls} tracking-[0.5em] text-center font-mono text-lg`}
                />
              </div>
              <div>
                <label className={labelCls}>New Password</label>
                <input
                  type="password" required value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters" autoComplete="new-password" className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Confirm Password</label>
                <input
                  type="password" required value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password" className={inputCls}
                />
              </div>
              {error && <ErrBox>{error}</ErrBox>}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-[#076292] hover:bg-[#054e73] disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors">
                {loading ? "Resetting…" : "Reset Password"}
              </button>
              <button type="button" onClick={() => { setStep("request"); setError(""); }}
                className="w-full text-xs text-slate-400 hover:text-white transition-colors">
                Use a different email
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-6">
          <Link href="/login" className="text-slate-400 hover:text-white text-sm transition-colors">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function ErrBox({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
      {children}
    </p>
  );
}
