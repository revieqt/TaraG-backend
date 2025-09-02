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
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Apply JWT authentication middleware to all routes
router.post('/', authMiddleware, createItinerary);

// Get all itineraries for a user - now accepts status as query parameter
router.get('/user/:userID', authMiddleware, getItinerariesByUser);

// Get itinerary by ID
router.get('/:id', authMiddleware, getItineraryById);

// Delete itinerary by ID
router.delete('/:id', authMiddleware, deleteItinerary);

// Cancel itinerary by ID
router.post('/cancel/:id', authMiddleware, cancelItinerary);

// Update itinerary by ID
router.put('/update/:id', authMiddleware, updateItinerary);

// Mark itinerary as done by ID
router.post('/done/:id', authMiddleware, markItineraryAsDone);

export default router;