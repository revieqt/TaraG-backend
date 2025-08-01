import express from 'express';
import multer from 'multer';
import { updateUserProfileImage, updateUserBio, getUserProfileData } from '../controllers/userController';

const router = express.Router();

// Configure multer for memory storage (for processing images)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Update profile image endpoint
router.post('/update-profile-image', upload.single('image'), updateUserProfileImage);

// Update bio endpoint
router.put('/update-bio', updateUserBio);

// Get user profile endpoint
router.get('/profile/:userID', getUserProfileData);

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