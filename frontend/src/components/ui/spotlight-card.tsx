"use client";

import * as React from "react";
import { motion } from "framer-motion";

// Component 5: Spotlight Glow Card
// Card that tracks cursor position and paints a radial gradient glow internally

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  /** Radius of spotlight in px */
  radius?: number;
}

export function SpotlightCard({
  children,
  className = "",
  glowColor = "rgba(168, 85, 247, 0.18)",
  radius = 280,
}: SpotlightCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState<{ x: number; y: number } | null>(null);
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setPosition(null);
      }}
    >
      {/* Spotlight gradient */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          background: position
            ? `radial-gradient(${radius}px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 70%)`
            : "none",
          opacity: isHovered ? 1 : 0,
        }}
      />
      {/* Border glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit] z-0"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        style={{
          background: position
            ? `radial-gradient(${radius}px circle at ${position.x}px ${position.y}px, ${glowColor.replace(/[\d.]+\)$/, "0.35)")}, transparent 70%)`
            : "none",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "1px",
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

export default SpotlightCard;

