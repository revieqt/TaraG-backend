import admin from 'firebase-admin';

const db = admin.firestore();

export interface NotificationData {
  title: string;
  note: string;
  userID: string;
  action: string;
}

export interface NotificationWithId extends NotificationData {
  id: string;
  state: string;
  createdOn: any; // timestamp
}

export async function getUserNotifications(userID: string): Promise<NotificationWithId[]> {
  try {
    const snapshot = await db.collection('notifications')
      .where('userID', '==', userID)
      .orderBy('createdOn', 'desc')
      .get();
    
    const notifications: NotificationWithId[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data() as NotificationData & { state: string; createdOn: any };
      notifications.push({
        id: doc.id,
        ...data
      });
    });
    
    return notifications;
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
}

export async function changeToReadState(notificationId: string): Promise<boolean> {
  try {
    const docRef = db.collection('notifications').doc(notificationId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      throw new Error('Notification not found');
    }
    
    await docRef.update({
      state: 'read'
    });
    
    return true;
  } catch (error) {
    console.error('Error changing notification to read state:', error);
    throw error;
  }
}

export async function deleteNotification(notificationId: string): Promise<boolean> {
  try {
    const docRef = db.collection('notifications').doc(notificationId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      throw new Error('Notification not found');
    }
    
    await docRef.delete();
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}

export async function createNotification(data: NotificationData): Promise<string> {
  try {
    const notificationData = {
      ...data,
      state: 'unread',
      createdOn: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('notifications').add(notificationData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
} 