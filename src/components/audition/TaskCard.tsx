"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface TaskCardProps {
  number: string;
  label: string;
  scenario: string;
  onPerform: () => void;
  loading: boolean;
  performed: boolean;
}

export default function TaskCard({
  number,
  label,
  scenario,
  onPerform,
  loading,
  performed,
}: TaskCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card variant="default" className="max-w-2xl">
        <div className="mb-4 flex items-center gap-3">
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-orchid">
            Task {number}
          </span>
          <span className="font-mono text-xs text-ash">—</span>
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-orchid">
            {label}
          </span>
        </div>

        <p className="mb-6 font-sans text-base leading-relaxed text-bone/80">
          {scenario}
        </p>

        {!performed && (
          <Button
            variant="primary"
            loading={loading}
            onClick={onPerform}
            disabled={loading}
          >
            Perform
          </Button>
        )}
      </Card>
    </motion.div>
  );
}
