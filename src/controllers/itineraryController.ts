import { Request, Response } from 'express';
import { addItinerary } from '../services/firestoreService';

export async function createItinerary(req: Request, res: Response) {
  try {
    const {
      title,
      description,
      type,
      createdOn,
      startDate,
      endDate,
      planDaily,
      locations
    } = req.body;

    // Basic validation (expand as needed)
    if (!title || !type || !createdOn || !startDate || !endDate || !locations) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const itinerary = {
      title,
      description,
      type,
      createdOn,
      startDate,
      endDate,
      planDaily,
      locations
    };

    const id = await addItinerary(itinerary);
    res.status(201).json({ id });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create itinerary' });
  }
} 