import express from "express";
import { aiChatController, createAIItinerary, createAIRoute } from "../controllers/aiChatController";

const router = express.Router();

// POST /api/aiChat
router.post("/", aiChatController);

// POST /api/aiChat/create-itinerary
router.post("/create-itinerary", createAIItinerary);

// POST /api/aiChat/create-route
router.post("/create-route", createAIRoute);

export default router;