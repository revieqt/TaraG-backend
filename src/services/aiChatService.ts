import axios from 'axios';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export async function sendAIChatMessage(messages: ChatMessage[]) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not set');
  }
  const response = await axios.post(
    OPENROUTER_API_URL,
    {
      model: 'mistralai/mistral-7b-instruct',
      messages,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://tarag.app/'
      },
    }
  );
  return response.data;
} 