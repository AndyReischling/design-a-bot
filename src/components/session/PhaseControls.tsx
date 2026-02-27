"use client";

import Button from "@/components/ui/Button";
import type { SessionStatus } from "@/lib/types";

interface PhaseControlsProps {
  status: SessionStatus;
  onAdvance: () => void;
  canAdvance: boolean;
  loading?: boolean;
  playerCount?: number;
  submittedCount?: number;
  votesIn?: number;
  totalVoters?: number;
}

function getButtonLabel(status: SessionStatus): string {
  switch (status) {
    case "lobby":
      return "Start Character Creation";
    case "creating":
      return "Close Submissions & Begin Auditions";
    case "auditioning":
      return "Auditions in progress...";
    case "presenting":
      return "Open Voting";
    case "voting":
      return "Close Voting & Reveal";
    case "results":
      return "View Full Results";
    default:
      return "Next";
  }
}

export default function PhaseControls({
  status,
  onAdvance,
  canAdvance,
  loading,
  playerCount,
  submittedCount,
  votesIn,
  totalVoters,
}: PhaseControlsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/[0.06] bg-void/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-orchid">
            {status}
          </span>
          {status === "lobby" && playerCount !== undefined && (
            <span className="font-sans text-xs text-ash">
              {playerCount} player{playerCount !== 1 ? "s" : ""} joined
            </span>
          )}
          {status === "creating" && submittedCount !== undefined && playerCount !== undefined && (
            <span className="font-sans text-xs text-ash">
              {submittedCount} / {playerCount} submitted
            </span>
          )}
          {status === "voting" && votesIn !== undefined && totalVoters !== undefined && (
            <span className="font-sans text-xs text-ash">
              {votesIn} of {totalVoters} votes in
            </span>
          )}
        </div>
        <Button
          variant="primary"
          disabled={!canAdvance || status === "auditioning"}
          loading={loading || status === "auditioning"}
          onClick={onAdvance}
        >
          {getButtonLabel(status)}
        </Button>
      </div>
    </div>
  );
}
