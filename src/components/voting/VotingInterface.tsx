"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DialogueBlock from "@/components/ui/DialogueBlock";
import { TASK_ORDER, TASK_META, type TaskType, type CharacterWithAudition } from "@/lib/types";

interface VotingInterfaceProps {
  characters: CharacterWithAudition[];
  selfPlayerId?: string;
  allowSelfVote: boolean;
  onVote: (approvals: Record<string, boolean>) => void;
  hasVoted: boolean;
}

export default function VotingInterface({
  characters,
  selfPlayerId,
  allowSelfVote,
  onVote,
  hasVoted,
}: VotingInterfaceProps) {
  const [approvals, setApprovals] = useState<Record<string, boolean | null>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  if (hasVoted) {
    return (
      <div className="flex flex-col items-center gap-2 py-8">
        <div className="h-8 w-8 rounded-full bg-teal/20 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8.5L6.5 12L13 4" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="font-sans text-sm text-bone">Votes submitted. Waiting for others...</p>
      </div>
    );
  }

  const votableChars = characters.filter((c) => {
    if (!allowSelfVote && c.playerId === selfPlayerId) return false;
    return true;
  });

  const allVoted = votableChars.every(
    (c) => approvals[c.name] !== undefined && approvals[c.name] !== null
  );

  const handleSubmit = () => {
    const result: Record<string, boolean> = {};
    for (const c of votableChars) {
      if (approvals[c.name] !== null && approvals[c.name] !== undefined) {
        result[c.name] = approvals[c.name]!;
      }
    }
    onVote(result);
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="font-sans text-xs font-medium uppercase tracking-widest text-bone">
        Review each character and vote yes or no
      </p>

      <div className="flex flex-col gap-4">
        {characters.map((c) => {
          const isSelf = !allowSelfVote && c.playerId === selfPlayerId;
          const isExpanded = expanded === c.name;
          const vote = approvals[c.name];
          const isDialogue = (text: string) =>
            /USER:\s/i.test(text) || /^[A-Za-z\s]+:\s/m.test(text);

          return (
            <div
              key={c.name}
              className={`
                rounded-xl border transition-all duration-200 overflow-hidden
                ${isSelf ? "opacity-40" : ""}
                ${
                  vote === true
                    ? "border-teal/60 bg-teal/5"
                    : vote === false
                      ? "border-orchid/60 bg-orchid/5"
                      : "border-bone/10 bg-surface"
                }
              `}
            >
              <button
                type="button"
                onClick={() => setExpanded(isExpanded ? null : c.name)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-center gap-4">
                  {c.avatarUrl && (
                    <div className="overflow-hidden rounded-lg shrink-0" style={{ width: 56, height: 56 }}>
                      <Image
                        src={c.avatarUrl}
                        alt={c.name}
                        width={56}
                        height={56}
                        className="pixelated"
                        style={{ imageRendering: "pixelated" }}
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-serif text-lg font-bold text-bone">{c.name}</p>
                    {isSelf && (
                      <span className="font-sans text-[10px] text-bone">(yours -- skipped)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {vote === true && (
                      <span className="rounded-full bg-teal/20 px-2 py-0.5 font-mono text-[10px] text-teal">YES</span>
                    )}
                    {vote === false && (
                      <span className="rounded-full bg-orchid/20 px-2 py-0.5 font-mono text-[10px] text-orchid">NO</span>
                    )}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      className={`text-bone transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    >
                      <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                  </div>
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
                    <div className="px-4 pb-4 flex flex-col gap-3 border-t border-bone/10 pt-4">
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

                      {!isSelf && (
                        <div className="flex gap-2 pt-2 border-t border-bone/10">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setApprovals((prev) => ({ ...prev, [c.name]: true }));
                            }}
                            className={`
                              flex-1 rounded-lg border-2 py-2.5 font-sans text-sm font-medium transition-all
                              ${
                                vote === true
                                  ? "border-teal bg-teal/20 text-teal"
                                  : "border-bone/10 text-bone hover:border-teal/50"
                              }
                            `}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setApprovals((prev) => ({ ...prev, [c.name]: false }));
                            }}
                            className={`
                              flex-1 rounded-lg border-2 py-2.5 font-sans text-sm font-medium transition-all
                              ${
                                vote === false
                                  ? "border-orchid bg-orchid/20 text-orchid"
                                  : "border-bone/10 text-bone hover:border-orchid/50"
                              }
                            `}
                          >
                            No
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <Button
        variant="primary"
        disabled={!allVoted}
        onClick={handleSubmit}
        className="self-end"
      >
        Submit Votes
      </Button>
    </div>
  );
}
