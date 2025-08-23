import express from 'express';
import {
  createItinerary,
  getItinerariesByUser,
  getItineraryById,
  deleteItinerary,
  cancelItinerary,
  updateItinerary,
  markItineraryAsDone
} from '../controllers/itineraryController';

const router = express.Router();

router.post('/', createItinerary);

// Get all itineraries for a user
router.get('/user/:userID', getItinerariesByUser);

// Get itinerary by ID
router.get('/:id', getItineraryById);

// Delete itinerary by ID
router.delete('/:id', deleteItinerary);

// Cancel itinerary by ID
router.post('/cancel/:id', cancelItinerary);

// Update itinerary by ID
router.put('/update/:id', updateItinerary);

// Mark itinerary as done by ID
router.post('/done/:id', markItineraryAsDone);

export default router;