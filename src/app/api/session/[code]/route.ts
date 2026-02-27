import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const session = await getSession(code);
    if (!session) {
      return NextResponse.json({ error: "Session not found", code }, { status: 404 });
    }
    return NextResponse.json({ session });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to get session";
    console.error("GET session error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
