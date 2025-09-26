import express from 'express';
import { reverseGeocode } from '../controllers/locationController';

const router = express.Router();

router.get('/reverse-geocode', reverseGeocode);

export default router;
