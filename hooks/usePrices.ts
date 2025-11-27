import { useQuery } from '@tanstack/react-query';
import { PriceResponse, StationPriceData } from '@/types';

interface UsePricesParams {
  lat: number;
  lng: number;
  radiusKm: number;
  enabled?: boolean;
}

async function fetchPrices({ lat, lng, radiusKm }: Omit<UsePricesParams, 'enabled'>) {
  const res = await fetch(`/api/prices?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`);
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  return res.json() as Promise<PriceResponse>;
}

export function usePrices({ lat, lng, radiusKm, enabled = true }: UsePricesParams) {
  return useQuery({
    queryKey: ['prices', lat, lng, radiusKm],
    queryFn: () => fetchPrices({ lat, lng, radiusKm }),
    enabled,
    staleTime: 30000, // 30 seconds
  });
}

