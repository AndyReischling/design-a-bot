import { NextResponse } from "next/server";
import { createSession, getSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { code, hostId, ...settings } = body;

    if (code) {
      const session = await getSession(code);
      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
      return NextResponse.json({ session });
    }

    const result = await createSession(settings);
    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to create session";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
