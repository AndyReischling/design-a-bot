"use client";

import { useEffect, useRef, useState, useCallback, useId } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

interface RobotAvatarProps {
  size?: number;
  className?: string;
  interactive?: boolean;
}

export default function RobotAvatar({
  size = 200,
  className = "",
  interactive = true,
}: RobotAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [blinkState, setBlinkState] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 20, mass: 0.5 };
  const pupilX = useSpring(useTransform(mouseX, [-1, 1], [-3, 3]), springConfig);
  const pupilY = useSpring(useTransform(mouseY, [-1, 1], [-2, 2]), springConfig);
  const headRotate = useSpring(useTransform(mouseX, [-1, 1], [-4, 4]), springConfig);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current || !interactive) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (window.innerWidth / 2);
      const dy = (e.clientY - cy) / (window.innerHeight / 2);
      mouseX.set(Math.max(-1, Math.min(1, dx)));
      mouseY.set(Math.max(-1, Math.min(1, dy)));
    },
    [interactive, mouseX, mouseY]
  );

  useEffect(() => {
    if (!interactive) return;
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [interactive, handleMouseMove]);

  // Blink on a semi-random interval
  useEffect(() => {
    if (!interactive) return;
    let timeout: ReturnType<typeof setTimeout>;
    const scheduleBlink = () => {
      const delay = 2000 + Math.random() * 4000;
      timeout = setTimeout(() => {
        setBlinkState(true);
        setTimeout(() => {
          setBlinkState(false);
          scheduleBlink();
        }, 150);
      }, delay);
    };
    scheduleBlink();
    return () => clearTimeout(timeout);
  }, [interactive]);

  const uid = `rob-${useId().replace(/:/g, "")}`;

  return (
    <motion.div
      ref={containerRef}
      className={`inline-flex items-center justify-center ${className}`}
      animate={interactive ? { y: [0, -4, 0] } : {}}
      transition={
        interactive
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
        role="img"
        aria-label="Robot mascot"
      >
        <defs>
          <linearGradient
            id={`${uid}-grad`}
            x1="100" y1="0" x2="100" y2="250"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#6BCB77" />
            <stop offset="40%" stopColor="#3FCFCF" />
            <stop offset="100%" stopColor="#4DA8DA" />
          </linearGradient>
          <filter id={`${uid}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id={`${uid}-foot`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3FCFCF" />
            <stop offset="100%" stopColor="#4DA8DA" />
          </linearGradient>
          {/* Clip for eyelids */}
          <clipPath id={`${uid}-eyeClipL`}>
            <rect
              x="68"
              y={blinkState ? "54" : "42"}
              width="28"
              height={blinkState ? "2" : "28"}
              rx="2"
              style={{ transition: "y 0.08s ease-in, height 0.08s ease-in" }}
            />
          </clipPath>
          <clipPath id={`${uid}-eyeClipR`}>
            <rect
              x="104"
              y={blinkState ? "54" : "42"}
              width="28"
              height={blinkState ? "2" : "28"}
              rx="2"
              style={{ transition: "y 0.08s ease-in, height 0.08s ease-in" }}
            />
          </clipPath>
        </defs>

        {/* BODY (static) */}
        <g
          filter={`url(#${uid}-glow)`}
          stroke={`url(#${uid}-grad)`}
          strokeWidth="1.5"
          fill="none"
        >
          {/* Body shell */}
          <rect x="52" y="98" width="96" height="90" rx="18" ry="18" />

          {/* Chest panel */}
          <rect x="66" y="110" width="68" height="48" rx="6" ry="6" />

          {/* Left token display */}
          <rect x="72" y="116" width="26" height="14" rx="3" ry="3" />
          <text
            x="85" y="126"
            textAnchor="middle"
            fill={`url(#${uid}-grad)`}
            fontSize="6"
            fontFamily="var(--font-jetbrains), monospace"
            stroke="none"
          >
            TOKEN
          </text>
          <text
            x="85" y="150"
            textAnchor="middle"
            fill={`url(#${uid}-grad)`}
            fontSize="14"
            fontFamily="var(--font-jetbrains), monospace"
            fontWeight="500"
            stroke="none"
          >
            12.5
          </text>

          {/* Right token display */}
          <rect x="102" y="116" width="26" height="14" rx="3" ry="3" />
          <text
            x="115" y="126"
            textAnchor="middle"
            fill={`url(#${uid}-grad)`}
            fontSize="6"
            fontFamily="var(--font-jetbrains), monospace"
            stroke="none"
          >
            TOKEN
          </text>
          <text
            x="115" y="150"
            textAnchor="middle"
            fill={`url(#${uid}-grad)`}
            fontSize="14"
            fontFamily="var(--font-jetbrains), monospace"
            fontWeight="500"
            stroke="none"
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

          {/* Left leg */}
          <line x1="82" y1="188" x2="82" y2="218" />
          <line x1="78" y1="210" x2="78" y2="218" />
          <line x1="86" y1="210" x2="86" y2="218" />

          {/* Right leg */}
          <line x1="118" y1="188" x2="118" y2="218" />
          <line x1="114" y1="210" x2="114" y2="218" />
          <line x1="122" y1="210" x2="122" y2="218" />
        </g>

        {/* Feet */}
        <rect x="72" y="218" width="20" height="10" rx="3" ry="3" fill={`url(#${uid}-foot)`} opacity="0.8" />
        <rect x="108" y="218" width="20" height="10" rx="3" ry="3" fill={`url(#${uid}-foot)`} opacity="0.8" />

        {/* HEAD (rotates to follow cursor) */}
        <motion.g
          filter={`url(#${uid}-glow)`}
          stroke={`url(#${uid}-grad)`}
          strokeWidth="1.5"
          fill="none"
          style={{
            originX: "100px",
            originY: "85px",
            rotate: interactive ? headRotate : 0,
          }}
        >
          {/* Dome */}
          <path d="M60 85 Q60 25 100 20 Q140 25 140 85 Z" />

          {/* Visor band */}
          <line x1="58" y1="85" x2="142" y2="85" />
          <line x1="58" y1="90" x2="142" y2="90" />

          {/* Nose dot */}
          <circle cx="100" cy="95" r="3" />

          {/* Left eye assembly */}
          <g clipPath={`url(#${uid}-eyeClipL)`}>
            {/* Outer ring */}
            <circle cx="82" cy="58" r="12" />
            {/* Inner ring */}
            <circle cx="82" cy="58" r="7" />
            {/* Pupil (follows cursor) */}
            <motion.circle
              cx="82"
              cy="58"
              r="3"
              fill={`url(#${uid}-grad)`}
              stroke="none"
              style={interactive ? { x: pupilX, y: pupilY } : {}}
            />
          </g>

          {/* Right eye assembly */}
          <g clipPath={`url(#${uid}-eyeClipR)`}>
            <circle cx="118" cy="58" r="12" />
            <circle cx="118" cy="58" r="7" />
            <motion.circle
              cx="118"
              cy="58"
              r="3"
              fill={`url(#${uid}-grad)`}
              stroke="none"
              style={interactive ? { x: pupilX, y: pupilY } : {}}
            />
          </g>
        </motion.g>
      </svg>
    </motion.div>
  );
}
