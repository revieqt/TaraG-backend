import { Router } from 'express';
import { getUserNotifications, markNotificationAsRead, createNewNotification } from '../controllers/notificationController';

const router = Router();

// Get notifications for a user
router.get('/:userId', getUserNotifications);

// Mark notification as read
router.put('/:notificationId/read', markNotificationAsRead);

// Create new notification
router.post('/', createNewNotification);

export default router; 