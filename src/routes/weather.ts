import express from 'express';
import { getWeeklyWeather } from '../controllers/weatherController';

const router = express.Router();

router.get('/', getWeeklyWeather);

export default router; 