import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

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

interface CachedAlerts {
  lastUpdated: string;
  alerts: AlertWithId[];
}

const CACHE_FILE_PATH = path.join(__dirname, '../../cache/daily_alerts.json');

// Check if cache needs to be refreshed (once per day)
function shouldRefreshCache(): boolean {
  try {
    if (!fs.existsSync(CACHE_FILE_PATH)) {
      return true;
    }
    
    const cacheData = JSON.parse(fs.readFileSync(CACHE_FILE_PATH, 'utf8')) as CachedAlerts;
    const lastUpdated = new Date(cacheData.lastUpdated);
    const now = new Date();
    
    // Check if it's a different day
    return lastUpdated.getDate() !== now.getDate() || 
           lastUpdated.getMonth() !== now.getMonth() || 
           lastUpdated.getFullYear() !== now.getFullYear();
  } catch (error) {
    console.error('Error checking cache:', error);
    return true;
  }
}

// Load alerts from cache
function loadAlertsFromCache(): AlertWithId[] {
  try {
    if (!fs.existsSync(CACHE_FILE_PATH)) {
      return [];
    }
    
    const cacheData = JSON.parse(fs.readFileSync(CACHE_FILE_PATH, 'utf8')) as CachedAlerts;
    return cacheData.alerts || [];
  } catch (error) {
    console.error('Error loading alerts from cache:', error);
    return [];
  }
}

// Update cache with new alerts
function updateCache(alerts: AlertWithId[]): void {
  try {
    const cacheData: CachedAlerts = {
      lastUpdated: new Date().toISOString(),
      alerts
    };
    
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cacheData, null, 2));
  } catch (error) {
    console.error('Error updating cache:', error);
  }
}

// Load all alerts from Firestore and cache them
export async function loadAndCacheAlerts(): Promise<AlertWithId[]> {
  try {
    const snapshot = await db.collection('alerts').get();
    const alerts: AlertWithId[] = [];
    
    snapshot.forEach(doc => {
      const alertData = doc.data() as AlertData & { createdOn: any };
      alerts.push({
        id: doc.id,
        ...alertData
      });
    });
    
    updateCache(alerts);
    return alerts;
  } catch (error) {
    console.error('Error loading alerts from Firestore:', error);
    throw error;
  }
}

// Get alerts (from cache if available, otherwise load from Firestore)
export async function getCachedAlerts(): Promise<AlertWithId[]> {
  if (shouldRefreshCache()) {
    return await loadAndCacheAlerts();
  }
  
  return loadAlertsFromCache();
}

// Check if alert is currently active (within startOn and endOn dates)
export function isAlertActive(alert: AlertWithId): boolean {
  const now = new Date();
  const startDate = alert.startOn.toDate ? alert.startOn.toDate() : new Date(alert.startOn);
  const endDate = alert.endOn.toDate ? alert.endOn.toDate() : new Date(alert.endOn);
  
  return now >= startDate && now <= endDate;
}

export async function addAlert(data: AlertData): Promise<string> {
  const alertData = {
    ...data,
    createdOn: admin.firestore.FieldValue.serverTimestamp()
  };
  
  const docRef = await db.collection('alerts').add(alertData);
  
  // Check if the new alert is currently active
  const newAlert: AlertWithId = {
    id: docRef.id,
    ...alertData,
    createdOn: new Date()
  };
  
  if (isAlertActive(newAlert)) {
    // Add to cache if it's currently active
    const currentAlerts = loadAlertsFromCache();
    currentAlerts.push(newAlert);
    updateCache(currentAlerts);
  }
  
  return docRef.id;
}

export async function getAlertsByLocation(userLocation: UserLocation): Promise<AlertWithId[]> {
  // Get alerts from cache
  const allAlerts = await getCachedAlerts();
  
  const alerts: AlertWithId[] = [];
  
  allAlerts.forEach(alert => {
    // Only include active alerts
    if (!isAlertActive(alert)) {
      return;
    }
    
    const targetPlaces = alert.target || [];
    
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
      alerts.push(alert);
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
    
    // Remove from cache if it exists there
    const currentAlerts = loadAlertsFromCache();
    const updatedAlerts = currentAlerts.filter(alert => alert.id !== alertId);
    updateCache(updatedAlerts);
    
    return true;
  } catch (error) {
    console.error('Error deleting alert:', error);
    throw error;
  }
} 