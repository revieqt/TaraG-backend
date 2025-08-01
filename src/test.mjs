// testDeleteSpecificNotifications.mjs

// Test deleteNotification function
const testDeleteNotification = async (notificationId) => {
  try {
    console.log(`🗑️  Testing deleteNotification for ID: ${notificationId}...\n`);
    
    const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    console.log('\nResponse Status:', response.status);
    console.log('Response Body:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('\n✅ deleteNotification test PASSED!');
      console.log(`🗑️  Successfully deleted notification with ID: ${notificationId}`);
      return true;
    } else {
      console.log('\n❌ deleteNotification test FAILED!');
      console.log(`Error: ${result.error || 'Unknown error'}`);
      return false;
    }
    
  } catch (error) {
    console.error('\n💥 Error testing deleteNotification:', error);
    return false;
  }
};

// Delete specific notifications
const deleteSpecificNotifications = async () => {
  console.log('🎯 Starting Delete Specific Notifications Test...\n');
  
  const notificationIdsToDelete = [
    'd67V5cbQSaruasg2WH60',
    '1rlNhAk0Cs0EBrwLBj7c',
    '5YdMe4glTQMrnc4ilNpi',
    'DVZRcFxCSrR5eQsugt5d',
    '3pOVj2ALywdhcReRZeni'
  ];
  
  console.log('📋 Target notification IDs to delete:');
  notificationIdsToDelete.forEach((id, index) => {
    console.log(`   ${index + 1}. ${id}`);
  });
  
  let deletedCount = 0;
  
  for (let i = 0; i < notificationIdsToDelete.length; i++) {
    console.log(`\n🗑️  Deleting notification ${i + 1} of ${notificationIdsToDelete.length}...`);
    const success = await testDeleteNotification(notificationIdsToDelete[i]);
    
    if (success) {
      deletedCount++;
    }
    
    // Add a small delay between requests
    if (i < notificationIdsToDelete.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log('\n🏁 Delete Specific Notifications Test completed!');
  console.log(`\n📌 Successfully deleted ${deletedCount} out of ${notificationIdsToDelete.length} notifications`);
  
  if (deletedCount < notificationIdsToDelete.length) {
    console.log(`⚠️  Failed to delete ${notificationIdsToDelete.length - deletedCount} notifications`);
  }
  
  return deletedCount;
};

// Run the test
deleteSpecificNotifications();
