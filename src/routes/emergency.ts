import { Router } from 'express';
import { getNearestAmenity } from '../controllers/emergencyControler';

const router = Router();

router.post('/nearest', getNearestAmenity);

export default router;