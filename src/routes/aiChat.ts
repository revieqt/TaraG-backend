import express from 'express';
import { chatWithTara, chatWithTaraWithHistory, getTaraInfo } from '../controllers/aiChatController';

const router = express.Router();

// Basic chat endpoint - single message
router.post('/chat', chatWithTara);

// Chat endpoint with conversation history
router.post('/chat-with-history', chatWithTaraWithHistory);

// Get Tara information
router.get('/info', getTaraInfo);

export default router;
