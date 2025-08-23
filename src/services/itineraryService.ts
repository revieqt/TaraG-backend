import admin from '../config/firebase';

const db = admin.firestore();

export async function addItinerary(data: any) {
  const now = admin.firestore.Timestamp.now();

  // Determine status: 'current' if today is between startDate and endDate, else 'upcoming'
  const today = admin.firestore.Timestamp.now();
  let status = 'upcoming';
  if (
    data.startDate &&
    data.endDate &&
    today.seconds >= data.startDate.seconds &&
    today.seconds <= data.endDate.seconds
  ) {
    status = 'current';
  }

  const docRef = await db.collection('itineraries').add({
    ...data,
    createdOn: now,
    updatedOn: now,
    manuallyUpdated: false,
    status,
  });
  return docRef.id;
}

export async function updateItinerary(id: string, data: any) {
  const now = admin.firestore.Timestamp.now();
  await db.collection('itineraries').doc(id).update({
    ...data,
    updatedOn: now,
  });
  return true;
}

export async function cancelItinerary(id: string) {
  const now = admin.firestore.Timestamp.now();
  await db.collection('itineraries').doc(id).update({
    status: 'cancelled',
    manuallyUpdated: true,
    updatedOn: now,
  });
  return true;
}

export async function markItineraryAsDone(id: string) {
  const now = admin.firestore.Timestamp.now();
  await db.collection('itineraries').doc(id).update({
    status: 'completed',
    manuallyUpdated: true,
    updatedOn: now,
  });
  return true;
}