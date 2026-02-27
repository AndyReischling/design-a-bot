"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface PixelBotProps {
  avatarUrl: string;
  name: string;
  size?: number;
  delay?: number;
}

export default function PixelBot({ avatarUrl, name, size = 96, delay = 0 }: PixelBotProps) {
  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, scale: 0, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.5, type: "spring", stiffness: 200 }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 1.2 + delay * 0.3, repeat: Infinity, ease: "easeInOut" }}
        className="overflow-hidden rounded-lg"
        style={{ width: size, height: size }}
      >
        <Image
          src={avatarUrl}
          alt={`${name} pixel bot`}
          width={size}
          height={size}
          className="pixelated"
          style={{ imageRendering: "pixelated" }}
          unoptimized
        />
      </motion.div>
      <p className="font-mono text-[10px] uppercase tracking-wider text-bone">{name}</p>
    </motion.div>
  );
}
