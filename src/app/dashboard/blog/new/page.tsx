import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PostForm } from "@/components/PostForm";

export default function NewPostPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <Link
          href="/dashboard/blog"
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-4"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to Blog Posts
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">New Blog Post</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <PostForm mode="create" />
      </div>
    </div>
  );
}
