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
  onVote: (approvals: Record<string, boolean>) => void;
  hasVoted: boolean;
}

export default function VotingInterface({
  responses,
  allowSelfVote,
  onVote,
  hasVoted,
}: VotingInterfaceProps) {
  const [approvals, setApprovals] = useState<Record<string, boolean | null>>({});

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

  const allVoted = responses.every((r) => {
    if (r.isSelf && !allowSelfVote) return true;
    return approvals[r.botLabel] !== undefined && approvals[r.botLabel] !== null;
  });

  const handleSubmit = () => {
    const result: Record<string, boolean> = {};
    for (const r of responses) {
      if (r.isSelf && !allowSelfVote) continue;
      if (approvals[r.botLabel] !== null && approvals[r.botLabel] !== undefined) {
        result[r.botLabel] = approvals[r.botLabel]!;
      }
    }
    onVote(result);
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="font-sans text-xs font-medium uppercase tracking-widest text-bone">
        Vote yes or no on each bot
      </p>

      <div className="flex flex-col gap-3">
        {responses.map((r) => {
          const disabled = r.isSelf && !allowSelfVote;
          const vote = approvals[r.botLabel];
          const isDialogue = /USER:\s/i.test(r.response) || /^[A-Za-z\s]+:\s/m.test(r.response);

          return (
            <motion.div
              key={r.botLabel}
              className={`
                w-full rounded-xl border p-4 transition-all duration-200
                ${disabled ? "opacity-40" : ""}
                ${
                  vote === true
                    ? "border-teal/60 bg-teal/5"
                    : vote === false
                      ? "border-orchid/60 bg-orchid/5"
                      : "border-bone/10 bg-surface"
                }
              `}
            >
              <div className="mb-3">
                <span className="font-mono text-[10px] uppercase tracking-wider text-orchid">
                  {r.botLabel}
                </span>
                {r.isSelf && !allowSelfVote && (
                  <span className="ml-2 font-sans text-[10px] text-bone">(yours - skipped)</span>
                )}
              </div>

              <div className="mb-4">
                {isDialogue ? (
                  <DialogueBlock text={r.response} />
                ) : (
                  <p className="font-sans text-sm leading-relaxed text-bone whitespace-pre-wrap">
                    {r.response}
                  </p>
                )}
              </div>

              {!disabled && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setApprovals((prev) => ({ ...prev, [r.botLabel]: true }))}
                    className={`
                      flex-1 rounded-lg border-2 py-2 font-sans text-sm font-medium transition-all
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
                    onClick={() => setApprovals((prev) => ({ ...prev, [r.botLabel]: false }))}
                    className={`
                      flex-1 rounded-lg border-2 py-2 font-sans text-sm font-medium transition-all
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
            </motion.div>
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
