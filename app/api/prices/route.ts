import { NextRequest, NextResponse } from 'next/server';
import { generateMockStations } from '@/utils/mockData';
import { PriceResponse, StationPriceData, FuelType, BrandName } from '@/types';
import { randomUUID } from 'crypto';

// Helper to map API Brand to our internal BrandName
const mapApiBrandToInternal = (brandName: string): BrandName => {
  const lower = (brandName || '').toLowerCase();
  if (lower.includes('ampol') || lower.includes('caltex')) return 'Ampol';
  if (lower.includes('bp')) return 'BP';
  if (lower.includes('shell') || lower.includes('coles express') || lower.includes('viva')) return 'Shell';
  if (lower.includes('7-eleven') || lower.includes('7 eleven')) return '7-Eleven';
  if (lower.includes('united')) return 'United';
  if (lower.includes('costco')) return 'Costco';
  if (lower.includes('liberty')) return 'Liberty';
  if (lower.includes('metro')) return 'Metro';
  return 'Independent';
};

const mapApiFuelTypeToInternal = (apiCode: string): FuelType | null => {
  switch (apiCode) {
    case 'U91': return 'U91';
    case 'P95': return 'U95';
    case 'P98': return 'U98';
    case 'DSL': 
    case 'PDSL': return 'Diesel';
    default: return null;
  }
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = parseFloat(searchParams.get('lat') || '');
  const lng = parseFloat(searchParams.get('lng') || '');
  const radiusKm = Math.max(parseFloat(searchParams.get('radiusKm') || '5'), 10);

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ message: 'Invalid coords' }, { status: 400 });
  }

  const apiKey = process.env.SERVO_SAVER_API_KEY;
  const baseUrl = 'https://api.fuel.service.vic.gov.au/open-data/v1/fuel';

  try {
    if (!apiKey) {
        throw new Error('No API Key configured');
    }

    const headers = {
      'User-Agent': 'FuelMapVIC/1.0',
      'x-consumer-id': apiKey,
      'x-transactionid': randomUUID(),
      'Accept': 'application/json'
    };

    // 1. Try the likely "Prices Search" endpoint pattern
    // Based on the response schema provided, it returns "fuelPriceDetails".
    // We'll try the standard geospatial query against the prices endpoint.
    const pricesUrl = `${baseUrl}/prices?latitude=${lat}&longitude=${lng}&radius=${radiusKm * 1000}`;
    
    console.log(`Fetching real data from: ${pricesUrl}`);

    const res = await fetch(pricesUrl, { headers, next: { revalidate: 300 } });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Real API Failed: ${res.status}`, errorText);
      throw new Error(`API Error: ${res.status}`);
    }

    const data = await res.json();
    
    // 2. Parse using the CONFIRMED schema from screenshot
    // Schema: { fuelPriceDetails: [ { fuelStation: {...}, fuelPrices: [...] } ] }
    const priceDetails = data.fuelPriceDetails || [];

    if (!Array.isArray(priceDetails) || priceDetails.length === 0) {
       throw new Error('No stations found in radius (Empty fuelPriceDetails)');
    }

    const mappedStations: StationPriceData[] = priceDetails.map((item: any) => {
        const s = item.fuelStation;
        const prices = (item.fuelPrices || []).map((p: any) => ({
            stationId: s.id,
            fuelType: mapApiFuelTypeToInternal(p.fuelType),
            priceCpl: p.price,
            updatedAt: p.updatedAt || new Date().toISOString()
        })).filter((p: any) => p.fuelType !== null && p.price > 0); // Filter unavailable/null prices

        return {
            id: s.id,
            name: s.name,
            brand: mapApiBrandToInternal(s.brandId || s.name), // fallback to name if brandId is code
            address: s.address,
            lat: s.location?.latitude,
            lng: s.location?.longitude,
            prices
        };
    });

    return NextResponse.json({
        stations: mappedStations,
        meta: { count: mappedStations.length, source: 'LIVE' }
    });

  } catch (error) {
    console.warn('Using Fallback Data (Reason):', error);
    
    // Fallback to OSM + Smart Mock
    try {
       const { fetchStationsFromOSM } = await import('@/utils/osmFallback');
       const osmStations = await fetchStationsFromOSM(lat, lng, radiusKm);
       
       if (osmStations.length > 0) {
         return NextResponse.json({
           stations: osmStations,
           meta: { count: osmStations.length, source: 'MOCK' }
         });
       }
    } catch (osmError) {
       console.error('OSM Fallback failed:', osmError);
    }
    
    // Last Resort: Random Mock Data
    const mockData = generateMockStations(lat, lng, radiusKm);
    return NextResponse.json({
      stations: mockData,
      meta: { count: mockData.length, source: 'MOCK' }
    });
  }
}
