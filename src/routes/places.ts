import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  searchAutocompleteHandler,
  getPlaceDetailsHandler,
} from '../controllers/placesController';

const router = Router();

// Search for places with autocomplete
router.get('/search', authMiddleware, searchAutocompleteHandler);

// Get place details by place ID
router.get('/details/:placeId', authMiddleware, getPlaceDetailsHandler);

export default router;
