import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap, Circle } from 'react-leaflet';
import { StationPriceData, FuelType } from '@/types';
import PriceMarker from './PriceMarker';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons (though we use custom divIcon, good to have)
import L from 'leaflet';
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapInnerProps {
  center: { lat: number; lng: number };
  radiusKm: number;
  stations: StationPriceData[];
  selectedStationId: string | null;
  onStationSelect: (station: StationPriceData) => void;
  fuelType: FuelType;
}

function MapController({ center, selectedStationId, stations }: { center: { lat: number; lng: number }, selectedStationId: string | null, stations: StationPriceData[] }) {
  const map = useMap();

  // Fly to selected station
  useEffect(() => {
    if (selectedStationId) {
      const station = stations.find(s => s.id === selectedStationId);
      if (station) {
        map.flyTo([station.lat, station.lng], 15, { duration: 1.5 });
      }
    }
  }, [selectedStationId, stations, map]);

  // Fly to center when it changes (e.g. user location found)
  useEffect(() => {
    // Only fly if we aren't focused on a station
    if (!selectedStationId) {
        map.flyTo([center.lat, center.lng], map.getZoom(), { duration: 1 });
    }
  }, [center, map, selectedStationId]);

  return null;
}

export default function MapInner({ 
  center, 
  radiusKm, 
  stations, 
  selectedStationId, 
  onStationSelect,
  fuelType
}: MapInnerProps) {
  // Calculate min/max for color scale
  const prices = stations
    .map(s => s.prices.find(p => p.fuelType === fuelType)?.priceCpl)
    .filter((p): p is number => p !== undefined);
    
  const minPrice = Math.min(...prices, 0); // Avoid Infinity
  const maxPrice = Math.max(...prices, 0);

  return (
    <MapContainer 
      center={[center.lat, center.lng]} 
      zoom={13} 
      style={{ height: '100%', width: '100%' }}
      zoomControl={false} // We might want custom position
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      
      {/* Radius Circle */}
      <Circle 
        center={[center.lat, center.lng]}
        radius={radiusKm * 1000}
        pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.05, weight: 1 }}
      />

      {stations.map(station => {
        const price = station.prices.find(p => p.fuelType === fuelType)?.priceCpl;
        return (
          <PriceMarker
            key={`${station.id}-${price}-${fuelType}`}
            station={station}
            fuelType={fuelType}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onClick={onStationSelect}
            isSelected={selectedStationId === station.id}
          />
        );
      })}

      <MapController 
        center={center} 
        selectedStationId={selectedStationId} 
        stations={stations} 
      />
    </MapContainer>
  );
}

