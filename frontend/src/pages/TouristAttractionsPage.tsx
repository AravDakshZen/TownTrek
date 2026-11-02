import React, { useEffect, useState } from 'react';
import { Landmark, MapPin, Clock, Tag, Sun, Info, ArrowUpRight } from 'lucide-react';
import api from '../services/api';
import { TouristAttraction } from '../types';
import { LandmarkModal } from '../components/LandmarkModal';
import { getLandmarkImage } from '../utils/locationImages';

export const TouristAttractionsPage: React.FC = () => {
  const [attractions, setAttractions] = useState<TouristAttraction[]>([]);
  const [category, setCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedLandmark, setSelectedLandmark] = useState<TouristAttraction | null>(null);

  useEffect(() => {
    setLoading(true);
    const url = category === 'ALL' ? '/guide/attractions' : `/guide/attractions?category=${category}`;
    api.get(url)
      .then((res) => setAttractions(res.data))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-3">
            <Landmark className="w-8 h-8 text-emerald-600" />
            <span>Tourist Attractions &amp; Landmarks</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Historical forts, gothic basilicas, coastal beachways, science museums, and botanic gardens. Click on any card to view detailed gallery &amp; guide.
          </p>
        </div>

        {/* Filter categories */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: 'All Landmarks' },
            { id: 'HERITAGE', label: 'Heritage Sites' },
            { id: 'NATURE_BEACH', label: 'Nature & Beaches' },
            { id: 'MUSEUM', label: 'Museums' },
            { id: 'PARK', label: 'Botanical Parks' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                category === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading landmarks from district database...</div>
      ) : attractions.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No attractions found in this category.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attractions.map((a) => {
            const imageUrl = getLandmarkImage(a.attractionId);
            return (
              <div
                key={a.attractionId}
                onClick={() => setSelectedLandmark(a)}
                className="group cursor-pointer bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Location Image Header on Card */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={imageUrl}
                    alt={a.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                  
                  <div className="absolute top-3 left-3">
                    <span className="font-bold text-[11px] text-emerald-800 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm border border-emerald-100">
                      {a.category.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="font-extrabold text-xs text-white bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm">
                      {Number(a.entryFee) === 0 ? 'FREE ENTRY' : `₹ ${a.entryFee}`}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-600 text-white p-2 rounded-xl shadow-md">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                      {a.name}
                    </h2>

                    <div className="space-y-1.5 text-xs text-slate-500">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{a.location}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{a.openingHours}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">Best Time: {a.bestTimeToVisit}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {a.highlights}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span className="group-hover:text-emerald-600 font-semibold transition-colors flex items-center space-x-1">
                      <Info className="w-3.5 h-3.5" />
                      <span>Click to view details</span>
                    </span>
                    <span className="font-medium text-emerald-600">Open for Visitors</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedLandmark && (
        <LandmarkModal
          landmark={selectedLandmark}
          imageUrl={getLandmarkImage(selectedLandmark.attractionId)}
          onClose={() => setSelectedLandmark(null)}
        />
      )}
    </div>
  );
};
