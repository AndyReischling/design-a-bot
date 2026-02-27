"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

type CardVariant = "default" | "active" | "highlight" | "archive" | "score";

interface CardProps extends HTMLMotionProps<"div"> {
  variant?: CardVariant;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: "border-white/[0.06] hover:border-amber/40",
  active: "border-l-[3px] border-l-amber border-white/[0.06]",
  highlight: "border-white/[0.06] bg-glow-amber",
  archive: "border-white/[0.06] hover:border-orchid/40",
  score: "border-white/[0.06] bg-[#0e0e18]",
};

export default function Card({
  variant = "default",
  className = "",
  children,
  ...motionProps
}: CardProps) {
  return (
    <motion.div
      className={`
        rounded-xl border bg-surface p-6
        transition-all duration-300 ease-out
        hover:-translate-y-0.5
        hover:shadow-[0_4px_24px_rgba(232,148,58,0.08)]
        ${variantStyles[variant]}
        ${className}
      `}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
