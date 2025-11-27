import { StationPriceData, BrandName, FuelType } from '@/types';
import { MAJOR_BRANDS, FUEL_TYPES } from '@/utils/constants';
import { generateSmartPrice } from '@/utils/mockData';

// Helper to map OSM tags to our BrandName type
const mapOsmBrandToInternal = (tags: any): BrandName => {
  const name = (tags.name || '').toLowerCase();
  const brand = (tags.brand || '').toLowerCase();
  const operator = (tags.operator || '').toLowerCase();
  
  const combined = `${name} ${brand} ${operator}`;

  if (combined.includes('ampol') || combined.includes('caltex')) return 'Ampol';
  if (combined.includes('bp')) return 'BP';
  if (combined.includes('shell') || combined.includes('viva')) return 'Shell';
  if (combined.includes('7-eleven') || combined.includes('7 eleven')) return '7-Eleven';
  if (combined.includes('united')) return 'United';
  if (combined.includes('costco')) return 'Costco';
  if (combined.includes('liberty')) return 'Liberty';
  if (combined.includes('metro')) return 'Metro';
  
  return 'Independent';
};

export async function fetchStationsFromOSM(lat: number, lng: number, radiusKm: number): Promise<StationPriceData[]> {
  const radiusMeters = radiusKm * 1000;
  // Overpass QL query for fuel stations
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="fuel"](around:${radiusMeters},${lat},${lng});
      way["amenity"="fuel"](around:${radiusMeters},${lat},${lng});
    );
    out center;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      // Next.js caching: cache OSM results for a while to be nice to their API
      next: { revalidate: 3600 } 
    });

    if (!response.ok) {
      throw new Error(`OSM API failed: ${response.statusText}`);
    }

    const data = await response.json();
    const elements = data.elements || [];
    const marketBasePrice = 182.9; // Realistic current U91 price

    return elements.map((el: any) => {
      // For 'way' elements (buildings), use the 'center' property
      const stationLat = el.lat || el.center?.lat;
      const stationLng = el.lon || el.center?.lon;
      const tags = el.tags || {};
      
      const brand = mapOsmBrandToInternal(tags);
      const name = tags.name || `${brand} Station`;
      
      // Better Address Logic
      let address = '';
      if (tags['addr:street']) {
         address = `${tags['addr:housenumber'] || ''} ${tags['addr:street']}`;
         if (tags['addr:suburb']) address += `, ${tags['addr:suburb']}`;
         else address += ' VIC';
      } else {
         // If no street address, try to use nearby street context if available, or coords
         address = `${stationLat.toFixed(3)}, ${stationLng.toFixed(3)}`;
      }

      const id = `osm-${el.id}`;

      return {
        id,
        name,
        brand,
        address: address.trim(),
        lat: stationLat,
        lng: stationLng,
        prices: FUEL_TYPES.map(type => ({
          stationId: id,
          fuelType: type,
          priceCpl: generateSmartPrice(type, name, marketBasePrice), 
          updatedAt: new Date().toISOString(), 
        })),
      };
    });

  } catch (err) {
    console.error('Failed to fetch from OSM:', err);
    return []; 
  }
}

