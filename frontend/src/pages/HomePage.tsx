import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, Music, Calendar, Landmark, Utensils, ShieldAlert, ArrowRight, Clock, MapPin, Sparkles } from 'lucide-react';
import api from '../services/api';
import { Movie, PartyConcert, DistrictEvent, TouristAttraction, CitySpot } from '../types';

export const HomePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [parties, setParties] = useState<PartyConcert[]>([]);
  const [events, setEvents] = useState<DistrictEvent[]>([]);
  const [attractions, setAttractions] = useState<TouristAttraction[]>([]);
  const [spots, setSpots] = useState<CitySpot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/movies').then(res => setMovies(res.data.slice(0, 4))),
      api.get('/parties').then(res => setParties(res.data.slice(0, 3))),
      api.get('/events').then(res => setEvents(res.data.slice(0, 3))),
      api.get('/guide/attractions').then(res => setAttractions(res.data.slice(0, 3))),
      api.get('/guide/spots').then(res => setSpots(res.data.slice(0, 3))),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/40 via-slate-900 to-slate-900 pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to Metropolitan Central District</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Discover. Experience. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-400 to-sky-300 bg-clip-text text-transparent">
              Book Your City Passes in Real Time.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed">
            TownTrek connects you directly to live cinema seat reservations, premier music concerts, community cultural fests, heritage tours, and rapid civic helplines.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/movies"
              className="px-6 py-3 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-600/30 transition-all flex items-center space-x-2"
            >
              <span>Explore Movies &amp; Cinemas</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/entertainment"
              className="px-6 py-3 rounded-xl font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 hover:text-white border border-slate-700 transition-all flex items-center space-x-2"
            >
              <span>Concerts &amp; Gigs</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Discovery Hub Quick Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore TownTrek Services
          </h2>
          <p className="text-sm text-slate-500">
            Select a service to browse real-time district schedules and ticketing.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link
            to="/movies"
            className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-500 hover:shadow-lg transition-all text-center space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Movies</h3>
              <p className="text-[11px] text-slate-400">Cinemas &amp; Seats</p>
            </div>
          </Link>

          <Link
            to="/entertainment"
            className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-500 hover:shadow-lg transition-all text-center space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <Music className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Concerts</h3>
              <p className="text-[11px] text-slate-400">Gigs &amp; Comedy</p>
            </div>
          </Link>

          <Link
            to="/events"
            className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-500 hover:shadow-lg transition-all text-center space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Workshops</h3>
              <p className="text-[11px] text-slate-400">Fests &amp; Carnivals</p>
            </div>
          </Link>

          <Link
            to="/attractions"
            className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all text-center space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Landmarks</h3>
              <p className="text-[11px] text-slate-400">Heritage &amp; Parks</p>
            </div>
          </Link>

          <Link
            to="/dining"
            className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-rose-500 hover:shadow-lg transition-all text-center space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Dining</h3>
              <p className="text-[11px] text-slate-400">Food &amp; Bazaars</p>
            </div>
          </Link>

          <Link
            to="/emergency"
            className="group p-5 rounded-2xl bg-white border border-rose-200 hover:border-rose-500 hover:shadow-lg transition-all text-center space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-rose-700 text-sm">Emergency</h3>
              <p className="text-[11px] text-slate-400">24x7 Helplines</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};
export default HomePage;
