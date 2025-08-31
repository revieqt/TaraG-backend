import { Request, Response } from "express";
import { aiChatService } from "../services/aiChatService";

// Define the message type
type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

// In-memory session store (for simplicity)
const sessions: Record<string, ChatMessage[]> = {};

export const aiChatController = async (req: Request, res: Response) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: "sessionId and message are required" });
    }

    // Initialize session if not exists
    if (!sessions[sessionId]) {
      sessions[sessionId] = [
        {
          role: "system",
          content:
            "You are Tara, a friendly travel assistant. You only answer travel-related questions. Be concise. If a user asks something not related to travel, politely say you can only answer travel-related questions.",
        },
      ];
    }

    // Push user message
    sessions[sessionId].push({ role: "user", content: message });

    // Call AI service with full conversation
    const aiResponse = await aiChatService(sessions[sessionId]);

    // Push assistant reply into history
    sessions[sessionId].push({ role: "assistant", content: aiResponse });

    res.json({ reply: aiResponse });
  } catch (error) {
    console.error("aiChatController Error:", error);
    res.status(500).json({ error: "Failed to get AI response" });
  }
};