"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

type CardVariant = "default" | "active" | "highlight" | "archive" | "score";

interface CardProps extends HTMLMotionProps<"div"> {
  variant?: CardVariant;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: "border-bone/10 hover:border-amber/50",
  active: "border-l-[3px] border-l-amber border-bone/10",
  highlight: "border-bone/10 bg-amber/10",
  archive: "border-bone/10 hover:border-orchid/50",
  score: "border-bone/10 bg-surface",
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
        hover:shadow-[0_4px_24px_rgba(245,213,71,0.15)]
        ${variantStyles[variant]}
        ${className}
      `}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
