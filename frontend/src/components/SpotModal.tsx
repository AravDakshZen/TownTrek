import React from 'react';
import { X, MapPin, Clock, Star, Phone, DollarSign, ExternalLink, Utensils } from 'lucide-react';
import { CitySpot } from '../types';

interface SpotModalProps {
  spot: CitySpot | null;
  imageUrl: string;
  onClose: () => void;
}

export const SpotModal: React.FC<SpotModalProps> = ({ spot, imageUrl, onClose }) => {
  if (!spot) return null;

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
            alt={spot.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
          
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
            <div className="flex items-center space-x-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-rose-600/90 text-white backdrop-blur-md shadow-sm">
                {spot.spotType.replace('_', ' ')}
              </span>
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/90 text-white text-xs font-bold backdrop-blur-md">
                <Star className="w-3.5 h-3.5 fill-white" />
                <span>{Number(spot.rating).toFixed(1)} / 5.0</span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight text-white drop-shadow">
              {spot.name}
            </h2>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          {/* Key Facts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Price Range</span>
              <span className="text-base font-extrabold text-slate-800 mt-0.5">
                {spot.priceRange} <span className="text-xs text-slate-400 font-normal">per person</span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Operating Timings</span>
              <span className="text-xs font-semibold text-slate-700 mt-0.5 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                {spot.timings}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Contact Line</span>
              <span className="text-xs font-semibold text-slate-700 mt-0.5 flex items-center">
                <Phone className="w-3.5 h-3.5 mr-1 text-rose-500 shrink-0" />
                {spot.contactNumber}
              </span>
            </div>
          </div>

          {/* Cuisine / Specialty Details */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Utensils className="w-4 h-4 text-rose-600" />
              <span>Signature Cuisines &amp; Specialties</span>
            </div>
            <p className="text-sm font-semibold text-slate-800 bg-rose-50/50 p-4 rounded-2xl border border-rose-100/60 leading-relaxed">
              {spot.cuisineOrSpecialty}
            </p>
          </div>

          {/* Address Location */}
          <div className="flex items-start space-x-3 text-sm text-slate-700">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Address</span>
              <p className="font-semibold text-slate-800">{spot.address}</p>
            </div>
          </div>

          {/* Bottom Call & Map Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <a
              href={`tel:${spot.contactNumber.replace(/[^0-9+]/g, '')}`}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center space-x-2 hover:bg-slate-50 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>Call Venue</span>
            </a>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name + ' ' + spot.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-center space-x-2 hover:bg-rose-600 transition-colors shadow-sm"
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
