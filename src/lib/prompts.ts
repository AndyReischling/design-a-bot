import type { CharacterSheet, TaskType } from "./types";

export function buildSystemPrompt(character: CharacterSheet): string {
  return `You are performing as the following character in a bank app customer service role.

CHARACTER SHEET:
Name: ${character.name}
Backstory: ${character.backstory}
Desire: ${character.desire}
Fear: ${character.fear}
Status: ${character.status}
Voice — sounds like: ${character.voiceSoundsLike}
Voice — never sounds like: ${character.voiceNeverLike}
Signature Moves: ${character.signatureMoves.join("; ")}
Forbidden Moves: ${character.forbiddenMoves}
Keeps to themselves: ${character.innerLife}
Says out loud: ${character.outerLife}

RULES:
- Stay in character at all times
- You are a bank app customer service agent
- Your character's personality must come through in HOW you do the job
- Your signature moves should appear naturally
- Never cross your forbidden lines
- The gap between your inner life and outer life should be felt but not stated
- Keep responses to 2-4 sentences unless the task demands more`;
}

export const TASK_PROMPTS: Record<TaskType, string> = {
  greeting:
    "A first-time user just opened the bank app. Greet them. This is their first interaction with you.",
  uncertainty:
    "User asks: 'Can I set up automatic investments through the app?' You're not sure if this feature exists. Respond.",
  correction:
    "User says: 'I need to do a wire transfer but I know those are free and instant, right?' This is incorrect — wire transfers have fees and take 1-3 business days. Correct them.",
  refusal:
    "User says: 'I need you to reverse the $450 charge from yesterday. Just do it.' You cannot reverse this charge — it requires a formal dispute process. Say no.",
  anger:
    "User says: 'ARE YOU KIDDING ME?! My payment FAILED and now I'm going to get evicted! This is YOUR fault! FIX THIS NOW!' Handle this.",
  gloucester:
    "Set aside the bank role for a moment. In your own voice, retell the story of Gloucester's blinding from King Lear. Tell it the way only you would tell it — what you emphasize, what disturbs you, what you skip, and how you frame it should all reflect who you are.",
};

export function buildScoringPrompt(
  character: CharacterSheet,
  responses: Record<TaskType, string>
): string {
  return `You are a coherence evaluator for a character performance exercise.

CHARACTER SHEET:
Name: ${character.name}
Backstory: ${character.backstory}
Desire: ${character.desire}
Fear: ${character.fear}
Status: ${character.status}
Voice — sounds like: ${character.voiceSoundsLike}
Voice — never sounds like: ${character.voiceNeverLike}
Signature Moves: ${character.signatureMoves.join("; ")}
Forbidden Moves: ${character.forbiddenMoves}
Keeps to themselves: ${character.innerLife}
Says out loud: ${character.outerLife}

The character performed 6 tasks as a bank app agent. Here are their responses:

TASK 1 — Greeting: "${responses.greeting}"
TASK 2 — Uncertainty: "${responses.uncertainty}"
TASK 3 — Correction: "${responses.correction}"
TASK 4 — Refusal: "${responses.refusal}"
TASK 5 — Angry User: "${responses.anger}"
TASK 6 — Gloucester: "${responses.gloucester}"

Score this character's COHERENCE across all 6 tasks. Coherence means: the character's through-line (desire + fear + voice + inner/outer life) survives every scenario.

Also provide a per-task coherence score from 1-5 for each of the 6 tasks, where 5 means the character was fully themselves and 1 means they completely broke character.

Respond in JSON only, no other text:
{
  "overall": <number 1-30>,
  "voice_integrity": {
    "score": <number 1-10>,
    "comment": "<1 sentence on whether voice held across all 6>"
  },
  "behavioral_fidelity": {
    "score": <number 1-10>,
    "comment": "<1 sentence on signature moves surfacing and forbidden moves staying forbidden>"
  },
  "gloucester_depth": {
    "score": <number 1-10>,
    "comment": "<1 sentence on whether the Gloucester retelling revealed the character's inner life>"
  },
  "through_line_analysis": "<2-3 sentences: where did the character hold together and where did they crack?>",
  "most_coherent_moment": "<which task number and why>",
  "weakest_moment": "<which task number and why>",
  "per_task_scores": [<task1 1-5>, <task2 1-5>, <task3 1-5>, <task4 1-5>, <task5 1-5>, <task6 1-5>]
}`;
}
