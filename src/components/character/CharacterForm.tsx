"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import RadioGroup from "@/components/ui/RadioGroup";
import Button from "@/components/ui/Button";
import type { CharacterSheet } from "@/lib/types";

interface CharacterFormProps {
  character: Partial<CharacterSheet>;
  onChange: (updates: Partial<CharacterSheet>) => void;
  avatarUrl?: string | null;
  onGenerateAvatar?: () => void;
  avatarLoading?: boolean;
}

const STATUS_OPTIONS = [
  { value: "higher", label: "Higher Status" },
  { value: "equal", label: "Equal Status" },
  { value: "lower", label: "Lower Status" },
];

const SIGNATURE_GHOSTS = [
  "A thing they always do when greeting someone",
  "How they buy time when they don't know something",
  "Their go-to way of softening bad news",
  "A verbal tic or phrase they lean on",
  "How they close a conversation",
];

const sectionReveal = {
  hidden: { opacity: 0, height: 0, marginBottom: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    marginBottom: 16,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    height: 0,
    marginBottom: 0,
    transition: { duration: 0.2 },
  },
};

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="font-mono text-xs text-orchid">{number}</span>
      <h3 className="font-serif text-lg font-semibold text-bone">{title}</h3>
    </div>
  );
}

function sectionHasContent(section: number, c: Partial<CharacterSheet>): boolean {
  switch (section) {
    case 1:
      return !!(c.name || c.backstory || c.desire || c.fear);
    case 2:
      return !!c.status;
    case 3:
      return !!(c.voiceSoundsLike || c.voiceNeverLike);
    case 4:
      return !!(c.signatureMoves && c.signatureMoves.some((m) => m.trim()));
    case 5:
      return !!c.forbiddenMoves;
    case 6:
      return !!(c.innerLife || c.outerLife);
    case 7:
      return !!c.appearance;
    default:
      return false;
  }
}

export default function CharacterForm({ character, onChange, avatarUrl, onGenerateAvatar, avatarLoading }: CharacterFormProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set([1])
  );

  const toggleSection = (n: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  const isSectionVisible = (n: number): boolean => {
    if (n === 1) return true;
    return sectionHasContent(n - 1, character);
  };

  const handleSignatureMove = (index: number, value: string) => {
    const moves = [...(character.signatureMoves || ["", "", "", "", ""])];
    moves[index] = value;
    onChange({ signatureMoves: moves });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Section 1: Identity */}
      <Card
        variant={expandedSections.has(1) ? "active" : "default"}
        className="cursor-pointer"
      >
        <div onClick={() => toggleSection(1)}>
          <SectionHeader number="01" title="Identity" />
        </div>
        <AnimatePresence>
          {expandedSections.has(1) && (
            <motion.div
              variants={sectionReveal}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col gap-4 overflow-hidden"
            >
              <Input
                label="Name"
                placeholder="What should we call them?"
                value={character.name || ""}
                onChange={(e) => onChange({ name: e.target.value })}
              />
              <Textarea
                label="Who is this person?"
                placeholder="2-3 sentences of backstory..."
                value={character.backstory || ""}
                onChange={(e) => onChange({ backstory: e.target.value })}
              />
              <Input
                label="What do they desire?"
                placeholder="One core want"
                value={character.desire || ""}
                onChange={(e) => onChange({ desire: e.target.value })}
              />
              <Input
                label="What do they fear?"
                placeholder="One core fear"
                value={character.fear || ""}
                onChange={(e) => onChange({ fear: e.target.value })}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Section 2: Status Relationship */}
      <AnimatePresence>
        {isSectionVisible(2) && (
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card
              variant={expandedSections.has(2) ? "active" : "default"}
              className="cursor-pointer"
            >
              <div onClick={() => toggleSection(2)}>
                <SectionHeader number="02" title="Status Relationship" />
              </div>
              <AnimatePresence>
                {expandedSections.has(2) && (
                  <motion.div
                    variants={sectionReveal}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="overflow-hidden"
                  >
                    <RadioGroup
                      label="In conversation, this character is..."
                      helperText="Status shapes how they greet, correct, and refuse. A king says no differently than a servant."
                      value={character.status || ""}
                      onChange={(v) =>
                        onChange({
                          status: v as CharacterSheet["status"],
                        })
                      }
                      options={STATUS_OPTIONS}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section 3: Voice Palette */}
      <AnimatePresence>
        {isSectionVisible(3) && (
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card
              variant={expandedSections.has(3) ? "active" : "default"}
              className="cursor-pointer"
            >
              <div onClick={() => toggleSection(3)}>
                <SectionHeader number="03" title="Voice Palette" />
              </div>
              <AnimatePresence>
                {expandedSections.has(3) && (
                  <motion.div
                    variants={sectionReveal}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex flex-col gap-4 overflow-hidden"
                  >
                    <Textarea
                      label="Sounds like"
                      placeholder={'e.g., "A patient librarian who\'s seen too much"'}
                      value={character.voiceSoundsLike || ""}
                      onChange={(e) =>
                        onChange({ voiceSoundsLike: e.target.value })
                      }
                    />
                    <Textarea
                      label="Never sounds like"
                      placeholder={'e.g., "Corporate jargon, sycophantic, bubbly"'}
                      value={character.voiceNeverLike || ""}
                      onChange={(e) =>
                        onChange({ voiceNeverLike: e.target.value })
                      }
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section 4: Signature Moves */}
      <AnimatePresence>
        {isSectionVisible(4) && (
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card
              variant={expandedSections.has(4) ? "active" : "default"}
              className="cursor-pointer"
            >
              <div onClick={() => toggleSection(4)}>
                <SectionHeader number="04" title="Signature Moves" />
              </div>
              <AnimatePresence>
                {expandedSections.has(4) && (
                  <motion.div
                    variants={sectionReveal}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex flex-col gap-3 overflow-hidden"
                  >
                    {SIGNATURE_GHOSTS.map((ghost, i) => (
                      <Input
                        key={i}
                        label={`Move ${i + 1}`}
                        placeholder={ghost}
                        value={character.signatureMoves?.[i] || ""}
                        onChange={(e) => handleSignatureMove(i, e.target.value)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section 5: Forbidden Moves */}
      <AnimatePresence>
        {isSectionVisible(5) && (
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card
              variant={expandedSections.has(5) ? "active" : "default"}
              className="cursor-pointer"
            >
              <div onClick={() => toggleSection(5)}>
                <SectionHeader number="05" title="Forbidden Moves" />
              </div>
              <AnimatePresence>
                {expandedSections.has(5) && (
                  <motion.div
                    variants={sectionReveal}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="overflow-hidden"
                  >
                    <Textarea
                      label="Lines they won't cross"
                      placeholder="What would make this character break? What do they refuse to do or say, no matter what?"
                      helperText="What would make this character break? What do they refuse to do or say, no matter what?"
                      value={character.forbiddenMoves || ""}
                      onChange={(e) =>
                        onChange({ forbiddenMoves: e.target.value })
                      }
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section 6: Inner vs. Outer */}
      <AnimatePresence>
        {isSectionVisible(6) && (
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card
              variant={expandedSections.has(6) ? "active" : "default"}
              className="cursor-pointer"
            >
              <div onClick={() => toggleSection(6)}>
                <SectionHeader number="06" title="Inner vs. Outer" />
              </div>
              <AnimatePresence>
                {expandedSections.has(6) && (
                  <motion.div
                    variants={sectionReveal}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex flex-col gap-4 overflow-hidden"
                  >
                    <Textarea
                      label="What they keep to themselves"
                      placeholder="The inner life they never reveal..."
                      value={character.innerLife || ""}
                      onChange={(e) =>
                        onChange({ innerLife: e.target.value })
                      }
                    />
                    <Textarea
                      label="What they say out loud"
                      placeholder="The version of themselves they present..."
                      helperText="The gap between these two is where believability lives."
                      value={character.outerLife || ""}
                      onChange={(e) =>
                        onChange({ outerLife: e.target.value })
                      }
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section 7: Appearance */}
      <AnimatePresence>
        {isSectionVisible(7) && (
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card
              variant={expandedSections.has(7) ? "active" : "default"}
              className="cursor-pointer"
            >
              <div onClick={() => toggleSection(7)}>
                <SectionHeader number="07" title="What Do They Look Like?" />
              </div>
              <AnimatePresence>
                {expandedSections.has(7) && (
                  <motion.div
                    variants={sectionReveal}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex flex-col gap-4 overflow-hidden"
                  >
                    <Textarea
                      label="Describe your bot's appearance"
                      placeholder="e.g., A squat orange robot with tired eyes and a dented chest plate, like it's been through too many customer complaints..."
                      helperText="This will be used to generate a pixel art avatar for your character."
                      value={character.appearance || ""}
                      onChange={(e) => onChange({ appearance: e.target.value })}
                    />
                    {character.appearance && character.appearance.trim().length > 5 && (
                      <Button
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onGenerateAvatar?.();
                        }}
                        loading={avatarLoading}
                        disabled={avatarLoading}
                      >
                        {avatarUrl ? "Regenerate Avatar" : "Generate Avatar"}
                      </Button>
                    )}
                    {avatarUrl && (
                      <motion.div
                        className="flex justify-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <div className="overflow-hidden rounded-xl border border-bone/10" style={{ width: 192, height: 192 }}>
                          <Image
                            src={avatarUrl}
                            alt={`${character.name || "Character"} avatar`}
                            width={192}
                            height={192}
                            style={{ imageRendering: "pixelated" }}
                            unoptimized
                          />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
