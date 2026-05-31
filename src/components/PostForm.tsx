"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { BlogPost } from "@/lib/api";
import { RichTextEditor } from "./RichTextEditor";
import { CoverImageInput } from "./CoverImageInput";
import { PostPreview } from "./PostPreview";
import { Pencil, Eye } from "lucide-react";

interface PostFormProps {
  initial?: Partial<BlogPost>;
  mode: "create" | "edit";
  slug?: string;
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function PostForm({ initial, mode, slug }: PostFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"write" | "preview">("write");

  const [title, setTitle]           = useState(initial?.title ?? "");
  const [postSlug, setPostSlug]     = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt]       = useState(initial?.excerpt ?? "");
  const [content, setContent]       = useState(initial?.content ?? "");
  const [author, setAuthor]         = useState(initial?.author ?? "Bombino Express Team");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [tags, setTags]             = useState((initial?.tags ?? []).join(", "));
  const [status, setStatus]         = useState<"published" | "draft">(initial?.status ?? "draft");
  const [publishedAt, setPublishedAt] = useState(
    initial?.publishedAt
      ? new Date(initial.publishedAt).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );

  function handleTitleChange(val: string) {
    setTitle(val);
    if (mode === "create") setPostSlug(slugify(val));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      title: title.trim(),
      slug: postSlug.trim(),
      excerpt: excerpt.trim(),
      content,
      author: author.trim(),
      coverImage: coverImage.trim(),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      status,
      publishedAt: new Date(publishedAt).toISOString(),
    };

    try {
      const url = mode === "create" ? "/api/posts" : `/api/posts/${slug}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/dashboard/blog");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Failed to save post");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#076292] focus:border-transparent transition bg-white";

  const labelCls = "block text-sm font-semibold text-slate-700 mb-1.5";

  const tags_ = tags.split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Write / Preview toggle */}
      <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
        <button
          type="button"
          onClick={() => setTab("write")}
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            tab === "write" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Pencil className="w-3.5 h-3.5" /> Write
        </button>
        <button
          type="button"
          onClick={() => setTab("preview")}
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            tab === "preview" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Eye className="w-3.5 h-3.5" /> Preview
        </button>
      </div>

      {/* ── Live page preview ─────────────────────────────── */}
      {tab === "preview" && (
        <PostPreview
          title={title}
          excerpt={excerpt}
          content={content}
          author={author}
          coverImage={coverImage}
          tags={tags_}
          publishedAt={publishedAt}
        />
      )}

      <div className={`grid grid-cols-2 gap-5 ${tab === "preview" ? "hidden" : ""}`}>
        {/* Title */}
        <div className="col-span-2">
          <label className={labelCls}>Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Post title"
            className={inputCls}
          />
        </div>

        {/* Slug */}
        <div>
          <label className={labelCls}>Slug *</label>
          <input
            type="text"
            required
            value={postSlug}
            onChange={(e) => setPostSlug(e.target.value)}
            placeholder="url-friendly-slug"
            className={inputCls}
          />
          <p className="text-xs text-slate-400 mt-1">URL: /blog/{postSlug || "slug"}</p>
        </div>

        {/* Author */}
        <div>
          <label className={labelCls}>Author</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author name"
            className={inputCls}
          />
        </div>

        {/* Excerpt */}
        <div className="col-span-2">
          <label className={labelCls}>Excerpt</label>
          <textarea
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short description shown in blog listing (plain text)"
            className={`${inputCls} resize-none`}
          />
        </div>

        {/* Rich text content */}
        <div className="col-span-2">
          <label className={labelCls}>Content</label>
          <RichTextEditor
            key={initial?.slug ?? "new"}
            defaultContent={initial?.content ?? ""}
            onChange={setContent}
          />
          <p className="text-xs text-slate-400 mt-1.5">
            What you see here is exactly how it will appear on the website.
          </p>
        </div>

        {/* Cover image */}
        <div className="col-span-2">
          <label className={labelCls}>Cover / Hero Image</label>
          <CoverImageInput value={coverImage} onChange={setCoverImage} />
        </div>

        {/* Tags */}
        <div className="col-span-2">
          <label className={labelCls}>Tags</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="shipping, customs, guide"
            className={inputCls}
          />
          <p className="text-xs text-slate-400 mt-1">Comma-separated</p>
        </div>

        {/* Status */}
        <div>
          <label className={labelCls}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "published" | "draft")}
            className={inputCls}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* Publish date */}
        <div>
          <label className={labelCls}>Publish Date</label>
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-[#076292] hover:bg-[#054e73] disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors"
        >
          {saving ? "Saving…" : mode === "create" ? "Create Post" : "Save Changes"}
        </button>
        <a
          href="/dashboard/blog"
          className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
