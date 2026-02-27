"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
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
import { TASK_ORDER, TASK_META, type CharacterSheet, type FinalRanking, type CharacterWithAudition } from "@/lib/types";

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
    async (botLabel: string) => {
      if (!playerId || !session) return;
      const taskIndex = session.currentTask;
      try {
        const res = await fetch(`/api/session/${code}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, taskIndex, votedForBotLabel: botLabel }),
        });
        const data = await res.json();
        if (data.success) {
          setVotedTasks((prev) => new Set([...prev, taskIndex]));
        }
      } catch { /* ignore */ }
    },
    [code, playerId, session]
  );

  const currentTask = session?.currentTask ?? 0;
  const currentTaskId = TASK_ORDER[currentTask];
  const currentMeta = currentTaskId ? TASK_META[currentTaskId] : null;
  const progress = computeProgress(character);
  const canSubmit = progress >= 100 && !submitted;

  const myCharacter = useMemo(() => {
    return session?.characters.find((c) => c.playerId === playerId);
  }, [session, playerId]);

  const myRanking = useMemo(() => {
    return rankings?.find((r) => r.botLabel === myCharacter?.botLabel);
  }, [rankings, myCharacter]);

  const votingResponses = useMemo(() => {
    if (!session || !currentTaskId) return [];
    return session.characters.map((c) => ({
      botLabel: c.botLabel,
      response: c.responses[currentTaskId] || "",
      isSelf: c.playerId === playerId,
    }));
  }, [session, currentTaskId, playerId]);

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
        <p className="mt-4 font-sans text-sm text-ash">Connecting to session...</p>
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
            <p className="font-sans text-xs text-ash">{playerName} / {code}</p>
          </div>
          <RobotAvatar size={32} animate={false} />
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
              <p className="font-sans text-sm text-ash">
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
              <CharacterForm character={character} onChange={handleCharacterChange} />
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
              <p className="font-sans text-sm text-ash">Waiting for everyone to finish...</p>
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
              <p className="font-sans text-sm text-ash">Sit tight.</p>
            </motion.div>
          )}

          {/* PRESENTING */}
          {session.status === "presenting" && currentMeta && (
            <motion.div
              key={`presenting-${currentTask}`}
              className="flex flex-col gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-orchid">
                  Task {currentMeta.number} — {currentMeta.label}
                </span>
                <p className="mt-2 font-sans text-sm text-bone/70">
                  {currentMeta.scenario}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                {session.characters.map((c) => (
                  <Card key={c.botLabel} variant="active" className="text-sm">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-orchid">
                      {c.botLabel}
                    </span>
                    <p className="mt-1 font-sans text-sm leading-relaxed text-bone/80 whitespace-pre-wrap">
                      {c.responses[currentTaskId] || "..."}
                    </p>
                  </Card>
                ))}
              </div>
              <p className="text-center font-sans text-xs text-ash">
                Waiting for host to open voting...
              </p>
            </motion.div>
          )}

          {/* VOTING */}
          {session.status === "voting" && currentMeta && (
            <motion.div
              key={`voting-${currentTask}`}
              className="flex flex-col gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-orchid">
                  Vote — Task {currentMeta.number}
                </span>
                <h2 className="mt-1 font-serif text-lg font-bold text-bone">
                  {currentMeta.label}
                </h2>
              </div>
              <VotingInterface
                responses={votingResponses}
                allowSelfVote={session.settings.allowSelfVote}
                onVote={handleVote}
                hasVoted={votedTasks.has(currentTask)}
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
