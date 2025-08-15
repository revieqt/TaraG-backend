# Tara AI Travel Assistant API Documentation

This document describes the AI chat API endpoints for interacting with Tara, a friendly AI travel assistant.

## Base URL
```
http://localhost:5000/api/ai-chat
```

## About Tara

Tara is a friendly and helpful AI travel assistant with the following characteristics:
- **Name**: Tara
- **Specialization**: Travel and tourism assistance only
- **Personality**: Warm, approachable, friendly, and professional
- **Communication Style**: Clear, concise, encouraging, and supportive
- **Focus**: Exclusively on travel-related topics and questions

## Travel Topics Tara Can Help With

Tara specializes in the following travel-related topics:
- 🏨 **Hotels and Accommodations**: Recommendations, booking tips, reviews
- ✈️ **Flights and Transportation**: Airlines, routes, travel tips
- 🗺️ **Destinations and Attractions**: Tourist spots, landmarks, activities
- 📅 **Travel Planning**: Itineraries, trip planning, scheduling
- 💰 **Budget Travel**: Cost-saving tips, affordable options
- 🛡️ **Travel Safety**: Safety tips, travel advisories, precautions
- 📋 **Travel Documents**: Passports, visas, requirements
- 🏛️ **Cultural Information**: Local customs, traditions, etiquette
- 🍽️ **Local Cuisine**: Restaurant recommendations, food culture
- 🚗 **Transportation**: Public transport, car rentals, local travel

## Important: Travel-Only Policy

**Tara will ONLY answer questions related to travel and tourism.** If you ask about:
- General knowledge questions
- Math or science problems
- Personal advice
- Non-travel topics

Tara will politely decline and redirect you to ask travel-related questions instead.

## Endpoints

### 1. Basic Chat
**POST** `/chat`

Send a single message to Tara and get a travel-focused response.

**Request:**
- Content-Type: `application/json`
- Body:
```json
{
  "message": "string"
}
```

**Response (Travel Question):**
```json
{
  "message": "Chat successful",
  "response": "Hello! I'm Tara, your travel assistant. I'd be happy to help you plan your trip to Europe! Some of the most popular destinations include Paris, Rome, Barcelona, and Amsterdam. What specific aspects of your trip would you like help with?",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Response (Non-Travel Question):**
```json
{
  "message": "Chat successful",
  "response": "I'm sorry, but I'm specifically designed to help with travel-related questions only. I'd be happy to assist you with travel planning, destination recommendations, hotel bookings, or any other travel topics!",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Error Responses:**
- `400`: Missing or invalid message
- `400`: Message too long (max 1000 characters)
- `500`: AI service error

### 2. Chat with Conversation History
**POST** `/chat-with-history`

Send a message to Tara with conversation history for context-aware travel responses.

**Request:**
- Content-Type: `application/json`
- Body:
```json
{
  "message": "string",
  "conversationHistory": [
    {
      "role": "user",
      "content": "What are good hotels in Paris?"
    },
    {
      "role": "assistant", 
      "content": "Paris has many excellent hotels! Some popular areas to consider are the Marais, Saint-Germain-des-Prés, and the 8th arrondissement near the Champs-Élysées. Would you like recommendations for a specific budget range?"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Chat successful",
  "response": "Great question! Since you're looking at hotels in those areas, here are some excellent restaurant recommendations nearby: In the Marais, try L'As du Fallafel for amazing falafel, or Le Comptoir du Relais in Saint-Germain for classic French cuisine. The 8th arrondissement has many upscale dining options near the Champs-Élysées.",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Error Responses:**
- `400`: Missing or invalid message
- `400`: Missing or invalid conversation history
- `400`: Message too long (max 1000 characters)
- `500`: AI service error

### 3. Get Tara Information
**GET** `/info`

Get information about Tara's travel-focused capabilities and personality.

**Request:**
- No body required

**Response:**
```json
{
  "message": "Tara AI Travel Assistant Information",
  "assistant": {
    "name": "Tara",
    "description": "A friendly and helpful AI travel assistant with a warm, approachable personality",
    "specialization": "Travel and tourism assistance only",
    "capabilities": [
      "Answer travel-related questions clearly and concisely",
      "Provide travel information and recommendations",
      "Help with travel planning and tips",
      "Share information about destinations and attractions",
      "Maintain friendly and professional tone",
      "Support and encourage travelers"
    ],
    "topics": [
      "Travel destinations and attractions",
      "Hotel and accommodation recommendations",
      "Flight and transportation information",
      "Travel planning and itineraries",
      "Travel safety and tips",
      "Cultural information about places",
      "Travel documents and requirements",
      "Local attractions and activities"
    ],
    "personality": "Friendly, warm, approachable, clear, concise, encouraging, supportive, travel-focused"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## AI Service Configuration

The API uses the Perplexity AI service with the following configuration:
- **Model**: llama-3.1-sonar-small-128k-online
- **Max Tokens**: 500
- **Temperature**: 0.7 (balanced creativity and consistency)
- **Top P**: 0.9
- **Timeout**: 30 seconds
- **Specialization**: Travel-focused system prompt

## Error Handling

The API includes comprehensive error handling for various scenarios:

### Common Error Types:
- **Authentication Errors**: Invalid API key
- **Rate Limiting**: Too many requests
- **Timeout Errors**: Request taking too long
- **Invalid Input**: Malformed requests
- **Service Errors**: AI service unavailable

### Error Response Format:
```json
{
  "error": "Descriptive error message"
}
```

## Usage Examples

### Frontend JavaScript Example (Travel Question)
```javascript
fetch('/api/ai-chat/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'What are the best travel destinations in Europe?'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Tara says:', data.response);
})
.catch(error => console.error('Error:', error));
```

### Frontend JavaScript Example (Non-Travel Question - Will be Declined)
```javascript
fetch('/api/ai-chat/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'What is the capital of France?'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Tara says:', data.response); // Will politely decline
})
.catch(error => console.error('Error:', error));
```

### Frontend JavaScript Example (Chat with Travel History)
```javascript
const conversationHistory = [
  { role: 'user', content: 'What are good hotels in Tokyo?' },
  { role: 'assistant', content: 'Tokyo has excellent hotels! For luxury, consider the Park Hyatt Tokyo or the Mandarin Oriental. For mid-range, the Tokyu Stay hotels are great value. What\'s your budget range?' }
];

fetch('/api/ai-chat/chat-with-history', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'What about transportation from the airport to these hotels?',
    conversationHistory: conversationHistory
  })
})
.then(response => response.json())
.then(data => {
  console.log('Tara says:', data.response);
})
.catch(error => console.error('Error:', error));
```

### Frontend JavaScript Example (Get Tara Info)
```javascript
fetch('/api/ai-chat/info')
.then(response => response.json())
.then(data => {
  console.log('Tara info:', data.assistant);
  console.log('Specialization:', data.assistant.specialization);
})
.catch(error => console.error('Error:', error));
```

## Rate Limiting and Best Practices

- **Message Length**: Keep messages under 1000 characters
- **Travel Focus**: Only ask travel-related questions
- **Conversation History**: Limit history to recent travel conversations
- **Error Handling**: Always handle potential errors in your frontend code
- **User Experience**: Show loading states while waiting for responses

## Security Considerations

- The API key is stored securely on the backend
- Input validation prevents malicious requests
- Message length limits prevent abuse
- Error messages don't expose sensitive information

## Troubleshooting

### Common Issues:

1. **"AI service authentication failed"**
   - Check if the API key is valid and active

2. **"Rate limit exceeded"**
   - Wait a moment before sending another request

3. **"Request timeout"**
   - The AI service is taking too long to respond
   - Try again in a few seconds

4. **"Message is too long"**
   - Shorten your message to under 1000 characters

5. **Tara declines non-travel questions**
   - This is expected behavior - Tara only answers travel-related questions
   - Rephrase your question to be travel-focused

6. **"Invalid conversation history format"**
   - Ensure conversation history follows the correct format with `role` and `content` fields

## Example Travel Questions Tara Can Answer

✅ **Good Questions:**
- "What are the best hotels in Paris?"
- "How do I plan a budget trip to Japan?"
- "What should I pack for a trip to Thailand?"
- "What are the must-see attractions in Rome?"
- "How safe is it to travel to Mexico?"
- "What's the best time to visit Bali?"
- "Can you recommend restaurants in Barcelona?"
- "What travel documents do I need for Europe?"

❌ **Questions Tara Will Decline:**
- "What is the capital of France?"
- "How do I solve this math problem?"
- "What's the weather like today?"
- "Can you help me with my homework?"
- "What's the meaning of life?"
- "How do I fix my computer?"

## Testing

Use the provided test file to verify Tara's travel-focused behavior:

```bash
node src/testAI.mjs
```

This will test both travel and non-travel questions to ensure Tara responds appropriately.
