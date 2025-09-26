import { Request, Response } from 'express';
import {
  getFilteredAlerts as serviceGetFilteredAlerts,
  getAlertsByLocation as serviceGetAlertsByLocation,
  createAlert as serviceCreateAlert,
  updateAlert as serviceUpdateAlert,
  deleteAlert as serviceDeleteAlert,
} from '../services/alertService';

interface AuthRequest extends Request {
  user?: any;
}

export async function getFilteredAlerts(req: Request, res: Response) {
  try {
    const { locations, date, severity, search } = req.query;
    const filters: {
      locations?: string[];
      date?: string;
      severity?: string;
      search?: string;
    } = {};

    if (typeof locations === 'string' && locations.trim()) {
      filters.locations = locations.split(',').map(loc => loc.trim());
    }
    if (typeof date === 'string') {
      filters.date = date;
    }
    if (typeof severity === 'string') {
      filters.severity = severity;
    }
    if (typeof search === 'string') {
      filters.search = search;
    }

    const alerts = await serviceGetFilteredAlerts(filters);
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching filtered alerts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getAlertsByLocation(req: Request, res: Response) {
  try {
    console.log('getAlertsByLocation called with query:', req.query);
    
    const { locations } = req.query;
    if (!locations || typeof locations !== 'string') {
      console.error('Missing or invalid locations parameter:', locations);
      return res.status(400).json({ message: 'locations query parameter is required' });
    }
    
    const locArray = locations.split(',').map(loc => loc.trim());
    console.log('Parsed locations array:', locArray);
    
    const alerts = await serviceGetAlertsByLocation(locArray);
    console.log('Retrieved alerts:', alerts.length);
    
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts by location:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function createAlert(req: AuthRequest, res: Response) {
  try {
    const { title, description, severity, startOn, endOn, locations } = req.body;
    if (!title || !description || !severity || !startOn || !endOn || !locations) {
      console.error('Missing required fields:', req.body);
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const id = await serviceCreateAlert({
      title,
      description,
      severity,
      startOn: new Date(startOn),
      endOn: new Date(endOn),
      locations,
    });
    res.status(201).json({ id });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Helper function to create a test alert (for debugging)
export async function createTestAlert(req: Request, res: Response) {
  try {
    console.log('Creating test alert...');
    const testAlert = {
      title: 'Test Alert',
      description: 'This is a test alert for debugging purposes',
      severity: 'medium' as const,
      startOn: new Date(),
      endOn: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      locations: ['global', 'melbourne', 'australia'],
    };
    
    const id = await serviceCreateAlert(testAlert);
    console.log('Test alert created with ID:', id);
    res.status(201).json({ id, message: 'Test alert created successfully' });
  } catch (error) {
    console.error('Error creating test alert:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateAlert(req: AuthRequest, res: Response) {
  try {
    const alertId = req.params.id;
    const { title, description, severity, startOn, endOn, locations } = req.body;
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (severity !== undefined) updateData.severity = severity;
    if (startOn !== undefined) updateData.startOn = new Date(startOn);
    if (endOn !== undefined) updateData.endOn = new Date(endOn);
    if (locations !== undefined) updateData.locations = locations;

    await serviceUpdateAlert(alertId, updateData);
    res.json({ message: 'Alert updated' });
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function deleteAlert(req: AuthRequest, res: Response) {
  try {
    const alertId = req.params.id;
    await serviceDeleteAlert(alertId);
    res.json({ message: 'Alert deleted' });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}