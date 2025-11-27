'use client';

import { useState } from 'react';
import { FilterState } from '@/types';
import { AVAILABLE_DISCOUNTS } from '@/utils/discounts';
import { Tag, X, ChevronDown, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface DiscountSelectorProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export default function DiscountSelector({ filters, onChange }: DiscountSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Count active discounts
  const activeCount = Object.values(filters.discounts || {}).reduce((a, b) => a + (b > 0 ? 1 : 0), 0);

  const toggleDiscount = (discountId: string, brand: string, amount: number) => {
    const currentDiscounts = { ...filters.discounts };
    
    // Simple toggle logic: if this brand already has this discount amount, remove it.
    // Note: This logic is a bit simplified. A brand might have multiple potential discounts.
    // For MVP, we'll key by Brand.
    
    if (currentDiscounts[brand] === amount) {
      delete currentDiscounts[brand];
    } else {
      currentDiscounts[brand] = amount;
    }

    onChange({ ...filters, discounts: currentDiscounts });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "flex items-center gap-1.5 px-3 py-2 text-sm font-medium border rounded-lg shadow-sm transition-colors",
          activeCount > 0
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
        )}
      >
        <Tag size={16} />
        <span className="hidden sm:inline">Discounts</span>
        {activeCount > 0 && (
          <span className="ml-1 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[100]" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-[101] animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 text-sm">Apply Savings</h3>
              <button onClick={() => setIsOpen(false)}><X size={16} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            
            <div className="space-y-2">
              {AVAILABLE_DISCOUNTS.map((d) => {
                const isActive = filters.discounts?.[d.brand] === d.centsOff;
                
                return (
                  <button
                    key={d.id}
                    onClick={() => toggleDiscount(d.id, d.brand, d.centsOff)}
                    className={clsx(
                      "w-full text-left p-2 rounded-lg border text-sm transition-all flex items-center justify-between group",
                      isActive 
                        ? "bg-green-50 border-green-200 text-green-800" 
                        : "bg-white border-gray-100 hover:border-gray-300 text-gray-600"
                    )}
                  >
                    <div>
                      <div className="font-semibold">{d.label}</div>
                      <div className="text-xs text-gray-400 group-hover:text-gray-500">{d.brand} • Save {d.centsOff}c</div>
                    </div>
                    {isActive && <Check size={16} className="text-green-600" />}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-3 pt-2 border-t text-xs text-gray-400 text-center">
              Prices will update to show your savings.
            </div>
          </div>
        </>
      )}
    </div>
  );
}

