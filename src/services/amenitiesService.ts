import axios from 'axios';

export interface Amenity {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  phone: string | null;
  website: string | null;
}

export async function findNearestAmenity(
  amenity: string,
  latitude: number,
  longitude: number
): Promise<Amenity[]> {
  const overpassUrl = 'https://overpass-api.de/api/interpreter';
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="${amenity}"](around:5000,${latitude},${longitude});
      way["amenity"="${amenity}"](around:5000,${latitude},${longitude});
      relation["amenity"="${amenity}"](around:5000,${latitude},${longitude});
    );
    out center tags;
  `;

  const response = await axios.post(overpassUrl, query, {
    headers: { 'Content-Type': 'text/plain' }
  });

  const elements = response.data.elements || [];
  return elements.map((el: any) => ({
    id: el.id?.toString(),
    name: el.tags?.name || `Unknown ${amenity.charAt(0).toUpperCase() + amenity.slice(1)}`,
    latitude: el.lat || el.center?.lat,
    longitude: el.lon || el.center?.lon,
    address:
      el.tags?.['addr:full'] ||
      `${el.tags?.['addr:street'] || ''} ${el.tags?.['addr:city'] || ''}`.trim(),
    phone: el.tags?.phone || el.tags?.contact_phone || null,
    website: el.tags?.website || el.tags?.contact_website || null,
  }));
}
