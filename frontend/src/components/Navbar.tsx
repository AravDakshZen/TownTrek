import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film, Music, Calendar, Landmark, Utensils, ShieldAlert, Ticket, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/movies', label: 'Movies', icon: Film },
    { to: '/entertainment', label: 'Concerts', icon: Music },
    { to: '/events', label: 'Workshops', icon: Calendar },
    { to: '/attractions', label: 'Landmarks', icon: Landmark },
    { to: '/dining', label: 'Dining', icon: Utensils },
    { to: '/emergency', label: 'Emergency', icon: ShieldAlert, special: 'emergency' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                TownTrek
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-100">
                District Hub
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items with Active Blue Indicator */}
          <div className="hidden lg:flex items-center space-x-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname.startsWith(link.to);
              
              if (link.special === 'emergency') {
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                      isActive
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-rose-600 hover:bg-rose-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* My Passes in exact same line with active blue indicator */}
            <Link
              to="/passes"
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                location.pathname.startsWith('/passes')
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
              }`}
            >
              <Ticket className={`w-3.5 h-3.5 ${location.pathname.startsWith('/passes') ? 'text-white' : 'text-slate-400'}`} />
              <span>My Passes</span>
            </Link>
          </div>

          {/* User Auth Info Pill */}
          <div className="hidden sm:flex items-center space-x-2 shrink-0">
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-brand-600" />
                <span className="truncate max-w-[120px]">{user?.fullName.split(' ')[0]}</span>
              </span>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-1">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                onClick={() => setMobileMenuOpen(false)}
                to={link.to}
                className={`block px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive ? 'bg-brand-600 text-white' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <Link
            onClick={() => setMobileMenuOpen(false)}
            to="/passes"
            className={`block px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
              location.pathname.startsWith('/passes') ? 'bg-brand-600 text-white' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            My Passes
          </Link>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Signed in as {user?.fullName}</span>
            <button onClick={logout} className="text-xs font-bold text-rose-600 hover:underline">Log Out</button>
          </div>
        </div>
      )}
    </nav>
  );
};
