import { Request, Response } from 'express';
import {
  createRoute,
  deleteRoute,
  getSavedRoutes,
  getRoutes,
} from '../services/routeService';

export const createRouteHandler = async (req: Request, res: Response) => {
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

export const deleteRouteHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing route id.' });
    await deleteRoute(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete route.' });
  }
};

export const getSavedRoutesHandler = async (req: Request, res: Response) => {
  try {
    const { userID } = req.body;
    if (!userID) return res.status(400).json({ error: 'Missing userID.' });
    const routes = await getSavedRoutes(userID);
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch saved routes.' });
  }
};

export const getRoutesHandler = async (req: Request, res: Response) => {
  try {
    const { location, mode, alternatives } = req.body;
    if (!location || !mode) {
      return res.status(400).json({ error: 'Missing location or mode.' });
    }
    const routes = await getRoutes({ location, mode, alternatives: !!alternatives });
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch routes.' });
  }
};