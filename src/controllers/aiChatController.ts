import { Request, Response } from "express";
import { aiChatService, recognizeIntent, getTravelSuggestions, UserIntent } from "../services/aiChatService";

// Define the message type
type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

// Enhanced response type
type AIResponse = {
  reply: string;
  intent?: UserIntent;
  suggestions?: string[];
  actionRequired?: {
    type: 'confirm_itinerary' | 'confirm_route' | 'check_active_route';
    data?: any;
  };
};

// In-memory session store (for simplicity)
const sessions: Record<string, ChatMessage[]> = {};

export const aiChatController = async (req: Request, res: Response) => {
  try {
    const { sessionId, message, userID, hasActiveRoute } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: "sessionId and message are required" });
    }

    // Initialize session if not exists
    if (!sessions[sessionId]) {
      sessions[sessionId] = [
        {
          role: "system",
          content:
            "You are Tara, a friendly travel assistant for the Philippines. You help with travel planning, itineraries, routes, and travel advice. Be helpful, concise, and engaging. When users ask for itinerary or route creation, be enthusiastic and offer to help create them.",
        },
      ];
    }

    // Recognize user intent
    const intent = recognizeIntent(message);
    console.log('Recognized intent:', intent);

    // Push user message
    sessions[sessionId].push({ role: "user", content: message });

    let aiResponse: string;
    let actionRequired: any = undefined;
    let suggestions: string[] = [];

    // Handle different intents
    switch (intent.type) {
      case 'create_itinerary':
        const { destination, duration, preferences } = intent.extractedData || {};
        
        aiResponse = `I'd love to help you create an itinerary${destination ? ` for ${destination}` : ''}${duration ? ` for ${duration}` : ''}! `;
        
        if (preferences && preferences.length > 0) {
          aiResponse += `I see you're interested in ${preferences.join(', ')}. `;
        }
        
        aiResponse += `I can create a personalized itinerary for you with recommended places, activities, and timing. Would you like me to create this itinerary and save it to your account?`;
        
        actionRequired = {
          type: 'confirm_itinerary',
          data: intent.extractedData
        };
        break;

      case 'create_route':
        if (hasActiveRoute) {
          aiResponse = "I notice you already have an active route in progress. You'll need to complete or cancel your current route before I can create a new one. Would you like me to help you manage your current route instead?";
          actionRequired = {
            type: 'check_active_route'
          };
        } else {
          const { startLocation, endLocation, transportMode } = intent.extractedData || {};
          
          aiResponse = `I can help you create a route${startLocation && endLocation ? ` from ${startLocation} to ${endLocation}` : ''}! `;
          aiResponse += `I'll find the best path${transportMode ? ` for ${transportMode === 'foot-walking' ? 'walking' : 'driving'}` : ''} and provide turn-by-turn directions. `;
          aiResponse += `Would you like me to generate this route for you?`;
          
          actionRequired = {
            type: 'confirm_route',
            data: intent.extractedData
          };
        }
        break;

      default:
        // For general queries, get AI response and add travel suggestions
        aiResponse = await aiChatService(sessions[sessionId]);
        
        // Add travel suggestions for general queries
        if (sessions[sessionId].length <= 3) { // Only for early conversation
          suggestions = getTravelSuggestions();
        }
        break;
    }

    // Push assistant reply into history
    sessions[sessionId].push({ role: "assistant", content: aiResponse });

    const response: AIResponse = {
      reply: aiResponse,
      intent: intent.type !== 'general' ? intent : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      actionRequired
    };

    res.json(response);
  } catch (error) {
    console.error("aiChatController Error:", error);
    res.status(500).json({ error: "Failed to get AI response" });
  }
};

// Create AI Itinerary Controller
export const createAIItinerary = async (req: Request, res: Response) => {
  try {
    const { userID, extractedData, accessToken } = req.body;
    
    if (!userID || !accessToken) {
      return res.status(400).json({ error: "userID and accessToken are required" });
    }

    // Generate sample locations based on extracted data
    const { destination, duration, preferences } = extractedData || {};
    
    // Create a basic itinerary structure
    const itinerary = {
      userID,
      title: `AI Generated Trip${destination ? ` - ${destination}` : ''}`,
      description: `Automatically generated itinerary${duration ? ` for ${duration}` : ''}${preferences ? ` featuring ${preferences.join(', ')}` : ''}`,
      duration: duration || '3 days',
      destination: destination || 'Philippines',
      preferences: preferences || [],
      locations: [
        {
          locationName: destination || 'Sample Destination',
          latitude: 14.5995,
          longitude: 120.9842,
          note: 'Starting point'
        }
      ],
      activities: [
        {
          name: 'Explore local attractions',
          time: '09:00 AM',
          duration: '2 hours',
          description: 'Visit popular tourist spots and landmarks'
        },
        {
          name: 'Try local cuisine',
          time: '12:00 PM', 
          duration: '1 hour',
          description: 'Experience authentic local food'
        }
      ],
      status: 'active',
      createdBy: 'ai',
      createdOn: new Date()
    };

    // Here you would call your itinerary service to save
    // For now, return success with the generated itinerary
    res.json({ 
      success: true, 
      message: "Itinerary created successfully!",
      itinerary 
    });

  } catch (error) {
    console.error("createAIItinerary Error:", error);
    res.status(500).json({ error: "Failed to create itinerary" });
  }
};

// Create AI Route Controller
export const createAIRoute = async (req: Request, res: Response) => {
  try {
    const { userID, extractedData, accessToken } = req.body;
    
    if (!userID || !accessToken) {
      return res.status(400).json({ error: "userID and accessToken are required" });
    }

    const { startLocation, endLocation, transportMode } = extractedData || {};
    
    if (!startLocation || !endLocation) {
      return res.status(400).json({ error: "Start and end locations are required" });
    }

    // Create route structure
    const routeData = {
      userID,
      status: 'active',
      mode: transportMode || 'driving-car',
      location: [
        {
          latitude: 14.5995, // Default Manila coordinates - should be geocoded
          longitude: 120.9842,
          locationName: startLocation
        },
        {
          latitude: 14.6091, // Default destination coordinates - should be geocoded  
          longitude: 121.0223,
          locationName: endLocation
        }
      ],
      createdBy: 'ai',
      createdOn: new Date()
    };

    // Here you would call your route service to create the actual route
    // For now, return success with the route data
    res.json({ 
      success: true, 
      message: "Route created successfully!",
      route: routeData,
      showGoToRoutes: true
    });

  } catch (error) {
    console.error("createAIRoute Error:", error);
    res.status(500).json({ error: "Failed to create route" });
  }
};