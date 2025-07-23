import { Request, Response } from 'express';
import { getEmergencyContact, setEmergencyContact, addEmergencyContact } from '../services/usersService';

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