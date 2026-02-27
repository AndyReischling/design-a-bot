"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { FinalRanking } from "@/lib/types";

interface IdentityRevealProps {
  rankings: FinalRanking[];
  onComplete: () => void;
}

export default function IdentityReveal({ rankings, onComplete }: IdentityRevealProps) {
  const [revealedCount, setRevealedCount] = useState(0);

  const allRevealed = revealedCount >= rankings.length;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-serif text-2xl font-bold text-bone">The Reveal</h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rankings.map((r, i) => (
          <AnimatePresence key={r.botLabel}>
            {i < revealedCount ? (
              <motion.div
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" as const }}
                style={{ perspective: 1000 }}
              >
                <Card variant="active">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ash">
                    {r.botLabel}
                  </span>
                  <h3 className="mt-1 font-serif text-xl font-bold text-bone">
                    {r.characterName}
                  </h3>
                  <p className="font-sans text-sm text-teal">{r.playerName}</p>
                </Card>
              </motion.div>
            ) : (
              <Card variant="default" className="flex items-center justify-center min-h-[100px]">
                <span className="font-mono text-lg text-ash/30">{r.botLabel}</span>
              </Card>
            )}
          </AnimatePresence>
        ))}
      </div>

      <div className="flex gap-3">
        {!allRevealed ? (
          <Button variant="primary" onClick={() => setRevealedCount((c) => c + 1)}>
            Reveal Next
          </Button>
        ) : (
          <Button variant="primary" onClick={onComplete}>
            Show Leaderboard
          </Button>
        )}
        {!allRevealed && (
          <Button
            variant="ghost"
            onClick={() => setRevealedCount(rankings.length)}
          >
            Reveal All
          </Button>
        )}
      </div>
    </div>
  );
}
