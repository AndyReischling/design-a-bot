"use client";

interface DialogueBlockProps {
  text: string;
  characterName?: string;
  className?: string;
}

function parseDialogueLine(line: string): { speaker: "user" | "character"; name: string; text: string } | null {
  const colonIdx = line.indexOf(":");
  if (colonIdx === -1) return null;
  const speaker = line.slice(0, colonIdx).trim();
  const text = line.slice(colonIdx + 1).trim();
  if (!speaker || !text) return null;
  if (/^USER$/i.test(speaker)) {
    return { speaker: "user", name: "USER", text };
  }
  return { speaker: "character", name: speaker, text };
}

export default function DialogueBlock({ text, characterName, className = "" }: DialogueBlockProps) {
  const lines = text.split("\n").filter(Boolean);
  if (lines.length === 0) return null;

  return (
    <div className={`space-y-2 font-sans text-sm leading-relaxed ${className}`}>
      {lines.map((line, i) => {
        const parsed = parseDialogueLine(line);
        if (!parsed) {
          return (
            <p key={i} className="text-bone">
              {line}
            </p>
          );
        }
        if (parsed.speaker === "user") {
          return (
            <div key={i} className="flex gap-3">
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-bone">
                USER
              </span>
              <p className="text-bone">{parsed.text}</p>
            </div>
          );
        }
        return (
          <div key={i} className="flex gap-3">
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-amber">
              {parsed.name}
            </span>
            <p className="text-bone">{parsed.text}</p>
          </div>
        );
      })}
    </div>
  );
}
