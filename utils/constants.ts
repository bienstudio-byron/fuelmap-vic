import { BrandName, FuelType } from '@/types';

export const MAJOR_BRANDS: BrandName[] = ['Ampol', 'BP', 'Shell', '7-Eleven', 'United'];

export const ALL_BRANDS: BrandName[] = [...MAJOR_BRANDS, 'Independent'];

export const FUEL_TYPES: FuelType[] = ['U91', 'U95', 'U98', 'Diesel'];

export const DEFAULT_CENTER = {
  lat: -37.8136, // Melbourne CBD
  lng: 144.9631,
};

