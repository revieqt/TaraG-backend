import admin from 'firebase-admin';

if (!admin.apps.length) {
  let serviceAccount;
  try {
    const path = require('path');
    serviceAccount = require(path.join(__dirname, '../../credentials/serviceAccount.json'));
  } catch (error) {
    serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      universe_domain: 'googleapis.com',
    };
  }
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

export async function getEmergencyContact(userId: string): Promise<any[]> {
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) return [];
  const data = userDoc.data() || {};
  return data.emergencyContact || [];
}

export async function setEmergencyContact(userId: string, emergencyContact: any[]): Promise<boolean> {
  await db.collection('users').doc(userId).update({ emergencyContact });
  return true;
}

export async function addEmergencyContact(userId: string, contact: any): Promise<boolean> {
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) throw new Error('User not found');
  const data = userDoc.data() || {};
  const contacts = data.emergencyContact || [];
  contacts.push(contact);
  await db.collection('users').doc(userId).update({ emergencyContact: contacts });
  return true;
}

export async function uploadProfileImage(userId: string, file: Express.Multer.File): Promise<string> {
  try {
    // Check if user exists
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `profile-images/${userId}/${timestamp}-${file.originalname}`;
    
    // Upload to Firebase Storage
    const fileUpload = bucket.file(fileName);
    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (error) => {
        reject(error);
      });

      blobStream.on('finish', async () => {
        try {
          // Make the file publicly accessible
          await fileUpload.makePublic();
          
          // Get the public URL
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          
          // Update user's profileImage in Firestore
          await db.collection('users').doc(userId).update({
            profileImage: publicUrl,
          });
          
          resolve(publicUrl);
        } catch (error) {
          reject(error);
        }
      });

      blobStream.end(file.buffer);
    });
  } catch (error) {
    throw error;
  }
} 