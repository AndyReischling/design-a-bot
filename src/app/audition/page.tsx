"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import CharacterCard from "@/components/character/CharacterCard";
import TaskSequence from "@/components/audition/TaskSequence";
import PixelBot from "@/components/ui/PixelBot";
import Button from "@/components/ui/Button";
import { useAppState } from "@/lib/context";

export default function AuditionPage() {
  const router = useRouter();
  const { character, avatarUrl } = useAppState();
  const [started, setStarted] = useState(false);
  const [showCharacter, setShowCharacter] = useState(false);

  const handleComplete = useCallback(() => {
    router.push("/report");
  }, [router]);

  if (!character || !character.name) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-serif text-2xl font-semibold text-bone">
            No character found
          </h1>
          <p className="mt-2 font-sans text-bone">
            Create a character first before the audition.
          </p>
          <Button
            variant="primary"
            className="mt-6"
            onClick={() => router.push("/create")}
          >
            Create a Character
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 md:px-12">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-bone">
            The Audition
          </span>
          <h1 className="mt-2 font-serif text-4xl font-bold text-bone">
            Six Scenarios
          </h1>
        </motion.div>

        {/* Avatar + Expandable character card */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {avatarUrl && (
            <div className="mb-4 flex justify-center">
              <PixelBot avatarUrl={avatarUrl} name={character.name || ""} size={120} />
            </div>
          )}
          <button
            onClick={() => setShowCharacter(!showCharacter)}
            className="mb-2 flex items-center gap-2 font-sans text-xs uppercase tracking-wider text-bone transition-colors hover:text-bone"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              className={`transition-transform ${showCharacter ? "rotate-90" : ""}`}
            >
              <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
            {showCharacter ? "Hide" : "Show"} Character Sheet
          </button>
          <AnimatePresence>
            {showCharacter && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <CharacterCard character={character} />
              </motion.div>
            )}
          </AnimatePresence>
          {!showCharacter && (
            <CharacterCard character={character} compact />
          )}
        </motion.div>

        {/* Pre-start / Task sequence */}
        <AnimatePresence mode="wait">
          {!started ? (
            <motion.div
              key="intro"
              className="flex flex-col items-center gap-6 py-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <p className="max-w-md font-sans text-base leading-relaxed text-bone">
                Your character has been hired as a customer service agent at a
                bank app. They must now handle six scenarios — as themselves.
              </p>
              <Button variant="primary" onClick={() => setStarted(true)}>
                Begin Audition
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TaskSequence onComplete={handleComplete} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
