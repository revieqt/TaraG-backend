import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getFilteredAlerts,
  getAlertsByLocation,
  createAlert,
  updateAlert,
  deleteAlert,
  createTestAlert,
} from '../controllers/alertController';

const router = express.Router();

/**
 * GET /api/alerts
 * Optional query params: locations, date, severity, search
 */
router.get('/', getFilteredAlerts);

/**
 * GET /api/alerts/by-location
 * Required query param: locations (comma-separated list)
 */
router.get('/by-location', getAlertsByLocation);

/**
 * POST /api/alerts
 * Protected: create a new alert
 */
router.post('/', authMiddleware, createAlert);

/**
 * PUT /api/alerts/:id
 * Protected: update an existing alert
 */
router.put('/:id', authMiddleware, updateAlert);

/**
 * DELETE /api/alerts/:id
 * Protected: delete an alert
 */
router.delete('/:id', authMiddleware, deleteAlert);

/**
 * POST /api/alerts/test
 * Create a test alert for debugging
 */
router.post('/test', createTestAlert);

export default router;