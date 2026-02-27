import type { CharacterSheet, TaskType, CoherenceScore, AuditionResponse } from "./types";

interface GenerateRequest {
  type: "audition_task" | "score";
  character: CharacterSheet;
  task?: TaskType;
  responses?: Record<TaskType, string>;
}

export async function performTask(
  character: CharacterSheet,
  task: TaskType
): Promise<string> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "audition_task",
      character,
      task,
    } satisfies GenerateRequest),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Failed to generate response");
  }

  const data = await res.json();
  return data.response;
}

export async function getScore(
  character: CharacterSheet,
  responses: Record<TaskType, AuditionResponse>
): Promise<CoherenceScore> {
  const responseTexts: Record<string, string> = {};
  for (const [key, val] of Object.entries(responses)) {
    responseTexts[key] = val.response;
  }

  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "score",
      character,
      responses: responseTexts,
    } satisfies GenerateRequest),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Scoring failed" }));
    throw new Error(err.error || "Failed to get score");
  }

  const data = await res.json();
  return data.score;
}
