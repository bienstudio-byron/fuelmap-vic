'use client';

import { useState } from 'react';
import { FilterState } from '@/types';
import { Plane, ShoppingCart, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';

interface PartnershipFilterProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const PARTNERSHIPS = [
  { id: 'qantas', label: 'Qantas Points', icon: Plane, color: 'text-red-600', brands: ['BP'] },
  { id: 'flybuys', label: 'Flybuys', icon: ShoppingCart, color: 'text-blue-600', brands: ['Shell'] },
  { id: 'everyday-rewards', label: 'Everyday Rewards', icon: ShoppingCart, color: 'text-orange-600', brands: ['Ampol'] },
  { id: 'velocity', label: 'Velocity Points', icon: Plane, color: 'text-blue-800', brands: ['7-Eleven'] },
  { id: 'racv', label: 'RACV Member', icon: ShieldCheck, color: 'text-yellow-600', brands: ['Ampol', 'United'] },
];

export default function PartnershipFilter({ filters, onChange }: PartnershipFilterProps) {
  const togglePartnership = (id: string) => {
    const current = filters.partnerships || [];
    const next = current.includes(id)
      ? current.filter(p => p !== id)
      : [...current, id];
    onChange({ ...filters, partnerships: next });
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rewards & Partnerships</label>
      <div className="flex flex-wrap gap-2">
        {PARTNERSHIPS.map((p) => {
          const isActive = (filters.partnerships || []).includes(p.id);
          return (
            <button
              key={p.id}
              onClick={() => togglePartnership(p.id)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-all',
                isActive
                  ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              )}
            >
              <p.icon size={14} className={isActive ? 'text-white' : p.color} />
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

