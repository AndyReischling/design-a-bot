"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import CharacterCard from "@/components/character/CharacterCard";
import ScoreDisplay from "@/components/report/ScoreDisplay";
import ThroughLineChart from "@/components/report/ThroughLineChart";
import MomentCard from "@/components/report/MomentCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingOrb from "@/components/ui/LoadingOrb";
import PixelBot from "@/components/ui/PixelBot";
import { useAppState, useAppDispatch } from "@/lib/context";
import { getScore } from "@/lib/api";
import {
  TASK_ORDER,
  TASK_META,
  type CharacterSheet,
  type TaskType,
  type AuditionResponse,
} from "@/lib/types";

export default function ReportPage() {
  const router = useRouter();
  const { character, responses, score, avatarUrl } = useAppState();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allResponses = TASK_ORDER.every((t) => responses[t]);

  useEffect(() => {
    if (!score && allResponses && character && !loading) {
      setLoading(true);
      getScore(
        character as CharacterSheet,
        responses as Record<TaskType, AuditionResponse>
      )
        .then((s) => {
          dispatch({ type: "SET_SCORE", payload: s });
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => setLoading(false));
    }
  }, [score, allResponses, character, responses, loading, dispatch]);

  const handleCopyResults = useCallback(() => {
    if (!character || !score) return;
    const text = [
      `THE AUDITION — Coherence Report`,
      `Character: ${character.name}`,
      `Overall Score: ${score.overall}/30`,
      `Voice Integrity: ${score.voiceIntegrity.score}/10 — ${score.voiceIntegrity.comment}`,
      `Behavioral Fidelity: ${score.behavioralFidelity.score}/10 — ${score.behavioralFidelity.comment}`,
      `Gloucester Depth: ${score.gloucesterDepth.score}/10 — ${score.gloucesterDepth.comment}`,
      ``,
      `Through-Line: ${score.throughLineAnalysis}`,
      `Strongest: ${score.mostCoherentMoment}`,
      `Weakest: ${score.weakestMoment}`,
      ``,
      ...TASK_ORDER.map((t) => {
        const meta = TASK_META[t];
        const r = responses[t];
        return `TASK ${meta.number} — ${meta.label}\n${r?.response || "No response"}\n`;
      }),
    ].join("\n");
    navigator.clipboard.writeText(text);
  }, [character, score, responses]);

  if (!character || !character.name) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-serif text-2xl font-semibold text-bone">
            No results yet
          </h1>
          <p className="mt-2 font-sans text-bone">
            Complete an audition to see the coherence report.
          </p>
          <Button
            variant="primary"
            className="mt-6"
            onClick={() => router.push("/create")}
          >
            Create a Character
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 md:px-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-bone">
            Coherence Report
          </span>
          <h1 className="mt-2 font-serif text-4xl font-bold text-bone">
            The Results
          </h1>
        </motion.div>

        {/* Character summary */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {avatarUrl && (
            <div className="mb-4 flex justify-center">
              <PixelBot avatarUrl={avatarUrl} name={character.name || ""} size={120} />
            </div>
          )}
          <CharacterCard character={character} />
        </motion.div>

        {/* Score section */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-16">
            <LoadingOrb size={48} />
            <p className="font-sans text-sm text-bone" aria-live="polite">
              Evaluating coherence across all six performances...
            </p>
          </div>
        )}

        {error && (
          <Card variant="default" className="mb-8 border-red-500/20">
            <p className="font-sans text-sm text-red-400">
              Scoring failed: {error}
            </p>
            <Button
              variant="secondary"
              className="mt-3"
              onClick={() => {
                setError(null);
                setLoading(false);
              }}
            >
              Retry
            </Button>
          </Card>
        )}

        {score && (
          <motion.div
            className="flex flex-col gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Score display */}
            <Card variant="score" className="p-8">
              <ScoreDisplay score={score} />
            </Card>

            {/* Through-line chart */}
            {score.perTaskScores && (
              <Card variant="score" className="p-6">
                <ThroughLineChart perTaskScores={score.perTaskScores} />
              </Card>
            )}

            {/* Moment-by-moment breakdown */}
            <div>
              <span className="mb-4 block font-sans text-xs font-medium uppercase tracking-widest text-bone">
                Moment-by-Moment Breakdown
              </span>
              <div className="flex flex-col gap-3">
                {TASK_ORDER.map((taskId, i) => {
                  const meta = TASK_META[taskId];
                  const r = responses[taskId];
                  return (
                    <MomentCard
                      key={taskId}
                      taskNumber={meta.number}
                      taskLabel={meta.label}
                      response={r?.response || "No response recorded"}
                      coherenceScore={score.perTaskScores?.[i] || 3}
                      index={i}
                      characterName={character?.name}
                    />
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 border-t border-white/[0.06] pt-6">
              <Button
                variant="primary"
                onClick={() => {
                  dispatch({ type: "RESET" });
                  router.push("/create");
                }}
              >
                Run Another Character
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.push("/archive")}
              >
                Browse the Archive
              </Button>
              <Button variant="ghost" onClick={handleCopyResults}>
                Copy Results
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
