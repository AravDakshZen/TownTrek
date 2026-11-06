import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface UserProfile {
  name: string;
  age: number;
  username: string;
  avatarUrl: string;
}

interface CityContextType {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  matchesCity: (text?: string) => boolean;
  filterByCity: <T>(items: T[], getSearchableText: (item: T) => string) => T[];
  validateCityWithDB: (queryCity: string) => Promise<{ matched: boolean; count: number; sampleMatches: string[] }>;
  detectLocationViaGPS: () => Promise<string>;
  clearCityFilter: () => void;
  isCityMatchingActive: boolean;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

// Well-known district alias groupings for smart matching
const DISTRICT_ALIASES: Record<string, string[]> = {
  chennai: ['chennai', 'madras', 'marina', 'chetpet', 'anna nagar', 't. nagar', 't nagar', 'omr', 'velachery', 'adyar', 'guindy', 'besant nagar', 'mylapore', 'triplicane', 'george town', 'thiruvanmiyur', 'ecr'],
  bangalore: ['bangalore', 'bengaluru', 'koramangala', 'indiranagar', 'jayanagar', 'whitefield', 'lavelle', 'church street', 'cubbon', 'mg road', 'brigade road', 'frazer town', 'malleshwaram', 'basavanagudi', 'vasanth nagar', 'central bangalore'],
  bengaluru: ['bangalore', 'bengaluru', 'koramangala', 'indiranagar', 'jayanagar', 'whitefield', 'lavelle', 'church street', 'cubbon', 'mg road', 'brigade road', 'frazer town', 'malleshwaram', 'basavanagudi', 'vasanth nagar', 'central bangalore'],
  mumbai: ['mumbai', 'bombay', 'bandra', 'andheri', 'juhu', 'colaba', 'worli', 'dadar', 'powai', 'marine drive', 'lower parel', 'bkc', 'nariman point', 'apollo bunder', 'fort', 'pali'],
  hyderabad: ['hyderabad', 'hitec city', 'jubilee hills', 'banjara hills', 'gachibowli', 'secunderabad', 'charminar'],
  delhi: ['delhi', 'new delhi', 'connaught place', 'hauz khas', 'saket', 'gurugram', 'noida']
};

export const CityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCityState] = useState<string>(() => {
    return localStorage.getItem('towntrek_selected_city') || '';
  });

  const [userProfile, setUserProfileState] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('towntrek_user_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setSelectedCity = (city: string) => {
    const trimmed = city.trim();
    setSelectedCityState(trimmed);
    if (trimmed) {
      localStorage.setItem('towntrek_selected_city', trimmed);
    } else {
      localStorage.removeItem('towntrek_selected_city');
    }
  };

  const clearCityFilter = () => {
    setSelectedCity('');
  };

  const setUserProfile = (profile: UserProfile) => {
    setUserProfileState(profile);
    localStorage.setItem('towntrek_user_profile', JSON.stringify(profile));
  };

  const matchesCity = (text?: string): boolean => {
    if (!selectedCity || !selectedCity.trim()) return true;
    if (!text) return false;

    const lowerText = text.toLowerCase();
    const queryCity = selectedCity.trim().toLowerCase();

    // Direct case-insensitive substring match
    if (lowerText.includes(queryCity)) return true;

    // Smart alias matching (e.g. "Marina" -> matches Chennai)
    const aliases = DISTRICT_ALIASES[queryCity];
    if (aliases) {
      return aliases.some(alias => lowerText.includes(alias));
    }

    // Reverse alias matching (if user types an alias like "koramangala", matches bangalore addresses)
    for (const [canonicalCity, aliasList] of Object.entries(DISTRICT_ALIASES)) {
      if (aliasList.includes(queryCity) && (lowerText.includes(canonicalCity) || aliasList.some(a => lowerText.includes(a)))) {
        return true;
      }
    }

    return false;
  };

  const filterByCity = <T,>(items: T[], getSearchableText: (item: T) => string): T[] => {
    if (!selectedCity || !selectedCity.trim()) return items;
    const filtered = items.filter(item => matchesCity(getSearchableText(item)));
    // If strict filter yields matches, return them; otherwise, fallback to full list
    return filtered.length > 0 ? filtered : items;
  };

  const validateCityWithDB = async (queryCity: string): Promise<{ matched: boolean; count: number; sampleMatches: string[] }> => {
    if (!queryCity.trim()) return { matched: false, count: 0, sampleMatches: [] };
    const q = queryCity.trim().toLowerCase();

    try {
      const [partiesRes, eventsRes, spotsRes, attractionsRes] = await Promise.all([
        api.get('/parties').catch(() => ({ data: [] })),
        api.get('/events').catch(() => ({ data: [] })),
        api.get('/guide/spots').catch(() => ({ data: [] })),
        api.get('/guide/attractions').catch(() => ({ data: [] })),
      ]);

      const allItems = [
        ...(partiesRes.data || []).map((p: any) => ({ title: p.title, loc: `${p.venue} ${p.location}` })),
        ...(eventsRes.data || []).map((e: any) => ({ title: e.title, loc: `${e.venue} ${e.location}` })),
        ...(spotsRes.data || []).map((s: any) => ({ title: s.name, loc: s.address })),
        ...(attractionsRes.data || []).map((a: any) => ({ title: a.name, loc: a.location })),
      ];

      const aliases = DISTRICT_ALIASES[q] || [q];
      const matchedItems = allItems.filter(item => {
        const text = item.loc.toLowerCase();
        return aliases.some(a => text.includes(a));
      });

      const sampleMatches = matchedItems.slice(0, 5).map(m => `${m.title} (${m.loc})`);
      return {
        matched: matchedItems.length > 0,
        count: matchedItems.length,
        sampleMatches,
      };
    } catch {
      return { matched: false, count: 0, sampleMatches: [] };
    }
  };

  const detectLocationViaGPS = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          let detectedCity = 'Chennai'; // Default fallback metropolitan district

          // Accurate bounding box checks for Indian metropolitans
          if (latitude >= 12.7 && latitude <= 13.5 && longitude >= 79.8 && longitude <= 80.5) {
            detectedCity = 'Chennai';
          } else if (latitude >= 12.8 && latitude <= 13.2 && longitude >= 77.4 && longitude <= 77.8) {
            detectedCity = 'Bangalore';
          } else if (latitude >= 18.8 && latitude <= 19.3 && longitude >= 72.7 && longitude <= 73.1) {
            detectedCity = 'Mumbai';
          } else if (latitude >= 17.2 && latitude <= 17.6 && longitude >= 78.2 && longitude <= 78.6) {
            detectedCity = 'Hyderabad';
          } else if (latitude >= 28.4 && latitude <= 28.9 && longitude >= 76.8 && longitude <= 77.4) {
            detectedCity = 'Delhi';
          } else {
            // Reverse geocode fallback using openstreetmap nominatim
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
              const data = await res.json();
              const city = data.address?.city || data.address?.town || data.address?.state_district || 'Chennai';
              detectedCity = city;
            } catch {
              detectedCity = 'Chennai';
            }
          }

          setSelectedCity(detectedCity);
          resolve(detectedCity);
        },
        (error) => {
          reject(error);
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    });
  };

  return (
    <CityContext.Provider
      value={{
        selectedCity,
        setSelectedCity,
        userProfile,
        setUserProfile,
        matchesCity,
        filterByCity,
        validateCityWithDB,
        detectLocationViaGPS,
        clearCityFilter,
        isCityMatchingActive: Boolean(selectedCity && selectedCity.trim()),
      }}
    >
      {children}
    </CityContext.Provider>
  );
};

export const useCity = (): CityContextType => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};

