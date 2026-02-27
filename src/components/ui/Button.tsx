"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import LoadingOrb from "./LoadingOrb";

type ButtonVariant = "primary" | "secondary" | "accent" | "ghost";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-amber text-white font-semibold hover:brightness-90 active:brightness-85 shadow-[0_0_20px_rgba(245,213,71,0.25)]",
  secondary:
    "bg-transparent border-2 border-teal text-teal hover:bg-teal hover:text-white hover:border-teal",
  accent:
    "bg-orchid text-white font-semibold hover:brightness-90 active:brightness-85",
  ghost:
    "bg-transparent text-bone hover:bg-bone/10",
};

export default function Button({
  variant = "primary",
  loading = false,
  disabled = false,
  children,
  className = "",
  ...motionProps
}: ButtonProps) {
  return (
    <motion.button
      className={`
        relative inline-flex items-center justify-center gap-2
        rounded-lg px-6 py-3 font-sans text-sm font-medium
        transition-all duration-200
        disabled:cursor-not-allowed disabled:opacity-40
        ${variantStyles[variant]}
        ${className}
      `}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      {...motionProps}
    >
      {loading ? (
        <LoadingOrb size={20} />
      ) : (
        children
      )}
    </motion.button>
  );
}
