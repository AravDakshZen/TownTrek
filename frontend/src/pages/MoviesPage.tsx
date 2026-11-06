import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Clock, Globe, ArrowRight, AlertCircle, RefreshCw, Loader2, MapPin } from 'lucide-react';
import api from '../services/api';
import { Movie, Show } from '../types';
import { useCity } from '../context/CityContext';
import { getMovieImage, FALLBACK_IMAGE } from '../utils/locationImages';

export const MoviesPage: React.FC = () => {
  const { selectedCity, matchesCity, isCityMatchingActive } = useCity();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterGenre, setFilterGenre] = useState<string>('ALL');
  const [filterByDistrict, setFilterByDistrict] = useState(true);
  const navigate = useNavigate();

  const fetchMoviesAndShows = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.get<Movie[]>('/movies'),
      api.get<Show[]>('/movies/shows').catch(() => ({ data: [] })),
    ])
      .then(([movieRes, showRes]) => {
        setMovies(Array.isArray(movieRes.data) ? movieRes.data : []);
        setShows(Array.isArray(showRes.data) ? showRes.data : []);
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Failed to fetch movies from MySQL database.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMoviesAndShows();
  }, []);

  // Set of movie IDs screening in active district
  const activeDistrictMovieIds = useMemo(() => {
    if (!isCityMatchingActive) return null;
    const matched = shows.filter(s => matchesCity(`${s.city || ''} ${s.theatreName} ${s.theatreLocation}`));
    return new Set(matched.map(s => s.movieId));
  }, [shows, isCityMatchingActive, matchesCity]);

  const genres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => {
      if (m.genre) {
        set.add(m.genre.trim());
      }
    });
    return ['ALL', ...Array.from(set)];
  }, [movies]);

  const filteredMovies = useMemo(() => {
    let result = movies;

    // Filter by district if toggle enabled
    if (filterByDistrict && isCityMatchingActive && activeDistrictMovieIds) {
      const districtMatches = result.filter(m => activeDistrictMovieIds.has(m.movieId));
      if (districtMatches.length > 0) {
        result = districtMatches;
      }
    }

    // Filter by genre
    if (filterGenre !== 'ALL') {
      result = result.filter((m) => m.genre && m.genre.toLowerCase() === filterGenre.toLowerCase());
    }

    return result;
  }, [movies, filterGenre, filterByDistrict, isCityMatchingActive, activeDistrictMovieIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-3 font-['Be_Vietnam_Pro',sans-serif]">
              <Film className="w-8 h-8 text-brand-600 dark:text-sky-400" />
              <span>Movies &amp; Cinema</span>
            </h1>
            {isCityMatchingActive && (
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 dark:bg-sky-950/60 dark:text-sky-300 border border-brand-200 dark:border-sky-800 shadow-sm">
                <MapPin className="w-3 h-3 text-brand-500" />
                <span>{selectedCity}</span>
              </span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-light font-['Be_Vietnam_Pro',sans-serif]">
            Browse current releases, select verified cinema showtimes, and lock seats in real time.
          </p>
        </div>

        {/* Dynamic Controls */}
        {!loading && !error && (
          <div className="flex flex-wrap items-center gap-2">
            {isCityMatchingActive && (
              <button
                type="button"
                onClick={() => setFilterByDistrict(prev => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filterByDistrict
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {filterByDistrict ? `Screening in ${selectedCity}` : 'Showing All Metropolitans'}
              </button>
            )}

            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setFilterGenre(g)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filterGenre.toLowerCase() === g.toLowerCase()
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading Indicator */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3 text-slate-500">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-sm font-medium">Loading cinema schedules from district MySQL database...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-3xl p-8 text-center max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/40 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Unable to Load Cinema Feed</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{error}</p>
          </div>
          <button
            onClick={fetchMoviesAndShows}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold inline-flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <p className="text-slate-500 text-sm">No movies found matching current filters.</p>
          <button
            onClick={() => { setFilterGenre('ALL'); setFilterByDistrict(false); }}
            className="text-xs text-brand-600 hover:text-brand-700 underline font-semibold"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMovies.map((movie) => {
            const poster = movie.posterUrl || getMovieImage(movie.movieId);
            const isPlayingInActiveDistrict = activeDistrictMovieIds?.has(movie.movieId);

            return (
              <div
                key={movie.movieId}
                className="bg-white dark:bg-neutral-900/70 rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Movie Poster Image */}
                <div className="relative h-60 w-full overflow-hidden bg-slate-900">
                  <img
                    src={poster}
                    alt={movie.movieName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                    <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-brand-600/90 text-white backdrop-blur-md shadow-sm">
                      {movie.genre}
                    </span>
                    {isPlayingInActiveDistrict && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/90 text-white backdrop-blur-md shadow-sm">
                        In {selectedCity}
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-md shadow-sm flex items-center space-x-1">
                      <Globe className="w-3 h-3 text-slate-300 mr-1" />
                      <span>{movie.language}</span>
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
                    <span className="flex items-center space-x-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md">
                      <Clock className="w-3.5 h-3.5 text-brand-400 mr-1" />
                      <span>{movie.durationMinutes} mins</span>
                    </span>
                    <span className="text-brand-300 font-semibold text-[11px]">Dolby Atmos 4K</span>
                  </div>
                </div>

                {/* Movie Details */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors leading-snug">
                      {movie.movieName}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-light">
                      Experience this film in Dolby Atmos and premium cinema sound with real-time seat selection.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-white/10">
                    <button
                      onClick={() => navigate(`/movies/${movie.movieId}`)}
                      className="w-full py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs flex items-center justify-center space-x-2 hover:bg-brand-600 dark:hover:bg-brand-400 transition-colors shadow-sm"
                    >
                      <span>Select Theatres &amp; Seats</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MoviesPage;
