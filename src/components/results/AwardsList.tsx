"use client";

import type { FinalRanking } from "@/lib/types";
import AwardBadge from "./AwardBadge";

interface AwardsListProps {
  rankings: FinalRanking[];
}

export default function AwardsList({ rankings }: AwardsListProps) {
  const allAwards = rankings.flatMap((r) =>
    r.awards.map((a) => ({
      award: a,
      characterName: r.characterName,
      playerName: r.playerName,
    }))
  );

  if (allAwards.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <span className="font-sans text-xs font-medium uppercase tracking-widest text-bone">
        Awards
      </span>
      <div className="grid gap-2 sm:grid-cols-2">
        {allAwards.map((a, i) => (
          <div key={i}>
            <AwardBadge award={a.award} />
            <p className="mt-1 pl-4 font-sans text-[10px] text-bone">
              {a.characterName} ({a.playerName})
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
