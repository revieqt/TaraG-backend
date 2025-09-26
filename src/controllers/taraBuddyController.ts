import { Request, Response } from 'express';
import * as taraBuddyService from '../services/taraBuddyService';

interface AuthRequest extends Request {
  user?: any;
}

export const createTaraBuddyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { userID } = req.body;
    if (!userID) {
      return res.status(400).json({ message: 'userID is required' });
    }
    const preference = await taraBuddyService.createTaraBuddyProfile(userID);
    return res.status(201).json({ message: 'TaraBuddy profile created', data: preference });
  } catch (error: any) {
    console.error('Error in createTaraBuddyProfile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateGenderPreference = async (req: AuthRequest, res: Response) => {
  try {
    const { userID, gender } = req.body;
    if (!userID || !gender) {
      return res.status(400).json({ message: 'userID and gender are required' });
    }
    const updated = await taraBuddyService.updateGenderPreference(userID, gender);
    return res.status(200).json({ message: 'Gender preference updated', data: updated });
  } catch (error: any) {
    console.error('Error in updateGenderPreference:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateMaxDistancePreference = async (req: AuthRequest, res: Response) => {
  try {
    const { userID, maxDistance } = req.body;
    if (!userID || typeof maxDistance !== 'number') {
      return res.status(400).json({ message: 'userID and maxDistance (number) are required' });
    }
    const updated = await taraBuddyService.updateMaxDistancePreference(userID, maxDistance);
    return res.status(200).json({ message: 'Max distance preference updated', data: updated });
  } catch (error: any) {
    console.error('Error in updateMaxDistancePreference:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateAgePreference = async (req: AuthRequest, res: Response) => {
  try {
    const { userID, ageRange } = req.body;
    if (!userID || !Array.isArray(ageRange) || ageRange.length !== 2) {
      return res.status(400).json({ message: 'userID and ageRange (array of two numbers) are required' });
    }
    const updated = await taraBuddyService.updateAgePreference(userID, ageRange);
    return res.status(200).json({ message: 'Age range preference updated', data: updated });
  } catch (error: any) {
    console.error('Error in updateAgePreference:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateZodiacPreference = async (req: AuthRequest, res: Response) => {
   try {
     const { userID, zodiac } = req.body;
     if (!userID || !Array.isArray(zodiac)) {
       return res.status(400).json({ message: 'userID and zodiac (array of strings) are required' });
     }
     const updated = await taraBuddyService.updateZodiacPreference(userID, zodiac);
     return res.status(200).json({ message: 'Zodiac preference updated', data: updated });
   } catch (error: any) {
     console.error('Error in updateZodiacPreference:', error);
     return res.status(500).json({ message: 'Internal server error' });
   }
};

export const disableTaraBuddyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { userID } = req.body;
    if (!userID) {
      return res.status(400).json({ message: 'userID is required' });
    }
    await taraBuddyService.disableTaraBuddyProfile(userID);
    return res.status(200).json({ message: 'TaraBuddy profile disabled' });
  } catch (error: any) {
    console.error('Error in disableTaraBuddyProfile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};