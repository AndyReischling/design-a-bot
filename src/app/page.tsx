"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Particles from "@/components/ui/Particles";
import RobotAvatar from "@/components/ui/RobotAvatar";
import VersaceCigarette from "@/components/ui/VersaceCigarette";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.2 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-16">
      <Particles count={24} />

      {/* Ambient background gradients */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-amber/[0.04] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-teal/[0.03] blur-[100px]" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orchid/[0.03] blur-[80px]" />
      </div>

      <motion.div
        className="relative z-10 flex max-w-2xl flex-col items-center gap-8 text-center"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Robot Avatar */}
        <motion.div variants={fadeUp}>
          <RobotAvatar size={120} />
        </motion.div>

        {/* Title */}
        <motion.div
          variants={fadeUp}
          className="flex items-center justify-center gap-4 sm:gap-6"
        >
          <VersaceCigarette size={40} accent="amber" className="hidden sm:block" />
          <h1 className="font-serif text-6xl font-bold tracking-tight text-bone sm:text-7xl md:text-8xl">
            THE AUDITION
          </h1>
          <VersaceCigarette size={40} accent="orchid" className="hidden sm:block" />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="max-w-md font-sans text-lg text-bone sm:text-xl"
        >
          Design a character. Give them a job. See if they hold together.
        </motion.p>

        {/* Rules card */}
        <motion.div variants={fadeUp}>
          <Card
            variant="default"
            className="max-w-lg border-bone/10 bg-surface/80 backdrop-blur-sm"
          >
            <p className="font-sans text-sm leading-relaxed text-bone">
              You&rsquo;ll build a fictional character from scratch — their voice,
              their fears, their signature moves. Then they&rsquo;ll be hired as a
              customer service agent at a bank app and face six escalating
              scenarios. The question isn&rsquo;t whether they can do the job. It&rsquo;s
              whether they can be <em className="text-teal">themselves</em> while
              doing it.
            </p>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-3 pb-12 sm:flex-row sm:gap-4">
          <Link href="/create">
            <Button variant="primary" className="px-8 py-4 text-base">
              Solo Audition
            </Button>
          </Link>
          <Link href="/host">
            <Button variant="secondary" className="px-8 py-4 text-base">
              Host a Session
            </Button>
          </Link>
          <Link href="/join">
            <Button variant="accent" className="px-8 py-4 text-base">
              Join a Session
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
