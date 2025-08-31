import express from 'express';
import { login, register, refreshToken, logout, sendVerificationEmail, checkEmailVerification, sendPasswordReset, updateFirstLogin, changePassword, fetchUserProfileController } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.post('/login', login); //works
router.post('/register', register); //works but there might be changes in the data
router.post('/refresh-token', refreshToken);
router.post('/send-verification-email', sendVerificationEmail);
router.post('/check-email-verification', checkEmailVerification);
router.post('/send-password-reset', sendPasswordReset); //works
router.post('/fetch-user-profile', authMiddleware, fetchUserProfileController);
router.post('/update-first-login', authMiddleware, updateFirstLogin);

// Protected routes
router.post('/logout', authMiddleware, logout); //works
router.post('/change-password', authMiddleware, changePassword);

export default router;