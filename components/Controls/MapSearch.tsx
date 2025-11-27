'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface MapSearchProps {
  onLocationSelect: (lat: number, lng: number, displayName: string) => void;
}

export default function MapSearch({ onLocationSelect }: MapSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Debounced Search
  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(async () => {
      setLoading(true);
      try {
        // Restrict to Victoria, Australia
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=au&viewbox=140.9,-34.0,150.0,-39.2&bounded=1`
        );
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      } catch (e) {
        console.error('Search failed', e);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce

    return () => {
        if(debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    onLocationSelect(parseFloat(result.lat), parseFloat(result.lon), result.display_name);
    setQuery(result.display_name.split(',')[0]); // Keep simple name in box
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-md mx-auto pointer-events-auto">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all text-sm"
          placeholder="Search suburb or postcode (VIC)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          // onBlur={() => setTimeout(() => setIsOpen(false), 200)} // Delay to allow clicks
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200">
          <ul className="max-h-60 overflow-y-auto py-1">
            {results.map((result) => (
              <li key={result.place_id}>
                <button
                  onClick={() => handleSelect(result)}
                  className="w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-start gap-3 transition-colors group"
                >
                  <MapPin size={16} className="mt-0.5 text-gray-400 group-hover:text-blue-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {result.display_name.split(',')[0]}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {result.display_name.split(',').slice(1).join(',')}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <div className="px-3 py-1.5 bg-gray-50 border-t text-[10px] text-gray-400 text-center">
            Search via OpenStreetMap
          </div>
        </div>
      )}
    </div>
  );
}

