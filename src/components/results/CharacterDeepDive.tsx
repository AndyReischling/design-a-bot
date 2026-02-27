"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "@/components/ui/Card";
import GlowBar from "@/components/ui/GlowBar";
import MomentCard from "@/components/report/MomentCard";
import ThroughLineChart from "@/components/report/ThroughLineChart";
import type { CharacterWithAudition } from "@/lib/types";
import { TASK_ORDER, TASK_META } from "@/lib/types";

interface CharacterDeepDiveProps {
  character: CharacterWithAudition;
  playerName: string;
}

export default function CharacterDeepDive({
  character,
  playerName,
}: CharacterDeepDiveProps) {
  const [expanded, setExpanded] = useState(false);
  const score = character.coherenceScore;

  return (
    <Card variant="default" className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-serif text-base font-semibold text-bone">
            {character.name}
          </p>
          <p className="font-sans text-xs text-bone">{playerName} / {character.botLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          {score && (
            <span className="font-mono text-sm text-amber">
              {score.overall}/30
            </span>
          )}
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            className={`text-bone transition-transform ${expanded ? "rotate-90" : ""}`}
          >
            <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
      </div>

      <AnimatePresence>
        {expanded && score && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mt-4 flex flex-col gap-4 border-t border-white/[0.06] pt-4">
              <div className="flex flex-col gap-3">
                <GlowBar value={score.voiceIntegrity.score} max={10} label="Voice Integrity" />
                <p className="font-sans text-xs text-bone">{score.voiceIntegrity.comment}</p>
                <GlowBar value={score.behavioralFidelity.score} max={10} label="Behavioral Fidelity" />
                <p className="font-sans text-xs text-bone">{score.behavioralFidelity.comment}</p>
                <GlowBar value={score.gloucesterDepth.score} max={10} label="Gloucester Depth" />
                <p className="font-sans text-xs text-bone">{score.gloucesterDepth.comment}</p>
              </div>

              <div>
                <span className="font-sans text-xs font-medium uppercase tracking-widest text-bone">
                  Through-Line Analysis
                </span>
                <p className="mt-1 font-sans text-sm text-bone">{score.throughLineAnalysis}</p>
              </div>

              {score.perTaskScores && (
                <ThroughLineChart perTaskScores={score.perTaskScores} />
              )}

              <div className="flex flex-col gap-2">
                {TASK_ORDER.map((taskId, i) => {
                  const meta = TASK_META[taskId];
                  const response = character.responses[taskId];
                  return response ? (
                    <MomentCard
                      key={taskId}
                      taskNumber={meta.number}
                      taskLabel={meta.label}
                      response={response}
                      coherenceScore={score.perTaskScores?.[i] || 3}
                      index={i}
                      characterName={character.name}
                    />
                  ) : null;
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
