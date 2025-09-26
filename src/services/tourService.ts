import { db } from '../config/firebase';
import { FieldValue } from 'firebase-admin/firestore';

export interface TourLocation {
  locationName: string;
  latitude: number;
  longitude: number;
  note: string;
}

export interface DailyPlan {
  day: number;
  date?: string;
  locations: TourLocation[];
  activities?: string[];
  notes?: string;
}

export interface TourItinerary {
  startDate: FirebaseFirestore.Timestamp;
  endDate: FirebaseFirestore.Timestamp;
  planDaily: boolean;
  locations: TourLocation[] | DailyPlan[]; // Array of locations if planDaily=false, array of daily plans if planDaily=true
}

export interface TourPricing {
  currency: string;
  price: number;
  inclusions: string[];
  exclusions: string[];
}

export interface TourMember {
  userID: string;
  name: string;
  username: string;
  profileImage: string;
  joinedOn: FirebaseFirestore.Timestamp;
  isApproved: boolean;
}

export interface TourGuide {
  userID: string;
  name: string;
  username: string;
  profileImage: string;
}

export interface TourParticipants {
  maxCapacity: number;
  members: TourMember[];
  tourGuides: TourGuide[];
}

export interface Tour {
  title: string;
  description: string;
  images: string[];
  agencyID: string;
  createdOn: FirebaseFirestore.Timestamp;
  updatedOn: FirebaseFirestore.Timestamp;
  tags: string[];
  status: 'draft' | 'active' | 'cancelled' | 'completed';
  itinerary: TourItinerary;
  pricing: TourPricing;
  participants: TourParticipants;
}

export interface CreateTourData {
  title: string;
  description: string;
  images: string[];
  agencyID: string;
  tags: string[];
  status: 'draft' | 'active' | 'cancelled' | 'completed';
  itinerary: {
    startDate: Date;
    endDate: Date;
    planDaily: boolean;
    locations: TourLocation[] | DailyPlan[]; // Array of locations if planDaily=false, array of daily plans if planDaily=true
  };
  pricing: TourPricing;
  participants: {
    maxCapacity: number;
    members?: TourMember[];
    tourGuides?: TourGuide[];
  };
}

export const createTour = async (tourData: CreateTourData): Promise<{ success: boolean; tourId?: string; error?: string }> => {
  try {
    // Validate required fields
    if (!tourData.title || !tourData.description || !tourData.agencyID) {
      return {
        success: false,
        error: 'Missing required fields: title, description, or agencyID'
      };
    }

    // Validate status
    const validStatuses = ['draft', 'active', 'cancelled', 'completed'];
    if (!validStatuses.includes(tourData.status)) {
      return {
        success: false,
        error: 'Invalid status. Must be one of: draft, active, cancelled, completed'
      };
    }

    // Validate itinerary dates
    if (tourData.itinerary.startDate >= tourData.itinerary.endDate) {
      return {
        success: false,
        error: 'Start date must be before end date'
      };
    }

    // Validate locations based on planDaily
    if (!tourData.itinerary.locations || tourData.itinerary.locations.length === 0) {
      return {
        success: false,
        error: 'At least one location is required'
      };
    }

    // If planDaily is true, validate daily plan structure
    if (tourData.itinerary.planDaily) {
      const dailyPlans = tourData.itinerary.locations as DailyPlan[];
      
      // Check if locations is actually an array of daily plans
      if (!Array.isArray(dailyPlans) || dailyPlans.some(plan => typeof plan.day !== 'number' || !Array.isArray(plan.locations))) {
        return {
          success: false,
          error: 'When planDaily is true, locations must be an array of daily plans with day number and locations array'
        };
      }

      // Validate each daily plan has at least one location
      for (const plan of dailyPlans) {
        if (!plan.locations || plan.locations.length === 0) {
          return {
            success: false,
            error: `Day ${plan.day} must have at least one location`
          };
        }
      }
    } else {
      // If planDaily is false, validate it's an array of locations
      const locations = tourData.itinerary.locations as TourLocation[];
      if (!Array.isArray(locations) || locations.some(loc => !loc.locationName || typeof loc.latitude !== 'number' || typeof loc.longitude !== 'number')) {
        return {
          success: false,
          error: 'When planDaily is false, locations must be an array of location objects with locationName, latitude, and longitude'
        };
      }
    }

    // Validate pricing
    if (!tourData.pricing.currency || tourData.pricing.price < 0) {
      return {
        success: false,
        error: 'Invalid pricing: currency is required and price must be non-negative'
      };
    }

    // Validate participants
    if (tourData.participants.maxCapacity <= 0) {
      return {
        success: false,
        error: 'Maximum capacity must be greater than 0'
      };
    }

    const now = FieldValue.serverTimestamp();
    
    // Convert input dates to Firestore timestamps
    const startTimestamp = FieldValue.serverTimestamp();
    const endTimestamp = FieldValue.serverTimestamp();
    
    // Prepare tour document
    const tour = {
      title: tourData.title,
      description: tourData.description,
      images: tourData.images || [],
      agencyID: tourData.agencyID,
      createdOn: now,
      updatedOn: now,
      tags: tourData.tags || [],
      status: tourData.status,
      itinerary: {
        startDate: startTimestamp,
        endDate: endTimestamp,
        planDaily: tourData.itinerary.planDaily,
        locations: tourData.itinerary.locations
      },
      pricing: {
        currency: tourData.pricing.currency,
        price: tourData.pricing.price,
        inclusions: tourData.pricing.inclusions || [],
        exclusions: tourData.pricing.exclusions || []
      },
      participants: {
        maxCapacity: tourData.participants.maxCapacity,
        members: tourData.participants.members || [],
        tourGuides: tourData.participants.tourGuides || []
      }
    };

    // Add the tour to Firestore
    const tourRef = await db.collection('tours').add(tour);

    return {
      success: true,
      tourId: tourRef.id
    };

  } catch (error) {
    console.error('Error creating tour:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};