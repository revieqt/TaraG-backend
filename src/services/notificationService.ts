import admin from 'firebase-admin';

if (!admin.apps.length) {
  let serviceAccount;
  
  try {
    // Try to load from credentials file (for local development)
    const path = require('path');
    serviceAccount = require(path.join(__dirname, '../../credentials/serviceAccount.json'));
  } catch (error) {
    // If file not found, try to use environment variables (for production)
    console.log('Service account file not found, using environment variables');
    serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      universe_domain: "googleapis.com"
    };
  }
  
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    throw error;
  }
}

const db = admin.firestore();

interface NotificationData {
  id: string;
  userID: string;
  note: string;
  notifiedOn?: { seconds: number };
  state?: string;
  action?: string;
}

export async function getNotifications(userId: string): Promise<NotificationData[]> {
  try {
    console.log('Querying notifications for userID:', userId);
    
    // First try with orderBy, if it fails, try without it
    let snapshot;
    try {
      snapshot = await db.collection('notifications')
        .where('userID', '==', userId)
        .orderBy('notifiedOn', 'desc')
        .get();
    } catch (orderByError) {
      console.log('OrderBy failed, trying without orderBy:', orderByError);
      snapshot = await db.collection('notifications')
        .where('userID', '==', userId)
        .get();
    }
    
    console.log('Query result - docs count:', snapshot.docs.length);
    
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as NotificationData[];
    
    console.log('Processed notifications:', notifications.length);
    
    // Sort manually if we didn't use orderBy
    if (notifications.length > 0 && notifications[0].notifiedOn) {
      notifications.sort((a, b) => {
        const aTime = a.notifiedOn?.seconds || 0;
        const bTime = b.notifiedOn?.seconds || 0;
        return bTime - aTime;
      });
    }
    
    return notifications;
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