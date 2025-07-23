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

export async function addItinerary(data: any) {
  const docRef = await db.collection('itineraries').add(data);
  return docRef.id;
} 