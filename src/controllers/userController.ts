import { Request, Response } from 'express';
import { updateProfileImage, updateBio, getUserProfile } from '../services/userService';

export async function updateUserProfileImage(req: Request, res: Response) {
  try {
    const { userID } = req.body;
    
    if (!userID) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const imageBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;

    // Validate image type
    if (!mimeType.startsWith('image/')) {
      return res.status(400).json({ error: 'File must be an image' });
    }

    const imageUrl = await updateProfileImage(userID, imageBuffer, mimeType);
    
    res.status(200).json({ 
      message: 'Profile image updated successfully',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error in updateUserProfileImage:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to update profile image' 
    });
  }
}

export async function updateUserBio(req: Request, res: Response) {
  try {
    const { userID, bio } = req.body;
    
    if (!userID || !bio) {
      return res.status(400).json({ error: 'User ID and bio are required' });
    }

    if (typeof bio !== 'string' || bio.trim().length === 0) {
      return res.status(400).json({ error: 'Bio must be a non-empty string' });
    }

    await updateBio(userID, bio.trim());
    
    res.status(200).json({ 
      message: 'Bio updated successfully',
      bio: bio.trim()
    });
  } catch (error) {
    console.error('Error in updateUserBio:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to update bio' 
    });
  }
}

export async function getUserProfileData(req: Request, res: Response) {
  try {
    const { userID } = req.params;
    
    if (!userID) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const userProfile = await getUserProfile(userID);
    
    res.status(200).json({ 
      message: 'User profile retrieved successfully',
      user: userProfile
    });
  } catch (error) {
    console.error('Error in getUserProfileData:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to get user profile' 
    });
  }
} 