import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, validateSessionToken } from "@/lib/auth";
import { getAllPosts, createPost } from "@/lib/api";

async function checkAuth(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return token ? validateSessionToken(token) : false;
}

export async function GET(req: NextRequest) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const posts = await getAllPosts();
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const post = await createPost(body);
    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create post";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
