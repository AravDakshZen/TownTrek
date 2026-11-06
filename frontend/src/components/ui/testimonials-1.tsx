import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  avatarUrl: string;
  tag?: string;
  brand?: string;
}

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    quote: "TownTrek is why booking IMAX tickets and district gigs is so effortless. No more clunky portals.",
    author: "Arjun Venkat",
    role: "Cinema & Live Music Enthusiast, Chennai",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    brand: "TownTrek Explorer",
    tag: "Verified Pass Holder",
  },
  {
    quote: "The liquid coverflow trailer preview and instant QR barcodes made attending the standup show seamless.",
    author: "Priya Sundaram",
    role: "Community Lead, Bangalore",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    brand: "TownTrek Live",
    tag: "VIP Pass Member",
  },
  {
    quote: "Instant seat selection with zero booking friction. The best metropolitan event discovery platform.",
    author: "Vikram Rathore",
    role: "Tech Lead & Film Critic",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    brand: "TownTrek Prime",
    tag: "District Critic",
  },
];

export function VercelIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg preserveAspectRatio="xMidYMid" viewBox="0 0 256 222" {...props}>
      <path d="m128 0 128 221.705H0z" fill="currentColor" />
    </svg>
  );
}

export function TestimonialsSection({
  testimonials = DEFAULT_TESTIMONIALS,
}: {
  testimonials?: TestimonialItem[];
}) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const active = testimonials[activeIndex] || testimonials[0];

  React.useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <figure className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center text-center px-4 py-8">
      {/* Brand pill */}
      <div className="mb-6 flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/60 dark:bg-white/5 backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
        <span className="font-medium text-xs tracking-wider uppercase text-slate-700 dark:text-slate-300">
          {active.tag || "District Testimonial"}
        </span>
      </div>

      {/* Quote */}
      <blockquote className="text-center text-xl leading-relaxed tracking-tight sm:text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white min-h-[96px] flex items-center justify-center transition-all duration-300">
        <span>&ldquo;{active.quote}&rdquo;</span>
      </blockquote>

      {/* Gradient divider */}
      <div className="mx-auto my-6 h-px w-full max-w-sm bg-gradient-to-r from-transparent via-slate-300 dark:via-white/20 to-transparent" />

      {/* Figcaption */}
      <figcaption className="flex flex-col items-center gap-4">
        <div className="space-y-0.5 text-center">
          <cite className="font-bold text-slate-900 dark:text-white text-lg not-italic">
            {active.author}
          </cite>
          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {active.role}
          </div>
        </div>

        <Avatar className="size-14 rounded-full border-2 border-brand-500/30 object-cover shadow-lg">
          <AvatarImage
            alt={`${active.author}'s profile picture`}
            src={active.avatarUrl}
          />
          <AvatarFallback>{active.author.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>

        {/* Carousel indicator dots */}
        {testimonials.length > 1 && (
          <div className="flex items-center gap-1.5 mt-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? "w-6 bg-brand-500 dark:bg-sky-400"
                    : "w-1.5 bg-slate-300 dark:bg-white/20 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        )}
      </figcaption>
    </figure>
  );
}

export default TestimonialsSection;

