import { NextResponse } from "next/server";
import { submitCharacter, setCharacterAvatar } from "@/lib/session";
import type { CharacterSheet } from "@/lib/types";

async function generateAvatar(code: string, playerId: string, character: CharacterSheet) {
  try {
    const { default: OpenAI } = await import("openai");
    const key = process.env.OPENAI_API_KEY;
    if (!key) return;
    const openai = new OpenAI({ apiKey: key });

    const appearance = character.appearance || "";
    const prompt = `A single pixelated robot character on a plain white background. 8-bit retro pixel art style, like a character from a classic arcade game. The user described the robot as: "${appearance}". The robot's name is ${character.name || "unknown"}. Make the pixel art match this description closely. Simple, iconic, memorable. No text. No background elements. Just the robot, centered, on white.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const url = response.data?.[0]?.url;
    if (url) {
      await setCharacterAvatar(code, playerId, url);
    }
  } catch (err) {
    console.error("Avatar generation failed:", err);
  }
}

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

    const ok = await submitCharacter(code, playerId, character);
    if (!ok) {
      return NextResponse.json(
        { error: "Cannot submit character. Check session status and whether you already submitted." },
        { status: 400 }
      );
    }

    generateAvatar(code, playerId, character as CharacterSheet).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to submit character";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
