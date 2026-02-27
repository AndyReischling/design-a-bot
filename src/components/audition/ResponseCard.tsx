"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";

interface ResponseCardProps {
  response: string;
  characterName: string;
}

export default function ResponseCard({ response, characterName }: ResponseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card variant="active" className="max-w-2xl">
        <span className="mb-2 block font-sans text-[10px] font-medium uppercase tracking-widest text-amber">
          {characterName} responds
        </span>
        <p className="font-sans text-base leading-relaxed text-bone/90 whitespace-pre-wrap">
          {response}
        </p>
      </Card>
    </motion.div>
  );
}
