import express from 'express';
import { 
  getUserNotificationsController, 
  changeToReadStateController, 
  deleteNotificationController, 
  createNotificationController 
} from '../controllers/notificationController';

const router = express.Router();

// Get all notifications for a user
router.get('/user/:userID', getUserNotificationsController);

// Mark notification as read
router.patch('/:id/read', changeToReadStateController);

// Delete a notification
router.delete('/:id', deleteNotificationController);

// Create a new notification
router.post('/', createNotificationController);

export default router; 