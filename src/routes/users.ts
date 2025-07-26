import { Router } from 'express';
import multer from 'multer';
import { getUserEmergencyContact, setUserEmergencyContact, addUserEmergencyContact, uploadUserProfileImage } from '../controllers/usersController';

const router = Router();

// Configure multer for memory storage
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
  },
});

router.get('/:userId/emergency-contact', getUserEmergencyContact);
router.put('/:userId/emergency-contact', setUserEmergencyContact);
router.post('/:userId/emergency-contact', addUserEmergencyContact);
router.post('/upload-profile-image', upload.single('image'), uploadUserProfileImage);

export default router; 