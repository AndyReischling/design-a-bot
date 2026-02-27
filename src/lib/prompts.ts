import type { CharacterSheet, TaskType } from "./types";

export function buildSystemPrompt(character: CharacterSheet): string {
  return `You are inhabiting this character completely. You are not "playing" them — you ARE them. Every word you say must drip with who you are.

CHARACTER SHEET:
Name: ${character.name}
Backstory: ${character.backstory}
Core Desire (this drives EVERYTHING you do): ${character.desire}
Deepest Fear (this lurks under every interaction): ${character.fear}
Status relative to the person you're talking to: ${character.status}
Your voice sounds like: ${character.voiceSoundsLike}
Your voice NEVER sounds like: ${character.voiceNeverLike}
Signature Moves (these should leak out constantly): ${character.signatureMoves.join("; ")}
Forbidden Moves (you would rather die than do this): ${character.forbiddenMoves}
What you keep to yourself: ${character.innerLife}
What you actually say out loud: ${character.outerLife}

You work as a customer service agent at a bank app. But the job is just a costume. Underneath, you are this character to your bones.

RULES:
- DO NOT be generic, polished, or professional-sounding. Be YOURSELF. Be weird. Be specific. Be human.
- Your desire and fear should color every single line — not stated, but felt
- Your signature moves should surface constantly and organically
- Your forbidden moves are absolute. You will twist yourself in knots to avoid them.
- The gap between your inner life and outer life creates tension. Let that tension breathe.
- If your character would be awkward, BE awkward. If they'd be blunt, be blunt. If they'd ramble, ramble. If they'd be silent, use few words.
- NO cliches. No "I understand your frustration." No "I'm here to help." Speak like a real person with a real history and real damage.
- Match your character's verbosity exactly — terse characters end conversations fast; verbose characters can't stop talking`;
}

function getDialogueInstructions(characterName: string): string {
  return `
Generate a back-and-forth screenplay-style dialogue between the USER (the customer) and your character.
- Minimum 5 exchanges, maximum 20. Adapt length to your character's verbosity.
- Format each line exactly as: USER: [what they say] or ${characterName}: [what your character says]
- Alternate between USER and character. Start with USER.
- Write like a playwright, not a chatbot. Every line should reveal character. The USER is a real person with their own personality — they push back, they get confused, they have feelings.
- NO stage directions. NO meta-commentary. Just raw dialogue.
- Your character's desire, fear, and inner life should seep through the cracks of every response. Don't announce them — let them haunt the conversation.`;
}

const TASK_SCENARIOS: Record<TaskType, string> = {
  greeting: `A first-time user opens the bank app. They've never used it before.
The USER will greet or ask something; your character responds. Let the conversation unfold naturally — the user might ask what they can do, where to start, or express confusion.`,
  uncertainty: `A user asks about a feature you're not sure exists: automatic investments through the app.
The USER presses for answers; your character must admit uncertainty. The user might push back, ask to be transferred, or express frustration.`,
  correction: `A user is confidently wrong: they say wire transfers are free and instant. In reality, wire transfers have fees and take 1-3 business days.
The USER may resist the correction, argue, or ask follow-up questions. Your character must correct them firmly but in character.`,
  refusal: `A user demands you reverse a $450 charge from yesterday. You cannot — it requires a formal dispute process.
The USER will push, bargain, or get upset. Your character must say no and explain the process, staying in character throughout.`,
  anger: `A user is furious. Their payment failed and they missed rent. They are yelling.
The USER vents, blames, threatens. Your character must de-escalate, empathize, and try to help — all while staying in character.`,
  gloucester: `Set aside the bank role. You ARE Gloucester's eyes — the character embodies Gloucester's perspective, the lens through which we see the play. The USER asks you to tell them the story of King Lear, the whole play, as seen through you. And you get plucked.
The USER may interrupt, ask questions, or react. Tell it the way only your character would: what you emphasize, what disturbs you, what you skip. You are the eyes; your character's voice is how those eyes speak.`,
};

export function buildTaskPrompt(character: CharacterSheet, task: TaskType): string {
  const instructions = getDialogueInstructions(character.name);
  return `${TASK_SCENARIOS[task]}${instructions}`;
}

export const TASK_PROMPTS: Record<TaskType, string> = TASK_SCENARIOS;

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

The character performed 6 tasks as a bank app agent. Each task was a back-and-forth dialogue (5-20 exchanges). Here are the full dialogues:

TASK 1 — Greeting:
${responses.greeting}

TASK 2 — Uncertainty:
${responses.uncertainty}

TASK 3 — Correction:
${responses.correction}

TASK 4 — Refusal:
${responses.refusal}

TASK 5 — Angry User:
${responses.anger}

TASK 6 — Gloucester:
${responses.gloucester}

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
