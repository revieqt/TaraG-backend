const axios = require('axios');

async function testEmergencyService() {
  console.log('🔍 Testing Emergency Service...\n');
  
  const testData = {
    amenity: 'hospital',
    latitude: 10.3157,  // Cebu City coordinates
    longitude: 123.8854
  };
  
  console.log('Test data:', testData);
  
  try {
    console.log('\n🚀 Testing emergency service endpoint...');
    
    const response = await axios.post('http://localhost:5000/api/emergency/nearest', testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Emergency service is working!');
    console.log('📝 Response status:', response.status);
    console.log('📝 Number of amenities found:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('📝 First amenity:', response.data[0]);
    }
    
    console.log('\n🎉 Emergency service is working correctly!');

  } catch (error) {
    console.log('❌ Emergency service test failed!');
    
    if (error.response) {
      console.log('🔐 Response error:', error.response.status, error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.log('🔌 Connection refused - make sure the backend is running on port 5000');
    } else {
      console.log('💥 Error:', error.message);
    }
  }
}

testEmergencyService();
