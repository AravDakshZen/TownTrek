import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { layoutScript } from "./sticker-slap-footer";

interface AnimatedScriptLogoProps {
  text?: string;
  className?: string;
}

export const AnimatedScriptLogo: React.FC<AnimatedScriptLogoProps> = ({
  text = "towntrek",
  className = "",
}) => {
  const pathRef = useRef<SVGPathElement>(null);
  const word = React.useMemo(() => layoutScript(text), [text]);
  const pad = 2.25;
  const vb = [
    -pad - 1,
    word.top - pad,
    Math.max(word.width, 1) + pad * 2 + 2 - word.top * 0.1584,
    -word.top + pad * 2 + 1,
  ]
    .map((v) => Math.round(v * 100) / 100)
    .join(" ");

  useEffect(() => {
    const el = pathRef.current;
    if (el) {
      const length = Math.ceil(el.getTotalLength()) + 2;
      el.style.strokeDasharray = `${length}`;
      el.style.strokeDashoffset = `${length}`;
      el.getBoundingClientRect(); // trigger layout
      el.style.transition = "stroke-dashoffset 1.3s cubic-bezier(0.55, 0.1, 0.35, 1)";
      el.style.strokeDashoffset = "0";
    }
  }, [text]);

  const replay = () => {
    const el = pathRef.current;
    if (el) {
      const length = Math.ceil(el.getTotalLength()) + 2;
      el.style.transition = "none";
      el.style.strokeDashoffset = `${length}`;
      setTimeout(() => {
        el.style.transition = "stroke-dashoffset 1.1s cubic-bezier(0.55, 0.1, 0.35, 1)";
        el.style.strokeDashoffset = "0";
      }, 20);
    }
  };

  return (
    <Link
      to="/"
      onMouseEnter={replay}
      className={`inline-flex items-center text-slate-900 dark:text-white transition-transform hover:scale-105 active:scale-95 group ${className}`}
      aria-label={`${text} home`}
    >
      <svg
        viewBox={vb}
        className="h-8 sm:h-9 w-auto overflow-visible select-none pointer-events-none"
        aria-hidden="true"
      >
        <path
          ref={pathRef}
          d={word.main + word.extra.join("")}
          transform="skewX(-9)"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
};

export default AnimatedScriptLogo;

