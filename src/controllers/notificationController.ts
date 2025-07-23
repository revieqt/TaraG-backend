import { Request, Response } from 'express';
import { getNotifications, changeNotificationToRead, createNotification } from '../services/notificationService';

export async function getUserNotifications(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log('Fetching notifications for user:', userId);
    const notifications = await getNotifications(userId);
    console.log('Found notifications:', notifications.length);
    res.json({ notifications });
  } catch (error) {
    console.error('Error in getUserNotifications:', error);
    res.status(500).json({ 
      error: 'Failed to fetch notifications',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
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

// Test endpoint to create a sample notification
export async function createTestNotification(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const testNotification = {
      userID: userId,
      note: 'This is a test notification from the backend!',
      state: 'unread',
      action: '/home'
    };

    const notificationId = await createNotification(testNotification);
    
    res.json({ 
      success: true, 
      notificationId,
      message: 'Test notification created successfully'
    });
  } catch (error) {
    console.error('Error in createTestNotification:', error);
    res.status(500).json({ 
      error: 'Failed to create test notification',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 