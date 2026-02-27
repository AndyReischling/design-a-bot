"use client";

interface VoteCounterProps {
  votesIn: number;
  totalVoters: number;
}

export default function VoteCounter({ votesIn, totalVoters }: VoteCounterProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-2xl text-amber tabular-nums">{votesIn}</span>
        <span className="font-mono text-sm text-bone">of</span>
        <span className="font-mono text-2xl text-bone tabular-nums">{totalVoters}</span>
      </div>
      <span className="font-sans text-xs uppercase tracking-wider text-bone">votes in</span>
    </div>
  );
}
