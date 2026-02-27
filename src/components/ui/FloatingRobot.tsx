"use client";

import RobotAvatar from "./RobotAvatar";

interface FloatingRobotProps {
  size?: number;
}

export default function FloatingRobot({ size = 48 }: FloatingRobotProps) {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <RobotAvatar size={size} interactive />
    </div>
  );
}
