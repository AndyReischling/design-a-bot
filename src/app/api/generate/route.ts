import { NextResponse } from "next/server";
import { buildSystemPrompt, buildTaskPrompt, buildScoringPrompt } from "@/lib/prompts";
import { parseScoreResponse } from "@/lib/scoring";
import type { CharacterSheet, TaskType } from "@/lib/types";

async function getOpenAI() {
  const { default: OpenAI } = await import("openai");
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Missing OPENAI_API_KEY. Set it in Vercel Environment Variables.");
  return new OpenAI({ apiKey: key });
}

const MODEL = "gpt-4o";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, character, task, responses } = body;

    if (!character) {
      return NextResponse.json({ error: "Character is required" }, { status: 400 });
    }

    if (type === "audition_task") {
      const taskTypes: TaskType[] = ["greeting", "uncertainty", "correction", "refusal", "anger", "gloucester"];
      if (!task || !taskTypes.includes(task as TaskType)) {
        return NextResponse.json({ error: "Valid task type is required" }, { status: 400 });
      }

      const systemPrompt = buildSystemPrompt(character as CharacterSheet);
      const taskPrompt = buildTaskPrompt(character as CharacterSheet, task as TaskType);

      const openai = await getOpenAI();
      const completion = await openai.chat.completions.create({
        model: MODEL,
        max_tokens: 4096,
        temperature: 1.2,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: taskPrompt },
        ],
      });

      const response = completion.choices[0]?.message?.content || "";

      return NextResponse.json({ response });
    }

    if (type === "score") {
      if (!responses) {
        return NextResponse.json(
          { error: "All 6 responses are required for scoring" },
          { status: 400 }
        );
      }

      const scoringPrompt = buildScoringPrompt(
        character as CharacterSheet,
        responses
      );

      const openai = await getOpenAI();
      const completion = await openai.chat.completions.create({
        model: MODEL,
        max_tokens: 2048,
        messages: [{ role: "user", content: scoringPrompt }],
      });

      const rawText = completion.choices[0]?.message?.content || "";
      const score = parseScoreResponse(rawText);

      return NextResponse.json({ score });
    }

    return NextResponse.json({ error: "Invalid request type" }, { status: 400 });
  } catch (error) {
    console.error("API error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
