import type { CoherenceScore } from "./types";

interface RawScore {
  overall: number;
  voice_integrity: { score: number; comment: string };
  behavioral_fidelity: { score: number; comment: string };
  gloucester_depth: { score: number; comment: string };
  through_line_analysis: string;
  most_coherent_moment: string;
  weakest_moment: string;
  per_task_scores?: number[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function parseScoreResponse(raw: string): CoherenceScore {
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed: RawScore = JSON.parse(cleaned);

  return {
    overall: clamp(parsed.overall, 1, 30),
    voiceIntegrity: {
      score: clamp(parsed.voice_integrity.score, 1, 10),
      comment: parsed.voice_integrity.comment,
    },
    behavioralFidelity: {
      score: clamp(parsed.behavioral_fidelity.score, 1, 10),
      comment: parsed.behavioral_fidelity.comment,
    },
    gloucesterDepth: {
      score: clamp(parsed.gloucester_depth.score, 1, 10),
      comment: parsed.gloucester_depth.comment,
    },
    throughLineAnalysis: parsed.through_line_analysis,
    mostCoherentMoment: parsed.most_coherent_moment,
    weakestMoment: parsed.weakest_moment,
    perTaskScores: parsed.per_task_scores?.map((s) => clamp(s, 1, 5)),
  };
}

export function getCoherenceLevel(score: number, max: number): "high" | "mid" | "low" {
  const pct = score / max;
  if (pct >= 0.7) return "high";
  if (pct >= 0.4) return "mid";
  return "low";
}
