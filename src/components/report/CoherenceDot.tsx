"use client";

interface CoherenceDotProps {
  score: number; // 1-5
}

export default function CoherenceDot({ score }: CoherenceDotProps) {
  const level: "high" | "mid" | "low" =
    score >= 4 ? "high" : score >= 3 ? "mid" : "low";

  const colors = {
    high: { bg: "bg-teal", text: "text-teal", label: "Held" },
    mid: { bg: "bg-amber", text: "text-amber", label: "Bent" },
    low: { bg: "bg-red-500", text: "text-red-400", label: "Cracked" },
  };

  const c = colors[level];

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-2 w-2 rounded-full ${c.bg}`} />
      <span className={`font-mono text-[10px] uppercase tracking-wider ${c.text}`}>
        {c.label}
      </span>
    </span>
  );
}
