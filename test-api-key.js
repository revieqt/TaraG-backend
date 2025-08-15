const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function testApiKey() {
  console.log('🔍 Testing OpenRouter API Key...\n');
  
  if (!API_KEY) {
    console.log('❌ No API key found!');
    console.log('Please create a .env file with your OPENROUTER_API_KEY');
    console.log('Example: OPENROUTER_API_KEY=your_key_here');
    return;
  }

  if (API_KEY === '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') {
    console.log('❌ Using default API key - this will not work!');
    console.log('Please set your actual OpenRouter API key in the .env file');
    return;
  }

  console.log('✅ API key found in .env file');
  console.log('🔑 Key starts with:', API_KEY.substring(0, 10) + '...');

  try {
    console.log('\n🚀 Testing OpenRouter API connection...');
    
    const response = await axios.post(API_URL, {
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        { role: 'user', content: 'Hello, can you help me with travel planning?' }
      ],
      max_tokens: 100,
      temperature: 0.7,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://tarag-app.com',
        'X-Title': 'TaraG Travel Assistant'
      },
      timeout: 10000
    });

    if (response.data && response.data.choices && response.data.choices[0]) {
      console.log('✅ OpenRouter API key is valid and working!');
      console.log('📝 Test response:', response.data.choices[0].message.content.substring(0, 100) + '...');
      console.log('\n🎉 Your TaraG backend should now work correctly!');
    } else {
      console.log('❌ Unexpected response format from API');
    }

  } catch (error) {
    console.log('❌ API test failed!');
    
    if (error.response?.status === 401) {
      console.log('🔐 Authentication failed - your API key is invalid');
      console.log('Please check your OpenRouter API key and try again');
    } else if (error.response?.status === 429) {
      console.log('⏰ Rate limit exceeded - try again in a moment');
    } else if (error.code === 'ECONNABORTED') {
      console.log('⏱️ Request timeout - check your internet connection');
    } else {
      console.log('💥 Error:', error.message);
    }
  }
}

testApiKey();
