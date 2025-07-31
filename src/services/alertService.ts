import admin from 'firebase-admin';

const db = admin.firestore();

export interface UserLocation {
  suburb?: string;
  city?: string;
  town?: string;
  state?: string;
  region?: string;
  country?: string;
}

export interface AlertData {
  title: string;
  note: string;
  severity: string;
  createdBy: string;
  startOn: any; // timestamp
  endOn: any; // timestamp
  target: string[];
}

export interface AlertWithId extends AlertData {
  id: string;
  createdOn: any; // timestamp
}

export async function addAlert(data: AlertData): Promise<string> {
  const alertData = {
    ...data,
    createdOn: admin.firestore.FieldValue.serverTimestamp()
  };
  
  const docRef = await db.collection('alerts').add(alertData);
  return docRef.id;
}

export async function getAlertsByLocation(userLocation: UserLocation): Promise<AlertWithId[]> {
  // Get all alerts from the collection
  const snapshot = await db.collection('alerts').get();
  
  const alerts: AlertWithId[] = [];
  
  snapshot.forEach(doc => {
    const alertData = doc.data() as AlertData & { createdOn: any };
    const targetPlaces = alertData.target || [];
    
    // Check if any of the user's location fields match the target places
    const locationFields = [
      userLocation.suburb,
      userLocation.city,
      userLocation.town,
      userLocation.state,
      userLocation.region,
      userLocation.country
    ].filter(Boolean); // Remove undefined/null values
    
    // Check if any location field matches any target place
    const hasMatch = locationFields.some(location => 
      targetPlaces.some(target => 
        target.toLowerCase() === location?.toLowerCase()
      )
    );
    
    if (hasMatch) {
      alerts.push({
        id: doc.id,
        ...alertData
      });
    }
  });
  
  return alerts;
}

export async function deleteAlert(alertId: string): Promise<boolean> {
  try {
    const docRef = db.collection('alerts').doc(alertId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      throw new Error('Alert not found');
    }
    
    await docRef.delete();
    return true;
  } catch (error) {
    console.error('Error deleting alert:', error);
    throw error;
  }
} 