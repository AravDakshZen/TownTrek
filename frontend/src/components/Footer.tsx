import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, ShieldAlert, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Brand */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-md bg-brand-500 flex items-center justify-center text-white">
                <Landmark className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-sm text-white">TownTrek</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Unified exploration and booking for films, concerts, workshops, and landmarks.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-xs mb-2">Discovery</h4>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-400 text-[11px]">
              <Link to="/movies" className="hover:text-white transition-colors">Movies</Link>
              <Link to="/entertainment" className="hover:text-white transition-colors">Concerts</Link>
              <Link to="/events" className="hover:text-white transition-colors">Workshops</Link>
              <Link to="/attractions" className="hover:text-white transition-colors">Landmarks</Link>
              <Link to="/dining" className="hover:text-white transition-colors">Dining</Link>
            </div>
          </div>

          {/* Account & Services */}
          <div>
            <h4 className="text-white font-semibold text-xs mb-2">Account</h4>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-400 text-[11px]">
              <Link to="/passes" className="hover:text-white transition-colors">My Passes</Link>
              <Link to="/emergency" className="text-rose-400 hover:text-rose-300 transition-colors">Emergency (112)</Link>
              <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            </div>
          </div>

          {/* Dispatch Info */}
          <div>
            <h4 className="text-white font-semibold text-xs mb-2">Helplines</h4>
            <div className="text-[11px] text-slate-400 space-y-0.5">
              <p className="text-rose-400 font-medium">National Emergency: 112</p>
              <p>Ambulance: 108 &bull; Police: 100</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>&copy; {new Date().getFullYear()} TownTrek. All rights reserved.</p>
          <span>Metropolitan Central District</span>
        </div>
      </div>
    </footer>
  );
};
