import axios from 'axios';
import { GOOGLE_API_KEY } from '../config/apiKeys';

// New Google Places API (New) endpoints
const PLACES_NEW_BASE_URL = 'https://places.googleapis.com/v1/places';

interface PlaceAutocompleteResult {
  suggestions: Array<{
    placePrediction: {
      place: string;
      placeId: string;
      text: {
        text: string;
        matches: Array<{
          endOffset: number;
        }>;
      };
      structuredFormat: {
        mainText: {
          text: string;
          matches: Array<{
            endOffset: number;
          }>;
        };
        secondaryText: {
          text: string;
          matches: Array<{
            endOffset: number;
          }>;
        };
      };
    };
  }>;
}

interface PlaceDetailsResult {
  id: string;
  displayName: {
    text: string;
    languageCode: string;
  };
  formattedAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  userRatingCount?: number;
  photos?: Array<{
    name: string;
    widthPx: number;
    heightPx: number;
  }>;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  regularOpeningHours?: {
    openNow: boolean;
    weekdayDescriptions: string[];
  };
}

export const searchAutocomplete = async (searchQuery: string, latitude: number, longitude: number) => {
  try {
    const response = await axios.post<PlaceAutocompleteResult>(
      `${PLACES_NEW_BASE_URL}:autocomplete`,
      {
        input: searchQuery,
        locationBias: {
          circle: {
            center: {
              latitude: latitude,
              longitude: longitude,
            },
            radius: 10000.0, // 10km radius
          },
        },
        languageCode: 'en',
        regionCode: 'PH', // Philippines
        includedPrimaryTypes: ['establishment'],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'suggestions.placePrediction.place,suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat',
        },
      }
    );

    if (!response.data.suggestions) {
      return [];
    }

    return response.data.suggestions.map(suggestion => ({
      description: suggestion.placePrediction.text.text,
      placeId: suggestion.placePrediction.placeId,
      mainText: suggestion.placePrediction.structuredFormat.mainText.text,
      secondaryText: suggestion.placePrediction.structuredFormat.secondaryText.text,
    }));
  } catch (error) {
    console.error('Error in searchAutocomplete:', error);
    throw new Error('Failed to fetch place autocomplete results');
  }
};

export const getPlaceDetails = async (placeId: string) => {
  try {
    const response = await axios.get<PlaceDetailsResult>(
      `${PLACES_NEW_BASE_URL}/${placeId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,rating,userRatingCount,photos,nationalPhoneNumber,websiteUri,regularOpeningHours',
        },
      }
    );

    const place = response.data;
    return {
      name: place.displayName.text,
      placeId: place.id,
      address: place.formattedAddress,
      location: {
        lat: place.location.latitude,
        lng: place.location.longitude,
      },
      rating: place.rating,
      totalRatings: place.userRatingCount,
      phoneNumber: place.nationalPhoneNumber,
      website: place.websiteUri,
      openingHours: place.regularOpeningHours ? {
        open_now: place.regularOpeningHours.openNow,
        weekday_text: place.regularOpeningHours.weekdayDescriptions,
      } : undefined,
      photoReference: place.photos?.[0]?.name,
    };
  } catch (error) {
    console.error('Error in getPlaceDetails:', error);
    throw new Error('Failed to fetch place details');
  }
};
