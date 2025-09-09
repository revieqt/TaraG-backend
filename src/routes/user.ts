import express from 'express';
import multer from 'multer';
import { Request, Response } from 'express';
import { 
  updateUserProfileImage, 
  updateUserBio, 
  getUserProfileData, 
  updateUserStringFieldController, 
  updateUserBooleanFieldController, 
  batchUpdateUserInfoController 
} from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';
import { getUsersByType } from '../services/userService';
import { db } from '../config/firebase';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get users by type endpoint
router.get('/type/:userType', async (req: Request, res: Response) => {
  try {
    const { userType } = req.params;
    const users = await getUsersByType(userType);
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users by type:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Delete user endpoint
router.delete('/:userID', async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    await db.collection('users').doc(userID).delete();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Warning endpoint
router.post('/:userID/warning', async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    const { action } = req.body;
    
    const userRef = db.collection('users').doc(userID);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const currentWarnings = userDoc.data()?.warningCount || 0;
    const newWarnings = action === 'add' ? currentWarnings + 1 : Math.max(0, currentWarnings - 1);
    
    await userRef.update({ warningCount: newWarnings });
    
    res.status(200).json({ 
      message: 'Warning updated successfully',
      warningCount: newWarnings
    });
  } catch (error) {
    console.error('Error updating warning:', error);
    res.status(500).json({ error: 'Failed to update warning' });
  }
});

// Secure profile endpoint - FIXED to properly use authMiddleware
router.get('/secure-profile/:userID', authMiddleware, async (req: any, res: Response) => {
  try {
    const { userID } = req.params;
    
    // Verify the authenticated user has permission (admin role)
    const authenticatedUser = req.user;
    
    // For now, allow any authenticated user to view profiles
    // You might want to add role-based authorization here later
    
    const userDoc = await db.collection('users').doc(userID).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userDoc.data();
    
    // Check if userData exists
    if (!userData) {
      return res.status(404).json({ error: 'User data not found' });
    }
    
    // Return only non-sensitive data with proper null checks
    const secureProfile = {
      likes: userData.likes || [],
      trips: userData.trips || [],
      loginHistory: (userData.loginHistory || []).map((login: any) => ({
        date: login?.date || '',
        time: login?.time || '',
        device: login?.device || ''
      })),
      emergencyContacts: (userData.emergencyContacts || []).map((contact: any) => ({
        name: contact?.name || '',
        relationship: contact?.relationship || '',
        phone: contact?.phone ? maskPhoneNumber(contact.phone) : '' // Mask phone numbers
      })),
      activityLogs: userData.activityLogs || []
    };
    
    res.status(200).json({ 
      message: 'User profile retrieved successfully',
      user: secureProfile
    });
  } catch (error) {
    console.error('Error getting secure user profile:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Helper function to mask phone numbers
function maskPhoneNumber(phone: string): string {
  if (!phone) return '';
  if (phone.length <= 4) return '*'.repeat(phone.length);
  return '*'.repeat(phone.length - 4) + phone.slice(-4);
}

// Update profile image endpoint
router.post('/update-profile-image', upload.single('image'), updateUserProfileImage);

// Update bio endpoint
router.put('/update-bio', updateUserBio);

// Get user profile endpoint
router.get('/profile/:userID', getUserProfileData);

// Update user string field endpoint (protected)
router.put('/update-string-field', authMiddleware, updateUserStringFieldController);

// Update user boolean field endpoint (protected)
router.put('/update-boolean-field', authMiddleware, updateUserBooleanFieldController);

// Batch update user information endpoint (protected)
router.put('/batch-update', authMiddleware, batchUpdateUserInfoController);

// Error handling middleware for multer
router.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: 'File upload error' });
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({ error: 'Only image files are allowed' });
  }
  
  next(error);
});

export default router;