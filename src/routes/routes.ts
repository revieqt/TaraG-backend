import { Router } from 'express';
import {
  createRouteHandler,
  deleteRouteHandler,
  getSavedRoutesHandler,
  getRoutesHandler,
} from '../controllers/routeController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/create', authMiddleware, createRouteHandler);
router.post('/delete', authMiddleware, deleteRouteHandler);
router.post('/saved', authMiddleware, getSavedRoutesHandler);
router.post('/get', getRoutesHandler);

export default router;