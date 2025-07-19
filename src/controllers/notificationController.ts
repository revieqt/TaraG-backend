import { Request, Response } from 'express';
import { getNotifications, changeNotificationToRead, createNotification } from '../services/notificationService';

export async function getUserNotifications(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const notifications = await getNotifications(userId);
    res.json({ notifications });
  } catch (error) {
    console.error('Error in getUserNotifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

export async function markNotificationAsRead(req: Request, res: Response) {
  try {
    const { notificationId } = req.params;
    
    if (!notificationId) {
      return res.status(400).json({ error: 'Notification ID is required' });
    }

    await changeNotificationToRead(notificationId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
}

export async function createNewNotification(req: Request, res: Response) {
  try {
    const { userID, note, state, action } = req.body;
    
    if (!userID || !note) {
      return res.status(400).json({ error: 'User ID and note are required' });
    }

    const notificationId = await createNotification({
      userID,
      note,
      state,
      action
    });

    res.json({ success: true, notificationId });
  } catch (error) {
    console.error('Error in createNewNotification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
} 