"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X, Link2 } from "lucide-react";

interface CoverImageInputProps {
  value: string;
  onChange: (url: string) => void;
}

export function CoverImageInput({ value, onChange }: CoverImageInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Upload failed");
      }
      const { url } = await res.json();
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) upload(file);
  }

  return (
    <div>
      {value ? (
        /* ── Preview state ─────────────────────────────── */
        <div className="relative group rounded-xl overflow-hidden border border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Cover preview" className="w-full h-44 object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs font-semibold bg-white text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs font-semibold bg-white/90 text-red-600 px-3 py-1.5 rounded-lg hover:bg-white inline-flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Remove
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-[#076292]" />
            </div>
          )}
        </div>
      ) : (
        /* ── Empty / dropzone state ────────────────────── */
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !uploading && fileRef.current?.click()}
          className="cursor-pointer rounded-xl border-2 border-dashed border-slate-200 hover:border-[#076292]/40 hover:bg-slate-50 transition-colors h-44 flex flex-col items-center justify-center gap-2 text-center px-4"
        >
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin text-[#076292]" />
              <span className="text-sm text-slate-500">Uploading…</span>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <ImagePlus className="w-5 h-5 text-slate-400" />
              </div>
              <span className="text-sm font-medium text-slate-600">
                Click to upload or drag &amp; drop
              </span>
              <span className="text-xs text-slate-400">JPG, PNG, WebP, GIF — max 8 MB</span>
            </>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}

      {/* Optional: paste a URL instead */}
      <div className="mt-2">
        {showUrl ? (
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#076292]"
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowUrl(true)}
            className="text-xs text-slate-400 hover:text-[#076292] inline-flex items-center gap-1 transition-colors"
          >
            <Link2 className="w-3 h-3" /> Or paste an image URL
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={onPick}
      />
    </div>
  );
}
