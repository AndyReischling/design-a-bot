import { NextResponse } from "next/server";
import { submitCharacter } from "@/lib/session";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { playerId, character } = body;

    if (!playerId || !character) {
      return NextResponse.json({ error: "playerId and character are required" }, { status: 400 });
    }

    const ok = submitCharacter(code, playerId, character);
    if (!ok) {
      return NextResponse.json(
        { error: "Cannot submit character. Check session status and whether you already submitted." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to submit character";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
