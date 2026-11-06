import React, { useEffect, useState, useMemo } from 'react';
import { ShieldAlert, Phone, MapPin, CheckCircle, Clock } from 'lucide-react';
import api from '../services/api';
import { EmergencyService } from '../types';
import { useCity } from '../context/CityContext';

export const EmergencyServicesPage: React.FC = () => {
  const [services, setServices] = useState<EmergencyService[]>([]);
  const [category, setCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const { selectedCity, matchesCity, isCityMatchingActive } = useCity();
  const [showAllDistricts, setShowAllDistricts] = useState(false);

  useEffect(() => {
    setLoading(true);
    const url = category === 'ALL' ? '/guide/emergency' : `/guide/emergency?category=${category}`;
    api.get(url)
      .then((res) => setServices(res.data))
      .finally(() => setLoading(false));
  }, [category]);

  const filteredServices = useMemo(() => {
    if (showAllDistricts || !isCityMatchingActive) return services;
    const matched = services.filter(s =>
      s.category === 'EMERGENCY_HELPLINE' ||
      matchesCity(`${s.serviceName} ${s.address}`)
    );
    return matched.length > 0 ? matched : services;
  }, [services, isCityMatchingActive, showAllDistricts, matchesCity]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Rapid Helplines Banner */}
      <div className="bg-gradient-to-r from-rose-600 to-red-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-200 bg-white/10 px-2.5 py-0.5 rounded-full inline-block">
              Rapid National Response
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Emergency Dispatch Numbers</h2>
            <p className="text-rose-100 text-xs sm:text-sm">In extreme life or safety emergencies, call dispatch immediately:</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20 text-center">
              <span className="block text-[11px] text-rose-200">National Unified</span>
              <span className="text-2xl font-black text-white">112</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20 text-center">
              <span className="block text-[11px] text-rose-200">Police Patrol</span>
              <span className="text-2xl font-black text-white">100</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20 text-center">
              <span className="block text-[11px] text-rose-200">Ambulance</span>
              <span className="text-2xl font-black text-white">108</span>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Section Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
              <ShieldAlert className="w-6 h-6 text-rose-600" />
              <span>Essential District Services Directory</span>
            </h1>
            {selectedCity && (
              <span className="text-xs bg-rose-50 text-rose-700 px-3 py-1 rounded-full font-bold border border-rose-200 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{selectedCity}</span>
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Hospitals, police stations, fire rescue commands, and municipal transit control rooms.
          </p>
        </div>

        {/* Filter categories & district toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedCity && (
            <button
              onClick={() => setShowAllDistricts(prev => !prev)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-200"
            >
              {showAllDistricts ? 'Filter by My District' : 'Show All Cities'}
            </button>
          )}

          {[
            { id: 'ALL', label: 'All Services' },
            { id: 'EMERGENCY_HELPLINE', label: 'Helplines' },
            { id: 'HOSPITAL', label: 'Hospitals & Trauma' },
            { id: 'POLICE', label: 'Police Stations' },
            { id: 'FIRE_SAFETY', label: 'Fire Safety' },
            { id: 'CIVIC_TRANSIT', label: 'Civic & Transit' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                category === cat.id
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
        <div className="text-center py-20 text-slate-400">Loading directory...</div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          No services found for {selectedCity || 'this category'}.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((s) => (
            <div
              key={s.serviceId}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-lg transition-all space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                    {s.category.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                    s.is247 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {s.is247 ? '24x7 Active' : 'Operating Hours'}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 leading-snug">{s.serviceName}</h2>

                <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-800 text-sm">
                    <Phone className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{s.phoneNumber}</span>
                    {s.alternateNumber && (
                      <span className="text-xs font-normal text-slate-500">/ {s.alternateNumber}</span>
                    )}
                  </div>
                  <div className="flex items-start space-x-1.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{s.address}</span>
                  </div>
                </div>

                {s.notes && (
                  <p className="text-xs text-slate-500 pt-2 border-t border-slate-100 italic">
                    "{s.notes}"
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs flex items-center justify-between">
                <a
                  href={`tel:${s.phoneNumber}`}
                  className="w-full text-center py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors flex items-center justify-center space-x-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Organization</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
