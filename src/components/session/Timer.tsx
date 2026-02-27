"use client";

import { useState, useEffect } from "react";

interface TimerProps {
  durationMinutes: number;
  onExpire?: () => void;
  startTime: number;
}

export default function Timer({ durationMinutes, onExpire, startTime }: TimerProps) {
  const [remaining, setRemaining] = useState(durationMinutes * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const left = Math.max(durationMinutes * 60 - elapsed, 0);
      setRemaining(left);
      if (left <= 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [durationMinutes, startTime, onExpire]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const urgent = remaining <= 60;

  return (
    <div
      className={`font-mono text-2xl tabular-nums ${
        urgent ? "text-amber animate-pulse" : "text-bone/60"
      }`}
    >
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </div>
  );
}
