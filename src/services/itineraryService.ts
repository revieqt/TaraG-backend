import admin from '../config/firebase';

const db = admin.firestore();

export async function addItinerary(data: any) {
  const docRef = await db.collection('itineraries').add(data);
  return docRef.id;
}

// Add