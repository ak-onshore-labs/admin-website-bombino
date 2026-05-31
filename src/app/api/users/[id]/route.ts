import { NextRequest, NextResponse } from "next/server";
import { getActor } from "@/lib/api-auth";
import { updateUser, deleteUser, findById, countAdmins, type Role } from "@/lib/users";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const actor = await getActor(req);
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (actor.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const target = findById(id);
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const patch: Partial<{ email: string; name: string; password: string; role: Role }> = {};

  if (typeof body.email === "string") patch.email = body.email;
  if (typeof body.name === "string") patch.name = body.name;
  if (typeof body.password === "string" && body.password) {
    if (body.password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    patch.password = body.password;
  }
  if (body.role === "admin" || body.role === "editor") {
    // Prevent demoting the last admin
    if (target.role === "admin" && body.role === "editor" && countAdmins() === 1) {
      return NextResponse.json({ error: "Cannot demote the last remaining admin" }, { status: 400 });
    }
    patch.role = body.role;
  }

  try {
    const updated = updateUser(id, patch);
    return NextResponse.json({
      id: updated.id, email: updated.email, name: updated.name,
      role: updated.role, createdAt: updated.createdAt, updatedAt: updated.updatedAt,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const actor = await getActor(req);
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (actor.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  if (id === actor.id) {
    return NextResponse.json({ error: "You can't delete your own account" }, { status: 400 });
  }

  try {
    deleteUser(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 400 });
  }
}
