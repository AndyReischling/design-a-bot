"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import IdentityReveal from "@/components/results/IdentityReveal";
import Leaderboard from "@/components/results/Leaderboard";
import AwardsList from "@/components/results/AwardsList";
import CharacterDeepDive from "@/components/results/CharacterDeepDive";
import LoadingOrb from "@/components/ui/LoadingOrb";
import type { FinalRanking, CharacterWithAudition, Player } from "@/lib/types";

export default function HostResultsPage() {
  const params = useParams();
  const code = (params.code as string).toUpperCase();

  const [rankings, setRankings] = useState<FinalRanking[] | null>(null);
  const [characters, setCharacters] = useState<CharacterWithAudition[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [phase, setPhase] = useState<"reveal" | "leaderboard" | "deepdive">("reveal");

  useEffect(() => {
    fetch(`/api/session/${code}/results`)
      .then((res) => res.json())
      .then((data) => {
        setRankings(data.rankings);
        setCharacters(data.characters);
        setPlayers(data.players);
      });
  }, [code]);

  if (!rankings) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingOrb size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 md:px-12">
      <div className="mx-auto max-w-5xl">
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-bone">
            The Audition
          </span>
          <h1 className="mt-2 font-serif text-4xl font-bold text-bone md:text-5xl"
            style={{
              color: "var(--amber)",
              textShadow: "0 0 30px rgba(232,148,58,0.2)",
            }}
          >
            Final Results
          </h1>
        </motion.div>

        {phase === "reveal" && (
          <IdentityReveal
            rankings={rankings}
            onComplete={() => setPhase("leaderboard")}
          />
        )}

        {phase === "leaderboard" && (
          <motion.div
            className="flex flex-col gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Leaderboard rankings={rankings} />
            <AwardsList rankings={rankings} />

            <button
              onClick={() => setPhase("deepdive")}
              className="self-center font-sans text-sm text-teal underline underline-offset-4"
            >
              Deep-dive into individual performances
            </button>
          </motion.div>
        )}

        {phase === "deepdive" && (
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button
              onClick={() => setPhase("leaderboard")}
              className="self-start font-sans text-xs text-bone hover:text-bone"
            >
              &larr; Back to leaderboard
            </button>
            <h2 className="font-serif text-2xl font-bold text-bone">
              Performance Deep Dive
            </h2>
            {characters.map((c) => {
              const player = players.find((p) => p.id === c.playerId);
              return (
                <CharacterDeepDive
                  key={c.botLabel}
                  character={c}
                  playerName={player?.name || "Unknown"}
                />
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
