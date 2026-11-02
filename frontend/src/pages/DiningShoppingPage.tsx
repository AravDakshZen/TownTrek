import React, { useEffect, useState } from 'react';
import { Utensils, MapPin, Phone, Clock, Star, ArrowUpRight, Info } from 'lucide-react';
import api from '../services/api';
import { CitySpot } from '../types';
import { SpotModal } from '../components/SpotModal';
import { getSpotImage } from '../utils/locationImages';

export const DiningShoppingPage: React.FC = () => {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-3">
            <Utensils className="w-8 h-8 text-rose-600" />
            <span>Dining &amp; Shopping Centres</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Curated restaurants, artisanal cafes, luxury shopping malls, street food streets, and local bazaars. Click on any card for full info &amp; pictures.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: 'All Venues' },
            { id: 'RESTAURANT', label: 'Restaurants' },
            { id: 'CAFE', label: 'Cafes' },
            { id: 'SHOPPING_MALL', label: 'Shopping Malls' },
            { id: 'STREET_FOOD_HUB', label: 'Street Food Hubs' },
            { id: 'LOCAL_BAZAAR', label: 'Local Bazaars' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setTypeFilter(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === cat.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading spots from district database...</div>
      ) : spots.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No establishments found in this category.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spots.map((s) => {
            const imageUrl = getSpotImage(s.spotId);
            return (
              <div
                key={s.spotId}
                onClick={() => setSelectedSpot(s)}
                className="group cursor-pointer bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-rose-300 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Spot Picture Header */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={imageUrl}
                    alt={s.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />

                  <div className="absolute top-3 left-3">
                    <span className="font-bold text-[11px] text-rose-800 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm border border-rose-100">
                      {s.spotType.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{Number(s.rating).toFixed(1)}</span>
                  </div>

                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-rose-600 text-white p-2 rounded-xl shadow-md">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Spot Card Body */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors leading-snug">
                      {s.name}
                    </h2>
                    <p className="text-xs font-semibold text-slate-700 line-clamp-1">
                      {s.cuisineOrSpecialty}
                    </p>

                    <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{s.address}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{s.timings}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{s.contactNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="group-hover:text-rose-600 font-semibold transition-colors flex items-center space-x-1 text-slate-400">
                      <Info className="w-3.5 h-3.5" />
                      <span>View details</span>
                    </span>
                    <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded">
                      {s.priceRange}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedSpot && (
        <SpotModal
          spot={selectedSpot}
          imageUrl={getSpotImage(selectedSpot.spotId)}
          onClose={() => setSelectedSpot(null)}
        />
      )}
    </div>
  );
};
