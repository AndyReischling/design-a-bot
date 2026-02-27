"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import GlowBar from "@/components/ui/GlowBar";
import type { CoherenceScore } from "@/lib/types";

interface ScoreDisplayProps {
  score: CoherenceScore;
}

function useCountUp(target: number, duration: number = 1200) {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number>(0);

  useEffect(() => {
    startTime.current = null;

    const animate = (timestamp: number) => {
      if (startTime.current === null) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      }
    };

    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, [target, duration]);

  return value;
}

export default function ScoreDisplay({ score }: ScoreDisplayProps) {
  const overallAnimated = useCountUp(score.overall);

  return (
    <motion.div
      className="flex flex-col gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Overall score */}
      <div className="flex items-end gap-4">
        <div>
          <span className="font-sans text-xs font-medium uppercase tracking-widest text-ash">
            Coherence Score
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className="font-mono text-6xl font-medium tabular-nums"
              style={{ color: "var(--amber)" }}
            >
              {overallAnimated}
            </span>
            <span className="font-mono text-xl text-ash">/ 30</span>
          </div>
        </div>
      </div>

      {/* Sub-scores */}
      <div className="flex flex-col gap-4">
        <GlowBar
          value={score.voiceIntegrity.score}
          max={10}
          label="Voice Integrity"
        />
        <p className="font-sans text-xs text-bone/60 -mt-2">
          {score.voiceIntegrity.comment}
        </p>

        <GlowBar
          value={score.behavioralFidelity.score}
          max={10}
          label="Behavioral Fidelity"
        />
        <p className="font-sans text-xs text-bone/60 -mt-2">
          {score.behavioralFidelity.comment}
        </p>

        <GlowBar
          value={score.gloucesterDepth.score}
          max={10}
          label="Gloucester Depth"
        />
        <p className="font-sans text-xs text-bone/60 -mt-2">
          {score.gloucesterDepth.comment}
        </p>
      </div>

      {/* Analysis */}
      <div className="border-t border-white/[0.06] pt-4">
        <span className="font-sans text-xs font-medium uppercase tracking-widest text-ash">
          Through-Line Analysis
        </span>
        <p className="mt-2 font-sans text-sm leading-relaxed text-bone/80">
          {score.throughLineAnalysis}
        </p>
      </div>

      {/* Highlights */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-teal/20 bg-teal/5 p-4">
          <span className="font-sans text-[10px] font-medium uppercase tracking-widest text-teal">
            Most Coherent Moment
          </span>
          <p className="mt-1 font-sans text-sm text-bone/80">
            {score.mostCoherentMoment}
          </p>
        </div>
        <div className="rounded-lg border border-amber/20 bg-amber/5 p-4">
          <span className="font-sans text-[10px] font-medium uppercase tracking-widest text-amber">
            Weakest Moment
          </span>
          <p className="mt-1 font-sans text-sm text-bone/80">
            {score.weakestMoment}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
