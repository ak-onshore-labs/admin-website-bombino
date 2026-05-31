import { NextRequest, NextResponse } from "next/server";
import { getActor } from "@/lib/api-auth";
import { readUsers, createUser, type Role } from "@/lib/users";

export const runtime = "nodejs";

function sanitize(u: { id: string; email: string; name: string; role: Role; createdAt: string; updatedAt: string }) {
  return { id: u.id, email: u.email, name: u.name, role: u.role, createdAt: u.createdAt, updatedAt: u.updatedAt };
}

export async function GET(req: NextRequest) {
  const actor = await getActor(req);
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (actor.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(readUsers().map(sanitize));
}

export async function POST(req: NextRequest) {
  const actor = await getActor(req);
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (actor.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email, name, password, role } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }
  if (String(password).length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }
  const safeRole: Role = role === "admin" ? "admin" : "editor";

  try {
    const user = createUser({ email, name: name ?? "", password, role: safeRole });
    return NextResponse.json(sanitize(user), { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 400 });
  }
}
