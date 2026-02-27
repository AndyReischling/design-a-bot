import { NextResponse } from "next/server";
import type { CharacterSheet } from "@/lib/types";

async function getOpenAI() {
  const { default: OpenAI } = await import("openai");
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Missing OPENAI_API_KEY");
  return new OpenAI({ apiKey: key });
}

function buildAvatarPrompt(character: CharacterSheet): string {
  const mood = character.fear && character.desire
    ? `Their deepest desire is "${character.desire}" and their deepest fear is "${character.fear}".`
    : "";
  const voice = character.voiceSoundsLike
    ? `Their personality sounds like: ${character.voiceSoundsLike}.`
    : "";
  const status = character.status === "higher"
    ? "They carry themselves with authority."
    : character.status === "lower"
      ? "They carry themselves with humility."
      : "They see themselves as an equal.";

  return `A single pixelated robot character on a plain white background. 8-bit retro pixel art style, like a character from a classic arcade game. The robot should visually express this personality: ${character.name}. ${character.backstory ? character.backstory : ""} ${mood} ${voice} ${status} The robot's shape, color palette, expression, and accessories should all reflect who they are. Simple, iconic, memorable. No text. No background elements. Just the robot, centered, on white.`;
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
