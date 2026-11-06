"use client";

import * as React from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

// Component 1: Morphing Hero Headline
// Staggered blur→clear word reveal + morphing verb on idle

const MORPHING_PHRASES = ["Tonight.", "This Weekend.", "Right Now.", "Near You."];

interface MorphingHeadlineProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

function MorphWord({ word, delay }: { word: string; delay: number }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.span
      ref={ref}
      className="inline-block mr-[0.25em]"
      initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {word}
    </motion.span>
  );
}

export function MorphingHeadline({
  title = "Discover Your City.",
  subtitle = "Tonight.",
  className = "",
}: MorphingHeadlineProps) {
  const words = title.split(" ");
  const [phraseIndex, setPhraseIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % MORPHING_PHRASES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`${className}`}>
      {/* Main heading */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
        {words.map((word, i) => (
          <MorphWord key={i} word={word} delay={0.1 + i * 0.07} />
        ))}
      </h1>

      {/* Morphing sub-phrase */}
      <div className="mt-1 h-8 sm:h-9 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.p
            key={phraseIndex}
            className="absolute text-lg sm:text-xl font-bold text-brand-600 dark:text-sky-300 drop-shadow-sm"
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -14, filter: "blur(8px)" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {MORPHING_PHRASES[phraseIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default MorphingHeadline;

