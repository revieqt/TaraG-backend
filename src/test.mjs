// testAlertApi.mjs

// Test getLatestAlert function
const testGetLatestAlert = async () => {
  try {
    console.log('Testing getLatestAlert...');
    
    const response = await fetch('http://localhost:5000/api/alerts/latest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        suburb: "Minglanilla",
        city: "Minglanilla",
        state: "Minglanilla",
        country: "Australia"
      })
    });
    
    const result = await response.json();
    console.log('getLatestAlert Response:', result);
    console.log('Status:', response.status);
    
    if (response.ok) {
      console.log('✅ getLatestAlert test passed!');
      console.log(`Found ${result.alerts?.length || 0} matching alerts`);
    } else {
      console.log('❌ getLatestAlert test failed!');
    }
    
  } catch (error) {
    console.error('Error testing getLatestAlert:', error);
  }
};


// Run both tests
const runTests = async () => {
  console.log('🚀 Starting Alert API Tests...\n');
  
  await testGetLatestAlert();
  
  console.log('\n🏁 Alert API Tests completed!');
};

runTests();