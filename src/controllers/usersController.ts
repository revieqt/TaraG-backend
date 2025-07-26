import { Request, Response } from 'express';
import { getEmergencyContact, setEmergencyContact, addEmergencyContact, uploadProfileImage } from '../services/usersService';

export async function getUserEmergencyContact(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });
    const contacts = await getEmergencyContact(userId);
    res.json({ emergencyContact: contacts });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get emergency contact' });
  }
}

export async function setUserEmergencyContact(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { emergencyContact } = req.body;
    if (!userId || !Array.isArray(emergencyContact)) return res.status(400).json({ error: 'User ID and emergencyContact array required' });
    await setEmergencyContact(userId, emergencyContact);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to set emergency contact' });
  }
}

export async function addUserEmergencyContact(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { contact } = req.body;
    if (!userId || !contact) return res.status(400).json({ error: 'User ID and contact required' });
    await addEmergencyContact(userId, contact);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to add emergency contact' });
  }
}

export async function uploadUserProfileImage(req: Request, res: Response) {
  try {
    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'User ID is required as query parameter' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Validate file type
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'File must be an image' });
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      return res.status(400).json({ error: 'File size must be less than 5MB' });
    }

    const imageUrl = await uploadProfileImage(userId, req.file);
    res.json({ 
      success: true, 
      imageUrl,
      message: 'Profile image uploaded successfully' 
    });
  } catch (error: any) {
    console.error('Upload profile image error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to upload profile image' 
    });
  }
} 