import { NextResponse } from "next/server";
import { joinSession } from "@/lib/session";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Player name is required" }, { status: 400 });
    }

    const result = await joinSession(code, name.trim());
    if (!result) {
      return NextResponse.json(
        { error: "Cannot join session. It may be full, already started, or not exist." },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to join";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
