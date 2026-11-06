"use client";

import * as React from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

// Component 9: Floating Tilt Movie Cards
// 3D perspective tilt + glare + "Book Now" slide-up overlay on hover

interface TiltMovieCardProps {
  children: React.ReactNode;
  className?: string;
  /** max tilt degrees */
  maxTilt?: number;
  glareColor?: string;
  disabled?: boolean;
}

export function TiltCard({
  children,
  className = "",
  maxTilt = 14,
  glareColor = "rgba(255,255,255,0.12)",
  disabled = false,
}: TiltMovieCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [maxTilt, -maxTilt]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-maxTilt, maxTilt]), {
    stiffness: 200,
    damping: 20,
  });
  const glareX = useTransform(rawX, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(rawY, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="w-full h-full"
      >
        {children}
        {/* Glare overlay */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-3xl z-20"
          style={{
            background: useTransform(
              [glareX, glareY],
              ([gx, gy]) =>
                `radial-gradient(circle at ${gx} ${gy}, ${glareColor} 0%, transparent 65%)`
            ) as any,
            opacity: 0.7,
          }}
        />
      </motion.div>
    </motion.div>
  );
}

export default TiltCard;

