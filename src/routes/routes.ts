import { Router } from 'express';
import {
  createRouteHandler,
  deleteRouteHandler,
  getSavedRoutesHandler,
  getRoutesHandler,
} from '../controllers/routeController';

const router = Router();

router.post('/create', createRouteHandler);
router.post('/delete', deleteRouteHandler);
router.post('/saved', getSavedRoutesHandler);
router.post('/get', getRoutesHandler);

export default router;