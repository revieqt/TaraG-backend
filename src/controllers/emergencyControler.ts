import { Request, Response } from 'express';
import { findNearestAmenity } from '../services/emergencyService';

export const getNearestAmenity = async (req: Request, res: Response) => {
  try {
    const { amenity, latitude, longitude } = req.body;
    if (!amenity || !latitude || !longitude) {
      return res.status(400).json({ error: 'amenity, latitude, and longitude are required.' });
    }
    const results = await findNearestAmenity(amenity, latitude, longitude);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch amenities.' });
  }
};