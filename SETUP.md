# TaraG Backend Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenRouter API key

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```bash
touch .env
```

3. Add your OpenRouter API key to the `.env` file:
```
OPENROUTER_API_KEY=your_actual_api_key_here
```

## Getting an OpenRouter API Key

1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up or log in to your account
3. Go to API Keys section
4. Generate a new API key
5. Copy the API key and paste it in your `.env` file

## Running the Backend

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## Testing the API

Once the backend is running, you can test it:

1. Health check:
```bash
curl http://localhost:5000/health
```

2. Test AI chat:
```bash
curl -X POST http://localhost:5000/api/ai-chat/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are good travel destinations in Europe?"}'
```

## Troubleshooting

### "AI service authentication failed"
- Make sure you have set the `OPENROUTER_API_KEY` in your `.env` file
- Verify your API key is valid and active
- Check that the `.env` file is in the correct location (backend directory)

### "Rate limit exceeded"
- Wait a moment before sending another request
- Consider upgrading your OpenRouter plan if you need higher limits

### "Request timeout"
- The AI service is taking too long to respond
- Try again in a few seconds
- Check your internet connection

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key | Yes |
| `PORT` | Server port (default: 5000) | No |

## AI Model Configuration

The backend is configured to use:
- **Model**: `anthropic/claude-3.5-sonnet` (Claude 3.5 Sonnet via OpenRouter)
- **Max Tokens**: 500
- **Temperature**: 0.7 (balanced creativity and consistency)
- **Top P**: 0.9

You can change the model by modifying the `model` parameter in `src/services/aiChatService.ts`. Available models include:
- `anthropic/claude-3.5-sonnet` (recommended)
- `openai/gpt-4o`
- `openai/gpt-4o-mini`
- `meta-llama/llama-3.1-8b-instruct`
- `google/gemini-pro`

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Keep your API key secure and don't share it publicly
