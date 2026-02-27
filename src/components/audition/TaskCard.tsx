"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import VersaceCigarette from "@/components/ui/VersaceCigarette";

const ACCENTS = ["amber", "teal", "orchid"] as const;

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
  const accent = ACCENTS[(parseInt(number, 10) - 1) % 3];

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card variant="default" className="max-w-2xl">
        <div className="mb-4 flex items-center gap-3">
          <VersaceCigarette size={24} accent={accent} />
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-bone">
            Task {number}
          </span>
          <span className="font-mono text-xs text-bone">—</span>
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-bone">
            {label}
          </span>
        </div>

        <p className="mb-6 font-sans text-base leading-relaxed text-bone">
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
