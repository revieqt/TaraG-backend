// testEmergency.mjs - Test Emergency Amenity Search

const BASE_URL = 'http://localhost:5000/api/emergency/nearest';
const TEST_COORDS = { latitude: 10.2454, longitude: 123.7960 };
const AMENITIES = [
  { type: 'hospital', label: 'Hospital' },
  { type: 'police', label: 'Police Station' },
  { type: 'fire_station', label: 'Fire Station' }
];

const testAmenity = async (amenity, coords) => {
  try {
    console.log(`🚨 Testing search for nearest ${amenity.label}s...\n`);
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amenity: amenity.type,
        latitude: coords.latitude,
        longitude: coords.longitude
      })
    });

    const result = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Body:', JSON.stringify(result, null, 2));

    if (response.ok && Array.isArray(result)) {
      console.log(`\n✅ ${amenity.label} search test PASSED! Found ${result.length} result(s).`);
      if (result.length > 0) {
        console.log(`Sample result:\n`, result[0]);
      }
      return true;
    } else {
      console.log(`\n❌ ${amenity.label} search test FAILED!`);
      console.log(`Error: ${result.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.error(`\n💥 Error testing ${amenity.label} search:`, error);
    return false;
  }
};

const runEmergencyTests = async () => {
  console.log('🎯 Starting Emergency Amenity Tests...\n');
  let passedTests = 0;

  for (const amenity of AMENITIES) {
    console.log('='.repeat(60));
    console.log(`TEST: Nearest ${amenity.label}`);
    console.log('='.repeat(60));
    const success = await testAmenity(amenity, TEST_COORDS);
    if (success) passedTests++;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(60));
  console.log('🏁 EMERGENCY AMENITY TESTS COMPLETED!');
  console.log('='.repeat(60));
  console.log(`\n📊 Test Results: ${passedTests}/${AMENITIES.length} tests passed`);

  if (passedTests === AMENITIES.length) {
    console.log('\n🎉 ALL TESTS PASSED! Emergency search is working! 🚨');
  } else {
    console.log(`\n⚠️  ${AMENITIES.length - passedTests} test(s) failed. Please check the errors above.`);
  }

  return { passed: passedTests, total: AMENITIES.length };
};

runEmergencyTests()
  .then(results => {
    console.log(`\n📈 Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
    process.exit(results.passed === results.total ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Fatal error running tests:', error);
    process.exit(1);
  });