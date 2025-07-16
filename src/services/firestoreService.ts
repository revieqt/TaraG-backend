import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), 
  });
}

const db = admin.firestore();

export async function addItinerary(data: any) {
  const docRef = await db.collection('itineraries').add(data);
  return docRef.id;
} 