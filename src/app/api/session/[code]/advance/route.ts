import { NextResponse } from "next/server";
import { advancePhase, getSession, setCharacterResponses, setCharacterScore, updateAuditionProgress, updateSessionStatus } from "@/lib/session";
import { buildSystemPrompt, buildTaskPrompt, buildScoringPrompt } from "@/lib/prompts";
import { parseScoreResponse } from "@/lib/scoring";
import type { CharacterSheet, CharacterWithAudition, TaskType } from "@/lib/types";
import { TASK_ORDER } from "@/lib/types";

async function getOpenAI() {
  const { default: OpenAI } = await import("openai");
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Missing OPENAI_API_KEY. Set it in Vercel Environment Variables.");
  return new OpenAI({ apiKey: key });
}

async function generateResponse(character: CharacterSheet, task: TaskType): Promise<string> {
  const systemPrompt = buildSystemPrompt(character);
  const taskPrompt = buildTaskPrompt(character, task);

  const openai = await getOpenAI();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4096,
    temperature: 1.0,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: taskPrompt },
    ],
  });

  return completion.choices[0]?.message?.content || "";
}

async function scoreCoherence(character: CharacterWithAudition) {
  const scoringPrompt = buildScoringPrompt(
    character as CharacterSheet,
    character.responses as Record<TaskType, string>
  );

  const openai = await getOpenAI();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 2048,
    temperature: 0.3,
    messages: [{ role: "user", content: scoringPrompt }],
  });

  const rawText = completion.choices[0]?.message?.content || "";
  return parseScoreResponse(rawText);
}

async function runAllAuditions(code: string) {
  const session = await getSession(code);
  if (!session) return;

  const characters = session.characters;
  const totalTasks = characters.length * 6 + characters.length;
  let completed = 0;

  await updateAuditionProgress(code, 0, totalTasks);

  const BATCH_SIZE = 3;
  for (let i = 0; i < characters.length; i += BATCH_SIZE) {
    const batch = characters.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (char) => {
        const responses: Record<string, string> = {};
        const taskResults = await Promise.all(
          TASK_ORDER.map(async (task) => {
            try {
              const response = await generateResponse(char, task);
              return { task, response };
            } catch (err) {
              console.error(`Failed task ${task} for ${char.name}:`, err);
              return { task, response: "[Technical difficulties — response unavailable]" };
            }
          })
        );

        for (const { task, response } of taskResults) {
          responses[task] = response;
          completed++;
          await updateAuditionProgress(code, completed, totalTasks);
        }

        await setCharacterResponses(code, char.playerId, responses as Record<TaskType, string>);
      })
    );
  }

  for (const char of characters) {
    try {
      const freshSession = await getSession(code);
      const freshChar = freshSession?.characters.find((c) => c.playerId === char.playerId);
      if (freshChar && Object.keys(freshChar.responses).length === 6) {
        const score = await scoreCoherence(freshChar);
        await setCharacterScore(code, char.playerId, score);
      }
    } catch (err) {
      console.error(`Failed scoring for ${char.name}:`, err);
    }
    completed++;
    await updateAuditionProgress(code, completed, totalTasks);
  }

  await updateSessionStatus(code, "voting");
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { hostId } = body;

    if (!hostId) {
      return NextResponse.json({ error: "hostId is required" }, { status: 400 });
    }

    const session = await getSession(code);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const wasCreating = session.status === "creating";
    const updated = await advancePhase(code, hostId);

    if (!updated) {
      return NextResponse.json({ error: "Cannot advance phase" }, { status: 400 });
    }

    // Kick off auditions in background when transitioning from creating -> auditioning
    if (wasCreating && updated.status === "auditioning") {
      runAllAuditions(code).catch((err) =>
        console.error("Audition batch error:", err)
      );
    }

    return NextResponse.json({ session: updated });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to advance";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
