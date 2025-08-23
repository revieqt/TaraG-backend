// testItinerary.mjs

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api/itinerary';
const testUserID = 'FHblHf9jf9gzNLgxjKIZdX1T86o1';

// Sample itinerary data
const itineraryData = {
  userID: testUserID,
  title: 'Test Trip',
  type: 'vacation',
  description: 'A test itinerary for API testing.',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 86400000).toISOString(),
  planDaily: true,
  locations: [
    {
      date: new Date().toISOString(),
      locations: [
        {
          latitude: 10.2454,
          longitude: 123.7960,
          locationName: 'Start Point',
          note: 'Beginning of trip'
        },
        {
          latitude: 10.2500,
          longitude: 123.8000,
          locationName: 'Stop 1',
          note: 'First stop'
        }
      ]
    }
  ]
};

async function createItinerary() {
  const res = await fetch(`${BASE_URL}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itineraryData)
  });
  const data = await res.json();
  console.log('Create Itinerary:', data);
  return data.id;
}

async function getItinerariesByUser() {
  const res = await fetch(`${BASE_URL}/user/${testUserID}`);
  const data = await res.json();
  console.log('Get Itineraries By User:', data);
  return data.itineraries && data.itineraries.length > 0 ? data.itineraries[0].id : null;
}

async function getItineraryById(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  const data = await res.json();
  console.log('Get Itinerary By ID:', data);
}

async function updateItinerary(id) {
  const updateData = {
    title: 'Updated Test Trip',
    description: 'Updated description',
    planDaily: false
  };
  const res = await fetch(`${BASE_URL}/update/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  });
  const data = await res.json();
  console.log('Update Itinerary:', data);
}

async function cancelItinerary(id) {
  const res = await fetch(`${BASE_URL}/cancel/${id}`, {
    method: 'POST'
  });
  const data = await res.json();
  console.log('Cancel Itinerary:', data);
}

async function markItineraryAsDone(id) {
  const res = await fetch(`${BASE_URL}/done/${id}`, {
    method: 'POST'
  });
  const data = await res.json();
  console.log('Mark Itinerary As Done:', data);
}

async function deleteItinerary(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  console.log('Delete Itinerary:', data);
}

(async () => {
  console.log('--- Creating Itinerary ---');
  const itineraryId = await createItinerary();

  console.log('\n--- Getting Itineraries By User ---');
  await getItinerariesByUser();

  console.log('\n--- Getting Itinerary By ID ---');
  await getItineraryById(itineraryId);

  console.log('\n--- Updating Itinerary ---');
  await updateItinerary(itineraryId);

  console.log('\n--- Canceling Itinerary ---');
  await cancelItinerary(itineraryId);

  console.log('\n--- Marking Itinerary As Done ---');
  await markItineraryAsDone(itineraryId);

  console.log('\n--- Deleting Itinerary ---');
  await deleteItinerary(itineraryId);

  console.log('\nAll itinerary tests completed.');
})();