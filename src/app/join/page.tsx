"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import RobotAvatar from "@/components/ui/RobotAvatar";

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const handleJoin = () => {
    const clean = code.trim().toUpperCase();
    if (clean.length === 4) {
      router.push(`/join/${clean}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <motion.div
        className="flex max-w-sm flex-col items-center gap-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <RobotAvatar size={80} />

        <div>
          <h1 className="font-serif text-3xl font-bold text-bone">
            Join a Session
          </h1>
          <p className="mt-2 font-sans text-sm text-bone/50">
            Enter the 4-character room code shown on the host screen.
          </p>
        </div>

        <div className="w-full">
          <Input
            label="Room Code"
            placeholder="e.g. AX7Q"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
            className="text-center font-mono text-2xl tracking-[0.2em]"
          />
        </div>

        <Button
          variant="primary"
          disabled={code.trim().length !== 4}
          onClick={handleJoin}
          className="w-full"
        >
          Join
        </Button>
      </motion.div>
    </div>
  );
}
