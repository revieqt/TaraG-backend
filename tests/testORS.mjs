import fetch from 'node-fetch';

const ORS_API_KEY = process.env.ORS_API_KEY || 'YOUR_ORS_API_KEY'; // Replace with your actual key if not using env
const ORS_URL = 'https://api.openrouteservice.org/v2/directions/driving-car';

const coordinates = [
  [123.796, 10.2454], // Start (lng, lat)
  [123.81, 10.26],    // End (lng, lat)
];

const requestBody = {
  coordinates,
};

async function testORS() {
  console.log('--- Testing OpenRouteService Directions Endpoint ---');
  try {
    const res = await fetch(ORS_URL, {
      method: 'POST',
      headers: {
        'Authorization': ORS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('ORS Error:', data);
    } else {
      console.log('ORS Success:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Fetch Error:', err);
  }
}

testORS();