"use client";

import Card from "@/components/ui/Card";
import GlowBar from "@/components/ui/GlowBar";
import type { FinalRanking, CharacterWithAudition } from "@/lib/types";

interface PersonalResultProps {
  ranking: FinalRanking;
  character?: CharacterWithAudition;
  totalPlayers: number;
}

export default function PersonalResult({
  ranking,
  character,
  totalPlayers,
}: PersonalResultProps) {
  return (
    <Card variant="active" className="border-l-teal">
      <span className="font-sans text-[10px] font-medium uppercase tracking-widest text-teal">
        Your Result
      </span>
      <h3 className="mt-1 font-serif text-xl font-bold text-bone">
        {ranking.characterName}
      </h3>
      <p className="font-sans text-sm text-bone">
        Total Score: {ranking.totalScore} ({ranking.coherenceScore}/30 AI + {ranking.audiencePoints} audience)
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <GlowBar
          value={ranking.coherenceScore}
          max={30}
          label="AI Coherence"
        />
        <GlowBar
          value={ranking.audiencePoints}
          max={100}
          label="Audience Approval"
        />
      </div>

      {character?.coherenceScore && (
        <div className="mt-4 grid gap-2 grid-cols-3">
          <div className="text-center">
            <p className="font-mono text-sm text-teal">
              {character.coherenceScore.voiceIntegrity.score}/10
            </p>
            <p className="font-sans text-[10px] text-bone">Voice</p>
          </div>
          <div className="text-center">
            <p className="font-mono text-sm text-amber">
              {character.coherenceScore.behavioralFidelity.score}/10
            </p>
            <p className="font-sans text-[10px] text-bone">Behavior</p>
          </div>
          <div className="text-center">
            <p className="font-mono text-sm text-orchid">
              {character.coherenceScore.gloucesterDepth.score}/10
            </p>
            <p className="font-sans text-[10px] text-bone">Gloucester</p>
          </div>
        </div>
      )}

      {ranking.awards.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {ranking.awards.map((a) => (
            <span
              key={a.id}
              className="rounded-full bg-orchid/10 px-3 py-1 font-mono text-[10px] text-orchid"
            >
              {a.label}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
