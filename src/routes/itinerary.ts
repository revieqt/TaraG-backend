import express from 'express';
import { createItinerary } from '../controllers/itineraryController';
import { getItinerariesByUser, getItineraryById } from '../controllers/itineraryController';

const router = express.Router();

router.post('/', createItinerary);

// Get all itineraries for a user
router.get('/user/:userID', getItinerariesByUser);

// Get itinerary by ID
router.get('/:id', getItineraryById);

export default router; 