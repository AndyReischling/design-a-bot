"use client";

import { useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import RoomCode from "@/components/session/RoomCode";
import PlayerList from "@/components/session/PlayerList";
import PhaseControls from "@/components/session/PhaseControls";
import SessionProgressBar from "@/components/session/SessionProgressBar";
import LoadingOrb from "@/components/ui/LoadingOrb";
import VoteCounter from "@/components/voting/VoteCounter";
import CharacterAccordion from "@/components/voting/CharacterAccordion";
import RobotAvatar from "@/components/ui/RobotAvatar";
import PixelBot from "@/components/ui/PixelBot";
import { useSessionPolling } from "@/lib/useSessionPolling";
import { TASK_ORDER, TASK_META } from "@/lib/types";

export default function HostSessionPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string).toUpperCase();

  const hostId =
    typeof window !== "undefined"
      ? sessionStorage.getItem(`host_${code}`) || ""
      : "";

  const { session, error } = useSessionPolling({ code, intervalMs: 2000 });

  const handleAdvance = useCallback(async () => {
    await fetch(`/api/session/${code}/advance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostId }),
    });
  }, [code, hostId]);

  const submittedCount = session?.players.filter((p) => p.hasSubmittedCharacter).length ?? 0;

  const votersCount = useMemo(() => {
    if (!session) return 0;
    return session.players.filter((p) => p.hasVoted[0]).length;
  }, [session]);

  const canAdvance = useMemo(() => {
    if (!session) return false;
    switch (session.status) {
      case "lobby":
        return session.players.length >= 2;
      case "creating":
        return true;
      case "auditioning":
        return false;
      case "voting":
        return true;
      default:
        return false;
    }
  }, [session]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-sans text-bone">{error}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingOrb size={40} />
      </div>
    );
  }

  const joinUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/join/${code}`
      : `/join/${code}`;

  return (
    <div className="min-h-screen pb-20">
      <div className="mx-auto max-w-7xl px-6 py-8 md:px-12">
        {/* LOBBY */}
        {session.status === "lobby" && (
          <motion.div
            className="flex flex-col gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center justify-center">
              <RobotAvatar size={80} />
            </div>
            <RoomCode code={code} joinUrl={joinUrl} />
            <PlayerList players={session.players} />
          </motion.div>
        )}

        {/* CREATING */}
        {session.status === "creating" && (
          <motion.div
            className="flex flex-col gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-bone">
                Character Creation
              </span>
              <h1 className="mt-2 font-serif text-3xl font-bold text-bone md:text-4xl">
                Characters are being built...
              </h1>
              <p className="mt-2 font-mono text-sm text-bone">
                Room: {code}
              </p>
            </div>
            <PlayerList players={session.players} showStatus />

            {session.characters.some((c) => c.avatarUrl) && (
              <div className="mt-6">
                <p className="mb-4 text-center font-mono text-xs uppercase tracking-widest text-bone">
                  The Contestants
                </p>
                <div className="flex flex-wrap justify-center gap-6">
                  {session.characters
                    .filter((c) => c.avatarUrl)
                    .map((c, i) => (
                      <PixelBot
                        key={c.playerId}
                        avatarUrl={c.avatarUrl!}
                        name={c.name}
                        size={96}
                        delay={i * 0.2}
                      />
                    ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* AUDITIONING */}
        {session.status === "auditioning" && (
          <motion.div
            className="flex flex-col items-center gap-8 py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {session.characters.some((c) => c.avatarUrl) && (
              <div className="flex flex-wrap justify-center gap-6">
                {session.characters
                  .filter((c) => c.avatarUrl)
                  .map((c, i) => (
                    <PixelBot
                      key={c.playerId}
                      avatarUrl={c.avatarUrl!}
                      name={c.name}
                      size={80}
                      delay={i * 0.15}
                    />
                  ))}
              </div>
            )}
            <LoadingOrb size={64} />
            <div className="text-center">
              <h1 className="font-serif text-3xl font-bold text-bone md:text-4xl">
                The auditions are underway
              </h1>
              <p className="mt-2 font-sans text-bone">
                Generating responses for {session.characters.length} characters
                across 6 scenarios...
              </p>
            </div>
            {session.auditionProgress && (
              <div className="w-full max-w-md">
                <SessionProgressBar
                  completed={session.auditionProgress.completed}
                  total={session.auditionProgress.total}
                  label="Audition progress"
                />
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-2">
              {session.characters.map((c, i) => (
                <motion.div
                  key={c.botLabel}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.15 }}
                  className="rounded-full bg-surface border border-white/[0.06] px-4 py-2 font-mono text-sm text-orchid"
                >
                  {c.botLabel}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* VOTING */}
        {session.status === "voting" && (
          <motion.div
            className="flex flex-col gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-bone">
                Voting
              </span>
              <h2 className="mt-2 font-serif text-2xl font-bold text-bone">
                Players are reviewing all characters
              </h2>
            </div>

            <div className="flex justify-center">
              <VoteCounter
                votesIn={votersCount}
                totalVoters={session.players.length}
              />
            </div>

            <CharacterAccordion characters={session.characters} />
          </motion.div>
        )}

        {/* RESULTS */}
        {session.status === "results" && (
          <motion.div
            className="flex flex-col items-center gap-6 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h1 className="font-serif text-3xl font-bold text-bone md:text-4xl">
              And the results are in...
            </h1>
            <button
              onClick={() => router.push(`/host/${code}/results`)}
              className="font-sans text-teal underline underline-offset-4 hover:text-teal/80"
            >
              View the full reveal and leaderboard
            </button>
          </motion.div>
        )}
      </div>

      {/* Phase controls bar */}
      {session.status !== "results" && (
        <PhaseControls
          status={session.status}
          onAdvance={handleAdvance}
          canAdvance={canAdvance}
          playerCount={session.players.length}
          submittedCount={submittedCount}
          votesIn={votersCount}
          totalVoters={session.players.length}
        />
      )}
    </div>
  );
}
