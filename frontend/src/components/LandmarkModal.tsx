import React from 'react';
import { X, MapPin, Clock, Sun, Tag, ExternalLink, Compass } from 'lucide-react';
import { TouristAttraction } from '../types';

interface LandmarkModalProps {
  landmark: TouristAttraction | null;
  imageUrl: string;
  onClose: () => void;
}

export const LandmarkModal: React.FC<LandmarkModalProps> = ({ landmark, imageUrl, onClose }) => {
  if (!landmark) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Image Header */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-900 overflow-hidden shrink-0">
          <img
            src={imageUrl}
            alt={landmark.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          
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
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-emerald-500/90 text-white backdrop-blur-md mb-1 shadow-sm">
              {landmark.category.replace('_', ' ')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight text-white drop-shadow">
              {landmark.name}
            </h2>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          {/* Key Quick Facts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Entry Fee</span>
              <span className="text-base font-extrabold text-emerald-600 mt-0.5">
                {Number(landmark.entryFee) === 0 ? 'FREE ENTRY' : `₹ ${landmark.entryFee}`}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Visiting Hours</span>
              <span className="text-xs font-semibold text-slate-700 mt-0.5 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                {landmark.openingHours}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Best Time</span>
              <span className="text-xs font-semibold text-slate-700 mt-0.5 flex items-center">
                <Sun className="w-3.5 h-3.5 mr-1 text-amber-500 shrink-0" />
                {landmark.bestTimeToVisit}
              </span>
            </div>
          </div>

          {/* Address & Location */}
          <div className="flex items-start space-x-3 text-sm text-slate-700">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Precise Location</span>
              <p className="font-semibold text-slate-800">{landmark.location}</p>
            </div>
          </div>

          {/* Detailed Highlights */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>Architectural &amp; Historical Highlights</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
              {landmark.highlights}
            </p>
          </div>

          {/* Visitor Action / Navigation */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <div className="text-xs text-slate-400 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-slate-600">Open for public tourists &amp; visitors</span>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(landmark.name + ' ' + landmark.location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-center space-x-2 hover:bg-emerald-600 transition-colors shadow-sm"
            >
              <span>Get Directions on Map</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
