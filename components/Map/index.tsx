'use client';

import dynamic from 'next/dynamic';
import { StationPriceData, FuelType } from '@/types';

const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 flex items-center justify-center animate-pulse">
      <span className="text-gray-400 font-medium">Loading Map...</span>
    </div>
  ),
});

interface MapProps {
  center: { lat: number; lng: number };
  radiusKm: number;
  stations: StationPriceData[];
  selectedStationId: string | null;
  onStationSelect: (station: StationPriceData) => void;
  fuelType: FuelType;
}

export default function Map(props: MapProps) {
  return <MapInner {...props} />;
}

