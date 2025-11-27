import { StationPriceData, FuelType } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { MapPin } from 'lucide-react';
import { clsx } from 'clsx';
import { BrandLogoFallback } from '@/components/BrandLogo';

interface StationListItemProps {
  station: StationPriceData;
  fuelType: FuelType;
  onClick: () => void;
  isSelected: boolean;
  distanceKm?: number;
}

export default function StationListItem({ 
  station, 
  fuelType, 
  onClick, 
  isSelected,
  distanceKm 
}: StationListItemProps) {
  const priceData = station.prices.find(p => p.fuelType === fuelType);
  const price = priceData?.priceCpl || 0;
  
  return (
    <div 
      onClick={onClick}
      className={clsx(
        "p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors group",
        isSelected ? "bg-blue-50 hover:bg-blue-50 border-l-4 border-l-blue-500" : "border-l-4 border-l-transparent"
      )}
    >
      <div className="flex justify-between items-start gap-3">
        {/* Logo */}
        <div className="shrink-0 pt-1">
          <BrandLogoFallback brand={station.brand} className="w-10 h-10 shadow-sm" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{station.name}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5 truncate">
            <MapPin size={12} />
            {station.address}
          </p>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
             <span className="font-medium text-gray-500">{distanceKm ? `${distanceKm.toFixed(1)}km` : ''}</span>
             <span>•</span>
             <span>
               {priceData?.updatedAt ? formatDistanceToNow(new Date(priceData.updatedAt)) : 'recently'}
             </span>
          </div>
        </div>
        
        <div className="text-right shrink-0">
          <div className={clsx(
            "text-2xl font-black tracking-tight",
            isSelected ? "text-blue-700" : "text-gray-900"
          )}>
            {price.toFixed(1)}
          </div>
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">cents/L</div>
        </div>
      </div>
    </div>
  );
}

