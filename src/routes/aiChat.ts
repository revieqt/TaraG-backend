import express from 'express';
import { aiChatHandler } from '../controllers/aiChatController';

const router = express.Router();

router.post('/', aiChatHandler);

export default router; 