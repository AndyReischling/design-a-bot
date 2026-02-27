"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import DialogueBlock from "@/components/ui/DialogueBlock";
import { TASK_ORDER, TASK_META, type CharacterWithAudition } from "@/lib/types";

interface CharacterAccordionProps {
  characters: CharacterWithAudition[];
}

export default function CharacterAccordion({ characters }: CharacterAccordionProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {characters.map((c) => {
        const isExpanded = expanded === c.name;
        const isDialogue = (text: string) =>
          /USER:\s/i.test(text) || /^[A-Za-z\s]+:\s/m.test(text);

        return (
          <div
            key={c.name}
            className="rounded-xl border border-bone/10 bg-surface overflow-hidden transition-all"
          >
            <button
              type="button"
              onClick={() => setExpanded(isExpanded ? null : c.name)}
              className="w-full p-4 text-left cursor-pointer"
            >
              <div className="flex items-center gap-4">
                {c.avatarUrl && (
                  <div className="overflow-hidden rounded-lg shrink-0" style={{ width: 48, height: 48 }}>
                    <Image
                      src={c.avatarUrl}
                      alt={c.name}
                      width={48}
                      height={48}
                      style={{ imageRendering: "pixelated" }}
                      unoptimized
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-serif text-base font-bold text-bone">{c.name}</p>
                </div>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  className={`text-bone transition-transform ${isExpanded ? "rotate-90" : ""}`}
                >
                  <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </div>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 flex flex-col gap-4 border-t border-bone/10 pt-4">
                    {TASK_ORDER.map((taskId) => {
                      const meta = TASK_META[taskId];
                      const response = c.responses[taskId];
                      if (!response) return null;
                      return (
                        <div key={taskId}>
                          <div className="mb-2 flex items-center gap-2">
                            <span className="font-mono text-[10px] uppercase tracking-wider text-bone">
                              Task {meta.number}
                            </span>
                            <span className="font-mono text-[10px] text-bone">--</span>
                            <span className="font-mono text-[10px] uppercase tracking-wider text-bone">
                              {meta.label}
                            </span>
                          </div>
                          {isDialogue(response) ? (
                            <DialogueBlock text={response} characterName={c.name} />
                          ) : (
                            <p className="font-sans text-sm leading-relaxed text-bone whitespace-pre-wrap">
                              {response}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
