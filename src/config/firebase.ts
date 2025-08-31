import admin from 'firebase-admin';

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
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || (serviceAccount?.project_id ? `${serviceAccount.project_id}.appspot.com` : undefined),
    });
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    throw error;
  }
}

export const db = admin.firestore();
export default admin;