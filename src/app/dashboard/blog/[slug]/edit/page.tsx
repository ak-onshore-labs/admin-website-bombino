import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getPost } from "@/lib/api";
import { PostForm } from "@/components/PostForm";

export const dynamic = "force-dynamic";

export default async function EditPostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let post;
  try {
    post = await getPost(slug);
  } catch {
    notFound();
  }

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
        <h1 className="text-2xl font-bold text-slate-900">Edit Post</h1>
        <p className="text-slate-400 text-sm mt-1">{post.title}</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <PostForm mode="edit" initial={post} slug={slug} />
      </div>
    </div>
  );
}
