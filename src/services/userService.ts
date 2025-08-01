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