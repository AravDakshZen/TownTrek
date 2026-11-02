import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, ArrowRight, ShieldCheck, Ticket, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const WelcomeAuthGatewayPage: React.FC = () => {
  const navigate = useNavigate();
  const { setHasSkippedAuth } = useAuth();

  const handleSkip = () => {
    setHasSkippedAuth(true);
    navigate('/');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="relative max-w-xl w-full bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-2xl overflow-hidden space-y-8 text-center">
        {/* Background Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Icon & Welcome Tagline */}
        <div className="space-y-3">
          <div className="w-16 h-16 bg-gradient-to-tr from-brand-600 to-sky-400 text-white rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-brand-500/25">
            <Landmark className="w-8 h-8" />
          </div>
          <span className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
            Welcome to TownTrek
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Explore Your City, Cinema &amp; Experiences
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Reserve cinema tickets with gourmet snacks, register for concert passes, and discover curated local landmarks and dining spots.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left text-xs">
          <div className="flex items-center space-x-2 text-slate-700">
            <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
            <span>Real-time MySQL Seating</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-700">
            <Ticket className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Digital Passes &amp; QR Entry</span>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* Sign In Primary */}
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-600/20 flex items-center justify-center space-x-2 transition-all group"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Your Account</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Create Account Secondary */}
          <button
            onClick={() => navigate('/register')}
            className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Account</span>
          </button>

          {/* Skip Sign In - Explore as Guest */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleSkip}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline decoration-slate-300 underline-offset-4 transition-colors"
            >
              Skip Sign In &amp; Explore District as Guest &rarr;
            </button>
            <p className="text-[11px] text-slate-400 mt-1">
              (You will be prompted to sign in when booking tickets or inspecting full details)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

