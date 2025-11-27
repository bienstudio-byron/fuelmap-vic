import { StationPriceData, BrandName, FuelType } from '@/types';
import { MAJOR_BRANDS, FUEL_TYPES } from './constants';

// Price profiles relative to a "Market Base Price"
const BRAND_PRICE_PROFILE: Record<string, number> = {
  'Costco': -15.0,
  'Liberty': -8.0,
  'Metro': -8.0,
  'United': -4.0,
  'Ampol': 0.0, // Market base
  'BP': 1.0,
  'Shell': 1.0,
  '7-Eleven': 2.0,
  'Independent': -5.0,
};

const generateSmartPrice = (fuelType: FuelType, brand: string, basePrice: number): number => {
  // 1. Determine Brand Offset
  let brandOffset = 0;
  // Partial match for brand names
  const brandLower = brand.toLowerCase();
  if (brandLower.includes('costco')) brandOffset = BRAND_PRICE_PROFILE['Costco'];
  else if (brandLower.includes('liberty')) brandOffset = BRAND_PRICE_PROFILE['Liberty'];
  else if (brandLower.includes('metro')) brandOffset = BRAND_PRICE_PROFILE['Metro'];
  else if (brandLower.includes('united')) brandOffset = BRAND_PRICE_PROFILE['United'];
  else if (brandLower.includes('bp')) brandOffset = BRAND_PRICE_PROFILE['BP'];
  else if (brandLower.includes('shell') || brandLower.includes('coles express')) brandOffset = BRAND_PRICE_PROFILE['Shell'];
  else if (brandLower.includes('7-eleven')) brandOffset = BRAND_PRICE_PROFILE['7-Eleven'];
  else if (brandLower.includes('ampol') || brandLower.includes('caltex')) brandOffset = BRAND_PRICE_PROFILE['Ampol'];
  else brandOffset = BRAND_PRICE_PROFILE['Independent'];

  // 2. Determine Fuel Type Offset
  let fuelOffset = 0;
  if (fuelType === 'U95') fuelOffset = 14.0;
  if (fuelType === 'U98') fuelOffset = 22.0;
  if (fuelType === 'Diesel') fuelOffset = 2.0;

  // 3. Add small random variance (0.1 - 1.9 cents) so they aren't identical
  const variance = Math.random() * 1.8;

  // 4. Cycle Calculation (simulating price cycle position)
  // We'll assume we are in a "high" or "low" part of the cycle globally, 
  // but individual stations drift slightly.
  
  return parseFloat((basePrice + brandOffset + fuelOffset + variance).toFixed(1));
};

export const generateMockStations = (
  lat: number,
  lng: number,
  radiusKm: number
): StationPriceData[] => {
  // Original random generation (fallback if OSM fails)
  // ... (keeping existing logic for pure mock fallback, but using smart prices)
  
  const count = Math.floor(Math.random() * 10) + 10; 
  const stations: StationPriceData[] = [];
  const marketBasePrice = 182.9; // Realistic current U91 price

  for (let i = 0; i < count; i++) {
    const r = (radiusKm / 111) * Math.sqrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;
    const stationLat = lat + r * Math.cos(theta);
    const stationLng = lng + r * Math.sin(theta) / Math.cos(lat * Math.PI / 180);

    const isMajor = Math.random() > 0.3;
    const brand = isMajor 
      ? MAJOR_BRANDS[Math.floor(Math.random() * MAJOR_BRANDS.length)] 
      : 'Independent';

    const id = `mock-${i}`;

    stations.push({
      id,
      name: `${brand} Station ${i + 1}`,
      brand: brand as BrandName,
      address: `${Math.floor(Math.random() * 100) + 1} Mock Street, VIC`,
      lat: stationLat,
      lng: stationLng,
      prices: FUEL_TYPES.map(type => ({
        stationId: id,
        fuelType: type,
        priceCpl: generateSmartPrice(type, brand, marketBasePrice),
        updatedAt: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24)).toISOString(),
      })),
    });
  }

  return stations;
};

// Export the smart price generator for use in the Route Handler (OSM integration)
export { generateSmartPrice };
