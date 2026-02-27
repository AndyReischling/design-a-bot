"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import ProgressRing from "@/components/ui/ProgressRing";
import type { CharacterSheet } from "@/lib/types";

interface CharacterCardProps {
  character: Partial<CharacterSheet>;
  compact?: boolean;
}

function Placeholder({ width = "100%" }: { width?: string }) {
  return (
    <div
      className="h-3 rounded border border-white/[0.04] bg-white/[0.02]"
      style={{ width }}
    />
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-sans text-[10px] font-medium uppercase tracking-widest text-bone">
        {label}
      </span>
      {value ? (
        <p className="font-sans text-sm text-bone">{value}</p>
      ) : (
        <Placeholder width="70%" />
      )}
    </div>
  );
}

export function computeProgress(c: Partial<CharacterSheet>): number {
  const fields = [
    c.name,
    c.backstory,
    c.desire,
    c.fear,
    c.status,
    c.voiceSoundsLike,
    c.voiceNeverLike,
    c.signatureMoves && c.signatureMoves.filter((m) => m.trim()).length >= 3
      ? "ok"
      : undefined,
    c.forbiddenMoves,
    c.innerLife,
    c.outerLife,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

export default function CharacterCard({
  character,
  compact = false,
}: CharacterCardProps) {
  const progress = computeProgress(character);
  const isComplete = progress >= 100;

  return (
    <Card
      variant="default"
      className={`transition-all duration-500 ${
        isComplete
          ? "border-teal/40 shadow-[0_0_30px_rgba(63,207,207,0.1)]"
          : ""
      }`}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <span className="font-sans text-[10px] font-medium uppercase tracking-widest text-orchid">
            Character Dossier
          </span>
          <h2 className="mt-1 font-serif text-2xl font-bold text-bone">
            {character.name || (
              <span className="text-bone italic">Unnamed</span>
            )}
          </h2>
          {character.source && (
            <p className="font-sans text-xs text-bone mt-0.5">{character.source}</p>
          )}
        </div>
        <ProgressRing progress={progress} size={52} strokeWidth={3} />
      </div>

      {!compact && (
        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Field label="Backstory" value={character.backstory} />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Desire" value={character.desire} />
            <Field label="Fear" value={character.fear} />
          </div>

          <Field
            label="Status"
            value={
              character.status
                ? character.status.charAt(0).toUpperCase() +
                  character.status.slice(1) +
                  " status"
                : undefined
            }
          />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Sounds like" value={character.voiceSoundsLike} />
            <Field label="Never sounds like" value={character.voiceNeverLike} />
          </div>

          {character.signatureMoves &&
            character.signatureMoves.some((m) => m.trim()) && (
              <div className="flex flex-col gap-1">
                <span className="font-sans text-[10px] font-medium uppercase tracking-widest text-bone">
                  Signature Moves
                </span>
                <ul className="flex flex-col gap-0.5">
                  {character.signatureMoves
                    .filter((m) => m.trim())
                    .map((m, i) => (
                      <li
                        key={i}
                        className="font-sans text-sm text-bone before:mr-2 before:text-amber before:content-['›']"
                      >
                        {m}
                      </li>
                    ))}
                </ul>
              </div>
            )}

          <Field label="Forbidden Moves" value={character.forbiddenMoves} />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Keeps to themselves" value={character.innerLife} />
            <Field label="Says out loud" value={character.outerLife} />
          </div>
        </motion.div>
      )}

      {compact && (
        <div className="flex flex-wrap gap-2">
          {character.desire && (
            <span className="rounded-full bg-amber/10 px-2.5 py-1 font-sans text-xs text-amber">
              Desires: {character.desire}
            </span>
          )}
          {character.fear && (
            <span className="rounded-full bg-orchid/10 px-2.5 py-1 font-sans text-xs text-orchid">
              Fears: {character.fear}
            </span>
          )}
          {character.status && (
            <span className="rounded-full bg-teal/10 px-2.5 py-1 font-sans text-xs text-teal">
              {character.status} status
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
