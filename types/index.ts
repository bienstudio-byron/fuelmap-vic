export type FuelType = 'U91' | 'U95' | 'U98' | 'Diesel';

export type BrandName = 'Ampol' | 'BP' | 'Shell' | '7-Eleven' | 'United' | 'Independent' | 'Costco' | 'Liberty' | 'Metro';

export interface Station {
  id: string;
  name: string;
  brand: BrandName;
  address: string;
  lat: number;
  lng: number;
  amenities?: string[]; // e.g. ['toilet', 'food', 'coffee']
}

export interface Price {
  stationId: string;
  fuelType: FuelType;
  priceCpl: number; // Cents per litre
  updatedAt: string; // ISO string
}

export interface StationPriceData extends Station {
  prices: Price[];
}

export interface ApiError {
  message: string;
  code: 'MISSING_KEY' | 'API_ERROR' | 'NO_DATA';
}

export interface PriceResponse {
  stations: StationPriceData[];
  meta: {
    count: number;
    source: 'LIVE' | 'MOCK';
  };
}

export interface FilterState {
  fuelType: FuelType;
  radius: number;
  brands: BrandName[];
  sort: 'cheapest' | 'closest';
  includeIndependents: boolean;
  discounts: Record<string, number>; // Brand -> Cents off
  partnerships: string[]; // e.g. ['qantas', 'flybuys']
}
