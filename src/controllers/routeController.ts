import { Request, Response } from 'express';

interface AuthRequest extends Request {
  user?: any;
}
import {
  createRoute,
  deleteRoute,
  getSavedRoutes,
  getRoutes,
} from '../services/routeService';

export const createRouteHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { userID, status, mode, location } = req.body;
    if (!userID || !status || !mode || !location) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    const route = await createRoute({ userID, status, mode, location });
    res.json(route);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create route.' });
  }
};

export const deleteRouteHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing route id.' });
    await deleteRoute(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete route.' });
  }
};

export const getSavedRoutesHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { userID, status } = req.body;
    if (!userID || !status) return res.status(400).json({ error: 'Missing userID or status.' });
    const routes = await getSavedRoutes(userID, status);
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch saved routes.' });
  }
};

export const getRoutesHandler = async (req: Request, res: Response) => {
  try {
    const { location, mode } = req.body;
    console.log('🚀 getRoutesHandler called with:', { 
      locationCount: location?.length, 
      mode,
      locations: location?.map((loc: any, i: number) => `${i}: [${loc.latitude}, ${loc.longitude}]`)
    });
    
    if (!location || !mode) {
      console.log('❌ Missing required parameters');
      return res.status(400).json({ error: 'Missing location or mode.' });
    }
    
    if (!Array.isArray(location) || location.length < 2) {
      console.log('❌ Invalid location array');
      return res.status(400).json({ error: 'Location must be an array with at least 2 points.' });
    }
    
    const route = await getRoutes({ location, mode });
    console.log('✅ Route generated successfully with segments and steps:', {
      distance: `${(route.distance / 1000).toFixed(2)} km`,
      duration: `${Math.round(route.duration / 60)} min`,
      segmentCount: route.segments?.length || 0,
      totalSteps: route.segments?.reduce((acc: number, seg: any) => acc + (seg.steps?.length || 0), 0) || 0
    });
    res.json(route);
  } catch (error) {
    console.error('❌ getRoutesHandler error:', error);
    res.status(500).json({ error: 'Failed to fetch routes.', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};