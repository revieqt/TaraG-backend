import express from 'express';
import { getWeeklyWeather, getCurrentWeather } from '../controllers/weatherController';

const router = express.Router();

router.get('/', getWeeklyWeather);
router.get('/current', getCurrentWeather);

export default router; 