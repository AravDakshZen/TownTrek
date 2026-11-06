"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { SpotlightCard } from "./spotlight-card";

// Component 2: Asymmetric Bento Grid
// Replaces uniform 5-tile service hub with a premium asymmetric layout

export interface BentoTile {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  href: string;
  accentColor: string;
  glowColor: string;
  span?: "wide" | "normal";
  emoji?: string;
}

interface BentoGridProps {
  tiles: BentoTile[];
  className?: string;
}

function BentoCard({ tile, index }: { tile: BentoTile; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: index * 0.07 }}
      className={
        tile.span === "wide"
          ? "col-span-2 md:col-span-2 lg:col-span-2"
          : "col-span-1 md:col-span-1 lg:col-span-1"
      }
    >
      <Link to={tile.href} className="group block h-full">
        <SpotlightCard
          glowColor={tile.glowColor}
          className="h-full rounded-3xl bg-slate-50 dark:bg-neutral-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 hover:border-opacity-60 transition-all duration-300 hover:shadow-2xl"
        >
          <div className="p-6 h-full flex flex-col justify-between min-h-[120px]">
            <div className="flex items-start justify-between">
              <motion.div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: tile.accentColor }}
                whileHover={{ scale: 1.15, rotate: 8 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                {tile.icon}
              </motion.div>
              {tile.emoji && (
                <span className="text-2xl opacity-30 group-hover:opacity-70 transition-opacity">
                  {tile.emoji}
                </span>
              )}
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:translate-x-0.5 transition-transform">
                {tile.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {tile.subtitle}
              </p>
            </div>
          </div>
        </SpotlightCard>
      </Link>
    </motion.div>
  );
}

export function BentoGrid({ tiles, className = "" }: BentoGridProps) {
  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 auto-rows-fr ${className}`}
    >
      {tiles.map((tile, i) => (
        <BentoCard key={tile.href + i} tile={tile} index={i} />
      ))}
    </div>
  );
}

export default BentoGrid;

