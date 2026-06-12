import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, validateSessionToken } from "@/lib/auth";
import { getSettings, updateTeamEmail } from "@/lib/api";

export const runtime = "nodejs";

async function checkAuth(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return token ? validateSessionToken(token) : false;
}

export async function GET(req: NextRequest) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch settings";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await checkAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const teamEmail = typeof body.teamEmail === "string" ? body.teamEmail : "";
    const settings = await updateTeamEmail(teamEmail);
    return NextResponse.json(settings);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save settings";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
