"use client";

import type { Player } from "@/lib/types";
import PlayerCard from "./PlayerCard";

interface PlayerListProps {
  players: Player[];
  showStatus?: boolean;
}

export default function PlayerList({ players, showStatus }: PlayerListProps) {
  if (players.length === 0) {
    return (
      <p className="py-8 text-center font-sans text-sm text-bone">
        Waiting for players to join...
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-sans text-xs font-medium uppercase tracking-widest text-bone">
          Players
        </span>
        <span className="font-mono text-xs text-bone">{players.length}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {players.map((player, i) => (
          <PlayerCard
            key={player.id}
            player={player}
            index={i}
            showStatus={showStatus}
          />
        ))}
      </div>
    </div>
  );
}
