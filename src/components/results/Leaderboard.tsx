"use client";

import { motion } from "framer-motion";
import type { FinalRanking } from "@/lib/types";

interface LeaderboardProps {
  rankings: FinalRanking[];
}

export default function Leaderboard({ rankings }: LeaderboardProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-serif text-2xl font-bold text-bone">
        Final Results
      </h2>

      <div className="grid grid-cols-[40px_1fr_70px_70px_80px] gap-2 px-4 py-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-bone">
          Rank
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-bone">
          Character
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-bone text-right">
          AI
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-bone text-right">
          Audience
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-bone text-right">
          Total
        </span>
      </div>

      {rankings.map((r, i) => (
        <motion.div
          key={r.botLabel}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className={`
            grid grid-cols-[40px_1fr_70px_70px_80px] gap-2 items-center
            rounded-lg border px-4 py-3
            ${i === 0 ? "border-amber/30 bg-amber/5" : "border-bone/10 bg-surface"}
          `}
        >
          <span
            className={`font-mono text-lg font-bold ${
              i === 0 ? "text-amber" : "text-bone"
            }`}
          >
            #{i + 1}
          </span>
          <div>
            <p className="font-serif text-base font-semibold text-bone">
              {r.characterName}
            </p>
            <p className="font-sans text-xs text-bone">{r.playerName}</p>
          </div>
          <p className="text-right font-mono text-sm text-teal">
            {r.coherenceScore}/30
          </p>
          <p className="text-right font-mono text-sm text-amber">
            {r.audiencePoints}
          </p>
          <p className={`text-right font-mono text-sm font-bold ${i === 0 ? "text-amber" : "text-bone"}`}>
            {r.totalScore}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
