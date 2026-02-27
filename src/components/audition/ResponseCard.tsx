"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import DialogueBlock from "@/components/ui/DialogueBlock";
import VersaceCigarette from "@/components/ui/VersaceCigarette";

interface ResponseCardProps {
  response: string;
  characterName: string;
}

export default function ResponseCard({ response, characterName }: ResponseCardProps) {
  const isDialogue = /USER:\s/i.test(response) || /^[A-Za-z\s]+:\s/m.test(response);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card variant="active" className="max-w-2xl">
        <div className="mb-2 flex items-center gap-2">
          <VersaceCigarette size={20} accent="teal" />
          <span className="font-sans text-[10px] font-medium uppercase tracking-widest text-bone">
            {characterName} responds
          </span>
        </div>
        {isDialogue ? (
          <DialogueBlock text={response} characterName={characterName} className="text-base" />
        ) : (
          <p className="font-sans text-base leading-relaxed text-bone whitespace-pre-wrap">
            {response}
          </p>
        )}
      </Card>
    </motion.div>
  );
}
