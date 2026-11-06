"use client";

import * as React from "react";
import { motion, useInView, useMotionValue, animate } from "framer-motion";

// Component 4: Animated Stat Counters
// Numbers count up from 0 when scrolled into view

interface StatItem {
  value: number;
  suffix?: string;
  label: string;
  sublabel?: string;
  color?: string;
}

const DEFAULT_STATS: StatItem[] = [
  { value: 2400, suffix: "+", label: "Shows This Week", sublabel: "Movies, concerts & workshops", color: "#0ea5e9" },
  { value: 12, suffix: "", label: "Districts Covered", sublabel: "Metro & suburban zones", color: "#a855f7" },
  { value: 48000, suffix: "+", label: "Tickets Booked", sublabel: "Verified digital passes", color: "#10b981" },
  { value: 4.8, suffix: "★", label: "Avg. User Rating", sublabel: "Across all experience categories", color: "#f59e0b" },
];

function AnimatedNumber({
  value,
  suffix = "",
  color,
  duration = 2,
}: {
  value: number;
  suffix?: string;
  color?: string;
  duration?: number;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const isDecimal = !Number.isInteger(value);

  React.useEffect(() => {
    if (!inView) return;
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    const unsubscribe = motionValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = isDecimal
          ? latest.toFixed(1) + suffix
          : Math.round(latest).toLocaleString("en-IN") + suffix;
      }
    });
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [inView, value, suffix, duration, motionValue, isDecimal]);

  return (
    <span
      ref={ref}
      className="tabular-nums"
      style={color ? { color } : undefined}
    >
      {isDecimal ? "0.0" + suffix : "0" + suffix}
    </span>
  );
}

interface StatCountersProps {
  stats?: StatItem[];
  className?: string;
}

export function StatCounters({ stats = DEFAULT_STATS, className = "" }: StatCountersProps) {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <div
      ref={sectionRef}
      className={`grid grid-cols-2 lg:grid-cols-4 gap-8 py-10 ${className}`}
    >
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          className="text-center space-y-1.5"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
        >
          <div
            className="text-4xl sm:text-5xl font-extrabold tracking-tighter leading-none"
          >
            <AnimatedNumber value={stat.value} suffix={stat.suffix} color={stat.color} />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">{stat.label}</div>
          {stat.sublabel && (
            <div className="text-[11px] text-slate-400 dark:text-slate-500">{stat.sublabel}</div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

export default StatCounters;

