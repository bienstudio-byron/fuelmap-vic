import { BrandName } from '@/types';

export interface DiscountOption {
  id: string;
  label: string;
  brand: BrandName | 'All';
  centsOff: number;
  description?: string;
}

export const AVAILABLE_DISCOUNTS: DiscountOption[] = [
  {
    id: 'coles-4c',
    label: 'Coles Shopper',
    brand: 'Shell',
    centsOff: 4,
    description: '4c off at Shell Coles Express'
  },
  {
    id: 'woolworths-4c',
    label: 'Woolworths Rewards',
    brand: 'Ampol',
    centsOff: 4,
    description: '4c off at Ampol/Caltex'
  },
  {
    id: 'racv',
    label: 'RACV Member',
    brand: 'Ampol', // Usually participating locations, simplified for MVP
    centsOff: 4,
    description: 'Save at participating Ampol'
  },
  {
    id: 'united-2c',
    label: 'United Card',
    brand: 'United',
    centsOff: 2,
  },
  {
    id: '711-app',
    label: '7-Eleven App',
    brand: '7-Eleven',
    centsOff: 2, // Conservative estimate
    description: 'Fuel Lock savings'
  }
];

