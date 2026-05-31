import { NextRequest, NextResponse } from "next/server";
import { getActor } from "@/lib/api-auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const actor = await getActor(req);
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ email: actor.email, name: actor.name, role: actor.role });
}
