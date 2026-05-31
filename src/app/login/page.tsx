"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Invalid email or password");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="text-center mb-8">
          {/* Dark-on-dark logo recolored to white via CSS mask */}
          <div
            className="mx-auto mb-5 w-[200px] h-[52px] bg-white"
            style={{
              maskImage: "url('/bombino-logo-01.png')",
              maskSize: "contain",
              maskRepeat: "no-repeat",
              maskPosition: "center",
              WebkitMaskImage: "url('/bombino-logo-01.png')",
              WebkitMaskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
            }}
            role="img"
            aria-label="Bombino Express"
          />
          <div className="flex items-center justify-center gap-2">
            <span className="h-px w-6 bg-slate-700" />
            <p className="text-[0.7rem] font-bold tracking-[0.25em] uppercase text-[#FBAD1F]">
              Admin Panel
            </p>
            <span className="h-px w-6 bg-slate-700" />
          </div>
          <p className="text-slate-400 text-sm mt-3">Sign in to manage your website</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="you@bombinoexp.com"
              autoComplete="username"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-700 border border-slate-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#076292] focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter password"
              autoComplete="current-password"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-700 border border-slate-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#076292] focus:border-transparent transition"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#076292] hover:bg-[#054e73] disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <div className="text-center pt-1">
            <Link href="/forgot" className="text-xs text-slate-400 hover:text-[#FBAD1F] transition-colors">
              Forgot your password?
            </Link>
          </div>
        </form>

        <p className="text-center text-slate-600 text-xs mt-6">
          Bombino Express — Internal Admin Panel
        </p>
      </div>
    </div>
  );
}
