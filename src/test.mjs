// testDeleteNotification.mjs

// Test deleteNotification function
const testDeleteNotification = async (notificationId) => {
  try {
    console.log('🚀 Testing deleteNotification...\n');
    
    if (!notificationId) {
      console.log('⚠️  No notification ID provided, using default test ID...\n');
      notificationId = 'yzOT7zGTTiRTKEctQXFd';
    }
    
    console.log(`📋 Attempting to delete notification ${notificationId}...`);
    
    const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    console.log('\nResponse Status:', response.status);
    console.log('Response Body:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('\n✅ deleteNotification test PASSED!');
      console.log(`🗑️  Successfully deleted notification ${notificationId}`);
      console.log(`💬 Server message: ${result.message}`);
      return notificationId;
    } else {
      console.log('\n❌ deleteNotification test FAILED!');
      console.log(`Error: ${result.error || 'Unknown error'}`);
      return null;
    }
    
  } catch (error) {
    console.error('\n💥 Error testing deleteNotification:', error);
    return null;
  }
};

// Test deleteNotification with invalid notification ID
const testDeleteNotificationInvalidId = async () => {
  try {
    console.log('\n🔍 Testing deleteNotification with invalid notification ID...\n');
    
    const invalidId = 'invalid-notification-id-12345';
    console.log(`📋 Attempting to delete invalid notification ${invalidId}...`);
    
    const response = await fetch(`http://localhost:5000/api/notifications/${invalidId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    console.log('\nResponse Status:', response.status);
    console.log('Response Body:', JSON.stringify(result, null, 2));
    
    if (response.status === 404) {
      console.log('\n✅ Invalid ID test PASSED! (Correctly rejected invalid notification ID)');
      console.log(`💬 Server message: ${result.error}`);
    } else {
      console.log('\n❌ Invalid ID test FAILED! (Should have rejected invalid notification ID)');
    }
    
  } catch (error) {
    console.error('\n💥 Error testing invalid ID:', error);
  }
};

// Test deleteNotification with missing notification ID
const testDeleteNotificationMissingId = async () => {
  try {
    console.log('\n🔍 Testing deleteNotification with missing notification ID...\n');
    
    console.log('📋 Attempting to delete notification with empty ID...');
    
    const response = await fetch(`http://localhost:5000/api/notifications/`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    console.log('\nResponse Status:', response.status);
    console.log('Response Body:', JSON.stringify(result, null, 2));
    
    if (response.status === 400) {
      console.log('\n✅ Missing ID test PASSED! (Correctly rejected missing notification ID)');
      console.log(`💬 Server message: ${result.error}`);
    } else {
      console.log('\n❌ Missing ID test FAILED! (Should have rejected missing notification ID)');
    }
    
  } catch (error) {
    console.error('\n💥 Error testing missing ID:', error);
  }
};

// Verify the notification was actually deleted
const verifyNotificationDeletion = async (notificationId) => {
  try {
    console.log('\n🔍 Verifying notification deletion...\n');
    
    if (!notificationId) {
      console.log('⚠️  No notification ID provided for verification');
      return;
    }
    
    console.log(`📋 Checking if notification ${notificationId} still exists...`);
    
    const response = await fetch(`http://localhost:5000/api/notifications/user/test-user-123`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    
    if (response.ok) {
      const notification = result.notifications?.find(n => n.id === notificationId);
      if (notification) {
        console.log('❌ Verification FAILED! Notification still exists after deletion');
        console.log(`📖 Found notification: ${notification.title}`);
      } else {
        console.log('✅ Verification PASSED! Notification was successfully deleted');
      }
    } else {
      console.log('❌ Failed to fetch user notifications for verification');
    }
    
  } catch (error) {
    console.error('\n💥 Error verifying notification deletion:', error);
  }
};

// Test deleting a notification that was already deleted
const testDeleteAlreadyDeleted = async (notificationId) => {
  try {
    console.log('\n🔍 Testing deleteNotification on already deleted notification...\n');
    
    if (!notificationId) {
      console.log('⚠️  No notification ID provided for this test');
      return;
    }
    
    console.log(`📋 Attempting to delete already deleted notification ${notificationId}...`);
    
    const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    console.log('\nResponse Status:', response.status);
    console.log('Response Body:', JSON.stringify(result, null, 2));
    
    if (response.status === 404) {
      console.log('\n✅ Already deleted test PASSED! (Correctly rejected already deleted notification)');
      console.log(`💬 Server message: ${result.error}`);
    } else {
      console.log('\n❌ Already deleted test FAILED! (Should have rejected already deleted notification)');
    }
    
  } catch (error) {
    console.error('\n💥 Error testing already deleted notification:', error);
  }
};

// Run all deleteNotification tests
const runDeleteNotificationTests = async () => {
  console.log('🎯 Starting deleteNotification Tests...\n');
  
  const targetNotificationId = 'yzOT7zGTTiRTKEctQXFd';
  console.log(`🎯 Target notification ID: ${targetNotificationId}\n`);
  
  // Test 1: Valid notification deletion
  const deletedNotificationId = await testDeleteNotification(targetNotificationId);
  
  // Test 2: Invalid notification ID
  await testDeleteNotificationInvalidId();
  
  // Test 3: Missing notification ID
  await testDeleteNotificationMissingId();
  
  // Test 4: Verify the notification was actually deleted
  await verifyNotificationDeletion(deletedNotificationId);
  
  // Test 5: Try to delete the same notification again
  await testDeleteAlreadyDeleted(deletedNotificationId);
  
  console.log('\n🏁 deleteNotification Tests completed!');
  
  if (deletedNotificationId) {
    console.log(`\n📌 Successfully tested deletion of notification ID: ${deletedNotificationId}`);
    console.log('💡 The notification has been permanently removed from the database');
  }
};

runDeleteNotificationTests();