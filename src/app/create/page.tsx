"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import CharacterForm from "@/components/character/CharacterForm";
import CharacterCard, { computeProgress } from "@/components/character/CharacterCard";
import ArchiveDrawer from "@/components/character/ArchiveDrawer";
import Button from "@/components/ui/Button";
import { useAppState, useAppDispatch } from "@/lib/context";
import type { CharacterSheet } from "@/lib/types";

export default function CreatePage() {
  const router = useRouter();
  const { character } = useAppState();
  const dispatch = useAppDispatch();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const current: Partial<CharacterSheet> = character || {
    signatureMoves: ["", "", "", "", ""],
  };

  const handleChange = useCallback(
    (updates: Partial<CharacterSheet>) => {
      dispatch({
        type: "UPDATE_CHARACTER",
        payload: updates,
      });
      if (!character) {
        dispatch({
          type: "SET_CHARACTER",
          payload: {
            signatureMoves: ["", "", "", "", ""],
            ...updates,
          },
        });
      }
    },
    [character, dispatch]
  );

  const handleInspiration = useCallback(
    (archiveChar: CharacterSheet) => {
      const { id, isArchive, source, ...fields } = archiveChar;
      dispatch({
        type: "SET_CHARACTER",
        payload: { ...fields, signatureMoves: [...fields.signatureMoves] },
      });
      setDrawerOpen(false);
    },
    [dispatch]
  );

  const progress = computeProgress(current);
  const canSubmit = progress >= 100;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const id = crypto.randomUUID();
    dispatch({
      type: "SET_CHARACTER",
      payload: { ...current, id },
    });
    router.push("/audition");
  };

  return (
    <div className="min-h-screen px-6 py-12 md:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="font-mono text-xs uppercase tracking-widest text-orchid">
            Character Creation
          </span>
          <h1 className="mt-2 font-serif text-4xl font-bold text-bone">
            Build Your Character
          </h1>
          <p className="mt-2 max-w-lg font-sans text-bone/50">
            Fill out each section to bring your character to life. The next
            section reveals as you complete the current one.
          </p>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left: Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <CharacterForm character={current} onChange={handleChange} />

            {/* Bottom actions */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button
                variant="primary"
                disabled={!canSubmit}
                onClick={handleSubmit}
                className="px-8"
              >
                Send to Audition
              </Button>
              <Button
                variant="ghost"
                onClick={() => setDrawerOpen(true)}
              >
                Browse the Archive for Inspiration
              </Button>
            </div>
          </motion.div>

          {/* Right: Live preview */}
          <motion.div
            className="lg:sticky lg:top-8 lg:self-start"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CharacterCard character={current} />
          </motion.div>
        </div>
      </div>

      {/* Archive drawer */}
      <ArchiveDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSelect={handleInspiration}
      />
    </div>
  );
}
