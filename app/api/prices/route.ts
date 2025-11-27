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
  // Base URL derived from documentation Section 7.7
  const baseUrl = 'https://api.fuel.service.vic.gov.au/open-data/v1/fuel';

  try {
    if (!apiKey) {
        // If no key, skip straight to fallback
        throw new Error('No API Key configured');
    }

    // Construct headers as per Section 7.7 of documentation
    const headers = {
      'User-Agent': 'FuelMapVIC/1.0',
      'x-consumer-id': apiKey,
      'x-transactionid': randomUUID(),
      'Accept': 'application/json'
    };

    // Strategy: Fetch Stations using geospatial query
    // Using radius (meters) as this is standard for Vic Gov APIs.
    const stationsUrl = `${baseUrl}/stations?latitude=${lat}&longitude=${lng}&radius=${radiusKm * 1000}`;
    
    console.log(`Fetching real data from: ${stationsUrl}`);

    const res = await fetch(stationsUrl, { headers, next: { revalidate: 300 } });
    
    if (!res.ok) {
      // Log text for debugging
      const errorText = await res.text();
      console.error(`Real API Failed: ${res.status}`, errorText);
      throw new Error(`API Error: ${res.status}`);
    }

    const data = await res.json();
    // Assuming response shape: { stations: [...] } or just [...] based on typical Open Data
    const apiStations = data.stations || data || [];

    if (!Array.isArray(apiStations)) {
       throw new Error('Invalid API Response format');
    }

    if (apiStations.length === 0) {
       // It's possible there are truly no stations, or the API requires a different geo-query.
       // But we'll return empty list (and let frontend handle it) or throw to trigger fallback?
       // Let's throw to trigger OSM fallback so the user at least sees "Smart Mock" stations.
       throw new Error('No stations found in radius');
    }

    const mappedStations: StationPriceData[] = apiStations.map((s: any) => {
        // Prices might be nested in the station object
        const prices = (s.prices || []).map((p: any) => ({
            stationId: s.code || s.id,
            fuelType: mapApiFuelTypeToInternal(p.fuelType),
            priceCpl: p.price,
            updatedAt: p.lastUpdated || new Date().toISOString()
        })).filter((p: any) => p.fuelType !== null);

        return {
            id: s.code || s.id,
            name: s.name,
            brand: mapApiBrandToInternal(s.brand),
            address: s.address,
            lat: s.location?.latitude || s.lat,
            lng: s.location?.longitude || s.lng,
            prices
        };
    });

    return NextResponse.json({
        stations: mappedStations,
        meta: { count: mappedStations.length, source: 'LIVE' }
    });

  } catch (error) {
    console.warn('Using Fallback Data (Reason):', error);
    
    // FALLBACK: OSM Real Locations + Smart Mock Prices
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
    
    // LAST RESORT: Random Mock Data
    const mockData = generateMockStations(lat, lng, radiusKm);
    return NextResponse.json({
      stations: mockData,
      meta: { count: mockData.length, source: 'MOCK' }
    });
  }
}
