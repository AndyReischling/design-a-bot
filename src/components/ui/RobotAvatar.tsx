"use client";

import { motion } from "framer-motion";

interface RobotAvatarProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export default function RobotAvatar({
  size = 200,
  className = "",
  animate = true,
}: RobotAvatarProps) {
  const scale = size / 200;

  return (
    <motion.div
      className={`inline-flex items-center justify-center ${className}`}
      animate={animate ? { y: [0, -4, 0] } : {}}
      transition={
        animate
          ? { duration: 3, repeat: Infinity, ease: "easeInOut" as const }
          : {}
      }
    >
      <svg
        width={size}
        height={size * 1.25}
        viewBox="0 0 200 250"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main gradient: green top to cyan bottom */}
          <linearGradient id="robotGrad" x1="100" y1="0" x2="100" y2="250" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6BCB77" />
            <stop offset="40%" stopColor="#3FCFCF" />
            <stop offset="100%" stopColor="#4DA8DA" />
          </linearGradient>
          {/* Glow filter */}
          <filter id="robotGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Foot gradient */}
          <linearGradient id="footGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3FCFCF" />
            <stop offset="100%" stopColor="#4DA8DA" />
          </linearGradient>
        </defs>

        <g filter="url(#robotGlow)" stroke="url(#robotGrad)" strokeWidth={1.5 / scale} fill="none">
          {/* HEAD - dome shape */}
          <path d="M60 85 Q60 25 100 20 Q140 25 140 85 Z" />

          {/* Eyes - concentric circles */}
          <circle cx="82" cy="58" r="12" />
          <circle cx="82" cy="58" r="7" />
          <circle cx="82" cy="58" r="3" fill="url(#robotGrad)" />

          <circle cx="118" cy="58" r="12" />
          <circle cx="118" cy="58" r="7" />
          <circle cx="118" cy="58" r="3" fill="url(#robotGrad)" />

          {/* Head band / visor line */}
          <line x1="58" y1="85" x2="142" y2="85" />
          <line x1="58" y1="90" x2="142" y2="90" />

          {/* Small center dot (nose) */}
          <circle cx="100" cy="95" r="3" />

          {/* BODY - rounded rectangle */}
          <rect x="52" y="98" width="96" height="90" rx="18" ry="18" />

          {/* Chest panel - inner rounded rect */}
          <rect x="66" y="110" width="68" height="48" rx="6" ry="6" />

          {/* Left token display */}
          <rect x="72" y="116" width="26" height="14" rx="3" ry="3" />
          <text
            x="85"
            y="126"
            textAnchor="middle"
            fill="url(#robotGrad)"
            fontSize="6"
            fontFamily="var(--font-jetbrains), monospace"
          >
            TOKEN
          </text>
          <text
            x="85"
            y="150"
            textAnchor="middle"
            fill="url(#robotGrad)"
            fontSize="14"
            fontFamily="var(--font-jetbrains), monospace"
            fontWeight="500"
          >
            12.5
          </text>

          {/* Right token display */}
          <rect x="102" y="116" width="26" height="14" rx="3" ry="3" />
          <text
            x="115"
            y="126"
            textAnchor="middle"
            fill="url(#robotGrad)"
            fontSize="6"
            fontFamily="var(--font-jetbrains), monospace"
          >
            TOKEN
          </text>
          <text
            x="115"
            y="150"
            textAnchor="middle"
            fill="url(#robotGrad)"
            fontSize="14"
            fontFamily="var(--font-jetbrains), monospace"
            fontWeight="500"
          >
            16.7
          </text>

          {/* Belly buttons */}
          <circle cx="80" cy="172" r="5" />
          <circle cx="120" cy="172" r="5" />

          {/* Left arm */}
          <rect x="38" y="115" width="12" height="22" rx="4" ry="4" />
          <line x1="44" y1="137" x2="52" y2="130" />

          {/* Right arm */}
          <rect x="150" y="115" width="12" height="22" rx="4" ry="4" />
          <line x1="156" y1="137" x2="148" y2="130" />

          {/* LEGS */}
          {/* Left leg */}
          <line x1="82" y1="188" x2="82" y2="218" />
          <line x1="78" y1="210" x2="78" y2="218" />
          <line x1="86" y1="210" x2="86" y2="218" />

          {/* Right leg */}
          <line x1="118" y1="188" x2="118" y2="218" />
          <line x1="114" y1="210" x2="114" y2="218" />
          <line x1="122" y1="210" x2="122" y2="218" />
        </g>

        {/* Feet - filled blocks */}
        <rect x="72" y="218" width="20" height="10" rx="3" ry="3" fill="url(#footGrad)" opacity="0.8" />
        <rect x="108" y="218" width="20" height="10" rx="3" ry="3" fill="url(#footGrad)" opacity="0.8" />
      </svg>
    </motion.div>
  );
}
