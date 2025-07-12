import { Request, Response } from 'express';
import { sendAIChatMessage, ChatMessage } from '../services/aiChatService';

const systemPrompt: ChatMessage = {
  role: 'system',
  content: `You are Tara, a fun and friendly AI travel assistant. 
You help users with anything related to traveling: destinations, planning, weather, places to visit, safety, packing, budgeting, transportation, and tips.
You do NOT answer questions unrelated to travel. If the user asks something off-topic, do not answer it and kindly remind them that you're only here for travel help.
Make your responses short and concise, with a helpful tone, upbeat, and cheerful like a well-traveled friend! 🌍✈️
When the user wants to create a travel route, respond ONLY with this JSON structure (place names only):
{
  "action": "create_route",
  "locations": [
    { "locationName": "Manila" },
    { "locationName": "San Fernando, Pampanga" },
    { "locationName": "Baguio City" }
  ]
}`,
};

export async function aiChatHandler(req: Request, res: Response) {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message must be a string' });
  }
  try {
    const messages: ChatMessage[] = [
      systemPrompt,
      { role: 'user', content: message }
    ];
    const aiResponse = await sendAIChatMessage(messages);
    const aiMessage = aiResponse.choices?.[0]?.message?.content?.trim() || '';
    res.json({ message: aiMessage });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get AI response' });
  }
} 