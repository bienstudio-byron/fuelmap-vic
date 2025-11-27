'use client';

import { FilterState, FuelType, BrandName } from '@/types';
import { FUEL_TYPES, MAJOR_BRANDS } from '@/utils/constants';
import { SlidersHorizontal, MapPin, ArrowUpDown, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';
import MapSearch from './MapSearch';
import DiscountSelector from './DiscountSelector';
import PartnershipFilter from './PartnershipFilter';

interface ControlsProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onLocationSelect: (lat: number, lng: number) => void;
}

export default function Controls({ filters, onFilterChange, onLocationSelect }: ControlsProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleFuelChange = (fuelType: FuelType) => {
    onFilterChange({ ...filters, fuelType });
  };

  const handleRadiusChange = (radius: number) => {
    onFilterChange({ ...filters, radius });
  };

  const handleBrandToggle = (brand: BrandName) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand];
    onFilterChange({ ...filters, brands: newBrands });
  };

  const handleSortToggle = () => {
    onFilterChange({
      ...filters,
      sort: filters.sort === 'cheapest' ? 'closest' : 'cheapest',
    });
  };
  
  const handleIndependentsToggle = () => {
    onFilterChange({ ...filters, includeIndependents: !filters.includeIndependents });
  };

  const handleSearchLocation = (lat: number, lng: number) => {
      onLocationSelect(lat, lng);
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[95%] max-w-2xl z-[1000] space-y-3 pointer-events-none">
      {/* Search Bar - Now Interactive */}
      <div className="pointer-events-auto">
         <MapSearch onLocationSelect={handleSearchLocation} />
      </div>

      {/* Filters Container - Interactive */}
      <div className="bg-white/95 backdrop-blur shadow-lg rounded-xl p-3 pointer-events-auto">
        {/* Top Row: Fuel Type & Sort */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Left: Scrollable Fuel Types */}
          <div className="overflow-x-auto no-scrollbar flex-1 min-w-0">
            <div className="flex bg-gray-100 rounded-lg p-1 w-max">
              {FUEL_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => handleFuelChange(type)}
                  className={clsx(
                    'px-3 py-1.5 text-sm font-semibold rounded-md transition-all whitespace-nowrap',
                    filters.fuelType === type
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Fixed Actions (Discounts, Sort, Filter) */}
          <div className="flex items-center gap-2 shrink-0 relative z-50">
             <DiscountSelector filters={filters} onChange={onFilterChange} />

             <button
              onClick={handleSortToggle}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 shadow-sm whitespace-nowrap"
            >
              <ArrowUpDown size={16} />
              <span className="hidden sm:inline">{filters.sort === 'cheapest' ? 'Price' : 'Dist.'}</span>
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-2 text-sm font-medium border rounded-lg shadow-sm transition-colors",
                showFilters 
                  ? "bg-blue-50 border-blue-200 text-blue-700" 
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              )}
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* Extended Filters (Radius & Brands) */}
        {showFilters && (
          <div className="space-y-4 pt-2 border-t border-gray-100 animate-in slide-in-from-top-2">
            {/* Radius */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Radius</label>
              <div className="flex gap-2">
                {[5, 10, 20].map(km => (
                  <button
                    key={km}
                    onClick={() => handleRadiusChange(km)}
                    className={clsx(
                      'flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg transition-colors',
                      filters.radius === km
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    )}
                  >
                    <MapPin size={14} />
                    {km}km
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Brands</label>
              <div className="flex flex-wrap gap-2">
                {MAJOR_BRANDS.map(brand => {
                   const isSelected = filters.brands.includes(brand);
                   return (
                    <button
                      key={brand}
                      onClick={() => handleBrandToggle(brand)}
                      className={clsx(
                        'px-3 py-1 text-sm rounded-full border transition-all flex items-center gap-1',
                        isSelected
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {isSelected && <Check size={12} />}
                      {brand}
                    </button>
                  );
                })}
                
                 {/* Independent Toggle */}
                 <button
                    onClick={handleIndependentsToggle}
                    className={clsx(
                      'px-3 py-1 text-sm rounded-full border transition-all flex items-center gap-1',
                      filters.includeIndependents
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    )}
                  >
                     {filters.includeIndependents && <Check size={12} />}
                    Independents
                  </button>
              </div>
            </div>

            {/* Partnerships */}
            <PartnershipFilter filters={filters} onChange={onFilterChange} />
          </div>
        )}
      </div>
    </div>
  );
}
