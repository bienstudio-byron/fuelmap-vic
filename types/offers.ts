import { BrandName } from './index';

export type OfferType = 'FUEL_DISCOUNT' | 'FOOD' | 'COFFEE' | 'BUNDLE';

export interface RetailOffer {
  id: string;
  brand: BrandName;
  title: string; // "2 for $5 Coffee"
  description: string; // "Medium coffee only. Excludes iced."
  type: OfferType;
  expiryDate?: string;
  termsUrl?: string;
  active: boolean;
  logo?: string; // Optional specific image for deal
}

