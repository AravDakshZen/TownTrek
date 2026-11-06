import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Navigation, Check, Sparkles } from 'lucide-react';
import { useCity } from '../context/CityContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

interface CitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const POPULAR_THREE_CITIES = [
  {
    name: 'Chennai',
    state: 'Tamil Nadu',
    tag: 'Marina, Chetpet & OMR',
    icon: (
      <svg viewBox="0 0 100 100" className="w-14 h-14 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Kapaleeshwarar Gopuram Temple Line Art */}
        <path d="M50 12 L50 6" />
        <circle cx="50" cy="5" r="2" fill="currentColor" />
        <path d="M42 16 L58 16 L54 28 L46 28 Z" />
        <path d="M38 28 L62 28 L59 42 L41 42 Z" />
        <path d="M34 42 L66 42 L63 58 L37 58 Z" />
        <path d="M30 58 L70 58 L68 76 L32 76 Z" />
        <path d="M22 76 L78 76 L78 92 L22 92 Z" />
        <path d="M44 92 L44 80 Q50 76 56 80 L56 92" />
        {/* Gopuram tiers decoration */}
        <line x1="47" y1="22" x2="53" y2="22" />
        <line x1="45" y1="35" x2="55" y2="35" />
        <line x1="43" y1="50" x2="57" y2="50" />
        <line x1="40" y1="67" x2="60" y2="67" />
        <line x1="16" y1="92" x2="84" y2="92" />
      </svg>
    )
  },
  {
    name: 'Bangalore',
    state: 'Karnataka',
    tag: 'Koramangala, Indiranagar',
    icon: (
      <svg viewBox="0 0 100 100" className="w-14 h-14 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Vidhana Soudha Architectural Dome & Columns */}
        <path d="M50 10 L50 6" />
        <circle cx="50" cy="5" r="2" fill="currentColor" />
        {/* Central Dome */}
        <path d="M38 28 Q50 12 62 28 Z" />
        <rect x="36" y="28" width="28" height="6" rx="1" />
        {/* Side Domes */}
        <path d="M20 38 Q26 26 32 38 Z" />
        <path d="M68 38 Q74 26 80 38 Z" />
        {/* Main Structure Base & Pillars */}
        <rect x="16" y="38" width="68" height="8" rx="1" />
        <line x1="24" y1="46" x2="24" y2="84" />
        <line x1="36" y1="46" x2="36" y2="84" />
        <line x1="48" y1="46" x2="48" y2="84" />
        <line x1="52" y1="46" x2="52" y2="84" />
        <line x1="64" y1="46" x2="64" y2="84" />
        <line x1="76" y1="46" x2="76" y2="84" />
        {/* Steps Base */}
        <rect x="12" y="84" width="76" height="8" rx="1" />
        <line x1="8" y1="92" x2="92" y2="92" />
      </svg>
    )
  },
  {
    name: 'Mumbai',
    state: 'Maharashtra',
    tag: 'Bandra, Marine Drive',
    icon: (
      <svg viewBox="0 0 100 100" className="w-14 h-14 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Gateway of India Grand Roman Triumph Arch */}
        {/* Turrets and Domes */}
        <path d="M22 24 Q28 14 34 24 Z" />
        <path d="M66 24 Q72 14 78 24 Z" />
        <path d="M42 20 Q50 10 58 20 Z" />
        <rect x="18" y="24" width="64" height="8" rx="1" />
        {/* Left and Right Pylons */}
        <rect x="18" y="32" width="18" height="56" />
        <rect x="64" y="32" width="18" height="56" />
        {/* Central Grand Arch */}
        <path d="M36 88 L36 54 Q50 36 64 54 L64 88" />
        {/* Side arches */}
        <path d="M22 72 L22 56 Q27 48 32 56 L32 72" />
        <path d="M68 72 L68 56 Q73 48 78 56 L78 72" />
        {/* Base Steps */}
        <line x1="12" y1="88" x2="88" y2="88" />
        <line x1="8" y1="92" x2="92" y2="92" />
      </svg>
    )
  }
];

export const CitySelectorModal: React.FC<CitySelectorModalProps> = ({ isOpen, onClose }) => {
  const { selectedCity, setSelectedCity, detectLocationViaGPS } = useCity();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);

  if (!isOpen) return null;

  const filteredCities = POPULAR_THREE_CITIES.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
    c.tag.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const handleSelectCity = async (cityName: string) => {
    setSelectedCity(cityName);
    try {
      await api.put('/auth/city', { city: cityName });
    } catch (_) {}
    toast.success('District Updated', `Personalized for ${cityName}`);
    onClose();
  };

  const handleGpsClick = async () => {
    setGpsLoading(true);
    try {
      const detected = await detectLocationViaGPS();
      await handleSelectCity(detected);
    } catch {
      await handleSelectCity('Chennai');
    } finally {
      setGpsLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSelectCity(searchQuery.trim());
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Crystal Liquid Glass Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-md transition-all duration-300"
        />

        {/* Modal Window matching Screenshot 1 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-lg rounded-3xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-[24px] font-bold text-slate-900 dark:text-white font-['Be_Vietnam_Pro',sans-serif]">
              Select Location
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Box matching Screenshot 1 */}
          <form onSubmit={handleCustomSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search city, area or locality"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all font-['Be_Vietnam_Pro',sans-serif]"
            />
          </form>

          {/* Use Current Location Button with GPS Icon matching Screenshot 1 */}
          <button
            type="button"
            onClick={handleGpsClick}
            disabled={gpsLoading}
            className="flex items-center space-x-2.5 text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            <Navigation className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
            <span>Use Current Location</span>
          </button>

          {/* Popular Cities Section (3 Cities Only) */}
          <div className="space-y-4 pt-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-['Be_Vietnam_Pro',sans-serif]">
              Popular Cities
            </span>

            <div className="grid grid-cols-3 gap-3.5 sm:gap-4">
              {filteredCities.map((city) => {
                const isSelected = selectedCity.toLowerCase() === city.name.toLowerCase();
                return (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => handleSelectCity(city.name)}
                    className={`relative rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all group ${
                      isSelected
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-2 border-indigo-600 dark:border-indigo-500 shadow-md scale-[1.02]'
                        : 'bg-indigo-50/40 dark:bg-slate-800/50 hover:bg-indigo-50/80 dark:hover:bg-slate-800 border border-indigo-100/80 dark:border-white/5 hover:border-indigo-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}

                    <div className="mb-2 group-hover:scale-105 transition-transform">
                      {city.icon}
                    </div>

                    <span className="font-bold text-slate-900 dark:text-white text-sm block font-['Be_Vietnam_Pro',sans-serif]">
                      {city.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-light mt-0.5">
                      {city.state}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CitySelectorModal;

