import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

const db = admin.firestore();
const bucket = admin.storage().bucket();

export async function updateProfileImage(userID: string, imageBuffer: Buffer, mimeType: string): Promise<string> {
  try {
    // Generate unique filename
    const fileExtension = mimeType.split('/')[1];
    const fileName = `profileImages/${userID}_${uuidv4()}.${fileExtension}`;
    
    // Upload to Firebase Storage
    const file = bucket.file(fileName);
    await file.save(imageBuffer, {
      metadata: {
        contentType: mimeType,
      },
      public: true
    });

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    
    // Update Firestore document
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