"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import RobotAvatar from "@/components/ui/RobotAvatar";

export default function HostCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.code && data.hostId) {
        sessionStorage.setItem(`host_${data.code}`, data.hostId);
        router.push(`/host/${data.code}`);
      }
    } catch {
      alert("Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <motion.div
        className="flex max-w-md flex-col items-center gap-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <RobotAvatar size={100} />

        <div>
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-bone">
            Multiplayer
          </span>
          <h1 className="mt-2 font-serif text-4xl font-bold text-bone">
            Host a Session
          </h1>
          <p className="mt-3 font-sans text-bone">
            Create a room for your group. Players join on their own devices.
            You control the pacing on this screen.
          </p>
        </div>

        <Card variant="default" className="w-full text-left">
          <h3 className="font-sans text-xs font-medium uppercase tracking-widest text-bone mb-3">
            How it works
          </h3>
          <ol className="flex flex-col gap-2 font-sans text-sm text-bone">
            <li>1. Create a session and share the room code</li>
            <li>2. Players build characters on their own devices</li>
            <li>3. All characters audition simultaneously via AI</li>
            <li>4. The group votes on the best responses each round</li>
            <li>5. Identities revealed, dual leaderboard shown</li>
          </ol>
        </Card>

        <Button
          variant="primary"
          loading={loading}
          onClick={handleCreate}
          className="px-10 py-4 text-base"
        >
          Create Session
        </Button>
      </motion.div>
    </div>
  );
}
