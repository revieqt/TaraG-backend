import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import * as taraBuddyController from '../controllers/taraBuddyController';

const router = express.Router();

router.post('/profile', authMiddleware, taraBuddyController.createTaraBuddyProfile);
router.patch('/gender', authMiddleware, taraBuddyController.updateGenderPreference);
router.patch('/distance', authMiddleware, taraBuddyController.updateMaxDistancePreference);
router.patch('/age', authMiddleware, taraBuddyController.updateAgePreference);
router.patch('/zodiac', authMiddleware, taraBuddyController.updateZodiacPreference);
router.delete('/disable', authMiddleware, taraBuddyController.disableTaraBuddyProfile);

export default router;