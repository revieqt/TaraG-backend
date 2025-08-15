import { Request, Response } from 'express';
import { getTaraResponse, getTaraResponseWithContext } from '../services/aiChatService';

export async function chatWithTara(req: Request, res: Response) {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Message is required and must be a non-empty string' 
      });
    }

    const trimmedMessage = message.trim();
    
    // Check message length to prevent abuse
    if (trimmedMessage.length > 1000) {
      return res.status(400).json({ 
        error: 'Message is too long. Please keep it under 1000 characters.' 
      });
    }

    const taraResponse = await getTaraResponse(trimmedMessage);
    
    res.status(200).json({ 
      message: 'Chat successful',
      response: taraResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in chatWithTara:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to get response from Tara' 
    });
  }
}

export async function chatWithTaraWithHistory(req: Request, res: Response) {
  try {
    const { message, conversationHistory } = req.body;
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Message is required and must be a non-empty string' 
      });
    }

    if (!conversationHistory || !Array.isArray(conversationHistory)) {
      return res.status(400).json({ 
        error: 'Conversation history is required and must be an array' 
      });
    }

    const trimmedMessage = message.trim();
    
    // Check message length to prevent abuse
    if (trimmedMessage.length > 1000) {
      return res.status(400).json({ 
        error: 'Message is too long. Please keep it under 1000 characters.' 
      });
    }

    // Validate conversation history format
    const validHistory = conversationHistory.every(msg => 
      msg && typeof msg === 'object' && 
      typeof msg.role === 'string' && 
      ['user', 'assistant'].includes(msg.role) &&
      typeof msg.content === 'string'
    );

    if (!validHistory) {
      return res.status(400).json({ 
        error: 'Invalid conversation history format' 
      });
    }

    const taraResponse = await getTaraResponseWithContext(trimmedMessage, conversationHistory);
    
    res.status(200).json({ 
      message: 'Chat successful',
      response: taraResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in chatWithTaraWithHistory:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to get response from Tara' 
    });
  }
}

export async function getTaraInfo(req: Request, res: Response) {
  try {
    res.status(200).json({ 
      message: 'Tara AI Travel Assistant Information',
      assistant: {
        name: 'Tara',
        description: 'A friendly and helpful AI travel assistant with a warm, approachable personality',
        specialization: 'Travel and tourism assistance only',
        capabilities: [
          'Answer travel-related questions clearly and concisely',
          'Provide travel information and recommendations',
          'Help with travel planning and tips',
          'Share information about destinations and attractions',
          'Maintain friendly and professional tone',
          'Support and encourage travelers'
        ],
        topics: [
          'Travel destinations and attractions',
          'Hotel and accommodation recommendations',
          'Flight and transportation information',
          'Travel planning and itineraries',
          'Travel safety and tips',
          'Cultural information about places',
          'Travel documents and requirements',
          'Local attractions and activities'
        ],
        personality: 'Friendly, warm, approachable, clear, concise, encouraging, supportive, travel-focused'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in getTaraInfo:', error);
    res.status(500).json({ 
      error: 'Failed to get Tara information' 
    });
  }
}
