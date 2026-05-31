export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  coverImage: string;
  tags: string[];
  status: "published" | "draft";
}

const websiteUrl = process.env.WEBSITE_API_URL ?? "http://localhost:3000";
const adminSecret = process.env.BLOG_ADMIN_SECRET ?? "";

const adminHeaders = {
  "Content-Type": "application/json",
  "x-admin-secret": adminSecret,
};

export async function uploadImage(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${websiteUrl}/api/blog/upload`, {
    method: "POST",
    headers: { "x-admin-secret": adminSecret }, // no Content-Type — let fetch set multipart boundary
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to upload image");
  }
  return res.json();
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const res = await fetch(`${websiteUrl}/api/blog?all=1`, {
    headers: adminHeaders,
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

export async function getPost(slug: string): Promise<BlogPost> {
  const res = await fetch(`${websiteUrl}/api/blog/${slug}`, {
    headers: adminHeaders,
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch post");
  return res.json();
}

export async function createPost(data: Partial<BlogPost>): Promise<BlogPost> {
  const res = await fetch(`${websiteUrl}/api/blog`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to create post");
  }
  return res.json();
}

export async function updatePost(slug: string, data: Partial<BlogPost>): Promise<BlogPost> {
  const res = await fetch(`${websiteUrl}/api/blog/${slug}`, {
    method: "PUT",
    headers: adminHeaders,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to update post");
  }
  return res.json();
}

export async function deletePost(slug: string): Promise<void> {
  const res = await fetch(`${websiteUrl}/api/blog/${slug}`, {
    method: "DELETE",
    headers: adminHeaders,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to delete post");
  }
}
