"use client";

interface VersaceCigaretteProps {
  size?: number;
  className?: string;
  /** Accent color: "amber" | "teal" | "orchid" */
  accent?: "amber" | "teal" | "orchid";
}

export default function VersaceCigarette({
  size = 32,
  className = "",
  accent = "amber",
}: VersaceCigaretteProps) {
  const accentColor =
    accent === "amber"
      ? "var(--amber)"
      : accent === "teal"
        ? "var(--teal)"
        : "var(--orchid)";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Cigarette - luxury angle, gold filter */}
      <g transform="translate(6, 18) rotate(-12)">
        {/* Filter tip - accent color */}
        <rect x="0" y="2" width="10" height="4" rx="0.5" fill={accentColor} />
        {/* Paper body */}
        <rect
          x="10"
          y="2"
          width="30"
          height="4"
          rx="0.5"
          fill="white"
          stroke="#D4D4D4"
          strokeWidth="0.25"
        />
        {/* Ember */}
        <ellipse cx="40" cy="4" rx="2.5" ry="2" fill={accentColor} opacity="0.85" />
      </g>
      {/* Smoke - baroque curl */}
      <path
        d="M42 12 C46 8 48 12 46 16 C44 20 40 18 42 14"
        stroke={accentColor}
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}
