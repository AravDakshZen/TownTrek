import React, { useEffect, useState } from 'react';
import { Utensils, MapPin, Phone, Clock, Star, ArrowUpRight, Info } from 'lucide-react';
import api from '../services/api';
import { CitySpot } from '../types';
import { SpotModal } from '../components/SpotModal';
import { getSpotImage, FALLBACK_IMAGE } from '../utils/locationImages';
import { useCity } from '../context/CityContext';

export const DiningShoppingPage: React.FC = () => {
  const { selectedCity, matchesCity, isCityMatchingActive } = useCity();
  const [spots, setSpots] = useState<CitySpot[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<CitySpot | null>(null);

  useEffect(() => {
    setLoading(true);
    const url = typeFilter === 'ALL' ? '/guide/spots' : `/guide/spots?type=${typeFilter}`;
    api.get(url)
      .then((res) => setSpots(res.data))
      .finally(() => setLoading(false));
  }, [typeFilter]);

  const filteredSpots = isCityMatchingActive && spots.some(s => matchesCity(`${s.city || ''} ${s.address} ${s.name}`))
    ? spots.filter(s => matchesCity(`${s.city || ''} ${s.address} ${s.name}`))
    : spots;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-3 font-['Be_Vietnam_Pro',sans-serif]">
              <Utensils className="w-8 h-8 text-rose-600" />
              <span>Dining &amp; Shopping Centres</span>
            </h1>
            {isCityMatchingActive && (
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shadow-sm">
                <MapPin className="w-3 h-3 text-rose-500" />
                <span>{selectedCity}</span>
              </span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-light font-['Be_Vietnam_Pro',sans-serif]">
            Curated heritage diners, sea-facing fine dining, artisan roasteries, silk bazaars, and luxury malls.
          </p>
        </div>

        {/* Filter types */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: 'All Spots' },
            { id: 'RESTAURANT', label: 'Restaurants' },
            { id: 'CAFE', label: 'Artisan Cafes' },
            { id: 'LOCAL_BAZAAR', label: 'Local Bazaars' },
            { id: 'SHOPPING_MALL', label: 'Shopping Malls' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setTypeFilter(type.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                typeFilter === type.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading dining &amp; shopping from district database...</div>
      ) : filteredSpots.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No spots found in this category.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpots.map((spot) => {
            const imageUrl = getSpotImage(spot.spotId);
            return (
              <div
                key={spot.spotId}
                onClick={() => setSelectedSpot(spot)}
                className="group cursor-pointer bg-white dark:bg-neutral-900/70 rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-xl hover:border-rose-300 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Spot Image Header */}
                <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-rose-950/40 to-slate-900">
                  <img
                    src={imageUrl}
                    alt={spot.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                  <div className="absolute top-3 left-3">
                    <span className="font-bold text-[11px] text-rose-800 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm border border-rose-100">
                      {spot.spotType.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center space-x-1 font-bold text-xs bg-slate-900/80 text-white backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{spot.rating}</span>
                  </div>

                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-rose-600 text-white p-2 rounded-xl shadow-md">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Spot Info */}
                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
                      {spot.name}
                    </h2>
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-1">
                      {spot.cuisineOrSpecialty || spot.category}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed font-light">
                      {spot.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-white/10 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center text-slate-500 dark:text-slate-400 truncate">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 mr-1.5 shrink-0" />
                      <span className="truncate">{spot.address}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 text-[11px]">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{spot.timings || spot.openingHours}</span>
                      </span>
                      <span className="font-extrabold text-slate-700 dark:text-slate-300">{spot.priceRange}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Spot Detail Modal */}
      <SpotModal
        spot={selectedSpot}
        imageUrl={selectedSpot ? getSpotImage(selectedSpot.spotId) : ''}
        onClose={() => setSelectedSpot(null)}
      />
    </div>
  );
};

export default DiningShoppingPage;
