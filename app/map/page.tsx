'use client';

import { useState, useMemo } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { usePrices } from '@/hooks/usePrices';
import { FilterState, StationPriceData } from '@/types';
import { MAJOR_BRANDS, DEFAULT_CENTER } from '@/utils/constants';
import { calculateDistance } from '@/utils/geo';
import Map from '@/components/Map';
import Controls from '@/components/Controls/Controls';
import StationListItem from '@/components/StationList/StationListItem';
import StationDetails from '@/components/StationList/StationDetails';
import SetupBanner from '@/components/SetupBanner';
import { Loader2, List, Tag } from 'lucide-react';
import { clsx } from 'clsx';
import { getRewardsForBrand } from '@/utils/rewards';

export default function MapPage() {
  const { lat, lng, loading: geoLoading } = useGeolocation();
  
  // State
  const [filters, setFilters] = useState<FilterState>({
    fuelType: 'U91',
    radius: 5,
    brands: [...MAJOR_BRANDS],
    sort: 'cheapest',
    includeIndependents: false,
    discounts: {},
    partnerships: [],
  });

  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [isMobileListOpen, setIsMobileListOpen] = useState(false);
  const [manualLocation, setManualLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Determine center for query (use default if geo fails/loading, but updated once geo returns)
  const center = manualLocation 
    ? manualLocation 
    : (geoLoading ? DEFAULT_CENTER : { lat, lng });

  // Fetch data
  const { data: priceData, isLoading: pricesLoading } = usePrices({
    lat: center.lat,
    lng: center.lng,
    radiusKm: filters.radius,
    enabled: !geoLoading || !!manualLocation,
  });

  const stations = priceData?.stations || [];
  const isMock = priceData?.meta.source === 'MOCK';

  // Filter, Sort, and Apply Discounts
  const processedStations = useMemo(() => {
    if (!stations.length) return [];

    // 1. Filter
    const filtered = stations.filter(station => {
      // A. Brand Filter
      const isMajor = MAJOR_BRANDS.includes(station.brand);
      const isIndependent = station.brand === 'Independent';
      
      let matchesBrand = false;
      if (isMajor) {
        matchesBrand = filters.brands.includes(station.brand);
      } else if (isIndependent) {
        matchesBrand = filters.includeIndependents;
      }
      
      if (!matchesBrand) return false;

      // B. Partnership Filter
      if (filters.partnerships && filters.partnerships.length > 0) {
        const stationRewards = getRewardsForBrand(station.brand);
        const hasPartnership = stationRewards.some(r => filters.partnerships.includes(r.id));
        if (!hasPartnership) return false;
      }

      return true;
    });

    // 2. Apply Discounts & Attach Distances
    const withAdjustedPrices = filtered.map(s => {
      const discountAmount = filters.discounts?.[s.brand] || 0;
      
      // Clone prices and adjust
      const adjustedPrices = s.prices.map(p => ({
        ...p,
        priceCpl: p.priceCpl - discountAmount
      }));

      return {
        ...s,
        prices: adjustedPrices,
        originalPrices: s.prices, // Keep ref if needed
        distance: calculateDistance(center.lat, center.lng, s.lat, s.lng)
      };
    });

    // 3. Sort
    return withAdjustedPrices.sort((a, b) => {
      if (filters.sort === 'closest') {
        return a.distance - b.distance;
      } else {
        const priceA = a.prices.find(p => p.fuelType === filters.fuelType)?.priceCpl || 9999;
        const priceB = b.prices.find(p => p.fuelType === filters.fuelType)?.priceCpl || 9999;
        return priceA - priceB;
      }
    });
  }, [stations, filters, center]);

  const selectedStation = processedStations.find(s => s.id === selectedStationId);

  // Handle station selection
  const handleStationSelect = (station: StationPriceData) => {
    setSelectedStationId(station.id);
    // On mobile, open list/drawer
    setIsMobileListOpen(true);
  };

  // Initial loading state
  if (geoLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500">Locating you...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full relative overflow-hidden">
      {/* Sidebar (Desktop) / Drawer (Mobile) */}
      <div 
        className={clsx(
          "fixed inset-x-0 bottom-0 z-[1100] h-[60%] bg-white shadow-2xl rounded-t-xl md:rounded-none md:shadow-xl transition-transform duration-300 ease-out flex flex-col",
          "md:relative md:inset-auto md:h-full md:w-96 md:translate-y-0",
          isMobileListOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* List Header / Close on Mobile */}
        <div className="md:hidden flex justify-center p-2 bg-gray-100 rounded-t-xl cursor-pointer shrink-0" onClick={() => setIsMobileListOpen(false)}>
           <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {selectedStation ? (
          <StationDetails 
            station={selectedStation} 
            onClose={() => {
                setSelectedStationId(null);
                // Keep mobile list open but go back to list view
            }} 
          />
        ) : (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b bg-white shrink-0">
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-blue-600">FuelMap</span> VIC
              </h1>
              <p className="text-xs text-gray-500 mt-1">Cheapest fuel near you</p>
              {isMock && <div className="mt-2"><SetupBanner /></div>}
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {processedStations.length === 0 ? (
                 <div className="p-8 text-center text-gray-500">
                   {pricesLoading ? (
                     <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
                   ) : (
                     <p>No stations found matching your filters.</p>
                   )}
                 </div>
              ) : (
                processedStations.map(station => (
                  <StationListItem
                    key={station.id}
                    station={station}
                    fuelType={filters.fuelType}
                    distanceKm={station.distance}
                    onClick={() => handleStationSelect(station)}
                    isSelected={selectedStationId === station.id}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Map Area */}
      <div className="flex-1 relative h-full w-full">
        <Controls filters={filters} onFilterChange={setFilters} onLocationSelect={(lat, lng) => setManualLocation({ lat, lng })} />
        
        {/* Active Discount Banner */}
        {Object.keys(filters.discounts || {}).length > 0 && (
           <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-1.5 rounded-full shadow-lg z-[900] text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
              <Tag size={12} />
              Savings Applied: Prices reduced by discounts
           </div>
        )}

        <Map 
          center={center}
          radiusKm={filters.radius}
          stations={processedStations}
          selectedStationId={selectedStationId}
          onStationSelect={handleStationSelect}
          fuelType={filters.fuelType}
        />

        {/* Mobile Toggle for List */}
        {!isMobileListOpen && (
            <button
            onClick={() => setIsMobileListOpen(true)}
            className="md:hidden absolute bottom-6 right-6 z-[1000] bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform active:scale-95"
            >
            <List size={24} />
            </button>
        )}
      </div>
    </div>
  );
}
