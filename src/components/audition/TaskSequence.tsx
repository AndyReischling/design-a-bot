"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TaskCard from "./TaskCard";
import ResponseCard from "./ResponseCard";
import Button from "@/components/ui/Button";
import VersaceCigarette from "@/components/ui/VersaceCigarette";
import { useAppState, useAppDispatch } from "@/lib/context";
import { performTask } from "@/lib/api";
import { TASK_ORDER, TASK_META, type TaskType, type CharacterSheet } from "@/lib/types";

interface TaskSequenceProps {
  onComplete: () => void;
}

export default function TaskSequence({ onComplete }: TaskSequenceProps) {
  const { character, responses, currentTask } = useAppState();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const currentTaskId = TASK_ORDER[currentTask];
  const meta = currentTaskId ? TASK_META[currentTaskId] : null;
  const currentResponse = currentTaskId ? responses[currentTaskId] : undefined;
  const allComplete = currentTask >= TASK_ORDER.length;

  const handlePerform = useCallback(async () => {
    if (!character || !currentTaskId) return;
    setLoading(true);
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const responseText = await performTask(
        character as CharacterSheet,
        currentTaskId
      );
      dispatch({
        type: "SET_RESPONSE",
        payload: {
          taskId: currentTaskId,
          response: responseText,
          timestamp: Date.now(),
        },
      });
    } catch (err) {
      console.error("Task failed:", err);
    } finally {
      setLoading(false);
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [character, currentTaskId, dispatch]);

  const handleNext = useCallback(() => {
    if (currentTask >= TASK_ORDER.length - 1) {
      onComplete();
    } else {
      dispatch({ type: "NEXT_TASK" });
    }
  }, [currentTask, dispatch, onComplete]);

  return (
    <div className="flex flex-col gap-6" role="region" aria-label="Audition task sequence">
      {/* Live status for screen readers */}
      <div className="sr-only" aria-live="polite">
        {loading
          ? `Generating response for task ${currentTask + 1} of 6...`
          : currentResponse
            ? `Response received for task ${currentTask + 1}. ${
                currentTask < TASK_ORDER.length - 1
                  ? "Press Next Task to continue."
                  : "Press See Results to view the coherence report."
              }`
            : `Task ${currentTask + 1} of 6: ${meta?.label || ""}`}
      </div>

      {/* Completed task chips */}
      <div className="flex flex-wrap gap-2" role="list" aria-label="Completed tasks">
        {TASK_ORDER.slice(0, currentTask).map((taskId, i) => {
          const t = TASK_META[taskId];
          const accents = ["amber", "teal", "orchid"] as const;
          const accent = accents[i % 3];
          return (
            <motion.div
              key={taskId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              role="listitem"
              className="flex items-center gap-1.5 rounded-full bg-bone/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-bone"
            >
              <VersaceCigarette size={14} accent={accent} />
              {t.number} {t.label}
            </motion.div>
          );
        })}
      </div>

      {/* Current task */}
      <AnimatePresence mode="wait">
        {!allComplete && meta && (
          <div key={currentTaskId} className="flex flex-col gap-4">
            <TaskCard
              number={meta.number}
              label={meta.label}
              scenario={meta.scenario}
              onPerform={handlePerform}
              loading={loading}
              performed={!!currentResponse}
            />

            {currentResponse && (
              <>
                <ResponseCard
                  response={currentResponse.response}
                  characterName={character?.name || "Character"}
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button variant="secondary" onClick={handleNext}>
                    {currentTask >= TASK_ORDER.length - 1
                      ? "See Results"
                      : "Next Task"}
                  </Button>
                </motion.div>
              </>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div
        className="flex items-center gap-2"
        role="progressbar"
        aria-valuenow={currentTask}
        aria-valuemin={0}
        aria-valuemax={TASK_ORDER.length}
        aria-label={`Audition progress: ${currentTask} of ${TASK_ORDER.length} tasks complete`}
      >
        {TASK_ORDER.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              i < currentTask
                ? "bg-teal"
                : i === currentTask
                  ? "bg-amber"
                  : "bg-white/[0.06]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
