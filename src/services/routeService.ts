import admin from '../config/firebase';
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

export async function getSavedRoutes(userID: string) {
  const snapshot = await db.collection('routes').where('userID', '==', userID).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getRoutes(data: {
  location: Array<{ latitude: number; longitude: number }>;
  mode: string;
  alternatives: boolean;
}) {
  const apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImFlZGFkMzNiMGU1ZDRlZmRiNDMyZDdkMTY2OGU5Y2Q1IiwiaCI6Im11cm11cjY0In0=";
  const coordinates = data.location.map(loc => [loc.longitude, loc.latitude]);
  const url = `https://api.openrouteservice.org/v2/directions/${data.mode}`;
  const params = {
    coordinates,
    ...(data.alternatives ? { alternative_routes: { target_count: 3, share_factor: 0.6, weight_factor: 1.6 } } : {}),
  };

  const response = await axios.post(url, params, {
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
    },
  });

  // Handle both single and alternative routes
  const routes = response.data.routes || [response.data.route];
  return routes.map((route: any, idx: number) => ({
    id: route.id || `route_${idx}`,
    distance: (route.summary.distance / 1000).toFixed(2), // km
    duration: Math.round(route.summary.duration / 60), // minutes
    geometry: route.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]),
  }));
}