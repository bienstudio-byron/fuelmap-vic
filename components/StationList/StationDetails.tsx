import { StationPriceData, FuelType } from '@/types';
import { Copy, ExternalLink, X, Clock, MapPin, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';
import { useState } from 'react';
import { BrandLogoFallback } from '@/components/BrandLogo';
import { getRewardsForBrand } from '@/utils/rewards';

interface StationDetailsProps {
  station: StationPriceData;
  onClose: () => void;
}

export default function StationDetails({ station, onClose }: StationDetailsProps) {
  const [copied, setCopied] = useState(false);
  const rewards = getRewardsForBrand(station.brand);

  const handleCopy = () => {
    navigator.clipboard.writeText(station.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${station.lat},${station.lng}`, '_blank');
  };

  return (
    <div className="h-full flex flex-col bg-white animate-in slide-in-from-bottom-4 duration-300">
      {/* Header with Brand Color */}
      <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10 shadow-sm">
        <div className="flex items-center gap-3 overflow-hidden">
           <BrandLogoFallback brand={station.brand} className="w-10 h-10 shrink-0" />
           <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900 truncate">{station.name}</h2>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{station.brand}</p>
           </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
          <X size={20} />
        </button>
      </div>
      
      <div className="p-4 space-y-6 overflow-y-auto flex-1">
        {/* Address & Actions */}
        <div className="space-y-3">
           <div className="flex items-start gap-2 text-gray-600 bg-gray-50 p-3 rounded-lg">
             <MapPin size={18} className="shrink-0 mt-0.5 text-gray-400" />
             <p className="text-sm leading-snug">{station.address}</p>
           </div>
           
           <div className="grid grid-cols-2 gap-3">
             <button 
               onClick={handleOpenMaps}
               className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm active:translate-y-0.5"
             >
               <ExternalLink size={16} />
               Directions
             </button>
             <button 
               onClick={handleCopy}
               className={clsx(
                 "flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-semibold transition-all active:translate-y-0.5",
                 copied ? "bg-green-50 border-green-200 text-green-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"
               )}
             >
               <Copy size={16} />
               {copied ? 'Copied' : 'Copy Address'}
             </button>
           </div>
        </div>

        {/* Rewards & Offers */}
        {rewards.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
               <Tag size={16} className="text-purple-600" />
               Rewards & Offers
            </h3>
            <div className="space-y-2">
              {rewards.map(reward => (
                <div key={reward.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-white border border-purple-100 rounded-xl">
                  <div className={clsx("p-2 bg-white rounded-full shadow-sm", reward.color)}>
                    <reward.icon size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-900">{reward.name}</div>
                    <div className="text-xs text-gray-600">{reward.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prices Grid */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Clock size={16} className="text-blue-600" />
            Live Prices
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {station.prices.map((price) => (
              <div key={price.fuelType} className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-blue-200 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-700">
                    {price.fuelType}
                  </span>
                </div>
                
                <div className="mt-2">
                   <div className="flex items-baseline gap-0.5">
                      <span className="text-2xl font-black text-gray-900">{price.priceCpl.toFixed(1)}</span>
                      <span className="text-xs font-medium text-gray-400">c/L</span>
                   </div>
                   <div className="text-[10px] text-gray-400 mt-1 font-medium">
                     {formatDistanceToNow(new Date(price.updatedAt))} ago
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

