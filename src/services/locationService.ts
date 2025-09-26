import axios from 'axios';

interface ReverseGeocodeResult {
  suburb?: string;
  city?: string;
  state?: string;
  country?: string;
}

export async function reverseGeocodeLocation(latitude: number, longitude: number): Promise<ReverseGeocodeResult> {
  try {
    // Using Nominatim (OpenStreetMap) for reverse geocoding - free and reliable
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: latitude,
        lon: longitude,
        format: 'json',
        addressdetails: 1,
        zoom: 18
      },
      headers: {
        'User-Agent': 'TaraG-App/1.0'
      }
    });

    const data = response.data;
    const address = data.address || {};

    // Extract location components
    const result: ReverseGeocodeResult = {
      suburb: address.suburb || address.neighbourhood || address.hamlet || address.village,
      city: address.city || address.town || address.municipality,
      state: address.state || address.province || address.region,
      country: address.country
    };

    return result;
  } catch (error) {
    console.error('Reverse geocoding API error:', error);
    throw new Error('Failed to reverse geocode location');
  }
}
