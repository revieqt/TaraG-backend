import fetch from "node-fetch";
import {OPENROUTER_API_KEY} from "../config/apiKeys";
const MODEL = "mistralai/mistral-7b-instruct:free";

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
        max_tokens: 200,
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