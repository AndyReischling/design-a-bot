import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { computeRankings } from "@/lib/voting";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const session = getSession(code);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const rankings = computeRankings(session);

  return NextResponse.json({
    rankings,
    characters: session.characters,
    players: session.players,
    votes: session.votes,
  });
}
