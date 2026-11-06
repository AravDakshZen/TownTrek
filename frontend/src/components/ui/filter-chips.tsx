"use client";

import * as React from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

// Component 8: Animated Filter Chip Pills
// Chips with sliding animated highlight (Framer layoutId), sticky on scroll

export type FilterChip = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
};

const DEFAULT_CHIPS: FilterChip[] = [
  { id: "all", label: "All" },
  { id: "movies", label: "Movies" },
  { id: "concerts", label: "Concerts" },
  { id: "workshops", label: "Workshops" },
  { id: "events", label: "Events" },
  { id: "landmarks", label: "Landmarks" },
  { id: "dining", label: "Dining" },
];

interface FilterChipsProps {
  chips?: FilterChip[];
  value?: string;
  onChange?: (id: string) => void;
  className?: string;
  sticky?: boolean;
}

export function FilterChips({
  chips = DEFAULT_CHIPS,
  value,
  onChange,
  className = "",
  sticky = false,
}: FilterChipsProps) {
  const [active, setActive] = React.useState<string>(value ?? chips[0]?.id ?? "all");

  React.useEffect(() => {
    if (value !== undefined) setActive(value);
  }, [value]);

  const handleSelect = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  return (
    <div
      className={`${sticky ? "sticky top-[64px] z-30" : ""} ${className}`}
    >
      <div
        className={`
          w-full overflow-x-auto scrollbar-hide
          ${sticky ? "py-3 bg-white/80 dark:bg-black/80 backdrop-blur-lg border-b border-slate-200/60 dark:border-white/10" : ""}
        `}
      >
        <LayoutGroup>
          <div className="flex items-center gap-2 px-4 min-w-max">
            {chips.map((chip) => {
              const isActive = active === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => handleSelect(chip.id)}
                  className={`
                    relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap font-['Be_Vietnam_Pro',sans-serif]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
                    ${isActive
                      ? "text-white dark:text-black shadow-md shadow-brand-500/20"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200/80 dark:border-white/10 hover:border-brand-500/50"
                    }
                  `}
                >
                  {/* Sliding glass background */}
                  {isActive && (
                    <motion.span
                      layoutId="chip-bg"
                      className="absolute inset-0 rounded-full bg-brand-600 dark:bg-white backdrop-blur-lg"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {chip.icon && (
                    <span className="relative z-10 p-0.5 rounded-full bg-white/20 dark:bg-black/10 backdrop-blur-sm">{chip.icon}</span>
                  )}
                  <span className="relative z-10">{chip.label}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
      </div>
    </div>
  );
}

export default FilterChips;

