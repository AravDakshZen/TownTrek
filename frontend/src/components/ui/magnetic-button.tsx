"use client";

import * as React from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

// Component 7: Magnetic CTA Button
// Cursor-attracted button with spring physics and ripple on click

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number;   // magnetic pull strength (px radius influence)
  disabled?: boolean;
  as?: "button" | "a";
  href?: string;
}

export function MagneticButton({
  children,
  className = "",
  onClick,
  strength = 40,
  disabled = false,
  as = "button",
  href,
}: MagneticButtonProps) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = React.useState<{ id: number; x: number; y: number }[]>([]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!wrapperRef.current || disabled) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = Math.max(rect.width, rect.height) * 1.5;
    const pull = Math.max(0, 1 - dist / maxDist);
    x.set(dx * pull * (strength / 40));
    y.set(dy * pull * (strength / 40));
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!wrapperRef.current) return;
    if (as === "a" && href?.startsWith("/")) {
      e.preventDefault();
    }
    const rect = wrapperRef.current.getBoundingClientRect();
    const rx = e.clientX - rect.left;
    const ry = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x: rx, y: ry }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 700);
    onClick?.();
  };

  const Tag = as === "a" ? motion.a : motion.button;

  return (
    <div
      ref={wrapperRef}
      className="relative inline-flex"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Tag
        href={as === "a" ? href : undefined}
        className={`relative overflow-hidden select-none ${className}`}
        style={{ x: springX, y: springY } as any}
        onClick={handleClick as any}
        disabled={as === "button" ? disabled : undefined}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        {children}
        {/* Ripple rings */}
        {ripples.map((r) => (
          <span
            key={r.id}
            className="pointer-events-none absolute rounded-full border border-white/60"
            style={{
              left: r.x,
              top: r.y,
              width: 8,
              height: 8,
              marginLeft: -4,
              marginTop: -4,
              animation: "tt-ripple 0.65s ease-out forwards",
            }}
          />
        ))}
      </Tag>

      <style>{`
        @keyframes tt-ripple {
          0%   { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(18); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default MagneticButton;

