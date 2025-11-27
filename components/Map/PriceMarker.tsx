import { DivIcon } from 'leaflet';
import { Marker } from 'react-leaflet';
import { StationPriceData, FuelType } from '@/types';
import { clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { renderToStaticMarkup } from 'react-dom/server';
import { BrandLogoFallback } from '@/components/BrandLogo';

interface PriceMarkerProps {
  station: StationPriceData;
  fuelType: FuelType;
  minPrice: number;
  maxPrice: number;
  onClick: (station: StationPriceData) => void;
  isSelected: boolean;
}

// Helper to interpolate color
const getColor = (price: number, min: number, max: number) => {
  if (min === max) return 'bg-green-500';
  const ratio = (price - min) / (max - min);
  
  if (ratio < 0.25) return 'bg-green-500'; // Cheapest 25%
  if (ratio < 0.5) return 'bg-green-400';
  if (ratio < 0.75) return 'bg-yellow-400';
  return 'bg-red-500'; // Most expensive
};

export default function PriceMarker({ 
  station, 
  fuelType, 
  minPrice, 
  maxPrice, 
  onClick,
  isSelected 
}: PriceMarkerProps) {
  const priceData = station.prices.find(p => p.fuelType === fuelType);
  const price = priceData?.priceCpl || 0;
  const colorClass = getColor(price, minPrice, maxPrice);
  const updatedAgo = priceData?.updatedAt ? formatDistanceToNow(new Date(priceData.updatedAt)) : '';
  
  // Shorten time string
  const shortTime = updatedAgo
    .replace('minutes', 'm').replace('minute', 'm')
    .replace('hours', 'h').replace('hour', 'h')
    .replace('days', 'd').replace('day', 'd')
    .replace('less than a minute', '<1m')
    .split(' ')[0] + (updatedAgo.includes('less') ? '' : updatedAgo.split(' ')[1]?.[0] || '');

  // Render the logo component to a string so Leaflet can use it in HTML
  const logoHtml = renderToStaticMarkup(
    <BrandLogoFallback brand={station.brand} className="w-5 h-5 rounded-full border border-white shadow-sm" />
  );

  const html = `
    <div class="relative flex flex-col items-center justify-center group select-none">
      
      <!-- Bubble Container -->
      <div class="${clsx(
        'flex items-center pl-1 pr-2 h-8 rounded-full shadow-md border-2 transition-transform bg-white gap-1',
        isSelected ? 'border-black scale-110 z-50' : 'border-white group-hover:scale-110'
      )}">
        
        <!-- Brand Logo -->
        <div class="shrink-0 flex items-center justify-center">
           ${logoHtml}
        </div>

        <!-- Price -->
        <div class="font-bold text-sm text-gray-900">
          ${price.toFixed(1)}
        </div>
        
        <!-- Color Indicator Dot -->
        <div class="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white ${colorClass}"></div>
      </div>
      
      <!-- Triangle Pointer -->
      ${isSelected ? '<div class="absolute top-7 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-black"></div>' : ''}
      
      <!-- Hover Time Label -->
      <div class="absolute top-9 bg-gray-800/90 px-1.5 py-0.5 rounded text-[10px] font-medium text-white shadow-sm backdrop-blur whitespace-nowrap ${isSelected ? 'block' : 'hidden group-hover:block'}">
        ${shortTime}
      </div>
    </div>
  `;

  const icon = new DivIcon({
    html,
    className: 'bg-transparent', 
    iconSize: [80, 48], // Wider for the new layout
    iconAnchor: [40, 20], 
  });

  return (
    <Marker 
      position={[station.lat, station.lng]} 
      icon={icon}
      eventHandlers={{
        click: () => onClick(station),
      }}
    />
  );
}

