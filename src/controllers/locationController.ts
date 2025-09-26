import { Request, Response } from 'express';
import { reverseGeocodeLocation } from '../services/locationService';

export async function reverseGeocode(req: Request, res: Response) {
  const { latitude, longitude } = req.query;
  
  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'latitude and longitude query parameters are required' });
  }

  try {
    const locationData = await reverseGeocodeLocation(Number(latitude), Number(longitude));
    res.json(locationData);
  } catch (error) {
    console.error('🗺️ Reverse geocoding error:', error);
    res.status(500).json({ error: 'Failed to reverse geocode location' });
  }
}
