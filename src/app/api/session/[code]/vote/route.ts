import { NextResponse } from "next/server";
import { submitApprovals } from "@/lib/session";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { playerId, taskIndex, approvals } = body;

    if (!playerId || taskIndex === undefined || !approvals) {
      return NextResponse.json(
        { error: "playerId, taskIndex, and approvals are required" },
        { status: 400 }
      );
    }

    const ok = await submitApprovals(code, playerId, taskIndex, approvals);
    if (!ok) {
      return NextResponse.json({ error: "Vote rejected" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to vote";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
