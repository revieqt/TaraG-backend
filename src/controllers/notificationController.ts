import { Request, Response } from 'express';
import { 
  getUserNotifications, 
  changeToReadState, 
  deleteNotification, 
  createNotification,
  NotificationData 
} from '../services/notificationService';

export async function getUserNotificationsController(req: Request, res: Response) {
  try {
    const { userID } = req.params;
    
    if (!userID) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const notifications = await getUserNotifications(userID);
    res.json({ notifications });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch notifications' });
  }
}

export async function changeToReadStateController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Notification ID is required' });
    }
    
    await changeToReadState(id);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    if (error.message === 'Notification not found') {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.status(500).json({ error: error.message || 'Failed to update notification state' });
  }
}

export async function deleteNotificationController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Notification ID is required' });
    }
    
    await deleteNotification(id);
    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Notification not found') {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.status(500).json({ error: error.message || 'Failed to delete notification' });
  }
}

export async function createNotificationController(req: Request, res: Response) {
  try {
    const { title, note, userID, action }: NotificationData = req.body;

    // Basic validation
    if (!title || !note || !userID || !action) {
      return res.status(400).json({ error: 'Missing required fields: title, note, userID, action' });
    }

    const notificationData: NotificationData = {
      title,
      note,
      userID,
      action
    };

    const id = await createNotification(notificationData);
    res.status(201).json({ id });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create notification' });
  }
} 