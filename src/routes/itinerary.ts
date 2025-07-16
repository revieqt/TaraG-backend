import express from 'express';
import { createItinerary } from '../controllers/itineraryController';
import { getItinerariesByUser, getItineraryById, deleteItinerary } from '../controllers/itineraryController';

const router = express.Router();

router.post('/', createItinerary);

// Get all itineraries for a user
router.get('/user/:userID', getItinerariesByUser);

// Get itinerary by ID
router.get('/:id', getItineraryById);

// Delete itinerary by ID
router.delete('/:id', deleteItinerary);

export default router; 