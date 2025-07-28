import admin from 'firebase-admin';

// Firebase is already initialized in firestoreService.ts, so we just import it

const db = admin.firestore();
const bucket = admin.storage().bucket();

export async function getEmergencyContact(userId: string): Promise<any[]> {
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) return [];
  const data = userDoc.data() || {};
  return data.emergencyContact || [];
}

export async function setEmergencyContact(userId: string, emergencyContact: any[]): Promise<boolean> {
  await db.collection('users').doc(userId).update({ emergencyContact });
  return true;
}

export async function addEmergencyContact(userId: string, contact: any): Promise<boolean> {
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) throw new Error('User not found');
  const data = userDoc.data() || {};
  const contacts = data.emergencyContact || [];
  contacts.push(contact);
  await db.collection('users').doc(userId).update({ emergencyContact: contacts });
  return true;
}

export async function uploadProfileImage(userId: string, file: Express.Multer.File): Promise<string> {
  try {
    // Check if user exists
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `profile-images/${userId}/${timestamp}-${file.originalname}`;
    
    // Upload to Firebase Storage
    const fileUpload = bucket.file(fileName);
    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (error) => {
        reject(error);
      });

      blobStream.on('finish', async () => {
        try {
          // Make the file publicly accessible
          await fileUpload.makePublic();
          
          // Get the public URL
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          
          // Update user's profileImage in Firestore
          await db.collection('users').doc(userId).update({
            profileImage: publicUrl,
          });
          
          resolve(publicUrl);
        } catch (error) {
          reject(error);
        }
      });

      blobStream.end(file.buffer);
    });
  } catch (error) {
    throw error;
  }
} 