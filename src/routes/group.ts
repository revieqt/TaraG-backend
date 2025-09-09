import express from 'express';
import { getGroups, getGroupData, createGroup, joinGroup, respondJoinRequest, promoteUserToAdmin, kickUserFromGroup, linkGroupItinerary, deleteGroupItinerary, deleteGroup } from '../controllers/groupController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// All group routes require authentication
router.post('/get-groups', authMiddleware, getGroups);
router.post('/get-group-data', authMiddleware, getGroupData);
router.post('/create-group', authMiddleware, createGroup);
router.post('/join-group', authMiddleware, joinGroup);
router.post('/respond-join-request', authMiddleware, respondJoinRequest);
router.post('/promote-user', authMiddleware, promoteUserToAdmin);
router.post('/kick-user', authMiddleware, kickUserFromGroup);
router.post('/leave-group', authMiddleware, kickUserFromGroup); // Reuse kick function for leave
router.post('/link-itinerary', authMiddleware, linkGroupItinerary);
router.post('/delete-itinerary', authMiddleware, deleteGroupItinerary);
router.post('/delete-group', authMiddleware, deleteGroup);

export default router;