import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Film, Music, Calendar, Landmark, Utensils, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { QuickSearchResponse } from '../types';

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<QuickSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    setLoading(true);
    api.get(`/search?q=${encodeURIComponent(query)}`)
      .then((res) => setResults(res.data))
      .catch(() => setResults(null))
      .finally(() => setLoading(false));
  }, [query]);

  const totalResults =
    (results?.attractions.length || 0) +
    (results?.spots.length || 0) +
    (results?.parties.length || 0) +
    (results?.events.length || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-3">
          <Search className="w-8 h-8 text-brand-600" />
          <span>District Quick Search</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Showing search results for <span className="font-bold text-slate-900">"{query}"</span> ({totalResults} results found)
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Searching across district databases...</div>
      ) : !query.trim() ? (
        <div className="text-center py-16 text-slate-400">Enter a keyword in the search bar above to begin.</div>
      ) : totalResults === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-200">
          No matches found for "{query}". Try searching for words like "beach", "fort", "pizza", "rock", or "workshop".
        </div>
      ) : (
        <div className="space-y-10">
          {/* Landmarks */}
          {results && results.attractions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Landmark className="w-5 h-5 text-emerald-600" />
                <span>Tourist Attractions &amp; Landmarks ({results.attractions.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {results.attractions.map((a) => (
                  <div key={a.attractionId} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {a.category}
                    </span>
                    <h3 className="font-bold text-slate-900">{a.name}</h3>
                    <p className="text-xs text-slate-500">{a.location}</p>
                    <p className="text-xs text-slate-600 line-clamp-2 pt-1">{a.highlights}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dining & Spots */}
          {results && results.spots.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Utensils className="w-5 h-5 text-rose-600" />
                <span>Dining &amp; Shopping Venues ({results.spots.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {results.spots.map((s) => (
                  <div key={s.spotId} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                      {s.spotType}
                    </span>
                    <h3 className="font-bold text-slate-900">{s.name}</h3>
                    <p className="text-xs text-slate-500">{s.cuisineOrSpecialty} • {s.priceRange}</p>
                    <p className="text-xs text-slate-600 pt-1">{s.address}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Concerts & Parties */}
          {results && results.parties.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Music className="w-5 h-5 text-purple-600" />
                <span>Live Gigs &amp; Parties ({results.parties.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {results.parties.map((p) => (
                  <div key={p.eventId} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                      {p.category}
                    </span>
                    <h3 className="font-bold text-slate-900">{p.title}</h3>
                    <p className="text-xs text-purple-600 font-semibold">{p.artistPerformer}</p>
                    <p className="text-xs text-slate-500">{p.venue} • Rs. {p.ticketPrice}</p>
                    <Link to="/entertainment" className="text-xs font-bold text-purple-600 hover:underline inline-block pt-1">
                      Book Pass &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events & Workshops */}
          {results && results.events.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                <span>Workshops &amp; Activities ({results.events.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {results.events.map((e) => (
                  <div key={e.eventId} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      {e.category}
                    </span>
                    <h3 className="font-bold text-slate-900">{e.title}</h3>
                    <p className="text-xs text-slate-500">{e.venue}</p>
                    <Link to="/events" className="text-xs font-bold text-amber-600 hover:underline inline-block pt-1">
                      Register RSVP &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

