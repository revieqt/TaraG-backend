import express from 'express';
import { getGroups, getGroupData, createGroup, joinGroup, approveUserToGroup } from '../controllers/groupController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// All group routes require authentication
router.post('/get-groups', authMiddleware, getGroups);
router.post('/get-group-data', authMiddleware, getGroupData);
router.post('/create-group', authMiddleware, createGroup);
router.post('/join-group', authMiddleware, joinGroup);
router.post('/approve-user', authMiddleware, approveUserToGroup);

export default router;