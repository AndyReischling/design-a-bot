"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";

interface VoteRevealProps {
  results: { botLabel: string; response: string; yes: number; total: number }[];
}

export default function VoteReveal({ results }: VoteRevealProps) {
  const maxPct = Math.max(...results.map((r) => (r.total > 0 ? r.yes / r.total : 0)));

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {results.map((r, i) => {
        const pct = r.total > 0 ? Math.round((r.yes / r.total) * 100) : 0;
        const isTop = r.total > 0 && r.yes / r.total === maxPct && maxPct > 0;

        return (
          <motion.div
            key={r.botLabel}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card
              variant={isTop ? "highlight" : "default"}
              className={isTop ? "border-amber/40" : ""}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs uppercase tracking-wider text-orchid">
                  {r.botLabel}
                </span>
                <motion.span
                  className="font-mono text-lg tabular-nums"
                  style={{ color: isTop ? "var(--amber)" : "var(--bone)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                >
                  {pct}%
                </motion.span>
              </div>
              <div className="mb-2 flex items-center gap-2">
                <span className="font-mono text-[10px] text-teal">{r.yes} yes</span>
                <span className="font-mono text-[10px] text-bone">/ {r.total} votes</span>
              </div>
              {isTop && (
                <motion.p
                  className="font-mono text-[10px] uppercase tracking-widest text-amber mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Round Winner
                </motion.p>
              )}
              <p className="font-sans text-xs leading-relaxed text-bone line-clamp-3">
                {r.response}
              </p>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
