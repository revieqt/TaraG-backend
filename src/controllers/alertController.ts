import { Request, Response } from 'express';
import { addAlert, getAlertsByLocation, deleteAlert, UserLocation, AlertData, loadAndCacheAlerts } from '../services/alertService';

export async function getLatestAlert(req: Request, res: Response) {
  try {
    const userLocation: UserLocation = req.body;
    
    // Basic validation - at least one location field should be provided
    const locationFields = [
      userLocation.suburb,
      userLocation.city,
      userLocation.town,
      userLocation.state,
      userLocation.region,
      userLocation.country
    ];
    
    if (!locationFields.some(field => field)) {
      return res.status(400).json({ error: 'At least one location field is required' });
    }
    
    const alerts = await getAlertsByLocation(userLocation);
    res.json({ 
      success: true,
      alerts,
      count: alerts.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch alerts' });
  }
}

export async function createAlert(req: Request, res: Response) {
  try {
    const {
      title,
      note,
      severity,
      createdBy,
      startOn,
      endOn,
      target
    }: AlertData = req.body;

    // Basic validation
    if (!title || !note || !severity || !createdBy || !startOn || !endOn || !target) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate that target is an array
    if (!Array.isArray(target)) {
      return res.status(400).json({ error: 'Target must be an array of strings' });
    }

    // Validate that target array is not empty
    if (target.length === 0) {
      return res.status(400).json({ error: 'Target array cannot be empty' });
    }

    // Validate severity
    const validSeverities = ['low', 'medium', 'high'];
    if (!validSeverities.includes(severity.toLowerCase())) {
      return res.status(400).json({ error: 'Severity must be one of: low, medium, high' });
    }

    const alertData: AlertData = {
      title,
      note,
      severity: severity.toLowerCase(),
      createdBy,
      startOn,
      endOn,
      target
    };

    const id = await addAlert(alertData);
    res.status(201).json({ 
      success: true,
      id,
      message: 'Alert created successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create alert' });
  }
}

export async function deleteAlertController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Alert ID is required' });
    }
    
    await deleteAlert(id);
    res.json({ success: true, message: 'Alert deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Alert not found') {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.status(500).json({ error: error.message || 'Failed to delete alert' });
  }
}

// New endpoint to manually refresh cache (for testing/admin purposes)
export async function refreshCache(req: Request, res: Response) {
  try {
    const alerts = await loadAndCacheAlerts();
    res.json({ 
      success: true, 
      message: 'Cache refreshed successfully',
      count: alerts.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to refresh cache' });
  }
} 