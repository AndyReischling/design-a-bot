import { NextResponse } from "next/server";
import type { CharacterSheet } from "@/lib/types";

async function getOpenAI() {
  const { default: OpenAI } = await import("openai");
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Missing OPENAI_API_KEY");
  return new OpenAI({ apiKey: key });
}

function buildAvatarPrompt(character: CharacterSheet): string {
  const appearance = character.appearance || "";
  return `A single pixelated robot character on a plain white background. 8-bit retro pixel art style, like a character from a classic arcade game. The user described the robot as: "${appearance}". The robot's name is ${character.name || "unknown"}. Make the pixel art match this description closely. Simple, iconic, memorable. No text. No background elements. Just the robot, centered, on white.`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { character } = body;

    if (!character) {
      return NextResponse.json({ error: "Character is required" }, { status: 400 });
    }

    const prompt = buildAvatarPrompt(character as CharacterSheet);
    const openai = await getOpenAI();

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const url = response.data?.[0]?.url;
    if (!url) {
      return NextResponse.json({ error: "No image generated" }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Avatar generation error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate avatar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
