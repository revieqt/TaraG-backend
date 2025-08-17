import { Request, Response } from 'express';
import { addItinerary } from '../services/itineraryService';
import admin from 'firebase-admin';

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
      locations,
      userID
    } = req.body;

    // Basic validation (expand as needed)
    if (!title || !type || !createdOn || !startDate || !endDate || !locations|| !userID) {
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
      locations,
      userID
    };

    const id = await addItinerary(itinerary);
    res.status(201).json({ id });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create itinerary' });
  }
}

// Get all itineraries for a user
export async function getItinerariesByUser(req: Request, res: Response) {
  const { userID } = req.params;
  if (!userID) {
    return res.status(400).json({ error: 'userID is required' });
  }
  try {
    const snapshot = await admin.firestore().collection('itineraries').where('userID', '==', userID).get();
    const itineraries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ itineraries });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch itineraries' });
  }
}

// Get itinerary by ID
export async function getItineraryById(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'id is required' });
  }
  try {
    const doc = await admin.firestore().collection('itineraries').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch itinerary' });
  }
}

// Delete itinerary by ID
export async function deleteItinerary(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'id is required' });
  }
  try {
    await admin.firestore().collection('itineraries').doc(id).delete();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete itinerary' });
  }
} 