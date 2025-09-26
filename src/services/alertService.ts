import { db } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';

export interface Alert {
  id?: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  startOn: Date;
  endOn: Date;
  locations: string[];
}

interface Filters {
  locations?: string[];
  date?: string;
  severity?: string;
  search?: string;
}

/**
 * Fetch alerts from Firestore and apply optional filtering:
 * - severity exact match
 * - date between startOn and endOn
 * - search in title or description
 * - locations intersection
 */
export async function getFilteredAlerts(filters: Filters): Promise<Alert[]> {
  try {
    const snapshot = await db.collection('alerts').get();
    
    if (snapshot.empty) {
      return [];
    }

    let alerts: Alert[] = [];
    
    snapshot.docs.forEach(doc => {
      try {
        const data = doc.data();
        
        // Validate required fields
        if (!data.title || !data.description || !data.severity) {
          console.warn(`Alert ${doc.id} missing required fields`);
          return;
        }
        
        // Handle different timestamp formats
        let startOn: Date;
        let endOn: Date;
        
        if (data.startOn instanceof Timestamp) {
          startOn = data.startOn.toDate();
        } else if (typeof data.startOn === 'string') {
          startOn = new Date(data.startOn);
        } else if (data.startOn && typeof data.startOn === 'object' && data.startOn.seconds) {
          startOn = new Date(data.startOn.seconds * 1000);
        } else {
          console.warn(`Invalid startOn format for alert ${doc.id}`);
          return;
        }
        
        if (data.endOn instanceof Timestamp) {
          endOn = data.endOn.toDate();
        } else if (typeof data.endOn === 'string') {
          endOn = new Date(data.endOn);
        } else if (data.endOn && typeof data.endOn === 'object' && data.endOn.seconds) {
          endOn = new Date(data.endOn.seconds * 1000);
        } else {
          console.warn(`Invalid endOn format for alert ${doc.id}`);
          return;
        }
        
        const locations = Array.isArray(data.locations) ? data.locations : [];
        
        alerts.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          severity: data.severity,
          startOn,
          endOn,
          locations,
        });
      } catch (docError) {
        console.error(`Error processing alert document ${doc.id}:`, docError);
      }
    });

    if (filters.severity) {
      alerts = alerts.filter(a => a.severity === filters.severity);
    }

    if (filters.date) {
      const d = new Date(filters.date);
      alerts = alerts.filter(a => a.startOn <= d && a.endOn >= d);
    }

    if (filters.search) {
      const term = filters.search.toLowerCase();
      alerts = alerts.filter(a =>
        a.title.toLowerCase().includes(term) ||
        a.description.toLowerCase().includes(term)
      );
    }

    if (filters.locations && filters.locations.length > 0) {
      alerts = alerts.filter(a =>
        a.locations.some(loc => filters.locations!.includes(loc))
      );
    }

    return alerts;
  } catch (error) {
    console.error('Error in getFilteredAlerts:', error);
    throw error;
  }
}

/**
 * Fetch alerts where at least one of alert.locations
 * matches provided locations OR includes 'global'
 */
export async function getAlertsByLocation(locations: string[]): Promise<Alert[]> {
  try {
    console.log('Fetching alerts for locations:', locations);
    
    // Normalize input to lowercase for case-insensitive matching
    const lowerLocations = locations.map(l => l.toLowerCase());
    const snapshot = await db.collection('alerts').get();
    
    console.log('Firestore snapshot size:', snapshot.size);
    
    if (snapshot.empty) {
      console.log('No alerts found in Firestore collection');
      return [];
    }

    const allAlerts: Alert[] = [];
    
    snapshot.docs.forEach(doc => {
      try {
        const data = doc.data();
        console.log('Processing alert document:', doc.id, data);
        
        // Validate required fields
        if (!data.title || !data.description || !data.severity) {
          console.warn(`Alert ${doc.id} missing required fields:`, data);
          return;
        }
        
        // Handle different timestamp formats
        let startOn: Date;
        let endOn: Date;
        
        try {
          if (data.startOn instanceof Timestamp) {
            startOn = data.startOn.toDate();
          } else if (typeof data.startOn === 'string') {
            startOn = new Date(data.startOn);
          } else if (data.startOn && typeof data.startOn === 'object' && data.startOn.seconds) {
            startOn = new Date(data.startOn.seconds * 1000);
          } else {
            console.warn(`Invalid startOn format for alert ${doc.id}:`, data.startOn);
            return;
          }
          
          if (data.endOn instanceof Timestamp) {
            endOn = data.endOn.toDate();
          } else if (typeof data.endOn === 'string') {
            endOn = new Date(data.endOn);
          } else if (data.endOn && typeof data.endOn === 'object' && data.endOn.seconds) {
            endOn = new Date(data.endOn.seconds * 1000);
          } else {
            console.warn(`Invalid endOn format for alert ${doc.id}:`, data.endOn);
            return;
          }
        } catch (dateError) {
          console.error(`Error parsing dates for alert ${doc.id}:`, dateError);
          return;
        }
        
        // Ensure locations is an array
        const locations = Array.isArray(data.locations) ? data.locations : [];
        
        allAlerts.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          severity: data.severity,
          startOn,
          endOn,
          locations,
        });
      } catch (docError) {
        console.error(`Error processing alert document ${doc.id}:`, docError);
      }
    });

    console.log('Processed alerts count:', allAlerts.length);

    // Filter alerts by location
    const filteredAlerts = allAlerts.filter(a => {
      // Compare lowercase alert locations
      const alertLocs = a.locations.map(l => l.toLowerCase());
      const matches = alertLocs.includes('global') ||
                     alertLocs.some(loc => lowerLocations.includes(loc));
      
      if (matches) {
        console.log(`Alert ${a.id} matches locations:`, a.locations);
      }
      
      return matches;
    });

    console.log('Filtered alerts count:', filteredAlerts.length);
    return filteredAlerts;
    
  } catch (error) {
    console.error('Error in getAlertsByLocation:', error);
    throw error;
  }
}

/**
 * Create a new alert document
 */
export async function createAlert(alertData: Omit<Alert, 'id'>): Promise<string> {
  const docRef = await db.collection('alerts').add({
    title: alertData.title,
    description: alertData.description,
    severity: alertData.severity,
    startOn: Timestamp.fromDate(alertData.startOn),
    endOn: Timestamp.fromDate(alertData.endOn),
    locations: alertData.locations,
  });
  return docRef.id;
}

/**
 * Update an existing alert document by ID
 */
export async function updateAlert(alertId: string, alertData: Partial<Omit<Alert, 'id'>>): Promise<void> {
  const updatePayload: any = {};
  if (alertData.title !== undefined) updatePayload.title = alertData.title;
  if (alertData.description !== undefined) updatePayload.description = alertData.description;
  if (alertData.severity !== undefined) updatePayload.severity = alertData.severity;
  if (alertData.startOn !== undefined) updatePayload.startOn = Timestamp.fromDate(alertData.startOn);
  if (alertData.endOn !== undefined) updatePayload.endOn = Timestamp.fromDate(alertData.endOn);
  if (alertData.locations !== undefined) updatePayload.locations = alertData.locations;

  await db.collection('alerts').doc(alertId).update(updatePayload);
}

/**
 * Delete an alert document by ID
 */
export async function deleteAlert(alertId: string): Promise<void> {
  await db.collection('alerts').doc(alertId).delete();
}