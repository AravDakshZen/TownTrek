"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// Component 6: Parallax Landmark Card
// Scroll-driven parallax with inner image and card Y offset

interface ParallaxCardProps {
  children: React.ReactNode;
  className?: string;
  /** How many px the card shifts vertically relative to scroll */
  shift?: number;
}

export function ParallaxCard({ children, className = "", shift = 40 }: ParallaxCardProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [shift, -shift]);

  return (
    <motion.div ref={ref} style={{ y }} className={`will-change-transform ${className}`}>
      {children}
    </motion.div>
  );
}

/** For the inner image inside a ParallaxCard — moves at a different rate */
export function ParallaxImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y, scale: 1.2 }}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}

export default ParallaxCard;

