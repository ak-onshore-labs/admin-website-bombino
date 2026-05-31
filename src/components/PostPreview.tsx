"use client";

interface PostPreviewProps {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  coverImage: string;
  tags: string[];
  publishedAt: string; // ISO or datetime-local string
}

function formatDate(value: string) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export function PostPreview({
  title, content, author, coverImage, tags, publishedAt,
}: PostPreviewProps) {
  const hasCover = Boolean(coverImage);

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
      {/* Browser chrome bar */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 border-b border-slate-200">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <span className="ml-3 text-[0.7rem] text-slate-400 font-mono">
          bombinoexp.com/blog/{title ? "…" : ""}
        </span>
      </div>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section
        className={`relative px-6 pt-12 overflow-hidden ${
          hasCover ? "pb-10 min-h-[300px] flex items-end" : "bg-[#076292] pb-10"
        }`}
      >
        {hasCover && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverImage} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(4,28,42,0.92) 0%, rgba(5,45,68,0.70) 45%, rgba(7,98,146,0.45) 100%)",
              }}
            />
          </>
        )}

        <div className="relative z-10 w-full">
          <span className="inline-block text-white/70 text-xs font-medium mb-5">← Back to Blog</span>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[0.6rem] font-bold tracking-wider uppercase bg-[#FBAD1F]/20 text-[#FBAD1F] px-2.5 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
            {title || <span className="text-white/40">Untitled post</span>}
          </h1>

          <div className="mt-4 flex items-center gap-3 text-sm text-white/70">
            <span>{author || "Author"}</span>
            <span>·</span>
            <span>{formatDate(publishedAt) || "Date"}</span>
          </div>
        </div>
      </section>

      {/* ── Content ───────────────────────────────────────── */}
      <article className="px-6 py-10">
        {content ? (
          <div className="blog-content" dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <p className="text-slate-400 text-sm italic">Start writing — your post body appears here.</p>
        )}
      </article>
    </div>
  );
}
