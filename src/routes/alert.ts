import express from 'express';
import { getLatestAlert, createAlert, deleteAlertController, refreshCache } from '../controllers/alertController';

const router = express.Router();

// Get latest alerts based on user location
router.post('/latest', getLatestAlert);

// Create a new alert
router.post('/', createAlert);

// Delete an alert by ID
router.delete('/:id', deleteAlertController);

// Refresh cache manually (for testing/admin purposes)
router.post('/refresh-cache', refreshCache);

export default router; 