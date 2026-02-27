"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import CoherenceDot from "./CoherenceDot";

interface MomentCardProps {
  taskNumber: string;
  taskLabel: string;
  response: string;
  coherenceScore: number; // 1-5
  index: number;
}

export default function MomentCard({
  taskNumber,
  taskLabel,
  response,
  coherenceScore,
  index,
}: MomentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Card variant="default">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-orchid">
              Task {taskNumber}
            </span>
            <span className="font-mono text-xs text-ash">—</span>
            <span className="font-mono text-xs text-orchid">{taskLabel}</span>
          </div>
          <CoherenceDot score={coherenceScore} />
        </div>
        <p className="font-sans text-sm leading-relaxed text-bone/80 whitespace-pre-wrap">
          {response}
        </p>
      </Card>
    </motion.div>
  );
}
