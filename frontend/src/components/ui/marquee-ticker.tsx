"use client";

import * as React from "react";
import { motion, useAnimationFrame } from "framer-motion";

// Component 3: Infinite Marquee Ticker
// Horizontally scrolling strip of live event/movie highlights
// Pauses on hover, seamlessly loops

export interface MarqueeItem {
  label: string;
  category?: string;
  meta?: string;
  color?: string;
}

interface MarqueTickerProps {
  items?: MarqueeItem[];
  speed?: number; // px per second
  className?: string;
  pauseOnHover?: boolean;
}

const DOT = "·";

const DEFAULT_ITEMS: MarqueeItem[] = [
  { label: "Interstellar – 7:30 PM", category: "🎬", meta: "IMAX • PVR", color: "#0ea5e9" },
  { label: "AR Rahman Live", category: "🎵", meta: "Dec 14 • Chepauk", color: "#a855f7" },
  { label: "Don Bosco Auditorium", category: "🎭", meta: "Sold Out", color: "#ef4444" },
  { label: "AI Workshop: Prompt Engineering", category: "💡", meta: "Free Entry", color: "#f59e0b" },
  { label: "Dune: Prophecy of Sand – 9:00 PM", category: "🎬", meta: "Dolby Atmos", color: "#d97706" },
  { label: "Neon Horizon Electronic Gala", category: "🎧", meta: "VIP Passes", color: "#8b5cf6" },
  { label: "Chennai Food Fest 2024", category: "🍜", meta: "3 Days Left", color: "#10b981" },
  { label: "Spider-Verse – 6:15 PM", category: "🎬", meta: "4K Laser", color: "#ef4444" },
];

export function MarqueeTicker({
  items,
  speed = 60,
  className = "",
  pauseOnHover = true,
}: MarqueTickerProps) {
  const activeItems = (items && items.length > 0) ? items : DEFAULT_ITEMS;
  const [paused, setPaused] = React.useState(false);
  const xRef = React.useRef(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = React.useState(0);

  // Measure single-copy width
  React.useEffect(() => {
    if (contentRef.current) {
      setContentWidth(contentRef.current.scrollWidth / 2);
    }
  }, [activeItems]);

  useAnimationFrame((_, delta) => {
    if (paused || contentWidth === 0) return;
    xRef.current -= (speed * delta) / 1000;
    if (Math.abs(xRef.current) >= contentWidth) {
      xRef.current = 0;
    }
    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(${xRef.current}px)`;
    }
  });

  // Double the items for seamless looping
  const doubled = [...activeItems, ...activeItems];

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Live event ticker"
    >
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-white dark:from-black to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-white dark:from-black to-transparent" />

      <div
        ref={contentRef}
        className="flex items-center gap-0 whitespace-nowrap will-change-transform"
        style={{ display: "inline-flex" }}
      >
        <div
          ref={containerRef}
          className="inline-flex items-center gap-0"
          style={{ willChange: "transform" }}
        >
          {doubled.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium select-none"
            >
              <span className="text-sm">{item.category}</span>
              <span
                className="font-semibold tracking-tight text-slate-800 dark:text-slate-200"
                style={item.color ? { color: item.color } : undefined}
              >
                {item.label}
              </span>
              {item.meta && (
                <span className="text-slate-400 dark:text-slate-500 font-normal">
                  {item.meta}
                </span>
              )}
              <span className="text-slate-300 dark:text-slate-600 mx-2 font-bold text-base">
                {DOT}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MarqueeTicker;

