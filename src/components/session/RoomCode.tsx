"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";

interface RoomCodeProps {
  code: string;
  joinUrl: string;
}

export default function RoomCode({ code, joinUrl }: RoomCodeProps) {
  return (
    <Card variant="highlight" className="text-center">
      <p className="font-sans text-xs font-medium uppercase tracking-widest text-ash mb-3">
        Room Code
      </p>
      <motion.p
        className="font-mono text-7xl font-bold tracking-[0.2em] sm:text-8xl md:text-[120px]"
        style={{ color: "var(--amber)" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" as const }}
      >
        {code}
      </motion.p>
      <p className="mt-4 font-sans text-sm text-bone/50 break-all">
        Join at: <span className="text-teal">{joinUrl}</span>
      </p>
    </Card>
  );
}
