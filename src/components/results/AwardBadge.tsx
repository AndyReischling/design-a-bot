"use client";

import type { Award } from "@/lib/types";

interface AwardBadgeProps {
  award: Award;
}

const AWARD_ICONS: Record<string, string> = {
  "most-coherent": "[AI]",
  "audience-favorite": "[CROWD]",
  unanimous: "[STAR]",
  "biggest-gap": "[GAP]",
  "scene-stealer": "[STAGE]",
  "the-rock": "[ROCK]",
  "comeback-kid": "[RISE]",
  "gloucesters-favorite": "[LEAR]",
};

export default function AwardBadge({ award }: AwardBadgeProps) {
  const icon = AWARD_ICONS[award.id] || "[*]";

  return (
    <div className="flex items-start gap-3 rounded-lg border border-orchid/20 bg-orchid/5 px-4 py-3">
      <span className="font-mono text-xs text-orchid shrink-0">{icon}</span>
      <div>
        <p className="font-sans text-sm font-semibold text-bone">{award.label}</p>
        <p className="font-sans text-xs text-bone/60">{award.description}</p>
      </div>
    </div>
  );
}
