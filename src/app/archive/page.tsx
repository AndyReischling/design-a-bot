"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import ArchiveGrid from "@/components/character/ArchiveGrid";
import Button from "@/components/ui/Button";
import { useAppDispatch } from "@/lib/context";
import type { CharacterSheet } from "@/lib/types";

export default function ArchivePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleSelect = useCallback(
    (char: CharacterSheet) => {
      const { id, isArchive, source, ...fields } = char;
      dispatch({
        type: "SET_CHARACTER",
        payload: { ...fields, signatureMoves: [...fields.signatureMoves] },
      });
      router.push("/create");
    },
    [dispatch, router]
  );

  return (
    <div className="min-h-screen px-6 py-12 md:px-12">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="font-mono text-xs uppercase tracking-widest text-orchid">
            Character Archive
          </span>
          <h1 className="mt-2 font-serif text-4xl font-bold text-bone">
            The Archive
          </h1>
          <p className="mt-2 max-w-lg font-sans text-bone">
            Sixty characters from literature, mythology, theater, film, and
            television — each fully realized as a bank agent candidate. Use
            them as inspiration or run them through the audition yourself.
          </p>
          <Button
            variant="ghost"
            className="mt-4"
            onClick={() => router.push("/create")}
          >
            &larr; Back to Character Creation
          </Button>
        </motion.div>

        <ArchiveGrid onSelect={handleSelect} />
      </div>
    </div>
  );
}
