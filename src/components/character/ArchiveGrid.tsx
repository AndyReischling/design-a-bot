"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { CharacterSheet } from "@/lib/types";

interface ArchiveGridProps {
  onSelect?: (character: CharacterSheet) => void;
}

export default function ArchiveGrid({ onSelect }: ArchiveGridProps) {
  const [characters, setCharacters] = useState<CharacterSheet[]>([]);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/archive.json")
      .then((res) => res.json())
      .then((data) => {
        setCharacters(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return characters;
    const q = search.toLowerCase();
    return characters.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.source && c.source.toLowerCase().includes(q)) ||
        c.backstory.toLowerCase().includes(q)
    );
  }, [characters, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="font-sans text-sm text-ash">Loading archive...</p>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="font-sans text-sm text-ash">
          No archive data found. Run the generation script to populate.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Search"
        placeholder="Search by name, source, or backstory..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <p className="font-sans text-xs text-ash">
        {filtered.length} character{filtered.length !== 1 ? "s" : ""}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((char, i) => (
          <motion.div
            key={char.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.5) }}
          >
            <Card
              variant="archive"
              className="cursor-pointer"
              onClick={() =>
                setExpanded(expanded === char.id ? null : char.id)
              }
              whileHover={{
                rotateX: 1,
                rotateY: 1,
                transition: { duration: 0.2 },
              }}
              style={{ perspective: 1000 }}
            >
              <h3 className="font-serif text-base font-semibold text-bone">
                {char.name}
              </h3>
              <p className="mt-0.5 line-clamp-1 font-sans text-xs text-bone/60">
                {char.backstory}
              </p>
              {char.source && (
                <p className="mt-1 font-sans text-[10px] uppercase tracking-wider text-ash">
                  {char.source}
                </p>
              )}

              <AnimatePresence>
                {expanded === char.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 flex flex-col gap-2 border-t border-white/[0.06] pt-3">
                      <Detail label="Desire" value={char.desire} />
                      <Detail label="Fear" value={char.fear} />
                      <Detail
                        label="Status"
                        value={char.status}
                      />
                      <Detail
                        label="Sounds like"
                        value={char.voiceSoundsLike}
                      />
                      <Detail
                        label="Never sounds like"
                        value={char.voiceNeverLike}
                      />
                      <Detail
                        label="Forbidden moves"
                        value={char.forbiddenMoves}
                      />
                      {onSelect && (
                        <Button
                          variant="secondary"
                          className="mt-2 w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(char);
                          }}
                        >
                          Use as Inspiration
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-sans text-[10px] font-medium uppercase tracking-widest text-ash">
        {label}
      </span>
      <p className="font-sans text-xs text-bone/70">{value}</p>
    </div>
  );
}
