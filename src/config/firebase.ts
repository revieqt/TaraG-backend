import admin from 'firebase-admin';
import { FIREBASE_WEB_API_KEY, FIREBASE_STORAGE_BUCKET } from './apiKeys';

if (!admin.apps.length) {
  let serviceAccount;
  try {
    // Try to load from credentials file (for local development)
    const path = require('path');
    serviceAccount = require(path.join(__dirname, '../../credentials/serviceAccount.json'));
  } catch (error) {
    // If file not found, you can add environment variable fallback here if needed
    // serviceAccount = { ... }
  }

  try {
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || 
                         FIREBASE_STORAGE_BUCKET || 
                         (serviceAccount?.project_id ? `${serviceAccount.project_id}.firebasestorage.app` : undefined);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: storageBucket,
    });
    console.log('Firebase Admin SDK initialized successfully');
    console.log('Storage bucket:', storageBucket);
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    throw error;
  }
}

export const db = admin.firestore();
export default admin;