import { Request, Response } from 'express';
import { searchAutocomplete, getPlaceDetails } from '../services/placesService';

export const searchAutocompleteHandler = async (req: Request, res: Response) => {
  try {
    const { search, latitude, longitude } = req.query;

    if (!search || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Search query, latitude, and longitude are required',
      });
    }

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude or longitude',
      });
    }

    const results = await searchAutocomplete(search as string, lat, lng);
    
    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Error in searchAutocompleteHandler:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};

export const getPlaceDetailsHandler = async (req: Request, res: Response) => {
  try {
    const { placeId } = req.params;

    if (!placeId) {
      return res.status(400).json({
        success: false,
        message: 'Place ID is required',
      });
    }

    const placeDetails = await getPlaceDetails(placeId);
    
    return res.status(200).json({
      success: true,
      data: placeDetails,
    });
  } catch (error) {
    console.error('Error in getPlaceDetailsHandler:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};
