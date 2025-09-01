import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import admin, { db } from '../config/firebase';
import { FIREBASE_WEB_API_KEY } from '../config/apiKeys';
import fetch from 'node-fetch';

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

interface RefreshTokenRequest extends Request {
  body: {
    refreshToken: string;
  };
}

interface RegisterRequest extends Request {
  body: {
    email: string;
    password: string;
    fname: string;
    lname: string;
    mname?: string;
    bdate: string;
    gender: string;
    contactNumber: string;
    username: string;
    status: string;
    type: string;
  };
}

// Generate JWT tokens
const generateTokens = (userId: string, email: string) => {
  const secretKey = process.env.JWT_SECRET || 'default_secret';
  const refreshSecretKey = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret';

  const accessToken = jwt.sign(
    { userId, email },
    secretKey,
    { expiresIn: '1h' } // Short-lived access token
  );

  const refreshToken = jwt.sign(
    { userId, email },
    refreshSecretKey,
    { expiresIn: '7d' } // Longer-lived refresh token
  );

  return { accessToken, refreshToken };
};

// Fetch user profile from Firestore
const fetchUserProfile = async (userId: string, email: string) => {
  const userDoc = await db.collection('users').doc(userId).get();
  
  if (!userDoc.exists) {
    throw new Error('User profile not found. Please contact support.');
  }
  
  const userData = userDoc.data()!;

  const requiredFields = [
    'fname', 'lname', 'username', 'email', 'bdate', 'gender',
    'contactNumber', 'profileImage', 'status', 'type', 'createdOn'
  ];
  
  const missing = requiredFields.filter(field => userData[field] === undefined || userData[field] === null);
  if (missing.length > 0) {
    throw new Error('User profile is incomplete. Missing: ' + missing.join(', '));
  }

  return {
    id: userId,
    fname: userData.fname,
    mname: userData.mname,
    lname: userData.lname,
    username: userData.username,
    email: email || userData.email,
    bdate: userData.bdate?.toDate ? userData.bdate.toDate() : userData.bdate,
    gender: userData.gender,
    contactNumber: userData.contactNumber,
    profileImage: userData.profileImage,
    isProUser: userData.isProUser ?? false,
    status: userData.status,
    type: userData.type,
    bio: userData.bio || '',
    createdOn: userData.createdOn?.toDate ? userData.createdOn.toDate() : userData.createdOn,
    groups: userData.groups || [],
    isFirstLogin: userData.isFirstLogin ?? true,
    likes: userData.likes || [],
    safetyState: userData.safetyState || {
      isInAnEmergency: false,
      emergencyType: ''
    },
    publicSettings: userData.publicSettings || {
      isProfilePublic: true,
      isTravelInfoPublic: true,
      isPersonalInfoPublic: true
    }
  };
};

// Login controller
export const login = async (req: LoginRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Please enter both email and password.' 
      });
    }

    // Verify credentials with Firebase Auth REST API
    try {
      // Get Firebase Web API Key from apiKeys configuration
      const firebaseApiKey = FIREBASE_WEB_API_KEY;
      if (!firebaseApiKey) {
        throw new Error('Firebase Web API Key not configured');
      }

      // Verify password using Firebase Auth REST API
      const authResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      });

      const authData = await authResponse.json() as any;
      
      console.log('Firebase Auth Response Status:', authResponse.status);
      if (!authResponse.ok) {
        console.log('Firebase Auth Error:', authData);
        const errorCode = authData.error?.message || 'UNKNOWN_ERROR';
        if (errorCode === 'EMAIL_NOT_FOUND') {
          return res.status(404).json({ 
            error: 'No account found with this email.',
            code: 'auth/user-not-found'
          });
        } else if (errorCode === 'INVALID_PASSWORD') {
          return res.status(401).json({ 
            error: 'Incorrect password.',
            code: 'auth/wrong-password'
          });
        } else if (errorCode === 'INVALID_EMAIL') {
          return res.status(400).json({ 
            error: 'Invalid email address.',
            code: 'auth/invalid-email'
          });
        } else {
          return res.status(401).json({ 
            error: 'Invalid credentials.',
            code: 'auth/invalid-credentials'
          });
        }
      }

      const userId = authData.localId;

      // Get user record from Firebase Admin to check email verification
      const userRecord = await admin.auth().getUser(userId);
      
      // Check if email is verified
      if (!userRecord.emailVerified) {
        return res.status(403).json({ 
          error: 'Email not verified',
          code: 'auth/email-not-verified',
          requiresVerification: true 
        });
      }

      // Fetch user profile from Firestore
      const userProfile = await fetchUserProfile(userId, email);

      // Generate JWT tokens
      const { accessToken, refreshToken } = generateTokens(userId, email);

      // Return success response with tokens and user data
      res.status(200).json({
        success: true,
        user: userProfile,
        accessToken,
        refreshToken,
        message: 'Login successful'
      });

    } catch (firebaseError: any) {
      console.error('Firebase Auth Error:', firebaseError);
      
      if (firebaseError.code === 'auth/user-not-found') {
        return res.status(404).json({ 
          error: 'No account found with this email.',
          code: 'auth/user-not-found'
        });
      } else if (firebaseError.code === 'auth/invalid-email') {
        return res.status(400).json({ 
          error: 'Invalid email address.',
          code: 'auth/invalid-email'
        });
      } else {
        return res.status(401).json({ 
          error: 'Invalid credentials.',
          code: 'auth/invalid-credentials'
        });
      }
    }

  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error during login.',
      message: error.message 
    });
  }
};

// Register controller
export const register = async (req: RegisterRequest, res: Response) => {
  try {
    const { 
      email, 
      password, 
      fname, 
      lname, 
      mname, 
      bdate, 
      gender, 
      contactNumber, 
      username, 
      status, 
      type 
    } = req.body;

    // Validate required fields
    if (!email || !password || !fname || !lname || !bdate || !gender || !contactNumber || !username) {
      return res.status(400).json({ 
        error: 'Required fields must not be empty.' 
      });
    }

    try {
      // Create user with Firebase Auth REST API
      const firebaseApiKey = FIREBASE_WEB_API_KEY;
      if (!firebaseApiKey) {
        throw new Error('Firebase Web API Key not configured');
      }

      const createUserResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      });

      const createUserData = await createUserResponse.json() as any;

      if (!createUserResponse.ok) {
        const errorCode = createUserData.error?.message || 'UNKNOWN_ERROR';
        if (errorCode === 'EMAIL_EXISTS') {
          return res.status(409).json({ 
            error: 'Email is already in use.',
            code: 'auth/email-already-in-use'
          });
        } else if (errorCode === 'INVALID_EMAIL') {
          return res.status(400).json({ 
            error: 'Invalid email address.',
            code: 'auth/invalid-email'
          });
        } else if (errorCode === 'WEAK_PASSWORD') {
          return res.status(400).json({ 
            error: 'Password should be at least 6 characters.',
            code: 'auth/weak-password'
          });
        } else {
          return res.status(400).json({ 
            error: 'Registration failed.',
            code: 'auth/registration-failed'
          });
        }
      }

      const userId = createUserData.localId;
      let profileImage = '';
      if(gender === 'Male'){
        profileImage = '@/assets/images/defaultProfile-male.png';
      }else if(gender === 'Female'){
        profileImage = '@/assets/images/defaultProfile-female.png';
      }else{
        profileImage = '@/assets/images/slide1-img.png';
      }
      const userData = {
        fname,
        lname,
        mname: mname || '',
        bdate: new Date(bdate),
        gender,
        contactNumber,
        username,
        email,
        status,
        profileImage,
        type,
        bio: '',
        createdOn: new Date(),
        isProUser: false,
        isFirstLogin: true,
        likes: [],
        groups: [],
        safetyState: {
          isInAnEmergency: false,
          emergencyType: ''
        },
        publicSettings: {
          isProfilePublic: true,
          isTravelInfoPublic: true,
          isPersonalInfoPublic: true
        }
      };

      await db.collection('users').doc(userId).set(userData);

      // Generate JWT tokens
      const { accessToken, refreshToken } = generateTokens(userId, email);

      // Return success response with tokens and user data
      res.status(201).json({
        success: true,
        user: {
          id: userId,
          ...userData,
        },
        accessToken,
        refreshToken,
        message: 'Registration successful'
      });

    } catch (firebaseError: any) {
      console.error('Firebase Registration Error:', firebaseError);
      
      if (firebaseError.code === 'auth/email-already-in-use') {
        return res.status(409).json({ 
          error: 'Email is already in use.',
          code: 'auth/email-already-in-use'
        });
      } else if (firebaseError.code === 'auth/invalid-email') {
        return res.status(400).json({ 
          error: 'Invalid email address.',
          code: 'auth/invalid-email'
        });
      } else if (firebaseError.code === 'auth/weak-password') {
        return res.status(400).json({ 
          error: 'Password should be at least 6 characters.',
          code: 'auth/weak-password'
        });
      } else {
        return res.status(400).json({ 
          error: 'Registration failed.',
          code: 'auth/registration-failed'
        });
      }
    }

  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Internal server error during registration.',
      message: error.message 
    });
  }
};

// Refresh token controller
export const refreshToken = async (req: RefreshTokenRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required.' });
    }

    const refreshSecretKey = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret';

    try {
      const decoded = jwt.verify(refreshToken, refreshSecretKey) as any;
      const { userId, email } = decoded;

      // Generate new tokens
      const tokens = generateTokens(userId, email);

      res.status(200).json({
        success: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      });

    } catch (jwtError) {
      return res.status(403).json({ 
        error: 'Invalid or expired refresh token.',
        code: 'auth/invalid-refresh-token'
      });
    }

  } catch (error: any) {
    console.error('Refresh token error:', error);
    res.status(500).json({ 
      error: 'Internal server error during token refresh.',
      message: error.message 
    });
  }
};

// Logout controller (optional - mainly for token blacklisting if needed)
export const logout = async (req: Request, res: Response) => {
  try {
    // In a stateless JWT system, logout is typically handled client-side
    // by removing tokens from storage. However, you could implement
    // token blacklisting here if needed.
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'Internal server error during logout.',
      message: error.message 
    });
  }
};

// Send verification email controller
export const sendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    console.log('🔍 Email verification request:', { email });

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    try {
      console.log('📧 Getting user record by email:', email);
      // Get user from Firebase Admin by email
      const userRecord = await admin.auth().getUserByEmail(email);
      console.log('✅ User record found:', { uid: userRecord.uid, email: userRecord.email });
      
      // Create a custom token for this user to use with Firebase REST API
      const customToken = await admin.auth().createCustomToken(userRecord.uid);
      
      // Exchange custom token for ID token
      const firebaseApiKey = FIREBASE_WEB_API_KEY;
      if (!firebaseApiKey) {
        throw new Error('Firebase Web API Key not configured');
      }

      console.log('🔑 Creating custom token and exchanging for ID token...');
      const tokenResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${firebaseApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: customToken,
          returnSecureToken: true,
        }),
      });

      const tokenData = await tokenResponse.json() as any;
      
      if (!tokenResponse.ok) {
        console.error('❌ Failed to get ID token:', tokenData);
        throw new Error(`Failed to get ID token: ${tokenData.error?.message || 'Unknown error'}`);
      }
      
      console.log('✅ ID token obtained successfully');

      // Now send verification email using the ID token
      console.log('📤 Sending verification email...');
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firebaseApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestType: 'VERIFY_EMAIL',
          idToken: tokenData.idToken,
        }),
      });

      const data = await response.json() as any;

      if (!response.ok) {
        console.error('❌ Failed to send verification email:', data);
        return res.status(400).json({ 
          error: data.error?.message || 'Failed to send verification email.' 
        });
      }
      
      console.log('✅ Verification email sent successfully');

      res.status(200).json({
        success: true,
        message: 'Verification email sent successfully'
      });

    } catch (firebaseError) {
      console.error('Firebase error during email verification:', firebaseError);
      return res.status(500).json({ error: 'Failed to send verification email.' });
    }

  } catch (error: any) {
    console.error('Send verification email error:', error);
    res.status(500).json({ 
      error: 'Internal server error.',
      message: error.message 
    });
  }
};

// Check email verification controller
export const checkEmailVerification = async (req: Request, res: Response) => {
  try {
    const { userId, email } = req.body;

    if (!userId && !email) {
      return res.status(400).json({ error: 'User ID or email is required.' });
    }

    // Get user record from Firebase Admin to check email verification
    const userRecord = userId 
      ? await admin.auth().getUser(userId)
      : await admin.auth().getUserByEmail(email);
    
    // If email is verified, generate tokens for the user
    let tokens = null;
    if (userRecord.emailVerified) {
      const secretKey = process.env.JWT_SECRET || 'default_secret';
      const refreshSecretKey = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret';
      
      const accessToken = jwt.sign(
        { userId: userRecord.uid, email: userRecord.email },
        secretKey,
        { expiresIn: '1h' }
      );
      
      const refreshToken = jwt.sign(
        { userId: userRecord.uid },
        refreshSecretKey,
        { expiresIn: '7d' }
      );
      
      tokens = { accessToken, refreshToken };
    }

    res.status(200).json({
      success: true,
      emailVerified: userRecord.emailVerified,
      message: userRecord.emailVerified ? 'Email is verified' : 'Email is not verified',
      tokens
    });

  } catch (error: any) {
    console.error('Check email verification error:', error);
    res.status(500).json({ 
      error: 'Internal server error.',
      message: error.message 
    });
  }
};

// Send password reset email controller
export const sendPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const firebaseApiKey = FIREBASE_WEB_API_KEY;
    if (!firebaseApiKey) {
      throw new Error('Firebase Web API Key not configured');
    }

    // Send password reset email using Firebase Auth REST API
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firebaseApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestType: 'PASSWORD_RESET',
        email: email,
      }),
    });

    const data = await response.json() as any;

    if (!response.ok) {
      const errorCode = data.error?.message || 'UNKNOWN_ERROR';
      if (errorCode === 'EMAIL_NOT_FOUND') {
        return res.status(404).json({ 
          error: 'No account found with this email address.' 
        });
      } else {
        return res.status(400).json({ 
          error: data.error?.message || 'Failed to send password reset email.' 
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully'
    });

  } catch (error: any) {
    console.error('Send password reset error:', error);
    res.status(500).json({ 
      error: 'Internal server error.',
      message: error.message 
    });
  }
};

// Fetch user profile controller
export const fetchUserProfileController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    const userProfile = await fetchUserProfile(userRecord.uid, email);

    res.status(200).json({
      success: true,
      user: userProfile
    });

  } catch (error: any) {
    console.error('Fetch user profile error:', error);
    res.status(500).json({ 
      error: 'Internal server error.',
      message: error.message 
    });
  }
};

// Update first login status controller
export const updateFirstLogin = async (req: Request, res: Response) => {
  try {
    const { userIdentifier, interests } = req.body;

    if (!userIdentifier) {
      return res.status(400).json({ error: 'User identifier (email or userId) is required.' });
    }

    if (!interests || !Array.isArray(interests) || interests.length < 3) {
      return res.status(400).json({ error: 'At least 3 interests are required.' });
    }

    // Get user by email if userIdentifier looks like an email
    let userId: string;
    if (userIdentifier.includes('@')) {
      const userRecord = await admin.auth().getUserByEmail(userIdentifier);
      userId = userRecord.uid;
    } else {
      userId = userIdentifier;
    }

    console.log('🔍 UpdateFirstLogin: Processing for userId:', userId);

    // Update user document in Firestore
    await db.collection('users').doc(userId).update({
      isFirstLogin: false,
      likes: interests
    });

    console.log('✅ UpdateFirstLogin: Successfully updated user document');

    res.status(200).json({
      success: true,
      message: 'First login status updated successfully'
    });

  } catch (error: any) {
    console.error('Update first login error:', error);
    res.status(500).json({ 
      error: 'Internal server error.',
      message: error.message 
    });
  }
};

// Change password controller
export const changePassword = async (req: any, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId; // Get userId from middleware

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    try {
      // Get user record from Firebase Admin
      const userRecord = await admin.auth().getUser(userId);
      
      // Verify current password by attempting to sign in with it
      const firebaseApiKey = FIREBASE_WEB_API_KEY;
      if (!firebaseApiKey) {
        throw new Error('Firebase Web API Key not configured');
      }

      const signInResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userRecord.email,
          password: currentPassword,
          returnSecureToken: true,
        }),
      });

      if (!signInResponse.ok) {
        const signInData = await signInResponse.json() as any;
        if (signInData.error?.message === 'INVALID_PASSWORD') {
          return res.status(400).json({ error: 'Current password is incorrect.' });
        }
        throw new Error('Failed to verify current password');
      }

      // Update password using Firebase Admin
      await admin.auth().updateUser(userId, {
        password: newPassword,
      });

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (firebaseError) {
      console.error('Firebase error during password change:', firebaseError);
      return res.status(500).json({ error: 'Failed to change password.' });
    }

  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      error: 'Internal server error.',
      message: error.message 
    });
  }
};