"use client";

import { useEffect, useState, FormEvent } from "react";

export function TeamEmailForm() {
  const [teamEmail, setTeamEmail] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        const data = await res.json();
        if (active && res.ok) setTeamEmail(data.teamEmail ?? "");
        else if (active) setError(data.error ?? "Failed to load current email");
      } catch {
        if (active) setError("Failed to load current email");
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const value = teamEmail.trim();
    if (!value) {
      setError("Enter an email address");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamEmail: value }),
      });
      const data = await res.json();
      if (res.ok) {
        setTeamEmail(data.teamEmail ?? value);
        setSuccess("Notification email updated.");
      } else {
        setError(data.error ?? "Failed to save");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#076292] focus:border-transparent transition bg-white disabled:opacity-60";
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
        <label className={labelCls}>Notification Email</label>
        <input
          type="email"
          required
          value={teamEmail}
          onChange={(e) => setTeamEmail(e.target.value)}
          placeholder={loaded ? "team@bombinoexp.com" : "Loading…"}
          disabled={!loaded || saving}
          autoComplete="email"
          className={inputCls}
        />
      </div>

      <button
        type="submit"
        disabled={!loaded || saving}
        className="px-6 py-2.5 bg-[#076292] hover:bg-[#054e73] disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors"
      >
        {saving ? "Saving…" : "Save Email"}
      </button>
    </form>
  );
}
