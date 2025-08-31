import express from "express";
import { aiChatController } from "../controllers/aiChatController";

const router = express.Router();

// POST /api/aiChat
router.post("/", aiChatController);

export default router;