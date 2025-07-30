import express from 'express';
import { getLatestAlert, createAlert } from '../controllers/alertController';

const router = express.Router();

// Get latest alerts based on user location
router.post('/latest', getLatestAlert);

// Create a new alert
router.post('/', createAlert);

export default router; 