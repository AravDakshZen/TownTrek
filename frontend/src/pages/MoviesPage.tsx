import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Clock, Globe, ArrowRight, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import api from '../services/api';
import { Movie } from '../types';
import { getMovieImage } from '../utils/locationImages';

export const MoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterGenre, setFilterGenre] = useState<string>('ALL');
  const navigate = useNavigate();

  const fetchMovies = () => {
    setLoading(true);
    setError(null);
    api.get<Movie[]>('/movies')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setMovies(data);
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
    fetchMovies();
  }, []);

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
    if (filterGenre === 'ALL') {
      return movies;
    }
    return movies.filter((m) => m.genre && m.genre.toLowerCase() === filterGenre.toLowerCase());
  }, [movies, filterGenre]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-3">
            <Film className="w-8 h-8 text-brand-600" />
            <span>Movies &amp; Cinema</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Browse current movie releases, select your preferred cinema showtimes, and book seats in real time.
          </p>
        </div>

        {/* Dynamic Filter Badges */}
        {!loading && !error && movies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setFilterGenre(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterGenre.toLowerCase() === g.toLowerCase()
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Database Connection Required</h2>
            <p className="text-xs text-rose-700 mt-2 font-mono bg-white p-3 rounded-xl border border-rose-100 break-words">
              {error}
            </p>
          </div>
          <p className="text-xs text-slate-500">
            Ensure MySQL is running on port 3306 and Spring Boot backend is active on port 8080.
          </p>
          <button
            onClick={fetchMovies}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="text-center py-20 space-y-2">
          <p className="text-slate-600 font-medium">No movies match the selected genre &quot;{filterGenre}&quot;.</p>
          <button
            onClick={() => setFilterGenre('ALL')}
            className="text-xs text-brand-600 hover:text-brand-700 underline font-semibold"
          >
            Clear genre filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMovies.map((movie) => {
            const poster = movie.posterUrl || getMovieImage(movie.movieId);
            return (
              <div
                key={movie.movieId}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Movie Poster Image */}
                <div className="relative h-60 w-full overflow-hidden bg-slate-900">
                  <img
                    src={poster}
                    alt={movie.movieName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  <div className="absolute top-3 left-3">
                    <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-brand-600/90 text-white backdrop-blur-md shadow-sm">
                      {movie.genre}
                    </span>
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
                    <span className="text-brand-300 font-semibold text-[11px]">In Theatres</span>
                  </div>
                </div>

                {/* Movie Details */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug">
                      {movie.movieName}
                    </h2>
                    <p className="text-xs text-slate-500 mt-2">
                      Experience this film in Dolby Atmos and premium cinema sound with real-time seat selection.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => navigate(`/movies/${movie.movieId}`)}
                      className="w-full py-3 rounded-2xl bg-slate-900 text-white font-semibold text-xs flex items-center justify-center space-x-2 hover:bg-brand-600 transition-colors shadow-sm"
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
