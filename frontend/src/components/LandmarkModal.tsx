import React from 'react';
import { X, MapPin, Clock, Sun, Tag, ExternalLink, Compass } from 'lucide-react';
import { TouristAttraction } from '../types';
import { FALLBACK_IMAGE } from '../utils/locationImages';

interface LandmarkModalProps {
  landmark: TouristAttraction | null;
  imageUrl: string;
  onClose: () => void;
}

export const LandmarkModal: React.FC<LandmarkModalProps> = ({ landmark, imageUrl, onClose }) => {
  if (!landmark) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/60 dark:border-white/10 max-h-[90vh] flex flex-col font-['Be_Vietnam_Pro',sans-serif]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Image Header */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-900 overflow-hidden shrink-0">
          <img
            src={imageUrl || FALLBACK_IMAGE}
            alt={landmark.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge & Title in Image */}
          <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-emerald-600/90 text-white backdrop-blur-md shadow-sm">
              {landmark.category.replace('_', ' ')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight text-white drop-shadow font-['Be_Vietnam_Pro',sans-serif]">
              {landmark.name}
            </h2>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto font-['Be_Vietnam_Pro',sans-serif]">
          {/* Key Facts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Entry Fee</span>
              <span className="text-base font-extrabold text-slate-800 dark:text-white mt-0.5">
                {Number(landmark.entryFee) === 0 ? 'Free Entry' : `₹ ${landmark.entryFee}`}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Timings</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                {landmark.openingHours}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Best Time</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5 flex items-center">
                <Sun className="w-3.5 h-3.5 mr-1 text-amber-500 shrink-0" />
                {landmark.bestTimeToVisit || 'Daytime'}
              </span>
            </div>
          </div>

          {/* Highlights & Description */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Curated Highlights</span>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100/60 dark:border-emerald-900/40 leading-relaxed font-light">
              {landmark.highlights || landmark.description}
            </p>
          </div>

          {/* Address Location */}
          <div className="flex items-start space-x-3 text-sm text-slate-700 dark:text-slate-300">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Location</span>
              <p className="font-semibold text-slate-800 dark:text-white">{landmark.location}</p>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-white/10">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(landmark.name + ' ' + landmark.location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold flex items-center justify-center space-x-2 hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors shadow-sm"
            >
              <span>View On Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandmarkModal;
