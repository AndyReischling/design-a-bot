"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import CharacterForm from "@/components/character/CharacterForm";
import { computeProgress } from "@/components/character/CharacterCard";
import ArchiveDrawer from "@/components/character/ArchiveDrawer";
import VotingInterface from "@/components/voting/VotingInterface";
import Leaderboard from "@/components/results/Leaderboard";
import AwardsList from "@/components/results/AwardsList";
import PersonalResult from "@/components/results/PersonalResult";
import LoadingOrb from "@/components/ui/LoadingOrb";
import RobotAvatar from "@/components/ui/RobotAvatar";
import { useSessionPolling } from "@/lib/useSessionPolling";
import { type CharacterSheet, type FinalRanking, type CharacterWithAudition } from "@/lib/types";

export default function PlayerPage() {
  const params = useParams();
  const code = (params.code as string).toUpperCase();

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [joining, setJoining] = useState(false);
  const [character, setCharacter] = useState<Partial<CharacterSheet>>({
    signatureMoves: ["", "", "", "", ""],
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [votedTasks, setVotedTasks] = useState<Set<number>>(new Set());
  const [rankings, setRankings] = useState<FinalRanking[] | null>(null);

  // Restore session from storage
  useEffect(() => {
    const stored = sessionStorage.getItem(`player_${code}`);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setPlayerId(data.playerId);
        setPlayerName(data.name);
      } catch { /* ignore */ }
    }
  }, [code]);

  const { session } = useSessionPolling({
    code,
    intervalMs: 2000,
    enabled: !!playerId,
  });

  // Fetch results when session enters results phase
  useEffect(() => {
    if (session?.status === "results" && !rankings) {
      fetch(`/api/session/${code}/results`)
        .then((r) => r.json())
        .then((data) => setRankings(data.rankings))
        .catch(() => {});
    }
  }, [session?.status, code, rankings]);

  const handleJoin = useCallback(async () => {
    if (!nameInput.trim()) return;
    setJoining(true);
    try {
      const res = await fetch(`/api/session/${code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput.trim() }),
      });
      const data = await res.json();
      if (data.playerId) {
        setPlayerId(data.playerId);
        setPlayerName(nameInput.trim());
        sessionStorage.setItem(
          `player_${code}`,
          JSON.stringify({ playerId: data.playerId, name: nameInput.trim() })
        );
      } else {
        alert(data.error || "Failed to join");
      }
    } catch {
      alert("Failed to join session");
    } finally {
      setJoining(false);
    }
  }, [code, nameInput]);

  const handleCharacterChange = useCallback((updates: Partial<CharacterSheet>) => {
    setCharacter((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleInspiration = useCallback((archiveChar: CharacterSheet) => {
    const { id, isArchive, source, ...fields } = archiveChar;
    setCharacter({ ...fields, signatureMoves: [...fields.signatureMoves] });
    setDrawerOpen(false);
  }, []);

  const handleGenerateAvatar = useCallback(() => {
    setAvatarLoading(true);
    fetch("/api/avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ character }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.url) setAvatarUrl(data.url);
      })
      .catch(() => {})
      .finally(() => setAvatarLoading(false));
  }, [character]);

  const handleSubmitCharacter = useCallback(async () => {
    if (!playerId) return;
    try {
      const res = await fetch(`/api/session/${code}/character`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, character }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        alert(data.error || "Failed to submit");
      }
    } catch {
      alert("Failed to submit character");
    }
  }, [code, playerId, character]);

  const handleVote = useCallback(
    async (approvals: Record<string, boolean>) => {
      if (!playerId || !session) return;
      try {
        const res = await fetch(`/api/session/${code}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, approvals }),
        });
        const data = await res.json();
        if (data.success) {
          setVotedTasks((prev) => new Set([...prev, 0]));
        }
      } catch { /* ignore */ }
    },
    [code, playerId, session]
  );

  const progress = computeProgress(character);
  const canSubmit = progress >= 100 && !submitted;

  const myCharacter = useMemo(() => {
    return session?.characters.find((c) => c.playerId === playerId);
  }, [session, playerId]);

  const myRanking = useMemo(() => {
    return rankings?.find((r) => r.characterName === myCharacter?.name);
  }, [rankings, myCharacter]);

  // Not joined yet
  if (!playerId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <motion.div
          className="flex max-w-sm flex-col items-center gap-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <RobotAvatar size={70} />
          <div>
            <h1 className="font-serif text-2xl font-bold text-bone">
              Join Session
            </h1>
            <p className="mt-1 font-mono text-lg text-amber">{code}</p>
          </div>
          <Input
            label="Your Name"
            placeholder="Enter your display name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <Button
            variant="primary"
            disabled={!nameInput.trim()}
            loading={joining}
            onClick={handleJoin}
            className="w-full"
          >
            Join
          </Button>
        </motion.div>
      </div>
    );
  }

  // Joined but session not loaded yet
  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <LoadingOrb size={40} />
        <p className="mt-4 font-sans text-sm text-bone">Connecting to session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-orchid">
              {session.status}
            </span>
            <p className="font-sans text-xs text-bone">{playerName} / {code}</p>
          </div>
          <RobotAvatar size={32} interactive={false} />
        </div>

        {/* LOBBY - waiting */}
        <AnimatePresence mode="wait">
          {session.status === "lobby" && (
            <motion.div
              key="lobby"
              className="flex flex-col items-center gap-4 py-12 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="font-sans text-lg text-bone">
                You&apos;re in. Waiting for the host to start.
              </p>
              <p className="font-sans text-sm text-bone">
                {session.players.length} player{session.players.length !== 1 ? "s" : ""} in the lobby
              </p>
            </motion.div>
          )}

          {/* CREATING */}
          {session.status === "creating" && !submitted && (
            <motion.div
              key="creating"
              className="flex flex-col gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="font-serif text-xl font-bold text-bone">
                Build Your Character
              </h2>
              <CharacterForm
                character={character}
                onChange={handleCharacterChange}
                avatarUrl={avatarUrl}
                onGenerateAvatar={handleGenerateAvatar}
                avatarLoading={avatarLoading}
              />
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  disabled={!canSubmit}
                  onClick={handleSubmitCharacter}
                >
                  Submit Character
                </Button>
                <Button variant="ghost" onClick={() => setDrawerOpen(true)}>
                  Archive
                </Button>
              </div>
              <ArchiveDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onSelect={handleInspiration}
              />
            </motion.div>
          )}

          {session.status === "creating" && submitted && (
            <motion.div
              key="submitted"
              className="flex flex-col items-center gap-4 py-12 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="h-12 w-12 rounded-full bg-teal/20 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="font-sans text-lg text-bone">Character submitted</p>
              <p className="font-sans text-sm text-bone">Waiting for everyone to finish...</p>
            </motion.div>
          )}

          {/* AUDITIONING */}
          {session.status === "auditioning" && (
            <motion.div
              key="auditioning"
              className="flex flex-col items-center gap-4 py-12 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingOrb size={48} />
              <p className="font-sans text-lg text-bone">
                Your character is auditioning
              </p>
              <p className="font-sans text-sm text-bone">Sit tight.</p>
            </motion.div>
          )}

          {/* VOTING */}
          {session.status === "voting" && (
            <motion.div
              key="voting"
              className="flex flex-col gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div>
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-bone">
                  Voting
                </span>
                <h2 className="mt-1 font-serif text-lg font-bold text-bone">
                  Review all characters and vote
                </h2>
              </div>
              <VotingInterface
                characters={session.characters}
                selfPlayerId={playerId || undefined}
                allowSelfVote={session.settings.allowSelfVote}
                onVote={handleVote}
                hasVoted={votedTasks.has(0)}
              />
            </motion.div>
          )}

          {/* RESULTS */}
          {session.status === "results" && (
            <motion.div
              key="results"
              className="flex flex-col gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {myRanking && myCharacter && (
                <PersonalResult
                  ranking={myRanking}
                  character={myCharacter}
                  totalPlayers={session.players.length}
                />
              )}
              {rankings && (
                <>
                  <Leaderboard rankings={rankings} />
                  <AwardsList rankings={rankings} />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
