import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api/routes';

// Sample data
const userID = 'test-user-123';
const status = 'active';
const mode = 'driving-car';
const location = [
  { latitude: 10.2454, longitude: 123.7960, locationName: 'Start Point' },
  { latitude: 10.2500, longitude: 123.8000, locationName: 'Waypoint' },
  { latitude: 10.2600, longitude: 123.8100, locationName: 'End Point' }
];

// 1. Create Route
async function testCreateRoute() {
  const res = await fetch(`${BASE_URL}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userID, status, mode, location })
  });
  const data = await res.json();
  console.log('Create Route:', data);
  return data.id;
}

// 2. Get Saved Routes
async function testGetSavedRoutes() {
  const res = await fetch(`${BASE_URL}/saved`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userID })
  });
  const data = await res.json();
  console.log('Get Saved Routes:', data);
  return data;
}

// 3. Get Routes (from ORS)
async function testGetRoutes() {
  const locs = location.map(({ latitude, longitude }) => ({ latitude, longitude }));
  const res = await fetch(`${BASE_URL}/get`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location: locs, mode, alternatives: true })
  });
  const data = await res.json();
  console.log('Get Routes (ORS):', data);
  return data;
}

// 4. Delete Route
async function testDeleteRoute(routeId) {
  const res = await fetch(`${BASE_URL}/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: routeId })
  });
  const data = await res.json();
  console.log('Delete Route:', data);
  return data;
}

// Run all tests
(async () => {
  console.log('--- Testing Create Route ---');
  const routeId = await testCreateRoute();

  console.log('\n--- Testing Get Saved Routes ---');
  await testGetSavedRoutes();

  console.log('\n--- Testing Get Routes (ORS) ---');
  await testGetRoutes();

  console.log('\n--- Testing Delete Route ---');
  await testDeleteRoute(routeId);

  console.log('\nAll route tests completed.');
})();