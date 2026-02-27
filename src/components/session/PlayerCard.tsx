"use client";

import { motion } from "framer-motion";
import type { Player } from "@/lib/types";

interface PlayerCardProps {
  player: Player;
  index: number;
  showStatus?: boolean;
}

export default function PlayerCard({ player, index, showStatus }: PlayerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.06, duration: 0.3, ease: "easeOut" as const }}
      className={`
        flex items-center justify-between rounded-lg border px-4 py-3
        transition-all duration-300
        ${
          player.hasSubmittedCharacter
            ? "border-teal/30 bg-teal/5 shadow-[0_0_12px_rgba(63,207,207,0.08)]"
            : "border-white/[0.06] bg-surface"
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div
          className={`h-2.5 w-2.5 rounded-full ${
            player.hasSubmittedCharacter ? "bg-teal" : "bg-ash/40"
          }`}
        />
        <span className="font-sans text-sm font-medium text-bone">
          {player.name}
        </span>
      </div>
      {showStatus && (
        <span className="font-mono text-[10px] uppercase tracking-wider text-bone">
          {player.hasSubmittedCharacter ? "Ready" : "Working..."}
        </span>
      )}
    </motion.div>
  );
}
