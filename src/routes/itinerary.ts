import express from 'express';
import { createItinerary } from '../controllers/itineraryController';

const router = express.Router();

router.post('/', createItinerary);

export default router; 