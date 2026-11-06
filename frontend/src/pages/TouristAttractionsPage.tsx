import React, { useEffect, useState } from 'react';
import { Landmark, MapPin, Clock, Tag, Sun, Info, ArrowUpRight } from 'lucide-react';
import api from '../services/api';
import { TouristAttraction } from '../types';
import { LandmarkModal } from '../components/LandmarkModal';
import { getLandmarkImage, FALLBACK_IMAGE } from '../utils/locationImages';
import { useCity } from '../context/CityContext';

export const TouristAttractionsPage: React.FC = () => {
  const { selectedCity, matchesCity, isCityMatchingActive } = useCity();
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

  const filteredAttractions = isCityMatchingActive && attractions.some(a => matchesCity(`${a.city || ''} ${a.location || ''} ${a.name}`))
    ? attractions.filter(a => matchesCity(`${a.city || ''} ${a.location || ''} ${a.name}`))
    : attractions;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-3 font-['Be_Vietnam_Pro',sans-serif]">
              <Landmark className="w-8 h-8 text-emerald-600" />
              <span>Tourist Attractions &amp; Landmarks</span>
            </h1>
            {isCityMatchingActive && (
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                <MapPin className="w-3 h-3 text-emerald-500" />
                <span>{selectedCity}</span>
              </span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-light font-['Be_Vietnam_Pro',sans-serif]">
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${category === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading landmarks from district database...</div>
      ) : filteredAttractions.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No attractions found in this category.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAttractions.map((a) => {
            const imageUrl = getLandmarkImage(a.attractionId);
            return (
              <div
                key={a.attractionId}
                onClick={() => setSelectedLandmark(a)}
                className="group cursor-pointer bg-white dark:bg-neutral-900/70 rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Location Image Header on Card */}
                <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-emerald-950/40 to-slate-900">
                  <img
                    src={imageUrl}
                    alt={a.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

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

                {/* Content */}
                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                      {a.name}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed font-light">
                      {a.highlights || a.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-white/10 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500 mr-1 shrink-0" />
                        <span className="truncate">{a.location}</span>
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{a.bestTimeToVisit || 'All Day'}</span>
                    </div>

                    <div className="flex items-center text-slate-400 dark:text-slate-500 text-[11px]">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{a.openingHours}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail Guide Popup */}
      <LandmarkModal
        landmark={selectedLandmark}
        imageUrl={selectedLandmark ? getLandmarkImage(selectedLandmark.attractionId) : ''}
        onClose={() => setSelectedLandmark(null)}
      />
    </div>
  );
};

export default TouristAttractionsPage;
