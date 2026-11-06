import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Film, 
  Music, 
  Calendar, 
  Landmark, 
  Utensils, 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  Compass,
  ShieldCheck,
  Ticket,
  Clock,
  Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { Movie, Show, PartyConcert, DistrictEvent, TouristAttraction, CitySpot } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useCity } from '../context/CityContext';
import { useAuth } from '../context/AuthContext';
import GlassyCarousel, { GlassyCarouselItem } from '../components/ui/glassy-coverflow-carousel';
import { getMovieImage, getConcertImage, getWorkshopImage, getLandmarkImage, getSpotImage, FALLBACK_IMAGE } from '../utils/locationImages';

// ── New Premium Components ──────────────────────────────────────────────────
import { SectionReveal, RevealItem, FadeUp } from '../components/ui/section-reveal';
import { MarqueeTicker, MarqueeItem } from '../components/ui/marquee-ticker';
import { StatCounters } from '../components/ui/stat-counter';
import { MagneticButton } from '../components/ui/magnetic-button';
import { TiltCard } from '../components/ui/tilt-card';
import { SpotlightCard } from '../components/ui/spotlight-card';
import { ParallaxCard, ParallaxImage } from '../components/ui/parallax-card';
import { FilterChips, FilterChip } from '../components/ui/filter-chips';
import { MorphingHeadline } from '../components/ui/morphing-headline';
import { BentoGrid, BentoTile } from '../components/ui/bento-grid';
import { TestimonialsSection } from '../components/ui/testimonials-1';

// ─────────────────────────────────────────────────────────────────────────────

const FILTER_CHIPS: FilterChip[] = [
  { id: 'all',       label: 'All' },
  { id: 'movies',    label: 'Movies' },
  { id: 'concerts',  label: 'Concerts' },
  { id: 'workshops', label: 'Workshops' },
  { id: 'events',    label: 'Events' },
  { id: 'landmarks', label: 'Landmarks' },
  { id: 'dining',    label: 'Dining' },
];

const BENTO_TILES: BentoTile[] = [
  {
    title: 'Cinemas',
    subtitle: 'Multiplex & IMAX',
    icon: <Film className="w-6 h-6" />,
    href: '/movies',
    accentColor: '#0284c7',
    glowColor: 'rgba(2, 132, 199, 0.2)',
    emoji: '🎬',
    span: 'wide',
  },
  {
    title: 'Concerts',
    subtitle: 'Live Gigs & Standup',
    icon: <Music className="w-6 h-6" />,
    href: '/entertainment',
    accentColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.2)',
    emoji: '🎵',
  },
  {
    title: 'Workshops',
    subtitle: 'Pottery, AI & Food',
    icon: <Calendar className="w-6 h-6" />,
    href: '/events',
    accentColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.2)',
    emoji: '💡',
  },
  {
    title: 'Landmarks',
    subtitle: 'Heritage Citadel',
    icon: <Landmark className="w-6 h-6" />,
    href: '/attractions',
    accentColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.2)',
    emoji: '🏛️',
  },
  {
    title: 'Dining',
    subtitle: 'Cafes & Street Food',
    icon: <Utensils className="w-6 h-6" />,
    href: '/dining',
    accentColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.2)',
    emoji: '🍜',
  },
];

export const HomePage: React.FC = () => {
  const { theme } = useTheme();
  const { selectedCity, matchesCity, isCityMatchingActive } = useCity();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [movies, setMovies]         = useState<Movie[]>([]);
  const [shows, setShows]           = useState<Show[]>([]);
  const [parties, setParties]       = useState<PartyConcert[]>([]);
  const [events, setEvents]         = useState<DistrictEvent[]>([]);
  const [attractions, setAttractions] = useState<TouristAttraction[]>([]);
  const [spots, setSpots]           = useState<CitySpot[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  // ── Hero Carousel Items ──────────────────────────────────────────────────
  const heroCarouselItems: GlassyCarouselItem[] = [
    {
      id: 'john-wick-4',
      title: 'John Wick: Chapter 4',
      subtitle: 'Action Thriller • Dolby Cinema 4K',
      image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
      accent: '#e11d48',
      description: 'John Wick uncovers a path to defeating The High Table across Paris, Osaka, Berlin, and New York in grand IMAX surround sound.',
      trailerUrl: 'https://www.youtube.com/watch?v=qEVUtrk8_B4',
      href: '/movies/4',
      linkLabel: 'Book Cinema Pass',
    },
    {
      id: 'interstellar-horizon',
      title: 'Interstellar: Beyond Horizon',
      subtitle: 'Sci-Fi Masterpiece • Christopher Nolan',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
      accent: '#0ea5e9',
      description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival. Experience Hans Zimmer\'s pipe organ score in Dolby Atmos.',
      trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
      href: '/movies/1',
      linkLabel: 'View Showtimes',
    },
    {
      id: 'oppenheimer-imax',
      title: 'Oppenheimer',
      subtitle: 'Historical Drama • 70mm Large Format',
      image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&auto=format&fit=crop&q=80',
      accent: '#f59e0b',
      description: 'The gripping story of American scientist J. Robert Oppenheimer and his role in the Manhattan Project, filmed on high-resolution 70mm IMAX.',
      trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
      href: '/movies/7',
      linkLabel: 'Reserve Recliner Seats',
    },
    {
      id: 'neon-horizon-fest',
      title: 'Neon Horizon Electronic Gala',
      subtitle: 'Live Concert • Sunburn & DJ Nucleya',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
      accent: '#8b5cf6',
      description: 'High-octane bass drops, lasers, and immersive pyrotechnics under the open stars featuring premier electronic and fusion artists.',
      trailerUrl: 'https://www.youtube.com/watch?v=kYvS1w5z17A',
      href: '/entertainment',
      linkLabel: 'Book VIP Passes',
    },
    {
      id: 'dune-prophecy',
      title: 'Dune: Prophecy of Sand',
      subtitle: 'Sci-Fi Saga • Denis Villeneuve',
      image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
      accent: '#d97706',
      description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
      trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
      href: '/movies/9',
      linkLabel: 'Explore Cinema Seats',
    },
    {
      id: 'spider-verse',
      title: 'Across the Spider-Verse',
      subtitle: 'Animation & Adventure • Multiverse Odyssey',
      image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&auto=format&fit=crop&q=80',
      accent: '#ef4444',
      description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
      trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
      href: '/movies/6',
      linkLabel: 'Check Showtimes',
    },
  ];

  // ── Data Fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      api.get('/movies').then(res => setMovies(res.data)).catch(() => []),
      api.get('/movies/shows').then(res => setShows(res.data)).catch(() => []),
      api.get('/parties').then(res => setParties(res.data)).catch(() => []),
      api.get('/events').then(res => setEvents(res.data)).catch(() => []),
      api.get('/guide/attractions').then(res => setAttractions(res.data)).catch(() => []),
      api.get('/guide/spots').then(res => setSpots(res.data)).catch(() => []),
    ]).finally(() => setLoading(false));
  }, []);

  // ── District Filtering ──────────────────────────────────────────────────
  // Filter movies by shows matching the active city in real time
  const filteredMovies = React.useMemo(() => {
    if (!isCityMatchingActive || shows.length === 0) return movies;
    const matchingShowMovieIds = new Set(
      shows
        .filter(s => matchesCity(`${s.city || ''} ${s.theatreName} ${s.theatreLocation}`))
        .map(s => s.movieId)
    );
    const matched = movies.filter(m => matchingShowMovieIds.has(m.movieId));
    return matched.length > 0 ? matched : movies;
  }, [movies, shows, isCityMatchingActive, matchesCity]);

  const filteredParties = isCityMatchingActive
    ? parties.filter(p => matchesCity(`${p.city || ''} ${p.venue} ${p.location}`))
    : parties;
  const displayParties = (filteredParties.length > 0 ? filteredParties : parties).slice(0, 3);

  const filteredEvents = isCityMatchingActive
    ? events.filter(e => matchesCity(`${e.city || ''} ${e.venue} ${e.location}`))
    : events;
  const displayEvents = (filteredEvents.length > 0 ? filteredEvents : events).slice(0, 3);

  const filteredAttractions = isCityMatchingActive
    ? attractions.filter(a => matchesCity(`${a.city || ''} ${a.location || ''} ${a.name}`))
    : attractions;
  const displayAttractions = (filteredAttractions.length > 0 ? filteredAttractions : attractions).slice(0, 3);

  const filteredSpots = isCityMatchingActive
    ? spots.filter(s => matchesCity(`${s.city || ''} ${s.address} ${s.name}`))
    : spots;
  const displaySpots = (filteredSpots.length > 0 ? filteredSpots : spots).slice(0, 3);

  // ── Section visibility based on filter chip ─────────────────────────────
  const showMovies    = activeFilter === 'all' || activeFilter === 'movies';
  const showConcerts  = activeFilter === 'all' || activeFilter === 'concerts';
  const showWorkshops = activeFilter === 'all' || activeFilter === 'workshops';
  const showEvents    = activeFilter === 'all' || activeFilter === 'events';
  const showLandmarks = activeFilter === 'all' || activeFilter === 'landmarks';
  const showDining    = activeFilter === 'all' || activeFilter === 'dining';

  // ── Marquee items (live + from fetched data) ────────────────────────────
  const marqueeItems: MarqueeItem[] = [
    ...movies.slice(0, 3).map(m => ({
      label: `${m.movieName} – 7:30 PM`,
      category: '🎬',
      meta: m.language,
      color: '#0ea5e9',
    })),
    ...parties.slice(0, 2).map(p => ({
      label: p.title,
      category: '🎵',
      meta: p.venue,
      color: '#a855f7',
    })),
    ...events.slice(0, 2).map(e => ({
      label: e.title,
      category: '💡',
      meta: Number(e.entryFee) === 0 ? 'Free Entry' : `₹${e.entryFee}`,
      color: '#f59e0b',
    })),
    { label: 'AR Rahman Live', category: '🎵', meta: 'Dec 14 • Chepauk', color: '#8b5cf6' },
    { label: 'Chennai Food Fest 2024', category: '🍜', meta: '3 Days Left', color: '#10b981' },
  ].filter(Boolean);

  // ── GlassyCarousel theme ────────────────────────────────────────────────
  const carouselTheme = theme === 'dark' ? {
    '--color-background': '#000000',
    '--color-foreground': '#ffffff',
    '--color-card': '#0d0d0d',
    '--color-card-foreground': '#ffffff',
    '--color-muted-foreground': '#94a3b8',
    '--color-border': 'rgba(255, 255, 255, 0.16)',
    '--color-primary': '#38bdf8',
    '--color-primary-foreground': '#000000',
    '--carousel-background': '#000000',
    '--carousel-shadow-color': '#000000',
  } : {
    '--color-background': '#ffffff',
    '--color-foreground': '#0f172a',
    '--color-card': '#ffffff',
    '--color-card-foreground': '#0f172a',
    '--color-muted-foreground': '#64748b',
    '--color-border': 'rgba(0, 0, 0, 0.12)',
    '--color-primary': '#0284c7',
    '--color-primary-foreground': '#ffffff',
    '--carousel-background': '#ffffff',
    '--carousel-shadow-color': '#cbd5e1',
  };

  return (
    <div className="space-y-16 pb-20 overflow-x-hidden bg-white dark:bg-black text-slate-900 dark:text-slate-100 transition-colors duration-300">

      {/* ──────────────────────────────────────────────────────────────────────
          HERO: Glassy Coverflow Carousel + Morphing Headline overlay
      ────────────────────────────────────────────────────────────────────── */}
      <section className="relative w-full bg-white dark:bg-black transition-colors duration-300">
        <GlassyCarousel
          items={heroCarouselItems}
          layout="poster"
          initialIndex={1}
          autoPlay={true}
          interval={5500}
          label="TownTrek Premieres & District Blockbusters"
          style={carouselTheme as React.CSSProperties}
        />
        {/* Morphing headline overlaid bottom-left */}
        <div className="hidden sm:block absolute bottom-10 left-6 sm:left-10 md:left-16 z-20 pointer-events-none max-w-sm sm:max-w-md p-5 rounded-3xl bg-white/70 dark:bg-black/70 backdrop-blur-md border border-slate-200/50 dark:border-white/10 shadow-2xl">
          <MorphingHeadline
            title="Discover Your City."
            subtitle="Tonight."
          />
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────
          FILTER CHIPS (Quick Category Switcher)
      ────────────────────────────────────────────────────────────────────── */}
      <FadeUp delay={0.05} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <FilterChips
          chips={FILTER_CHIPS}
          value={activeFilter}
          onChange={setActiveFilter}
        />
      </FadeUp>

      {/* ──────────────────────────────────────────────────────────────────────
          BENTO GRID: Asymmetric Metropolitan Services
      ────────────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Metropolitan Services
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select a service to browse live schedules, seats, and district passes.
          </p>
        </FadeUp>
        <BentoGrid tiles={BENTO_TILES} />
      </section>

      {/* ──────────────────────────────────────────────────────────────────────
          STAT COUNTERS: Animated numbers
      ────────────────────────────────────────────────────────────────────── */}
      <FadeUp className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-100 dark:border-white/8 bg-slate-50/60 dark:bg-neutral-950/60 backdrop-blur-sm px-8">
          <StatCounters />
        </div>
      </FadeUp>

      {/* ──────────────────────────────────────────────────────────────────────
          MOVIES: Now Playing — Tilt Cards
      ────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showMovies && (
          <motion.section
            key="movies"
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionReveal>
              <RevealItem className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    Now Playing in Cinemas {selectedCity ? `in ${selectedCity}` : ''}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Live theatrical screening with Dolby Atmos, 4K projection, and interactive seat booking
                  </p>
                </div>
                <Link to="/movies" className="text-xs font-bold text-brand-600 dark:text-sky-400 hover:underline flex items-center space-x-1">
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </RevealItem>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-3xl overflow-hidden bg-slate-100 dark:bg-neutral-900/40 border border-slate-200 dark:border-white/10 p-0 animate-pulse flex flex-col justify-between">
                      <div className="h-64 w-full bg-slate-200 dark:bg-neutral-800" />
                      <div className="p-4 flex items-center justify-between border-t border-slate-200 dark:border-neutral-800">
                        <div className="h-3.5 w-24 bg-slate-200 dark:bg-neutral-800 rounded-md" />
                        <div className="h-3.5 w-16 bg-slate-200 dark:bg-neutral-800 rounded-md" />
                      </div>
                    </div>
                  ))
                ) : (
                  filteredMovies.slice(0, 4).map((m) => {
                  const poster = m.posterUrl || getMovieImage(m.movieId);
                  return (
                    <RevealItem key={m.movieId}>
                      <Link to={`/movies/${m.movieId}`} className="block group">
                        <TiltCard className="rounded-3xl overflow-hidden bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-white/10 hover:border-brand-500/50 hover:shadow-2xl transition-all">
                          <div className="relative h-64 w-full overflow-hidden bg-slate-900">
                            <img
                              src={poster}
                              alt={m.movieName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute top-3 left-3">
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 text-slate-900 backdrop-blur-md shadow-sm">
                                {m.genre}
                              </span>
                            </div>
                            {/* Hover overlay */}
                            <div className="absolute inset-0 flex items-end pb-14 justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                              <span className="px-5 py-2.5 rounded-2xl bg-black/60 dark:bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-lg">
                                Book Now →
                              </span>
                            </div>
                            <div className="absolute bottom-3 left-3 right-3 text-white">
                              <div className="flex items-center space-x-1 text-[11px] text-slate-300 mb-0.5">
                                <Clock className="w-3 h-3" />
                                <span>{m.durationMinutes} Mins • {m.language}</span>
                              </div>
                              <h3 className="font-bold text-base line-clamp-1 group-hover:text-sky-300 transition-colors">
                                {m.movieName}
                              </h3>
                            </div>
                          </div>
                          <div className="p-4 flex items-center justify-between text-xs border-t border-slate-200 dark:border-neutral-800">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Recliner & VIP</span>
                            <span className="font-bold text-brand-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform flex items-center space-x-1">
                              <span>Book Seats</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </TiltCard>
                      </Link>
                    </RevealItem>
                  );
                }))}
              </div>
            </SectionReveal>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────────────────
          CONCERTS: Spotlight Glow Cards
      ────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showConcerts && (
          <motion.section
            key="concerts"
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionReveal>
              <RevealItem className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    Concerts &amp; Standup Comedy {selectedCity ? `in ${selectedCity}` : ''}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Verified artist performances with instant digital pass issuance
                  </p>
                </div>
                <Link to="/entertainment" className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center space-x-1">
                  <span>View All Shows</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </RevealItem>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="h-52 p-5 rounded-3xl bg-slate-100 dark:bg-neutral-900/40 border border-slate-200 dark:border-white/10 animate-pulse flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="h-4 w-20 bg-purple-500/15 rounded-full" />
                          <div className="h-4 w-12 bg-slate-200 dark:bg-neutral-800 rounded-md" />
                        </div>
                        <div className="h-5 w-4/5 bg-slate-200 dark:bg-neutral-800 rounded-md" />
                        <div className="h-3.5 w-full bg-slate-200 dark:bg-neutral-800 rounded-md" />
                      </div>
                      <div className="pt-3 border-t border-slate-200 dark:border-neutral-800 flex justify-between">
                        <div className="h-3.5 w-32 bg-slate-200 dark:bg-neutral-800 rounded-md" />
                        <div className="h-3.5 w-16 bg-purple-500/20 rounded-md" />
                      </div>
                    </div>
                  ))
                ) : (
                  displayParties.map((p) => (
                    <RevealItem key={p.eventId}>
                      <Link to="/entertainment" className="group block h-full">
                        <SpotlightCard
                          glowColor="rgba(168, 85, 247, 0.18)"
                          className="h-full p-5 rounded-3xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-white/10 hover:shadow-xl transition-all flex flex-col justify-between space-y-4"
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="font-bold text-[10px] uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full">
                                {p.category.replace('_', ' ')}
                              </span>
                              <span className="font-bold text-slate-900 dark:text-white">₹ {p.ticketPrice}</span>
                            </div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-purple-500 transition-colors line-clamp-1">
                              {p.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{p.description}</p>
                          </div>
                          <div className="pt-3 border-t border-slate-200 dark:border-neutral-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                            <span className="truncate max-w-[180px]">{p.venue}</span>
                            <span className="font-semibold text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform">
                              Book Pass →
                            </span>
                          </div>
                        </SpotlightCard>
                      </Link>
                    </RevealItem>
                  ))
                )}
              </div>
            </SectionReveal>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────────────────
          WORKSHOPS: Spotlight Glow Cards (amber)
      ────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showWorkshops && (
          <motion.section
            key="workshops"
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionReveal>
              <RevealItem className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    Workshops &amp; Masterclasses {selectedCity ? `in ${selectedCity}` : ''}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Culinary festivals, pottery studios &amp; coding hackathons
                  </p>
                </div>
                <Link to="/events" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center space-x-1">
                  <span>View All Workshops</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </RevealItem>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="h-52 p-5 rounded-3xl bg-slate-100 dark:bg-neutral-900/40 border border-slate-200 dark:border-white/10 animate-pulse flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="h-4 w-20 bg-amber-500/15 rounded-full" />
                          <div className="h-4 w-12 bg-slate-200 dark:bg-neutral-800 rounded-md" />
                        </div>
                        <div className="h-5 w-4/5 bg-slate-200 dark:bg-neutral-800 rounded-md" />
                        <div className="h-3.5 w-full bg-slate-200 dark:bg-neutral-800 rounded-md" />
                      </div>
                      <div className="pt-3 border-t border-slate-200 dark:border-neutral-800 flex justify-between">
                        <div className="h-3.5 w-32 bg-slate-200 dark:bg-neutral-800 rounded-md" />
                        <div className="h-3.5 w-16 bg-amber-500/20 rounded-md" />
                      </div>
                    </div>
                  ))
                ) : (
                  displayEvents.map((e) => (
                    <RevealItem key={e.eventId}>
                      <Link to="/events" className="group block h-full">
                        <SpotlightCard
                          glowColor="rgba(245, 158, 11, 0.18)"
                          className="h-full p-5 rounded-3xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-white/10 hover:shadow-xl transition-all flex flex-col justify-between space-y-4"
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="font-bold text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                                {e.category.replace('_', ' ')}
                              </span>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {Number(e.entryFee) === 0 ? 'FREE' : `₹ ${e.entryFee}`}
                              </span>
                            </div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors line-clamp-1">
                              {e.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{e.description}</p>
                          </div>
                          <div className="pt-3 border-t border-slate-200 dark:border-neutral-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                            <span className="truncate max-w-[180px]">{e.venue}</span>
                            <span className="font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                              RSVP →
                            </span>
                          </div>
                        </SpotlightCard>
                      </Link>
                    </RevealItem>
                  ))
                )}
              </div>
            </SectionReveal>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────────────────
          LANDMARKS: Parallax Scroll Cards
      ────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showLandmarks && (
          <motion.section
            key="landmarks"
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionReveal>
              <RevealItem className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    Heritage Citadel &amp; Metropolitan Landmarks
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Explore historic bastions, French Gothic spires, and seaside promenades
                  </p>
                </div>
                <Link to="/attractions" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1">
                  <span>View All Attractions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </RevealItem>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-3xl overflow-hidden bg-slate-100 dark:bg-neutral-900/40 border border-slate-200 dark:border-white/10 animate-pulse flex flex-col justify-between">
                      <div className="h-56 w-full bg-slate-200 dark:bg-neutral-800" />
                      <div className="p-4 space-y-2.5">
                        <div className="h-4 w-3/4 bg-slate-200 dark:bg-neutral-800 rounded-md" />
                        <div className="h-3 w-full bg-slate-200 dark:bg-neutral-800 rounded-md" />
                      </div>
                    </div>
                  ))
                ) : (
                  displayAttractions.map((a, idx) => (
                    <RevealItem key={a.attractionId}>
                      <Link to="/attractions" className="group block">
                        <ParallaxCard shift={idx % 2 === 0 ? 30 : 50} className="rounded-3xl overflow-hidden bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 hover:shadow-xl transition-all">
                          <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-emerald-950/40 to-slate-900">
                            <img
                              src={getLandmarkImage(a.attractionId)}
                              alt={a.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                            <div className="absolute bottom-3 left-4 right-4 text-white">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block mb-0.5">
                                {a.category}
                              </span>
                              <h3 className="font-bold text-base line-clamp-1">{a.name}</h3>
                            </div>
                          </div>
                          <div className="p-4 space-y-2 text-xs">
                            <p className="text-slate-500 dark:text-slate-400 line-clamp-2">
                              {a.highlights || a.description}
                            </p>
                            <div className="pt-2 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-between text-slate-500 dark:text-slate-400">
                              <span>{a.openingHours}</span>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {Number(a.entryFee) === 0 ? 'Free Entry' : `₹ ${a.entryFee}`}
                              </span>
                            </div>
                          </div>
                        </ParallaxCard>
                      </Link>
                    </RevealItem>
                  ))
                )}
              </div>
            </SectionReveal>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────────────────
          DINING: Culinary Spots & Cafes (Spotlight Cards)
      ────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showDining && (
          <motion.section
            key="dining"
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionReveal>
              <RevealItem className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    District Dining &amp; Artisan Cafes {selectedCity ? `in ${selectedCity}` : ''}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Curated roasteries, rooftop bistros, and authentic street food hubs
                  </p>
                </div>
                <Link to="/dining" className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center space-x-1">
                  <span>View All Dining</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </RevealItem>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-3xl overflow-hidden bg-slate-100 dark:bg-neutral-900/40 border border-slate-200 dark:border-white/10 animate-pulse flex flex-col justify-between">
                      <div className="h-48 w-full bg-slate-200 dark:bg-neutral-800" />
                      <div className="p-4 space-y-2.5">
                        <div className="h-4 w-3/4 bg-slate-200 dark:bg-neutral-800 rounded-md" />
                        <div className="h-3 w-full bg-slate-200 dark:bg-neutral-800 rounded-md" />
                      </div>
                    </div>
                  ))
                ) : (
                  displaySpots.map((s) => (
                    <RevealItem key={s.spotId}>
                      <Link to="/dining" className="group block h-full">
                        <SpotlightCard
                          glowColor="rgba(244, 63, 94, 0.18)"
                          className="h-full rounded-3xl overflow-hidden bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-white/10 hover:shadow-xl transition-all flex flex-col justify-between"
                        >
                          <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-rose-950/40 to-slate-900">
                            <img
                              src={getSpotImage(s.spotId)}
                              alt={s.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                            <div className="absolute top-3 left-3">
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-500/90 text-white backdrop-blur-md shadow-sm">
                                {s.category || s.spotType}
                              </span>
                            </div>
                            <div className="absolute bottom-3 left-4 right-4 text-white">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 block mb-0.5">
                                {s.cuisineOrSpecialty || s.priceRange || 'Gourmet'}
                              </span>
                              <h3 className="font-bold text-base line-clamp-1">{s.name}</h3>
                            </div>
                          </div>
                          <div className="p-4 space-y-2 text-xs">
                            <p className="text-slate-500 dark:text-slate-400 line-clamp-2">
                              {s.description}
                            </p>
                            <div className="pt-2 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-between text-slate-500 dark:text-slate-400">
                              <span className="truncate max-w-[160px]">{s.address}</span>
                              <span className="font-semibold text-rose-600 dark:text-rose-400 group-hover:translate-x-0.5 transition-transform">
                                Explore →
                              </span>
                            </div>
                          </div>
                        </SpotlightCard>
                      </Link>
                    </RevealItem>
                  ))
                )}
              </div>
            </SectionReveal>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────────────────
          WHY TOWNTREK: Feature Grid
      ────────────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-neutral-950 p-8 sm:p-12 shadow-sm space-y-8">
            <RevealItem className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-brand-600 dark:text-sky-400 uppercase tracking-widest">
                TownTrek District Platform
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Built for Next-Gen Metropolitan Explorers
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                One unified liquid system for movies, concerts, workshops, and dining passes.
              </p>
            </RevealItem>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {[
                {
                  icon: <Sparkles className="w-5 h-5" />,
                  color: 'bg-brand-500/10 text-brand-600 dark:text-sky-400',
                  title: 'Liquid Glass Physics',
                  desc: 'Smooth fluid navigation, coverflow trailers, and slide-action booking for a tactile glass experience.',
                },
                {
                  icon: <Ticket className="w-5 h-5" />,
                  color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
                  title: 'Instant Barcode Passes',
                  desc: 'Generate verified digital tickets with QR barcodes, status badges, and confetti directly in your browser.',
                },
                {
                  icon: <Navigation className="w-5 h-5" />,
                  color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                  title: 'Smart District Matching',
                  desc: 'Automatic GPS coordinate lookup with case-insensitive district database validation across Chennai, Bangalore & beyond.',
                },
                {
                  icon: <ShieldCheck className="w-5 h-5" />,
                  color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                  title: 'Direct SQL Integrity',
                  desc: 'Strict input validation and ACID transactions ensuring double-booking protection and live seat matrices.',
                },
              ].map((f, i) => (
                <RevealItem key={i}>
                  <SpotlightCard
                    glowColor="rgba(148, 163, 184, 0.12)"
                    className="h-full p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-white/5 space-y-3"
                  >
                    <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center`}>
                      {f.icon}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{f.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                  </SpotlightCard>
                </RevealItem>
              ))}
            </div>
          </div>
        </SectionReveal>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────
          TESTIMONIALS: 21st.dev TestimonialsSection
      ────────────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-neutral-950/80 backdrop-blur-xl p-6 sm:p-10 shadow-sm">
            <TestimonialsSection />
          </div>
        </FadeUp>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────
          CTA BANNER: Magnetic Button
      ────────────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-brand-600 via-sky-600 to-indigo-700 p-8 sm:p-12 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Noise texture */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              }}
            />
            <div className="space-y-2 text-center md:text-left relative z-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Ready to explore your metropolitan district?
              </h2>
              <p className="text-xs sm:text-sm text-sky-100 max-w-xl">
                Create your personalized TownTrek profile with custom avatar, city filter, and instant digital pass wallet.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0 relative z-10">
              {isAuthenticated ? (
                <MagneticButton
                  as="a"
                  href="/passes"
                  strength={35}
                  className="px-6 py-3.5 rounded-2xl bg-white text-slate-900 font-bold text-xs shadow-lg hover:bg-slate-100 transition-all inline-flex items-center"
                  onClick={() => navigate('/passes')}
                >
                  View My Passes →
                </MagneticButton>
              ) : (
                <>
                  <MagneticButton
                    as="a"
                    href="/onboarding"
                    strength={50}
                    className="px-6 py-3.5 rounded-2xl bg-white text-slate-900 font-bold text-xs shadow-lg hover:bg-slate-100 transition-all inline-flex items-center"
                    onClick={() => navigate('/onboarding')}
                  >
                    Start Onboarding
                  </MagneticButton>
                  <MagneticButton
                    as="a"
                    href="/auth"
                    strength={35}
                    className="px-6 py-3.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs border border-white/30 transition-all inline-flex items-center"
                    onClick={() => navigate('/auth')}
                  >
                    Sign In
                  </MagneticButton>
                </>
              )}
            </div>
          </div>
        </FadeUp>
      </section>

    </div>
  );
};

export default HomePage;
