import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, validateSessionToken } from "@/lib/auth";
import { updatePost, deletePost } from "@/lib/api";

async function checkAuth(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return token ? validateSessionToken(token) : false;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { slug } = await params;
    const body = await req.json();
    const post = await updatePost(slug, body);
    return NextResponse.json(post);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update post";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { slug } = await params;
    await deletePost(slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete post";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
