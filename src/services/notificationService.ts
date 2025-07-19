import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), 
  });
}

const db = admin.firestore();

export async function getNotifications(userId: string) {
  try {
    const snapshot = await db.collection('notifications')
      .where('userID', '==', userId)
      .orderBy('notifiedOn', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

export async function changeNotificationToRead(notificationId: string) {
  try {
    await db.collection('notifications').doc(notificationId).update({
      state: 'read'
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating notification:', error);
    throw error;
  }
}

export async function createNotification(notificationData: {
  userID: string;
  note: string;
  state?: string;
  action?: string;
}) {
  try {
    const docRef = await db.collection('notifications').add({
      ...notificationData,
      notifiedOn: admin.firestore.FieldValue.serverTimestamp(),
      state: notificationData.state || 'unread'
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
} 