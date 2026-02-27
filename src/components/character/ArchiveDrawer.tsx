"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import ArchiveGrid from "./ArchiveGrid";
import type { CharacterSheet } from "@/lib/types";

interface ArchiveDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (character: CharacterSheet) => void;
}

export default function ArchiveDrawer({
  open,
  onClose,
  onSelect,
}: ArchiveDrawerProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-void/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-2xl flex-col bg-surface shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <div>
                <h2 className="font-serif text-xl font-semibold text-bone">
                  Character Archive
                </h2>
                <p className="font-sans text-xs text-bone">
                  60 characters for inspiration
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-bone transition-colors hover:bg-white/5 hover:text-bone"
                aria-label="Close archive"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M12 4L4 12M4 4l8 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <ArchiveGrid onSelect={onSelect} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
