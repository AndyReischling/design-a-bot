"use client";

import { motion } from "framer-motion";

interface SessionProgressBarProps {
  completed: number;
  total: number;
  label?: string;
}

export default function SessionProgressBar({
  completed,
  total,
  label,
}: SessionProgressBarProps) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <span className="font-sans text-xs text-bone">{label}</span>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-amber via-teal to-orchid"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3 }}
          style={{ boxShadow: "0 0 12px rgba(232, 148, 58, 0.3)" }}
        />
      </div>
      <div className="flex justify-between">
        <span className="font-mono text-xs text-bone">{completed} / {total}</span>
        <span className="font-mono text-xs text-amber">{pct}%</span>
      </div>
    </div>
  );
}
