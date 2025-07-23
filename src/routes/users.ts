import { Router } from 'express';
import { getUserEmergencyContact, setUserEmergencyContact, addUserEmergencyContact } from '../controllers/usersController';

const router = Router();

router.get('/:userId/emergency-contact', getUserEmergencyContact);
router.put('/:userId/emergency-contact', setUserEmergencyContact);
router.post('/:userId/emergency-contact', addUserEmergencyContact);

export default router; 