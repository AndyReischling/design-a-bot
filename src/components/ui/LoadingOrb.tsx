"use client";

import { motion } from "framer-motion";

interface LoadingOrbProps {
  size?: number;
  className?: string;
}

export default function LoadingOrb({ size = 32, className = "" }: LoadingOrbProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      role="status"
      aria-label="Loading"
    >
      <motion.div
        className="rounded-full"
        style={{ width: size, height: size }}
        animate={{
          boxShadow: [
            `0 0 ${size * 0.6}px ${size * 0.15}px rgba(232, 148, 58, 0.5)`,
            `0 0 ${size * 0.6}px ${size * 0.15}px rgba(63, 207, 207, 0.5)`,
            `0 0 ${size * 0.6}px ${size * 0.15}px rgba(155, 109, 255, 0.5)`,
            `0 0 ${size * 0.6}px ${size * 0.15}px rgba(232, 148, 58, 0.5)`,
          ],
          background: [
            "radial-gradient(circle, rgba(232,148,58,0.6) 0%, transparent 70%)",
            "radial-gradient(circle, rgba(63,207,207,0.6) 0%, transparent 70%)",
            "radial-gradient(circle, rgba(155,109,255,0.6) 0%, transparent 70%)",
            "radial-gradient(circle, rgba(232,148,58,0.6) 0%, transparent 70%)",
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
