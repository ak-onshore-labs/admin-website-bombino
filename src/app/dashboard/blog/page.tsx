import Link from "next/link";
import { getAllPosts, type BlogPost } from "@/lib/api";
import { PlusCircle, FileText } from "lucide-react";
import { DeleteButton } from "./DeleteButton";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function BlogListPage() {
  let posts: BlogPost[];
  try {
    posts = await getAllPosts();
  } catch {
    posts = [];
  }

  posts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blog Posts</h1>
          <p className="text-slate-500 text-sm mt-1">{posts.length} total posts</p>
        </div>
        <Link
          href="/dashboard/blog/new"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#076292] hover:bg-[#054e73] px-5 py-2.5 rounded-xl transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New Post
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {posts.length === 0 ? (
          <div className="py-20 text-center">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400">No blog posts yet</p>
            <Link
              href="/dashboard/blog/new"
              className="mt-3 inline-block text-sm font-semibold text-[#076292] hover:underline"
            >
              Create your first post →
            </Link>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[1fr_120px_120px_120px] gap-4 px-6 py-3 border-b border-slate-100 bg-slate-50">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Updated</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</span>
            </div>

            <div className="divide-y divide-slate-100">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="grid grid-cols-[1fr_120px_120px_120px] gap-4 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{post.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">/blog/{post.slug}</p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${
                      post.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      post.status === "published" ? "bg-green-500" : "bg-amber-500"
                    }`} />
                    {post.status === "published" ? "Published" : "Draft"}
                  </span>

                  <span className="text-xs text-slate-400">{formatDate(post.updatedAt)}</span>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/dashboard/blog/${post.slug}/edit`}
                      className="text-xs font-semibold text-[#076292] hover:text-[#054e73] transition-colors"
                    >
                      Edit
                    </Link>
                    <DeleteButton slug={post.slug} title={post.title} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
