"use client";

import { motion } from "framer-motion";

interface GlowBarProps {
  value: number;
  max: number;
  label: string;
  className?: string;
}

export default function GlowBar({
  value,
  max,
  label,
  className = "",
}: GlowBarProps) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="font-sans text-xs font-medium uppercase tracking-widest text-bone">
          {label}
        </span>
        <span className="font-mono text-sm text-amber">
          {value}/{max}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-amber to-teal"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          style={{
            boxShadow: "0 0 12px rgba(232, 148, 58, 0.4)",
          }}
        />
      </div>
    </div>
  );
}
