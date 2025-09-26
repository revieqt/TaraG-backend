import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

const db = admin.firestore();
const bucket = admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET || 'taralets-3adb8.firebasestorage.app');

// Helper function to delete profile image from Firebase Storage
export async function deleteProfileImageFromStorage(imageUrl: string): Promise<void> {
  if (!imageUrl || !imageUrl.includes('storage.googleapis.com') || !imageUrl.includes(bucket.name)) {
    return; // Not our storage URL, skip deletion
  }

  try {
    // Extract filename from URL
    const urlParts = imageUrl.split('/');
    const encodedFileName = urlParts[urlParts.length - 1];
    const fileName = decodeURIComponent(encodedFileName);
    
    // Delete the file
    const file = bucket.file(fileName);
    await file.delete();
    console.log(`Successfully deleted profile image: ${fileName}`);
  } catch (error) {
    console.warn('Failed to delete profile image from storage:', error);
    // Don't throw error, as this is a cleanup operation
  }
}

export async function updateProfileImage(userID: string, imageBuffer: Buffer, mimeType: string): Promise<string> {
  try {
    // Get current user data to check for existing profile image
    const userDoc = await db.collection('users').doc(userID).get();
    const userData = userDoc.data();
    const currentProfileImage = userData?.profileImage;

    // Delete old profile image if it exists
    if (currentProfileImage) {
      await deleteProfileImageFromStorage(currentProfileImage);
    }

    // Generate unique filename for new image
    const fileExtension = mimeType.split('/')[1];
    const fileName = `profileImages/${userID}_${uuidv4()}.${fileExtension}`;
    
    // Upload new image to Firebase Storage
    const file = bucket.file(fileName);
    await file.save(imageBuffer, {
      metadata: {
        contentType: mimeType,
      },
      public: true
    });

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    
    // Update Firestore document with new profile image URL
    await db.collection('users').doc(userID).update({
      profileImage: publicUrl,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return publicUrl;
  } catch (error) {
    console.error('Error updating profile image:', error);
    throw new Error('Failed to update profile image');
  }
}

export async function updateBio(userID: string, bio: string): Promise<void> {
  try {
    await db.collection('users').doc(userID).update({
      bio: bio,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating bio:', error);
    throw new Error('Failed to update bio');
  }
}

export async function getUserProfile(userID: string): Promise<any> {
  try {
    const userDoc = await db.collection('users').doc(userID).get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    return userDoc.data();
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw new Error('Failed to get user profile');
  }
}

export async function updateUserStringField(userID: string, fieldName: string, fieldValue: string): Promise<void> {
  try {
    // Validate field name to prevent unauthorized field updates
    const allowedStringFields = [
      'fname', 'mname', 'lname', 'username', 'bio', 'contactNumber', 
      'gender', 'status', 'type', 'profileImage'
    ];
    
    if (!allowedStringFields.includes(fieldName)) {
      throw new Error(`Field '${fieldName}' is not allowed to be updated`);
    }

    const updateData: any = {
      [fieldName]: fieldValue,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(userID).update(updateData);
  } catch (error) {
    console.error('Error updating user string field:', error);
    throw new Error(`Failed to update ${fieldName}`);
  }
}

export async function updateUserBooleanField(userID: string, fieldName: string, fieldValue: boolean): Promise<void> {
  try {
    // Validate field name to prevent unauthorized field updates
    const allowedBooleanFields = [
      'isProUser', 'isFirstLogin', 'safetyState.isInAnEmergency',
      'publicSettings.isProfilePublic', 'publicSettings.isTravelInfoPublic', 'publicSettings.isPersonalInfoPublic'
    ];
    
    if (!allowedBooleanFields.includes(fieldName)) {
      throw new Error(`Field '${fieldName}' is not allowed to be updated`);
    }

    let updateData: any = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Handle nested field updates
    if (fieldName.includes('.')) {
      const [parentField, childField] = fieldName.split('.');
      updateData[`${parentField}.${childField}`] = fieldValue;
    } else {
      updateData[fieldName] = fieldValue;
    }

    await db.collection('users').doc(userID).update(updateData);
  } catch (error) {
    console.error('Error updating user boolean field:', error);
    throw new Error(`Failed to update ${fieldName}`);
  }
}

export async function batchUpdateUserInfo(userID: string, updates: Record<string, string>): Promise<void> {
  try {
    // Validate field names to prevent unauthorized field updates
    const allowedStringFields = [
      'fname', 'mname', 'lname', 'contactNumber'
    ];
    
    const updateData: any = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Validate and prepare all updates
    for (const [fieldName, fieldValue] of Object.entries(updates)) {
      if (!allowedStringFields.includes(fieldName)) {
        throw new Error(`Field '${fieldName}' is not allowed to be updated`);
      }
      
      if (typeof fieldValue !== 'string') {
        throw new Error(`Field '${fieldName}' must be a string`);
      }
      
      updateData[fieldName] = fieldValue.trim();
    }

    // Perform batch update
    await db.collection('users').doc(userID).update(updateData);
  } catch (error) {
    console.error('Error batch updating user info:', error);
    throw new Error('Failed to update user information');
  }
}