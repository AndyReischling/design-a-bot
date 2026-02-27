"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";

interface VoteRevealProps {
  results: { botLabel: string; response: string; votes: number }[];
  maxVotes: number;
}

export default function VoteReveal({ results, maxVotes }: VoteRevealProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {results.map((r, i) => {
        const isWinner = r.votes === maxVotes && maxVotes > 0;

        return (
          <motion.div
            key={r.botLabel}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card
              variant={isWinner ? "highlight" : "default"}
              className={isWinner ? "border-amber/40" : ""}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs uppercase tracking-wider text-orchid">
                  {r.botLabel}
                </span>
                <motion.span
                  className="font-mono text-lg tabular-nums"
                  style={{ color: isWinner ? "var(--amber)" : "var(--bone)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                >
                  {r.votes}
                </motion.span>
              </div>
              {isWinner && (
                <motion.p
                  className="font-mono text-[10px] uppercase tracking-widest text-amber mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Round Winner
                </motion.p>
              )}
              <p className="font-sans text-xs leading-relaxed text-bone/60 line-clamp-3">
                {r.response}
              </p>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
