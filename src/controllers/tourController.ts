import { Request, Response } from 'express';
import { createTour, CreateTourData } from '../services/tourService';

export const createTourController = async (req: Request, res: Response): Promise<void> => {
  try {
    const tourData: CreateTourData = req.body;

    // Validate request body
    if (!tourData) {
      res.status(400).json({
        success: false,
        error: 'Request body is required'
      });
      return;
    }

    // Convert date strings to Date objects if they're strings
    if (typeof tourData.itinerary?.startDate === 'string') {
      tourData.itinerary.startDate = new Date(tourData.itinerary.startDate);
    }
    if (typeof tourData.itinerary?.endDate === 'string') {
      tourData.itinerary.endDate = new Date(tourData.itinerary.endDate);
    }

    // Call the service to create the tour
    const result = await createTour(tourData);

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Tour created successfully',
        tourId: result.tourId
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('Error in createTourController:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};