import Link from "next/link";
import { getAllPosts, type BlogPost } from "@/lib/api";
import { FileText, PlusCircle, Globe, Edit3 } from "lucide-react";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  let posts: BlogPost[];
  try {
    posts = await getAllPosts();
  } catch {
    posts = [];
  }

  const published = posts.filter((p) => p.status === "published").length;
  const drafts = posts.filter((p) => p.status === "draft").length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of your website content</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#076292]" />
            </div>
            <span className="text-sm font-medium text-slate-500">Total Posts</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{posts.length}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
              <Globe className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">Published</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{published}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">Drafts</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{drafts}</p>
        </div>
      </div>

      {/* Recent posts */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Recent Blog Posts</h2>
          <Link
            href="/dashboard/blog/new"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#076292] hover:bg-[#054e73] px-4 py-2 rounded-xl transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            New Post
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No blog posts yet</p>
            <Link
              href="/dashboard/blog/new"
              className="mt-3 inline-block text-sm font-semibold text-[#076292] hover:underline"
            >
              Create your first post →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {posts.slice(0, 5).map((post) => (
              <div key={post.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`shrink-0 inline-block w-2 h-2 rounded-full ${
                      post.status === "published" ? "bg-green-500" : "bg-amber-400"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{post.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatDate(post.publishedAt)} · {post.author}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/dashboard/blog/${post.slug}/edit`}
                  className="shrink-0 ml-4 text-xs font-semibold text-[#076292] hover:text-[#054e73] transition-colors"
                >
                  Edit
                </Link>
              </div>
            ))}
            {posts.length > 5 && (
              <div className="px-6 py-3 text-center">
                <Link href="/dashboard/blog" className="text-sm font-semibold text-[#076292] hover:underline">
                  View all {posts.length} posts →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
