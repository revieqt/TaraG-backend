import axios from 'axios';

// Use environment variable for API key, with fallback for development
const API_KEY = process.env.OPENROUTER_API_KEY || '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function getTaraResponse(userMessage: string): Promise<string> {
  try {
    // Check if API key is configured
    if (!API_KEY || API_KEY === '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') {
      throw new Error('OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable.');
    }

    // Create the system prompt for Tara's personality - TRAVEL FOCUSED
    const systemPrompt = `You are Tara, a friendly and helpful AI travel assistant. You have a warm, approachable personality and always respond in a clear, concise manner. You are specifically designed to help users with TRAVEL-RELATED questions and topics only. 

IMPORTANT: You should ONLY answer questions related to travel, tourism, destinations, hotels, flights, travel planning, travel tips, local attractions, cultural information about places, travel safety, travel documents, transportation, and similar travel topics.

If a user asks you about anything NOT related to travel (such as general knowledge, math, science, personal advice, etc.), you should politely decline and redirect them to ask travel-related questions instead.

Keep your responses friendly but professional, and always be encouraging and supportive. Focus on providing helpful travel information and guidance.`;

    const messages: ChatMessage[] = [
      { role: 'assistant', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    const response = await axios.post(API_URL, {
      model: 'anthropic/claude-3.5-sonnet', // Using Claude 3.5 Sonnet via OpenRouter
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
      top_p: 0.9,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://tarag-app.com', // Required by OpenRouter
        'X-Title': 'TaraG Travel Assistant' // Optional but recommended
      },
      timeout: 30000 // 30 second timeout
    });

    if (response.data && response.data.choices && response.data.choices[0]) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('Invalid response format from AI service');
    }

  } catch (error) {
    console.error('Error getting Tara response:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('AI service authentication failed - please check your OpenRouter API key');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please try again.');
      }
    }
    
    throw new Error('Failed to get response from Tara. Please try again.');
  }
}

export async function getTaraResponseWithContext(userMessage: string, conversationHistory: ChatMessage[]): Promise<string> {
  try {
    // Check if API key is configured
    if (!API_KEY || API_KEY === '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') {
      throw new Error('OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable.');
    }

    const systemPrompt = `You are Tara, a friendly and helpful AI travel assistant. You have a warm, approachable personality and always respond in a clear, concise manner. You are specifically designed to help users with TRAVEL-RELATED questions and topics only. 

IMPORTANT: You should ONLY answer questions related to travel, tourism, destinations, hotels, flights, travel planning, travel tips, local attractions, cultural information about places, travel safety, travel documents, transportation, and similar travel topics.

If a user asks you about anything NOT related to travel (such as general knowledge, math, science, personal advice, etc.), you should politely decline and redirect them to ask travel-related questions instead.

Keep your responses friendly but professional, and always be encouraging and supportive. Focus on providing helpful travel information and guidance.`;

    const messages: ChatMessage[] = [
      { role: 'assistant', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    const response = await axios.post(API_URL, {
      model: 'anthropic/claude-3.5-sonnet', // Using Claude 3.5 Sonnet via OpenRouter
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
      top_p: 0.9,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://tarag-app.com', // Required by OpenRouter
        'X-Title': 'TaraG Travel Assistant' // Optional but recommended
      },
      timeout: 30000
    });

    if (response.data && response.data.choices && response.data.choices[0]) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('Invalid response format from AI service');
    }

  } catch (error) {
    console.error('Error getting Tara response with context:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('AI service authentication failed - please check your OpenRouter API key');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please try again.');
      }
    }
    
    throw new Error('Failed to get response from Tara. Please try again.');
  }
}
