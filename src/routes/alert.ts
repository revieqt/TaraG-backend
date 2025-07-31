import express from 'express';
import { getLatestAlert, createAlert, deleteAlertController } from '../controllers/alertController';

const router = express.Router();

// Get latest alerts based on user location
router.post('/latest', getLatestAlert);

// Create a new alert
router.post('/', createAlert);

// Delete an alert by ID
router.delete('/:id', deleteAlertController);

export default router; 