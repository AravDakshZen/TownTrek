"use client";

import * as React from "react";
import { motion, useInView, Variants } from "framer-motion";

// Component 10: Scroll-Driven Section Reveals
// Wraps any section or card with a fade+slide-up reveal when scrolled into view

interface SectionRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Amount of element visible before triggering (0-1) */
  amount?: number;
  /** Y offset to slide from (px) */
  yOffset?: number;
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 32, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Wraps a section heading + content with staggered reveal */
export function SectionReveal({
  children,
  className,
  delay = 0,
  amount = 0.15,
}: SectionRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Direct child of SectionReveal — each one gets its own staggered animation */
export function RevealItem({
  children,
  className,
  delay,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={
        delay !== undefined
          ? {
              hidden: { opacity: 0, y: 32, filter: "blur(4px)" },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: {
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                  delay,
                },
              },
            }
          : itemVariants
      }
    >
      {children}
    </motion.div>
  );
}

/** One-shot reveal for a standalone element (heading, banner, etc.) */
export function FadeUp({
  children,
  className,
  delay = 0,
  amount = 0.2,
}: SectionRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28, filter: "blur(4px)" }}
      animate={
        inView
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: 28, filter: "blur(4px)" }
      }
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

export default SectionReveal;

