import admin from '../config/firebase';
import { ORS_API_KEY } from '../config/apiKeys';
import axios from 'axios';

const db = admin.firestore();

export async function createRoute(data: {
  userID: string;
  status: string;
  mode: string;
  location: Array<{ latitude: number; longitude: number; locationName: string }>;
}) {
  const route = {
    ...data,
    createdOn: admin.firestore.FieldValue.serverTimestamp(),
  };
  const docRef = await db.collection('routes').add(route);
  return { id: docRef.id, ...route };
}

export async function deleteRoute(id: string) {
  await db.collection('routes').doc(id).delete();
  return { success: true };
}

export async function getSavedRoutes(userID: string, status: string) {
  const snapshot = await db.collection('routes')
    .where('userID', '==', userID)
    .where('status', '==', status)
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getRoutes(data: {
  location: Array<{ latitude: number; longitude: number }>;
  mode: string;
}) {
  try {
    const apiKey = ORS_API_KEY;
    const coordinates = data.location.map(loc => [loc.longitude, loc.latitude]);
    const url = `https://api.openrouteservice.org/v2/directions/${data.mode}`;
    const params = {
      coordinates,
      instructions: true,
      geometry: true,
      elevation: false,
      extra_info: ['waytype', 'surface'],
      continue_straight: false,
      format: 'json'
    };

    console.log('🗺️ Calling OpenRouteService:', { url, coordinates, mode: data.mode });

    const response = await axios.post(url, params, {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ OpenRouteService response:', response.status);

    // Handle single route only
    const route = response.data.routes ? response.data.routes[0] : response.data.route;
    
    if (!route) {
      throw new Error('No route found in response');
    }

    // Process segments with steps
    const segments = route.segments?.map((segment: any) => ({
      distance: segment.distance,
      duration: segment.duration,
      steps: segment.steps?.map((step: any) => ({
        distance: step.distance,
        duration: step.duration,
        instruction: step.instruction,
        name: step.name || undefined,
        way_points: step.way_points
      })) || []
    })) || [];

    const result = {
      geometry: {
        coordinates: route.geometry?.coordinates || [],
        type: route.geometry?.type || 'LineString'
      },
      distance: route.summary.distance, // meters
      duration: route.summary.duration, // seconds
      bbox: route.bbox || undefined,
      segments
    };

    console.log('🎯 Route result with segments:', {
      ...result,
      segmentCount: segments.length,
      totalSteps: segments.reduce((acc: number, seg: any) => acc + (seg.steps?.length || 0), 0)
    });
    
    return result;
  } catch (error) {
    console.error('❌ OpenRouteService error:', error);
    throw error;
  }
}