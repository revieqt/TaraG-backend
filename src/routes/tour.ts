import express from 'express';
import { createTourController } from '../controllers/tourController';

const router = express.Router();

// POST /api/tours/create - Create a new tour
router.post('/create', createTourController);

export default router;