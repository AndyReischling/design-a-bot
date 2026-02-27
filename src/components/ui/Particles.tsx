"use client";

import { useMemo } from "react";

interface ParticlesProps {
  count?: number;
}

export default function Particles({ count = 30 }: ParticlesProps) {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const size = Math.random() * 2 + 1;
      const colors = [
        "rgba(232, 148, 58, 0.4)",
        "rgba(63, 207, 207, 0.3)",
        "rgba(155, 109, 255, 0.3)",
      ];
      const color = colors[i % 3];
      return {
        key: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size,
        color,
        duration: Math.random() * 15 + 10,
        delay: Math.random() * 10,
        dx: `${(Math.random() - 0.5) * 100}px`,
        dy: `${-Math.random() * 120 - 30}px`,
      };
    });
  }, [count]);

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.key}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animation: `drift ${p.duration}s ${p.delay}s infinite linear`,
            ["--dx" as string]: p.dx,
            ["--dy" as string]: p.dy,
          }}
        />
      ))}
    </div>
  );
}
