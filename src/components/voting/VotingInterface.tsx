"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DialogueBlock from "@/components/ui/DialogueBlock";

interface BotResponse {
  botLabel: string;
  response: string;
  isSelf: boolean;
}

interface VotingInterfaceProps {
  responses: BotResponse[];
  allowSelfVote: boolean;
  onVote: (botLabel: string) => void;
  hasVoted: boolean;
}

export default function VotingInterface({
  responses,
  allowSelfVote,
  onVote,
  hasVoted,
}: VotingInterfaceProps) {
  const [selected, setSelected] = useState<string | null>(null);

  if (hasVoted) {
    return (
      <div className="flex flex-col items-center gap-2 py-8">
        <div className="h-8 w-8 rounded-full bg-teal/20 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8.5L6.5 12L13 4" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="font-sans text-sm text-bone">Vote submitted. Waiting for others...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="font-sans text-xs font-medium uppercase tracking-widest text-bone">
        Tap the most believable response
      </p>

      <div className="flex flex-col gap-3">
        {responses.map((r) => {
          const disabled = r.isSelf && !allowSelfVote;
          const isSelected = selected === r.botLabel;

          return (
            <motion.button
              key={r.botLabel}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && setSelected(r.botLabel)}
              className={`
                w-full text-left rounded-xl border p-4 transition-all duration-200
                ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                ${
                  isSelected
                    ? "border-amber/60 bg-amber/5 shadow-[0_0_16px_rgba(232,148,58,0.1)]"
                    : "border-bone/10 bg-surface hover:border-amber/40"
                }
              `}
              whileTap={!disabled ? { scale: 0.98 } : {}}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-orchid">
                    {r.botLabel}
                  </span>
                  {r.isSelf && !allowSelfVote && (
                    <span className="ml-2 font-sans text-[10px] text-bone">(yours)</span>
                  )}
                  <div className="mt-1">
                    {/USER:\s/i.test(r.response) || /^[A-Za-z\s]+:\s/m.test(r.response) ? (
                      <DialogueBlock text={r.response} />
                    ) : (
                      <p className="font-sans text-sm leading-relaxed text-bone whitespace-pre-wrap">
                        {r.response}
                      </p>
                    )}
                  </div>
                </div>
                <div
                  className={`mt-1 h-5 w-5 shrink-0 rounded-full border-2 transition-all ${
                    isSelected
                      ? "border-amber bg-amber"
                      : "border-ash/30"
                  }`}
                />
              </div>
            </motion.button>
          );
        })}
      </div>

      <Button
        variant="primary"
        disabled={!selected}
        onClick={() => selected && onVote(selected)}
        className="self-end"
      >
        Submit Vote
      </Button>
    </div>
  );
}
