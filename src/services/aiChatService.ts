import fetch from "node-fetch";
import {OPENROUTER_API_KEY} from "../config/apiKeys";
const MODEL = "mistralai/mistral-7b-instruct:free";

// Intent recognition types
export type UserIntent = {
  type: 'general' | 'create_itinerary' | 'create_route' | 'travel_suggestion';
  confidence: number;
  extractedData?: {
    destination?: string;
    duration?: string;
    preferences?: string[];
    startLocation?: string;
    endLocation?: string;
    waypoints?: string[];
    transportMode?: string;
  };
};

// Travel suggestions
export const getTravelSuggestions = () => {
  const suggestions = [
    "What are the best destinations in the Philippines?",
    "Can you help me plan a 3-day itinerary for Cebu?",
    "What's the weather like in Boracay this month?",
    "Create a route from Manila to Baguio with scenic stops",
    "What are must-try local foods in Palawan?",
    "Best budget accommodations in Siargao",
    "How to get from NAIA to Makati?",
    "What to pack for a beach trip in the Philippines?"
  ];
  return suggestions.sort(() => Math.random() - 0.5).slice(0, 4);
};

// Intent recognition function
export const recognizeIntent = (message: string): UserIntent => {
  const lowerMessage = message.toLowerCase();
  
  // Itinerary creation patterns
  const itineraryPatterns = [
    /create.*itinerary/i,
    /plan.*trip/i,
    /make.*itinerary/i,
    /\d+\s*day.*trip/i,
    /travel.*plan/i,
    /itinerary.*for/i
  ];
  
  // Route creation patterns
  const routePatterns = [
    /create.*route/i,
    /make.*route/i,
    /route.*from.*to/i,
    /directions.*from/i,
    /how.*get.*from/i,
    /navigate.*to/i
  ];
  
  // Check for itinerary intent
  if (itineraryPatterns.some(pattern => pattern.test(lowerMessage))) {
    const extractedData: any = {};
    
    // Extract destination
    const destinationMatch = lowerMessage.match(/(?:to|for|in)\s+([a-zA-Z\s]+?)(?:\s|$|,|\?)/);
    if (destinationMatch) {
      extractedData.destination = destinationMatch[1].trim();
    }
    
    // Extract duration
    const durationMatch = lowerMessage.match(/(\d+)\s*day/);
    if (durationMatch) {
      extractedData.duration = durationMatch[1] + ' days';
    }
    
    // Extract preferences
    const preferences = [];
    if (lowerMessage.includes('beach')) preferences.push('beach');
    if (lowerMessage.includes('food')) preferences.push('food');
    if (lowerMessage.includes('culture')) preferences.push('culture');
    if (lowerMessage.includes('adventure')) preferences.push('adventure');
    if (lowerMessage.includes('budget')) preferences.push('budget');
    
    extractedData.preferences = preferences;
    
    return {
      type: 'create_itinerary',
      confidence: 0.8,
      extractedData
    };
  }
  
  // Check for route intent
  if (routePatterns.some(pattern => pattern.test(lowerMessage))) {
    const extractedData: any = {};
    
    // Extract from/to locations
    const routeMatch = lowerMessage.match(/(?:from|route)\s+([^to]+?)\s+to\s+([^with|$]+)/);
    if (routeMatch) {
      extractedData.startLocation = routeMatch[1].trim();
      extractedData.endLocation = routeMatch[2].trim();
    }
    
    // Extract transport mode
    if (lowerMessage.includes('walk') || lowerMessage.includes('walking')) {
      extractedData.transportMode = 'foot-walking';
    } else if (lowerMessage.includes('drive') || lowerMessage.includes('car')) {
      extractedData.transportMode = 'driving-car';
    } else {
      extractedData.transportMode = 'driving-car'; // default
    }
    
    return {
      type: 'create_route',
      confidence: 0.8,
      extractedData
    };
  }
  
  return {
    type: 'general',
    confidence: 1.0
  };
};

export const aiChatService = async (messages: any[]) => {
  if (!OPENROUTER_API_KEY) {
    console.error("Missing OpenRouter API key.");
    return "Sorry, the AI service is not configured.";
  }
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        max_tokens: 300,
      }),
    });

    const data = await response.json() as {
      error?: any;
      choices?: { message?: { content?: string } }[];
    };

    if (data.error || !data.choices || !data.choices[0]?.message?.content) {
      console.error("OpenRouter Error:", data.error || data);
      return "Sorry, I had trouble answering that.";
    }

    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("aiChatService Error:", error);
    return "Sorry, something went wrong while contacting the AI.";
  }
};